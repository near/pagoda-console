-- CreateTable
CREATE TABLE "FrontendDeployConfig" (
    "slug" TEXT NOT NULL,
    "repositorySlug" TEXT NOT NULL,
    "packageName" TEXT NOT NULL,
    "url" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "FrontendDeployment" (
    "slug" TEXT NOT NULL,
    "repoDeploymentSlug" TEXT NOT NULL,
    "frontendDeployConfigSlug" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "FrontendDeployConfig_slug_key" ON "FrontendDeployConfig"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "FrontendDeployment_slug_key" ON "FrontendDeployment"("slug");

-- AddForeignKey
ALTER TABLE "FrontendDeployConfig" ADD CONSTRAINT "FrontendDeployConfig_repositorySlug_fkey" FOREIGN KEY ("repositorySlug") REFERENCES "Repository"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FrontendDeployment" ADD CONSTRAINT "FrontendDeployment_frontendDeployConfigSlug_fkey" FOREIGN KEY ("frontendDeployConfigSlug") REFERENCES "FrontendDeployConfig"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FrontendDeployment" ADD CONSTRAINT "FrontendDeployment_repoDeploymentSlug_fkey" FOREIGN KEY ("repoDeploymentSlug") REFERENCES "RepoDeployment"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;
