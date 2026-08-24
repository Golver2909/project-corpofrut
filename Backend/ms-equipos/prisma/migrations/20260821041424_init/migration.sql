-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateTable
CREATE TABLE "equipos" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "isDisabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equipos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "miembros" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isCaptain" BOOLEAN NOT NULL DEFAULT false,
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),

    CONSTRAINT "miembros_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipo_actions" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "equipo_actions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "miembros_userId_idx" ON "miembros"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "miembros_teamId_userId_key" ON "miembros"("teamId", "userId");

-- CreateIndex
CREATE INDEX "equipo_actions_teamId_idx" ON "equipo_actions"("teamId");

-- AddForeignKey
ALTER TABLE "miembros" ADD CONSTRAINT "miembros_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "equipos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipo_actions" ADD CONSTRAINT "equipo_actions_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "equipos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
