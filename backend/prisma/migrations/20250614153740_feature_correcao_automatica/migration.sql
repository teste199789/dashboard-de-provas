-- AlterTable
ALTER TABLE "Proof" ADD COLUMN "gabaritoDefinitivo" TEXT;
ALTER TABLE "Proof" ADD COLUMN "gabaritoPreliminar" TEXT;
ALTER TABLE "Proof" ADD COLUMN "tipoPontuacao" TEXT;
ALTER TABLE "Proof" ADD COLUMN "totalQuestoes" INTEGER;
ALTER TABLE "Proof" ADD COLUMN "userAnswers" TEXT;

-- CreateTable
CREATE TABLE "Subject" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "questoes" INTEGER NOT NULL,
    "proofId" INTEGER NOT NULL,
    CONSTRAINT "Subject_proofId_fkey" FOREIGN KEY ("proofId") REFERENCES "Proof" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
