-- CreateTable
CREATE TABLE "Proof" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "titulo" TEXT NOT NULL,
    "banca" TEXT NOT NULL,
    "ano" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Result" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "disciplina" TEXT NOT NULL,
    "acertos" INTEGER NOT NULL,
    "erros" INTEGER NOT NULL,
    "brancos" INTEGER NOT NULL,
    "anuladas" INTEGER NOT NULL,
    "proofId" INTEGER NOT NULL,
    CONSTRAINT "Result_proofId_fkey" FOREIGN KEY ("proofId") REFERENCES "Proof" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
