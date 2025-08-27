-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "byuId" TEXT NOT NULL,
    "role" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "link" TEXT,
    "file" TEXT,
    "orderId" INTEGER NOT NULL,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" SERIAL NOT NULL,
    "requestDate" TIMESTAMP(3) NOT NULL,
    "vendor" TEXT NOT NULL,
    "shippingPreference" TEXT,
    "professorId" INTEGER NOT NULL,
    "purpose" TEXT NOT NULL,
    "workTag" TEXT NOT NULL,
    "spendCategoryId" INTEGER NOT NULL,
    "tax" DOUBLE PRECISION,
    "total" DOUBLE PRECISION,
    "userId" INTEGER NOT NULL,
    "lineMemoOptionId" INTEGER,
    "creditCard" BOOLEAN,
    "purchaseDate" TIMESTAMP(3),
    "receipt" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" TEXT NOT NULL,
    "comment" TEXT,
    "cartLink" TEXT,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpendCategory" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "visibleToStudents" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "SpendCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LineMemoOption" (
    "id" INTEGER NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "LineMemoOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Professors" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "title" TEXT,
    "email" TEXT,

    CONSTRAINT "Professors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_byuId_key" ON "User"("byuId");

-- CreateIndex
CREATE UNIQUE INDEX "SpendCategory_code_key" ON "SpendCategory"("code");

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "Professors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_spendCategoryId_fkey" FOREIGN KEY ("spendCategoryId") REFERENCES "SpendCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_lineMemoOptionId_fkey" FOREIGN KEY ("lineMemoOptionId") REFERENCES "LineMemoOption"("id") ON DELETE SET NULL ON UPDATE CASCADE;
