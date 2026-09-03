-- AddColumn
ALTER TABLE "User" ADD COLUMN "username" TEXT;

-- Give existing accounts a stable, unique username derived from their old name.
UPDATE "User"
SET "username" =
  COALESCE(
    NULLIF(LOWER(REGEXP_REPLACE(TRIM("name"), '[^a-zA-Z0-9_-]+', '-', 'g')), ''),
    'user'
  ) || '-' || LEFT("user_id", 6);

ALTER TABLE "User" ALTER COLUMN "username" SET NOT NULL;
ALTER TABLE "User" DROP COLUMN "name";

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
