import { PrismaClient } from "@prisma/client";
import minioClient from "../minioClient";

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
      cardType,
      purchaseDate,
      status,
      comment,
      cartLink,
    } = req.body;

    let receipt = [];

    // If a receipt file is included, upload to MinIO
    if (req.file) {
      const { originalname, buffer, mimetype } = req.file;
      const metaData = { "Content-Type": mimetype };

      await minioClient.putObject("receipts", originalname, buffer, metaData);
      const objectKey = originalname;
      receipt.push(objectKey);
    }

    // Format the order
    const orderData = {
      requestDate: new Date(),
      vendor,
      shippingPreference: shippingPreference || null,
      professor: { connect: { id: professorId } },
      purpose,
      workTag,
      spendCategory: { connect: { id: spendCategoryId } },
      tax: tax || null,
      total: total || null,
      user: { connect: { id: userId } },
      cardType: cardType || null,
      purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
      receipt,
      status,
      comment: comment || null,
      cartLink: cartLink || null,
      ...(lineMemoOptionId && {
        lineMemoOption: { connect: { id: lineMemoOptionId } },
      }),
    };

    // Only create items if they were submitted
    if (Array.isArray(items)) {
      const validItems = items.filter(
        (item) => item.name && item.name.trim() !== ""
      );

      if (validItems.length > 0) {
        orderData.items = {
          create: validItems.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            status: item.status,
            link: item.link || null,
            file: item.file || null,
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
  const { items, id, ...orderFields } = req.body;

  try {
    // Build dynamic data for the order — remove undefined or null values
    const cleanedOrderData = Object.fromEntries(
      Object.entries(orderFields).filter(([_, v]) => v !== undefined)
    );

    // Convert purchaseDate to a Date object if it exists
    if (cleanedOrderData.purchaseDate) {
      cleanedOrderData.purchaseDate = new Date(cleanedOrderData.purchaseDate);
    }

    // Update the order with only the provided fields
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: cleanedOrderData,
    });

    let updatedItems = [];

    // If items array is included, update them
    if (Array.isArray(items)) {
      updatedItems = await Promise.all(
        items.map((item) =>
          prisma.item.update({
            where: { id: item.id },
            data: {
              ...item, // includes only fields that were sent
            },
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
