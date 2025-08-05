-- AlterTable
ALTER TABLE "public"."ApiKey" ADD COLUMN     "metadata" JSONB,
ALTER COLUMN "status" SET DEFAULT 'verifying';
