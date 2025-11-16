-- CreateTable
CREATE TABLE "memory_lanes" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "memory_lanes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "memories" (
    "id" TEXT NOT NULL,
    "memoryLaneId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "memories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "memory_images" (
    "id" TEXT NOT NULL,
    "memoryId" TEXT NOT NULL,
    "blobUrl" TEXT NOT NULL,
    "blobPath" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "memory_images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "memories_memoryLaneId_timestamp_idx" ON "memories"("memoryLaneId", "timestamp");

-- CreateIndex
CREATE INDEX "memory_images_memoryId_order_idx" ON "memory_images"("memoryId", "order");

-- AddForeignKey
ALTER TABLE "memories" ADD CONSTRAINT "memories_memoryLaneId_fkey" FOREIGN KEY ("memoryLaneId") REFERENCES "memory_lanes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memory_images" ADD CONSTRAINT "memory_images_memoryId_fkey" FOREIGN KEY ("memoryId") REFERENCES "memories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
