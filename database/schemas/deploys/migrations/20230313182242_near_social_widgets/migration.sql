-- CreateTable
CREATE TABLE "NearSocialWidgetDeployConfig" (
    "slug" TEXT NOT NULL,
    "repositorySlug" TEXT NOT NULL,
    "widgetName" TEXT NOT NULL,
    "nearAccountId" TEXT NOT NULL,
    "nearPrivateKey" TEXT NOT NULL,
    "widgetPath" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "NearSocialWidgetDeployment" (
    "slug" TEXT NOT NULL,
    "repoDeploymentSlug" TEXT NOT NULL,
    "nearSocialWidgetDeployConfigSlug" TEXT NOT NULL,
    "deployTransactionHash" TEXT,
    "status" "ContractDeployStatus" NOT NULL DEFAULT E'IN_PROGRESS'
);

-- CreateIndex
CREATE UNIQUE INDEX "NearSocialWidgetDeployConfig_slug_key" ON "NearSocialWidgetDeployConfig"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "NearSocialWidgetDeployment_slug_key" ON "NearSocialWidgetDeployment"("slug");

-- AddForeignKey
ALTER TABLE "NearSocialWidgetDeployConfig" ADD CONSTRAINT "NearSocialWidgetDeployConfig_repositorySlug_fkey" FOREIGN KEY ("repositorySlug") REFERENCES "Repository"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NearSocialWidgetDeployment" ADD CONSTRAINT "NearSocialWidgetDeployment_nearSocialWidgetDeployConfigSlu_fkey" FOREIGN KEY ("nearSocialWidgetDeployConfigSlug") REFERENCES "NearSocialWidgetDeployConfig"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NearSocialWidgetDeployment" ADD CONSTRAINT "NearSocialWidgetDeployment_repoDeploymentSlug_fkey" FOREIGN KEY ("repoDeploymentSlug") REFERENCES "RepoDeployment"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;
