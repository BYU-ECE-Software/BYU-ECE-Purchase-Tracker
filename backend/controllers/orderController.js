import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Create a new order with items
export const createOrder = async (req, res) => {
  try {
    const {
      items,
      store,
      needByDate,
      shippingPreference,
      professor,
      purpose,
      workdayCode,
      userId,
    } = req.body;

    // Create the order
    const newOrder = await prisma.order.create({
      data: {
        requestDate: new Date(),
        store,
        needByDate: needByDate ? new Date(needByDate) : null,
        shippingPreference,
        professor,
        purpose,
        workdayCode,
        user: { connect: { id: userId } },
        items: {
          create: items.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            status: item.status,
            link: item.link || null,
            file: item.file || null,
          })),
        },
        subtotal: null, // secretary will fill this in later
        tax: null,
        total: null,
      },
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
        user: true, // optional: remove if you don't need it
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
