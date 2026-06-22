CREATE TYPE "PaymentMethod" AS ENUM ('COD', 'PAYMOB');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'CANCELED');

ALTER TABLE "Order"
ADD COLUMN "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'COD',
ADD COLUMN "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN "paymobIntentionId" TEXT,
ADD COLUMN "paymobTransactionId" TEXT,
ADD COLUMN "paymobOrderId" TEXT,
ADD COLUMN "paymobClientSecret" TEXT,
ADD COLUMN "paidAt" TIMESTAMP(3);

CREATE INDEX "Order_paymentStatus_idx" ON "Order"("paymentStatus");
CREATE INDEX "Order_paymobIntentionId_idx" ON "Order"("paymobIntentionId");
CREATE INDEX "Order_paymobTransactionId_idx" ON "Order"("paymobTransactionId");
