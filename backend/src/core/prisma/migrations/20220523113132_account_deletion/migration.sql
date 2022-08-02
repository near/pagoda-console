-- DropIndex
DROP INDEX "User_email_key";

-- Create conditionally unique index
CREATE UNIQUE INDEX User_email_key ON "User"(email) WHERE (active IS true);
