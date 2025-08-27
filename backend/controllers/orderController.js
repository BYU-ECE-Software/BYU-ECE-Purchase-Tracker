import { PrismaClient } from "@prisma/client";
import minioClient from "../minioClient.js";

const prisma = new PrismaClient();

//
// Create a new order with items
//
export const createOrder = async (req, res) => {
  try {
    const {
      items,
      vendor,
      shippingPreference,
      professorId,
      purpose,
      workTag,
      spendCategoryId,
      tax,
      total,
      userId,
      lineMemoOptionId,
      creditCard,
      purchaseDate,
      status,
      comment,
      cartLink,
    } = req.body;

    // --- FILE PROCESSING BLOCK ---
    const receipt = [];
    const itemFilesMap = {}; // index -> filename

    for (const file of req.files ?? []) {
      const { fieldname, originalname, buffer, mimetype } = file;
      const metaData = { "Content-Type": mimetype };

      // Store receipts to minio and store the object key in the db
      if (fieldname === "receipts") {
        await minioClient.putObject("receipts", originalname, buffer, metaData);
        receipt.push(originalname);

        // Store item files to minio and store the object key in the db
      } else if (fieldname.startsWith("itemFiles.")) {
        const index = parseInt(fieldname.split(".")[1], 10);
        await minioClient.putObject("files", originalname, buffer, metaData);
        itemFilesMap[index] = originalname;
      }
    }

    // Format the order
    const orderData = {
      requestDate: new Date(),
      vendor,
      shippingPreference: shippingPreference || null,
      professor: { connect: { id: parseInt(professorId) } },
      purpose,
      workTag,
      spendCategory: { connect: { id: parseInt(spendCategoryId) } },
      tax: tax ? parseFloat(tax) : null,
      total: total ? parseFloat(total) : null,
      user: { connect: { id: parseInt(userId) } },
      creditCard:
        creditCard === undefined || creditCard === null || creditCard === ""
          ? null
          : typeof creditCard === "boolean"
          ? creditCard
          : ["true", "1", "on"].includes(String(creditCard).toLowerCase())
          ? true
          : ["false", "0", "off"].includes(String(creditCard).toLowerCase())
          ? false
          : null,

      purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
      receipt,
      status,
      comment: comment || null,
      cartLink: cartLink || null,
      ...(lineMemoOptionId && {
        lineMemoOption: { connect: { id: parseInt(lineMemoOptionId) } },
      }),
    };

    // Only create items if they were submitted
    const parsedItems = typeof items === "string" ? JSON.parse(items) : items;

    if (Array.isArray(parsedItems)) {
      const validItems = parsedItems.filter(
        (item) => item.name && item.name.trim() !== ""
      );

      if (validItems.length > 0) {
        orderData.items = {
          create: validItems.map((item, index) => ({
            name: item.name,
            quantity: item.quantity,
            status: item.status,
            link: item.link || null,
            file: itemFilesMap[index] || null, // attach uploaded file if present
          })),
        };
      }
    }

    // Create the order
    const newOrder = await prisma.order.create({
      data: orderData,
      include: {
        items: true,
      },
    });

    res.status(201).json(newOrder);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Failed to create order", details: error.message });
  }
};

//
// Fetch all orders with items and users including pagination, sorting, status filtering, and searching
//
export const getAllOrders = async (req, res) => {
  try {
    // Extract query parameters
    const {
      page = 1,
      pageSize = 25,
      sortBy = "requestDate",
      order = "desc",
      status,
      query, // optional search term
      date,
    } = req.query;

    // Normalize and interpret search term
    const searchTerm = query?.toString().toLowerCase();
    const isNumeric = !isNaN(Number(searchTerm));

    // Validate and set sorting fields
    const validSortFields = [
      "status",
      "requestDate",
      "purchaseDate",
      "vendor",
      "shippingPreference",
      "studentName",
      "professor",
    ];
    const sortField = validSortFields.includes(sortBy) ? sortBy : "requestDate";
    const sortOrder = order === "asc" ? "asc" : "desc";

    // Handle sorting by nested fields. special cases
    let orderBy;
    switch (sortField) {
      case "studentName":
        orderBy = [
          { user: { lastName: sortOrder } },
          { user: { firstName: sortOrder } },
        ];
        break;
      case "professor":
        orderBy = [
          { professor: { lastName: sortOrder } },
          { professor: { firstName: sortOrder } },
        ];
        break;
      default:
        orderBy = { [sortField]: sortOrder };
    }

    // Construct dynamic filtering
    let where = {};

    if (status) {
      where.status = status;
    }

    if (date) {
      const parsedDate = new Date(date);
      if (!isNaN(parsedDate)) {
        const nextDay = new Date(parsedDate);
        nextDay.setDate(parsedDate.getDate() + 1);

        where.OR = [
          ...(where.OR || []), // Preserve any existing OR filters (like searchTerm)
          {
            purchaseDate: {
              gte: parsedDate,
              lt: nextDay,
            },
          },
          {
            requestDate: {
              gte: parsedDate,
              lt: nextDay,
            },
          },
        ];
      }
    }

    // Add search filters if query is present
    if (searchTerm) {
      where.OR = [
        { vendor: { contains: searchTerm, mode: "insensitive" } },
        { status: { contains: searchTerm, mode: "insensitive" } },
        isNumeric ? { total: Number(searchTerm) } : undefined,
        {
          user: {
            OR: [
              { firstName: { contains: searchTerm, mode: "insensitive" } },
              { lastName: { contains: searchTerm, mode: "insensitive" } },
              {
                AND:
                  searchTerm.split(" ").length >= 2
                    ? searchTerm.split(" ").map((name) => ({
                        OR: [
                          {
                            firstName: { contains: name, mode: "insensitive" },
                          },
                          { lastName: { contains: name, mode: "insensitive" } },
                        ],
                      }))
                    : [],
              },
            ],
          },
        },
        {
          professor: {
            OR: [
              { firstName: { contains: searchTerm, mode: "insensitive" } },
              { lastName: { contains: searchTerm, mode: "insensitive" } },
              {
                AND:
                  searchTerm.split(" ").length >= 2
                    ? searchTerm.split(" ").map((name) => ({
                        OR: [
                          {
                            firstName: { contains: name, mode: "insensitive" },
                          },
                          { lastName: { contains: name, mode: "insensitive" } },
                        ],
                      }))
                    : [],
              },
            ],
          },
        },
        {
          items: {
            some: {
              name: { contains: searchTerm, mode: "insensitive" },
            },
          },
        },
      ].filter(Boolean);
    }

    // Calculate pagination
    const skip = (Number(page) - 1) * Number(pageSize);
    const take = Number(pageSize);

    // Fetch filtered + paginated data and total count
    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        skip,
        take,
        where,
        orderBy,
        include: {
          items: true,
          user: true,
          lineMemoOption: true,
          professor: true,
          spendCategory: true,
        },
      }),
      prisma.order.count({ where }),
    ]);

    // Return paginated results
    res.status(200).json({
      data: orders,
      page: Number(page),
      pageSize: Number(pageSize),
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
    });
  } catch (error) {
    console.error("getAllOrders failed:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

//
// Fetch orders for a specific user
//
export const getOrdersByUser = async (req, res) => {
  const userId = parseInt(req.params.userId);

  if (isNaN(userId)) {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  try {
    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: true,
        user: true,
        lineMemoOption: true,
        professor: true,
        spendCategory: true,
      },
      orderBy: {
        requestDate: "desc",
      },
    });

    res.status(200).json(orders);
  } catch (error) {
    console.error("Failed to fetch user orders:", error);
    res.status(500).json({ error: "Failed to fetch user orders" });
  }
};

//
// Update an existing order and its items
//
export const updateOrder = async (req, res) => {
  const orderId = parseInt(req.params.id);
  const {
    items,
    deletedReceipts = [],
    deletedItemFiles = [],
    id,
    ...orderFields
  } = req.body;

  // parse items to an array
  let itemsArray = [];
  if (typeof items === "string") {
    try {
      itemsArray = JSON.parse(items);
    } catch (err) {
      console.warn("Failed to parse items:", err);
    }
  } else if (Array.isArray(items)) {
    itemsArray = items;
  }

  // if deleted receipts has been stringified, parse it back to an array
  let deletedReceiptsArray = [];

  if (typeof deletedReceipts === "string") {
    try {
      deletedReceiptsArray = JSON.parse(deletedReceipts);
    } catch (err) {
      console.warn("Failed to parse deletedReceipts:", err);
    }
  } else if (Array.isArray(deletedReceipts)) {
    deletedReceiptsArray = deletedReceipts;
  }

  // if deleted item files has been stringified, parse it back to an array
  let deletedItemFilesArray = [];

  if (typeof deletedItemFiles === "string") {
    try {
      deletedItemFilesArray = JSON.parse(deletedItemFiles);
    } catch (err) {
      console.warn("Failed to parse deletedItemFiles:", err);
    }
  } else if (Array.isArray(deletedItemFiles)) {
    deletedItemFilesArray = deletedItemFiles;
  }

  try {
    // Build dynamic data for the order — drop only undefined (keep null so users can clear)
    const cleanedOrderData = Object.fromEntries(
      Object.entries(orderFields).filter(([_, v]) => v !== undefined)
    );

    // Integers (IDs)
    const intKeys = [
      "professorId",
      "userId",
      "spendCategoryId",
      "lineMemoOptionId",
    ];
    for (const key of intKeys) {
      if (key in cleanedOrderData) {
        const v = cleanedOrderData[key];
        if (v === "" || v === null) {
          cleanedOrderData[key] = null;
        } else {
          const n = parseInt(String(v), 10);
          cleanedOrderData[key] = Number.isNaN(n) ? null : n;
        }
      }
    }

    // Floats (money-ish)
    const floatKeys = ["tax", "total"];
    for (const key of floatKeys) {
      if (key in cleanedOrderData) {
        const v = cleanedOrderData[key];
        if (v === "" || v === null) {
          cleanedOrderData[key] = null;
        } else {
          const n = parseFloat(String(v));
          cleanedOrderData[key] = Number.isNaN(n) ? null : n;
        }
      }
    }

    // Booleans
    const boolKeys = ["creditCard"];
    for (const key of boolKeys) {
      if (key in cleanedOrderData) {
        const v = cleanedOrderData[key];
        if (v === "" || v === null) {
          cleanedOrderData[key] = null; // allow clearing if your schema permits null
        } else if (typeof v === "boolean") {
          // already boolean, keep as is
        } else if (String(v).toLowerCase() === "true" || String(v) === "1") {
          cleanedOrderData[key] = true;
        } else if (String(v).toLowerCase() === "false" || String(v) === "0") {
          cleanedOrderData[key] = false;
        } else {
          // fallback: treat unknown as null or throw—your choice
          cleanedOrderData[key] = null;
        }
      }
    }

    for (const [k, v] of Object.entries(cleanedOrderData)) {
      if (v === "") cleanedOrderData[k] = null; // generic: clear text/date-ish fields
    }

    // List of relational databases
    const relationMappings = {
      professorId: "professor",
      userId: "user",
      spendCategoryId: "spendCategory",
      lineMemoOptionId: "lineMemoOption",
    };

    // convert all relational values to the correct connect format
    for (const idKey in relationMappings) {
      const relationKey = relationMappings[idKey];
      if (cleanedOrderData[idKey] !== undefined) {
        const val = cleanedOrderData[idKey]; // number | null
        delete cleanedOrderData[idKey];

        if (relationKey === "lineMemoOption" && val === null) {
          // optional relation -> allow clearing
          cleanedOrderData[relationKey] = { disconnect: true };
        } else {
          // required relations (and lineMemo when not null) -> connect
          cleanedOrderData[relationKey] = { connect: { id: Number(val) } };
        }
      }
    }

    // Convert purchaseDate to a Date object if it exists
    if (cleanedOrderData.purchaseDate) {
      cleanedOrderData.purchaseDate = new Date(cleanedOrderData.purchaseDate);
    }

    // Load the existing order so we can modify receipt array
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!existingOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Handle optional receipt uploads
    const newReceiptKeys = [];

    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        const { originalname, buffer, mimetype } = file;
        const metaData = { "Content-Type": mimetype };

        await minioClient.putObject("receipts", originalname, buffer, metaData);
        newReceiptKeys.push(originalname);
      }
    }

    // Handle requested receipt deletions from minio
    if (
      Array.isArray(deletedReceiptsArray) &&
      deletedReceiptsArray.length > 0
    ) {
      // Remove files from MinIO
      for (const filename of deletedReceiptsArray) {
        try {
          await minioClient.removeObject("receipts", filename);
        } catch (err) {
          console.warn(`Failed to delete ${filename} from MinIO`, err);
        }
      }
    }

    // Compute the new receipt array, removing deleted and adding new
    const updatedReceiptList = existingOrder.receipt
      .filter((key) => !deletedReceiptsArray.includes(key))
      .concat(newReceiptKeys);

    cleanedOrderData.receipt = {
      set: updatedReceiptList,
    };

    // handle deleted item files
    if (
      Array.isArray(deletedItemFilesArray) &&
      deletedItemFilesArray.length > 0
    ) {
      for (const filename of deletedItemFilesArray) {
        try {
          await minioClient.removeObject("files", filename);
        } catch (err) {
          console.warn(`Failed to delete ${filename} from MinIO`, err);
        }
      }

      // Clear the file reference from the associated file items in the DB
      await prisma.item.updateMany({
        where: {
          file: {
            in: deletedItemFilesArray,
          },
        },
        data: {
          file: null,
        },
      });
    }

    // Update the order with only the provided fields
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: cleanedOrderData,
    });

    let updatedItems = [];

    // If items array is included, update them
    if (Array.isArray(itemsArray) && itemsArray.length > 0) {
      updatedItems = await Promise.all(
        itemsArray.map((item) =>
          prisma.item.update({
            where: { id: Number(item.id) },
            data: { status: item.status }, // update precisely what you expect
          })
        )
      );
    }

    res.status(200).json({ order: updatedOrder, items: updatedItems });
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({
      error: "Failed to update order",
      details: error.message,
    });
  }
};
