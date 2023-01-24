-- CreateTable
CREATE TABLE "Repository" (
    "slug" TEXT NOT NULL,
    "projectSlug" TEXT NOT NULL,
    "environmentSubId" INTEGER NOT NULL,
    "githubRepoFullName" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "ContractDeployConfig" (
    "slug" TEXT NOT NULL,
    "repositorySlug" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "nearAccountId" TEXT NOT NULL,
    "nearPrivateKey" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "RepoDeployment" (
    "slug" TEXT NOT NULL,
    "repositorySlug" TEXT NOT NULL,
    "commitHash" TEXT NOT NULL,
    "commitMessage" TEXT NOT NULL,
    "frontendDeployUrl" TEXT
);

-- CreateTable
CREATE TABLE "ContractDeployment" (
    "slug" TEXT NOT NULL,
    "repoDeploymentSlug" TEXT NOT NULL,
    "contractDeployConfigSlug" TEXT NOT NULL,
    "deployTransactionHash" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Repository_slug_key" ON "Repository"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ContractDeployConfig_slug_key" ON "ContractDeployConfig"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "RepoDeployment_slug_key" ON "RepoDeployment"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ContractDeployment_slug_key" ON "ContractDeployment"("slug");

-- AddForeignKey
ALTER TABLE "ContractDeployConfig" ADD CONSTRAINT "ContractDeployConfig_repositorySlug_fkey" FOREIGN KEY ("repositorySlug") REFERENCES "Repository"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepoDeployment" ADD CONSTRAINT "RepoDeployment_repositorySlug_fkey" FOREIGN KEY ("repositorySlug") REFERENCES "Repository"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractDeployment" ADD CONSTRAINT "ContractDeployment_contractDeployConfigSlug_fkey" FOREIGN KEY ("contractDeployConfigSlug") REFERENCES "ContractDeployConfig"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractDeployment" ADD CONSTRAINT "ContractDeployment_repoDeploymentSlug_fkey" FOREIGN KEY ("repoDeploymentSlug") REFERENCES "RepoDeployment"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;
