-- Before this migration, there was no personal orgs assigned to every user. We need to create a personal org for existing projects and teams.

-- * Setup before personal org is created.
-- AlterTable
ALTER TABLE "Project" ADD COLUMN "orgSlug" TEXT;

-- AlterTable
ALTER TABLE "Team" ADD COLUMN "orgSlug" TEXT;


-- * Create a personal org for each user.

-- Temporarily name the org as 'personal-{{user.id}}'
INSERT INTO "Org" ("slug", "name", "personalForUserId", "createdBy", "updatedAt", "updatedBy", "active") 
    SELECT nanoid(13, '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'), 'personal-' || "id", "id", "id", CURRENT_TIMESTAMP, "id", "active" FROM "User";
-- Set the org name correctly to 'personal-{{org.slug}}'
UPDATE "Org" SET "name" = 'personal-' || "slug";

-- Create an OrgMember object to make each user an admin in their personal org
-- It's important to not create "OrgMember" here if the "Org" is not active, since "OrgMember" is hard-deleted when "Org" is deleted.
INSERT INTO "OrgMember" ("orgSlug", "userId", "role", "createdBy", "updatedAt", "updatedBy")
    SELECT "slug", "personalForUserId", 'ADMIN', "personalForUserId", CURRENT_TIMESTAMP, "personalForUserId" FROM "Org" WHERE "active" is true;

-- All teams right now are a team of 1. These teams' names have changed so let's update it.
-- These teams will be linked to the user's personal org.
-- * temporarily disable the audit trigger so that we don't have to update the updatedBy user ID.
ALTER TABLE "Team" DISABLE TRIGGER "TeamAudit";
UPDATE "Team" SET "name" = 'default';
UPDATE "Team" SET "orgSlug" = 
    (SELECT "slug" FROM "Org" inner join "TeamMember" ON "TeamMember"."teamId" = "Team"."id" and "Org"."personalForUserId" = "TeamMember"."userId");
ALTER TABLE "Team" ENABLE TRIGGER "TeamAudit";

-- Attach existing projects to their owner's org
-- * temporarily disable the audit trigger so that we don't have to update the updatedBy user ID.
ALTER TABLE "Project" DISABLE TRIGGER "ProjectAudit";
UPDATE "Project" SET "orgSlug" = (
    SELECT "Team"."orgSlug" 
    FROM "TeamProject" 
        inner join "Team" on "Project"."id" = "TeamProject"."projectId" and "TeamProject"."teamId" = "Team"."id");
ALTER TABLE "Project" DISABLE TRIGGER "ProjectAudit";

-- * Personal org is created and assigned to existing objects.

-- AlterTable
ALTER TABLE "Project" ALTER COLUMN "orgSlug" SET NOT NULL;

-- AlterTable
ALTER TABLE "Team" ALTER COLUMN "orgSlug" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_orgSlug_fkey" FOREIGN KEY ("orgSlug") REFERENCES "Org"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_orgSlug_fkey" FOREIGN KEY ("orgSlug") REFERENCES "Org"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;


-- * Custom conditional unique indexes to make sure we are only enforcing unique name and org combos on non-deleted objects.

-- CreateIndex
CREATE UNIQUE INDEX "Project_name_orgSlug_key" ON "Project"("name", "orgSlug") WHERE (active IS true);

-- CreateIndex
CREATE UNIQUE INDEX "Team_orgSlug_name_key" ON "Team"("orgSlug", "name") WHERE (active IS true);


-- * We are no longer soft-deleting `TeamMember` records, go ahead and hard-delete any existing active=false records.

DELETE FROM "TeamMember" WHERE "active" = false;

-- AlterTable
ALTER TABLE "TeamMember" DROP COLUMN "active"; 
