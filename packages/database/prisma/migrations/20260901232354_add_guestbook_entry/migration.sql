-- CreateEnum
CREATE TYPE "DrawingKind" AS ENUM ('face', 'cat');

-- CreateTable
CREATE TABLE "GuestbookEntry" (
    "entry_id" TEXT NOT NULL,
    "seed" TEXT NOT NULL,
    "kind" "DrawingKind" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuestbookEntry_pkey" PRIMARY KEY ("entry_id")
);

-- CreateIndex
CREATE INDEX "GuestbookEntry_created_at_idx" ON "GuestbookEntry"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "GuestbookEntry_seed_kind_key" ON "GuestbookEntry"("seed", "kind");
