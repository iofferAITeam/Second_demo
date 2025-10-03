-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('INACTIVE', 'ACTIVE', 'TRIAL', 'CANCELLED', 'EXPIRED', 'PAST_DUE');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "isPremium" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "subscriptionStatus" "SubscriptionStatus" NOT NULL DEFAULT 'INACTIVE',
ADD COLUMN     "stripeCustomerId" TEXT,
ADD COLUMN     "stripeSubscriptionId" TEXT,
ADD COLUMN     "subscriptionStartDate" TIMESTAMP(3),
ADD COLUMN     "subscriptionEndDate" TIMESTAMP(3),
ADD COLUMN     "subscriptionPlan" TEXT,
ADD COLUMN     "paymentMethod" TEXT,
ADD COLUMN     "lastPaymentDate" TIMESTAMP(3),
ADD COLUMN     "nextPaymentDate" TIMESTAMP(3);

