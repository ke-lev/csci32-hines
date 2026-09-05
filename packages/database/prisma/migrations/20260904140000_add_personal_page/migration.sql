-- CreateTable
CREATE TABLE "PersonalPage" (
    "page_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "intro_title" TEXT,
    "intro_subhead" TEXT,
    "intro_body" TEXT,
    "strokes" JSONB NOT NULL DEFAULT '[]',
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PersonalPage_pkey" PRIMARY KEY ("page_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PersonalPage_user_id_key" ON "PersonalPage"("user_id");

-- AddForeignKey
ALTER TABLE "PersonalPage" ADD CONSTRAINT "PersonalPage_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
