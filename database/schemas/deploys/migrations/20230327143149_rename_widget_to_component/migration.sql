/*
  Warnings:

  - You are about to drop the `NearSocialWidgetDeployConfig` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `NearSocialWidgetDeployment` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "NearSocialWidgetDeployConfig" DROP CONSTRAINT "NearSocialWidgetDeployConfig_repositorySlug_fkey";

-- DropForeignKey
ALTER TABLE "NearSocialWidgetDeployment" DROP CONSTRAINT "NearSocialWidgetDeployment_nearSocialWidgetDeployConfigSlu_fkey";

-- DropForeignKey
ALTER TABLE "NearSocialWidgetDeployment" DROP CONSTRAINT "NearSocialWidgetDeployment_repoDeploymentSlug_fkey";

-- DropTable
DROP TABLE "NearSocialWidgetDeployConfig";

-- DropTable
DROP TABLE "NearSocialWidgetDeployment";

-- CreateTable
CREATE TABLE "NearSocialComponentDeployConfig" (
    "slug" TEXT NOT NULL,
    "repositorySlug" TEXT NOT NULL,
    "componentName" TEXT NOT NULL,
    "nearAccountId" TEXT NOT NULL,
    "nearPrivateKey" TEXT NOT NULL,
    "componentPath" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "NearSocialComponentDeployment" (
    "slug" TEXT NOT NULL,
    "repoDeploymentSlug" TEXT NOT NULL,
    "nearSocialComponentDeployConfigSlug" TEXT NOT NULL,
    "deployTransactionHash" TEXT,
    "status" "ContractDeployStatus" NOT NULL DEFAULT E'IN_PROGRESS'
);

-- CreateIndex
CREATE UNIQUE INDEX "NearSocialComponentDeployConfig_slug_key" ON "NearSocialComponentDeployConfig"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "NearSocialComponentDeployment_slug_key" ON "NearSocialComponentDeployment"("slug");

-- AddForeignKey
ALTER TABLE "NearSocialComponentDeployConfig" ADD CONSTRAINT "NearSocialComponentDeployConfig_repositorySlug_fkey" FOREIGN KEY ("repositorySlug") REFERENCES "Repository"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NearSocialComponentDeployment" ADD CONSTRAINT "NearSocialComponentDeployment_nearSocialComponentDeployCon_fkey" FOREIGN KEY ("nearSocialComponentDeployConfigSlug") REFERENCES "NearSocialComponentDeployConfig"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NearSocialComponentDeployment" ADD CONSTRAINT "NearSocialComponentDeployment_repoDeploymentSlug_fkey" FOREIGN KEY ("repoDeploymentSlug") REFERENCES "RepoDeployment"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;
