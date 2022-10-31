/*
  Warnings:

  - A unique constraint covering the columns `[name,orgSlug]` on the table `Project` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[orgSlug,name]` on the table `Team` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Project_name_orgSlug_key" ON "Project"("name", "orgSlug");

-- CreateIndex
CREATE UNIQUE INDEX "Team_orgSlug_name_key" ON "Team"("orgSlug", "name");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
