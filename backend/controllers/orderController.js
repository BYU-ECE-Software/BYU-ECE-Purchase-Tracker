import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Create a new order with items
export const createOrder = async (req, res) => {
  try {
    const {
      items,
      vendor,
      shippingPreference,
      professorId,
      purpose,
      operatingUnit,
      spendCategoryId,
      tax,
      total,
      userId,
      lineMemoOptionId,
      cardType,
      purchaseDate,
      receipt,
      status,
      comment,
      cartLink,
    } = req.body;

    // Format the order
    const orderData = {
      requestDate: new Date(),
      vendor,
      shippingPreference: shippingPreference || null,
      professor: { connect: { id: professorId } },
      purpose,
      operatingUnit,
      spendCategory: { connect: { id: spendCategoryId } },
      tax: tax || null,
      total: total || null,
      user: { connect: { id: userId } },
      lineMemoOption: { connect: { id: lineMemoOptionId } },
      cardType: cardType || null,
      purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
      receipt: receipt || null,
      status,
      comment: comment || null,
      cartLink: cartLink || null,
    };

    // Only create items if they were submitted
    if (Array.isArray(items) && items.length > 0) {
      orderData.items = {
        create: items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          status: item.status,
          link: item.link || null,
          file: item.file || null,
        })),
      };
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

// Fetch all orders with items and users
export const getAllOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
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
    console.error(error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

// Update an existing order and its items
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

// Search for specific orders
export const searchOrders = async (req, res) => {
  const searchTerm = req.query.query?.toString().toLowerCase();

  if (!searchTerm) {
    return res.status(400).json({ error: "Missing search query" });
  }

  const isNumeric = !isNaN(Number(searchTerm));
  const isDate = !isNaN(Date.parse(searchTerm));

  // currently set to search by total, purchase date, vendor, status, student name, professor name, and items
  try {
    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { vendor: { contains: searchTerm, mode: "insensitive" } },
          { status: { contains: searchTerm, mode: "insensitive" } },
          isNumeric ? { total: Number(searchTerm) } : undefined,
          isDate ? { purchaseDate: new Date(searchTerm) } : undefined,
          // Match user (student) by first name, last name, or full name
          {
            user: {
              OR: [
                { firstName: { contains: searchTerm, mode: "insensitive" } },
                { lastName: { contains: searchTerm, mode: "insensitive" } },
              ],
            },
          },

          // Match professor by first name, last name, or full name
          {
            professor: {
              OR: [
                { firstName: { contains: searchTerm, mode: "insensitive" } },
                { lastName: { contains: searchTerm, mode: "insensitive" } },
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
        ].filter(Boolean),
      },
      include: {
        user: true,
        professor: true,
        items: true,
        lineMemoOption: true,
      },
    });

    res.status(200).json(orders);
  } catch (error) {
    console.error("Search failed:", error);
    res.status(500).json({ error: "Search failed", details: error.message });
  }
};
