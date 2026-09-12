ALTER TABLE "TipIdea" ADD COLUMN "closed_at" TIMESTAMP(3);

CREATE INDEX "TipIdea_closed_at_created_at_idx" ON "TipIdea"("closed_at", "created_at");
