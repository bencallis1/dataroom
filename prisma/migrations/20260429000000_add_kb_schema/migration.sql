-- Private AI knowledge base schema.
-- Adds chunks, entities, relationships, claims, analysis runs, and per-version
-- index state. Document/DocumentVersion are not modified; FKs to them are
-- enforced at the SQL level here.

-- Required for the `vector(1536)` column on DocumentChunk.embedding.
CREATE EXTENSION IF NOT EXISTS vector;

-- CreateEnum
CREATE TYPE "KbEntityType" AS ENUM ('PERSON', 'ORGANIZATION', 'PRODUCT', 'LOCATION', 'EVENT', 'CONCEPT', 'METRIC', 'DATE', 'OTHER');

-- CreateEnum
CREATE TYPE "AnalysisRunStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "KbIndexStatus" AS ENUM ('PENDING', 'INDEXING', 'READY', 'STALE', 'FAILED');

-- CreateTable
CREATE TABLE "DocumentChunk" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "documentVersionId" TEXT NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "pageNumber" INTEGER,
    "content" TEXT NOT NULL,
    "tokenCount" INTEGER,
    "embedding" vector(1536),
    "metadata" JSONB,
    "teamId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentChunk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KbEntity" (
    "id" TEXT NOT NULL,
    "type" "KbEntityType" NOT NULL,
    "name" TEXT NOT NULL,
    "canonicalName" TEXT,
    "description" TEXT,
    "aliases" TEXT[],
    "attributes" JSONB,
    "teamId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KbEntity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntityRelationship" (
    "id" TEXT NOT NULL,
    "fromEntityId" TEXT NOT NULL,
    "toEntityId" TEXT NOT NULL,
    "relationType" TEXT NOT NULL,
    "description" TEXT,
    "confidence" DOUBLE PRECISION,
    "attributes" JSONB,
    "teamId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EntityRelationship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentClaim" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "documentVersionId" TEXT,
    "chunkId" TEXT,
    "entityId" TEXT,
    "statement" TEXT NOT NULL,
    "claimType" TEXT,
    "pageNumber" INTEGER,
    "confidence" DOUBLE PRECISION,
    "evidence" JSONB,
    "teamId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentClaim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalysisRun" (
    "id" TEXT NOT NULL,
    "documentId" TEXT,
    "documentVersionId" TEXT,
    "runType" TEXT NOT NULL,
    "status" "AnalysisRunStatus" NOT NULL DEFAULT 'PENDING',
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "error" TEXT,
    "stats" JSONB,
    "config" JSONB,
    "teamId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnalysisRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KbIndexState" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "documentVersionId" TEXT NOT NULL,
    "status" "KbIndexStatus" NOT NULL DEFAULT 'PENDING',
    "chunkCount" INTEGER NOT NULL DEFAULT 0,
    "entityCount" INTEGER NOT NULL DEFAULT 0,
    "claimCount" INTEGER NOT NULL DEFAULT 0,
    "embeddingModel" TEXT,
    "lastIndexedAt" TIMESTAMP(3),
    "lastError" TEXT,
    "teamId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KbIndexState_pkey" PRIMARY KEY ("id")
);

-- CreateIndex (DocumentChunk)
CREATE UNIQUE INDEX "DocumentChunk_documentVersionId_chunkIndex_key" ON "DocumentChunk"("documentVersionId" ASC, "chunkIndex" ASC);
CREATE INDEX "DocumentChunk_teamId_idx" ON "DocumentChunk"("teamId" ASC);
CREATE INDEX "DocumentChunk_documentId_idx" ON "DocumentChunk"("documentId" ASC);
CREATE INDEX "DocumentChunk_documentVersionId_idx" ON "DocumentChunk"("documentVersionId" ASC);
CREATE INDEX "DocumentChunk_teamId_documentId_idx" ON "DocumentChunk"("teamId" ASC, "documentId" ASC);
CREATE INDEX "DocumentChunk_documentVersionId_chunkIndex_idx" ON "DocumentChunk"("documentVersionId" ASC, "chunkIndex" ASC);

-- pgvector ANN index (cosine). lists=100 is a reasonable starting point; tune
-- based on row count once data is loaded.
CREATE INDEX "DocumentChunk_embedding_idx" ON "DocumentChunk" USING ivfflat ("embedding" vector_cosine_ops) WITH (lists = 100);

-- CreateIndex (KbEntity)
CREATE UNIQUE INDEX "KbEntity_teamId_type_canonicalName_key" ON "KbEntity"("teamId" ASC, "type" ASC, "canonicalName" ASC);
CREATE INDEX "KbEntity_teamId_idx" ON "KbEntity"("teamId" ASC);
CREATE INDEX "KbEntity_teamId_type_idx" ON "KbEntity"("teamId" ASC, "type" ASC);
CREATE INDEX "KbEntity_teamId_name_idx" ON "KbEntity"("teamId" ASC, "name" ASC);
CREATE INDEX "KbEntity_type_idx" ON "KbEntity"("type" ASC);

-- CreateIndex (EntityRelationship)
CREATE UNIQUE INDEX "EntityRelationship_teamId_fromEntityId_toEntityId_relationT_key" ON "EntityRelationship"("teamId" ASC, "fromEntityId" ASC, "toEntityId" ASC, "relationType" ASC);
CREATE INDEX "EntityRelationship_teamId_idx" ON "EntityRelationship"("teamId" ASC);
CREATE INDEX "EntityRelationship_fromEntityId_idx" ON "EntityRelationship"("fromEntityId" ASC);
CREATE INDEX "EntityRelationship_toEntityId_idx" ON "EntityRelationship"("toEntityId" ASC);
CREATE INDEX "EntityRelationship_relationType_idx" ON "EntityRelationship"("relationType" ASC);
CREATE INDEX "EntityRelationship_teamId_relationType_idx" ON "EntityRelationship"("teamId" ASC, "relationType" ASC);

-- CreateIndex (DocumentClaim)
CREATE INDEX "DocumentClaim_teamId_idx" ON "DocumentClaim"("teamId" ASC);
CREATE INDEX "DocumentClaim_documentId_idx" ON "DocumentClaim"("documentId" ASC);
CREATE INDEX "DocumentClaim_documentVersionId_idx" ON "DocumentClaim"("documentVersionId" ASC);
CREATE INDEX "DocumentClaim_chunkId_idx" ON "DocumentClaim"("chunkId" ASC);
CREATE INDEX "DocumentClaim_entityId_idx" ON "DocumentClaim"("entityId" ASC);
CREATE INDEX "DocumentClaim_teamId_documentId_idx" ON "DocumentClaim"("teamId" ASC, "documentId" ASC);
CREATE INDEX "DocumentClaim_teamId_claimType_idx" ON "DocumentClaim"("teamId" ASC, "claimType" ASC);

-- CreateIndex (AnalysisRun)
CREATE INDEX "AnalysisRun_teamId_idx" ON "AnalysisRun"("teamId" ASC);
CREATE INDEX "AnalysisRun_teamId_status_idx" ON "AnalysisRun"("teamId" ASC, "status" ASC);
CREATE INDEX "AnalysisRun_documentId_idx" ON "AnalysisRun"("documentId" ASC);
CREATE INDEX "AnalysisRun_documentVersionId_idx" ON "AnalysisRun"("documentVersionId" ASC);
CREATE INDEX "AnalysisRun_status_createdAt_idx" ON "AnalysisRun"("status" ASC, "createdAt" DESC);

-- CreateIndex (KbIndexState)
CREATE UNIQUE INDEX "KbIndexState_documentVersionId_key" ON "KbIndexState"("documentVersionId" ASC);
CREATE INDEX "KbIndexState_teamId_idx" ON "KbIndexState"("teamId" ASC);
CREATE INDEX "KbIndexState_teamId_status_idx" ON "KbIndexState"("teamId" ASC, "status" ASC);
CREATE INDEX "KbIndexState_documentId_idx" ON "KbIndexState"("documentId" ASC);
CREATE INDEX "KbIndexState_status_idx" ON "KbIndexState"("status" ASC);

-- AddForeignKey: Team relations (managed by Prisma)
ALTER TABLE "DocumentChunk" ADD CONSTRAINT "DocumentChunk_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "KbEntity" ADD CONSTRAINT "KbEntity_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EntityRelationship" ADD CONSTRAINT "EntityRelationship_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DocumentClaim" ADD CONSTRAINT "DocumentClaim_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AnalysisRun" ADD CONSTRAINT "AnalysisRun_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "KbIndexState" ADD CONSTRAINT "KbIndexState_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: Entity self-relations
ALTER TABLE "EntityRelationship" ADD CONSTRAINT "EntityRelationship_fromEntityId_fkey" FOREIGN KEY ("fromEntityId") REFERENCES "KbEntity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EntityRelationship" ADD CONSTRAINT "EntityRelationship_toEntityId_fkey" FOREIGN KEY ("toEntityId") REFERENCES "KbEntity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: Claim -> Chunk / Entity (managed by Prisma)
ALTER TABLE "DocumentClaim" ADD CONSTRAINT "DocumentClaim_chunkId_fkey" FOREIGN KEY ("chunkId") REFERENCES "DocumentChunk"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "DocumentClaim" ADD CONSTRAINT "DocumentClaim_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "KbEntity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: Document / DocumentVersion linkage.
-- These are not declared as Prisma `@relation`s (Document and DocumentVersion
-- are intentionally not modified), but the database still enforces them so a
-- delete cascades correctly.
ALTER TABLE "DocumentChunk" ADD CONSTRAINT "DocumentChunk_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DocumentChunk" ADD CONSTRAINT "DocumentChunk_documentVersionId_fkey" FOREIGN KEY ("documentVersionId") REFERENCES "DocumentVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "DocumentClaim" ADD CONSTRAINT "DocumentClaim_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DocumentClaim" ADD CONSTRAINT "DocumentClaim_documentVersionId_fkey" FOREIGN KEY ("documentVersionId") REFERENCES "DocumentVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AnalysisRun" ADD CONSTRAINT "AnalysisRun_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AnalysisRun" ADD CONSTRAINT "AnalysisRun_documentVersionId_fkey" FOREIGN KEY ("documentVersionId") REFERENCES "DocumentVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "KbIndexState" ADD CONSTRAINT "KbIndexState_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "KbIndexState" ADD CONSTRAINT "KbIndexState_documentVersionId_fkey" FOREIGN KEY ("documentVersionId") REFERENCES "DocumentVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
