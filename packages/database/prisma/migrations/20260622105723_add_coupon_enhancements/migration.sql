-- AlterEnum
ALTER TYPE "CouponType" ADD VALUE 'FREE_DELIVERY';

-- AlterTable
ALTER TABLE "Coupon" ADD COLUMN     "minimumOrderAmount" DECIMAL(10,2);

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "couponCode" TEXT,
ADD COLUMN     "couponDiscount" DECIMAL(10,2),
ADD COLUMN     "couponType" "CouponType";
