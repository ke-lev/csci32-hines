-- CreateTable
CREATE TABLE "TipIdea" (
    "idea_id" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TipIdea_pkey" PRIMARY KEY ("idea_id")
);

-- CreateIndex
CREATE INDEX "TipIdea_created_at_idx" ON "TipIdea"("created_at");
