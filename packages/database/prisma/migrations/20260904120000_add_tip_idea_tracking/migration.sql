ALTER TABLE "TipIdea" ADD COLUMN "receipt" TEXT;
ALTER TABLE "TipIdea" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'heard';
ALTER TABLE "TipIdea" ADD COLUMN "shipped_href" TEXT;

UPDATE "TipIdea"
SET "receipt" = 'legacy_' || "idea_id"
WHERE "receipt" IS NULL;

ALTER TABLE "TipIdea" ALTER COLUMN "receipt" SET NOT NULL;

CREATE UNIQUE INDEX "TipIdea_receipt_key" ON "TipIdea"("receipt");
CREATE INDEX "TipIdea_status_created_at_idx" ON "TipIdea"("status", "created_at");
