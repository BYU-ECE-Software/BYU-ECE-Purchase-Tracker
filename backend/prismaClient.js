// This file initializes and exports a single instance of the PrismaClient.
// Import this file anywhere you need to interact with the database.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default prisma;
