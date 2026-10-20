-- DropForeignKey
ALTER TABLE "article" DROP CONSTRAINT IF EXISTS "article_authorId_fkey";

-- AlterTable
ALTER TABLE "article" ADD COLUMN IF NOT EXISTS "authorDept" TEXT,
ADD COLUMN IF NOT EXISTS "authorEmail" TEXT,
ADD COLUMN IF NOT EXISTS "authorName" TEXT,
ADD COLUMN IF NOT EXISTS "coverImagePublicId" TEXT,
ADD COLUMN IF NOT EXISTS "editorialFeedback" TEXT,
ADD COLUMN IF NOT EXISTS "editorialNotes" TEXT,
ADD COLUMN IF NOT EXISTS "enteredByEditor" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "isFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "publishedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "rejectionReason" TEXT,
ADD COLUMN IF NOT EXISTS "reviewedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "reviewedBy" TEXT,
ADD COLUMN IF NOT EXISTS "submissionRef" TEXT,
ADD COLUMN IF NOT EXISTS "submissionSource" TEXT,
ADD COLUMN IF NOT EXISTS "submittedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "tags" TEXT,
ALTER COLUMN "status" SET DEFAULT 'DRAFT',
ALTER COLUMN "authorId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "category" ADD COLUMN IF NOT EXISTS "coverImage" TEXT,
ADD COLUMN IF NOT EXISTS "description" TEXT,
ADD COLUMN IF NOT EXISTS "iconName" TEXT;

-- AlterTable
ALTER TABLE "magazine_issue" ADD COLUMN IF NOT EXISTS "coverImagePublicId" TEXT,
ADD COLUMN IF NOT EXISTS "edition" TEXT,
ADD COLUMN IF NOT EXISTS "isFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "pdfAssetPublicId" TEXT,
ADD COLUMN IF NOT EXISTS "publicationYear" INTEGER;

-- CreateTable
CREATE TABLE IF NOT EXISTS "article_revision" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT,
    "coverImage" TEXT,
    "feedback" TEXT,
    "status" TEXT NOT NULL,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "article_revision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "editorial_activity" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "entityTitle" TEXT,
    "performedBy" TEXT NOT NULL,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "editorial_activity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "article_submissionRef_key" ON "article"("submissionRef");

-- AddForeignKey
ALTER TABLE "article" ADD CONSTRAINT "article_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_revision" ADD CONSTRAINT "article_revision_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "article"("id") ON DELETE CASCADE ON UPDATE CASCADE;
