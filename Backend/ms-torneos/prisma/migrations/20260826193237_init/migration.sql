-- CreateEnum
CREATE TYPE "EstadoTorneo" AS ENUM ('BORRADOR', 'PUBLICADO', 'EN_CURSO', 'FINALIZADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "FormatoTorneo" AS ENUM ('LIGA', 'ELIMINACION_DIRECTA', 'GRUPOS');

-- CreateTable
CREATE TABLE "Torneo" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "deporte" TEXT NOT NULL,
    "descripcion" TEXT,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3),
    "estado" "EstadoTorneo" NOT NULL DEFAULT 'BORRADOR',
    "formato" "FormatoTorneo" NOT NULL,
    "maxParticipantes" INTEGER NOT NULL,
    "minParticipantes" INTEGER,
    "ganadorId" TEXT,
    "motivoCancelacion" TEXT,
    "organizadorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Torneo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Torneo_estado_idx" ON "Torneo"("estado");

-- CreateIndex
CREATE INDEX "Torneo_deporte_idx" ON "Torneo"("deporte");
