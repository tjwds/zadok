/*
  Warnings:

  - You are about to drop the column `created` on the `Habit` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Habit" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "timeBlockId" INTEGER,
    CONSTRAINT "Habit_timeBlockId_fkey" FOREIGN KEY ("timeBlockId") REFERENCES "TimeBlock" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Habit" ("id", "timeBlockId", "title") SELECT "id", "timeBlockId", "title" FROM "Habit";
DROP TABLE "Habit";
ALTER TABLE "new_Habit" RENAME TO "Habit";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
