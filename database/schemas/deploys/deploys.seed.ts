/*
  Generates mock deployment data.
  Run by (globally) installing ts-node then run
    ts-node deploys.seed.ts
*/
import { customAlphabet } from 'nanoid';

import { PrismaClient as CorePrismaClient, Project } from '../../clients/core';
import { PrismaClient } from '../../clients/deploys';
const core = new CorePrismaClient();
const deploys = new PrismaClient();

const nanoid = customAlphabet(
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  13,
);

const fakeHash = customAlphabet('0123456789abcdef', 64);

const fakeCid = customAlphabet(
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  46,
);

async function main() {
  await core.$connect();
  await deploys.$connect();

  const projects = await core.project.findMany({ where: { active: true } });

  if (projects.length < 2) {
    throw 'Please create at least 2 project(s) to create mock deployment data';
  }

  await createRepo(projects[0]);
  await createRepoWithMultipleConfigs(projects[1]);
}

async function createRepo(project: Project) {
  const githubRepoFullName = 'Prints Free Net Monies';
  const repository = await deploys.repository.upsert({
    where: {
      githubRepoFullName,
    },
    update: {
      projectSlug: project.slug,
    },
    create: {
      projectSlug: project.slug,
      slug: nanoid(),
      environmentSubId: 1, // testnet
      githubRepoFullName,
      authTokenHash: Buffer.from(fakeHash()),
      authTokenSalt: Buffer.from('343443'),
      contractDeployConfigs: {
        create: {
          slug: nanoid(),
          filename: 'helloworld.wasm',
          nearAccountId: 'helloworld.testnet',
          nearPrivateKey:
            '25AA362350E8A994772AB30E41A1C18B8741055B790C8B5A4CF0437B37E6614F',
        },
      },
      frontendDeployConfigs: {
        create: { slug: nanoid(), packageName: 'hello' },
      },
    },
    include: {
      frontendDeployConfigs: true,
      contractDeployConfigs: true,
    },
  });

  await deploys.repoDeployment.create({
    data: {
      slug: nanoid(),
      commitHash: fakeHash(),
      commitMessage: 'Solving problems one piece of code at a time',
      repositorySlug: repository.slug,
      frontendDeployments: {
        create: {
          slug: nanoid(),
          url: 'https://example.com',
          cid: fakeCid(),
          frontendDeployConfigSlug: repository.frontendDeployConfigs[0].slug,
        },
      },
      contractDeployments: {
        create: {
          slug: nanoid(),
          deployTransactionHash: fakeHash(),
          contractDeployConfigSlug: repository.contractDeployConfigs[0].slug,
        },
      },
    },
  });
}

async function createRepoWithMultipleConfigs(project: Project) {
  const githubRepoFullName = 'Solves world internet hunger using blockchain';
  const repository = await deploys.repository.upsert({
    where: {
      githubRepoFullName,
    },
    update: {
      projectSlug: project.slug,
    },
    create: {
      projectSlug: project.slug,
      slug: nanoid(),
      environmentSubId: 1, // testnet
      githubRepoFullName,
      authTokenHash: Buffer.from(fakeHash()),
      authTokenSalt: Buffer.from('saltandpepper'),
      contractDeployConfigs: {
        createMany: {
          data: [
            {
              slug: nanoid(),
              filename: 'worldHunger.wasm',
              nearAccountId: 'whatnameshouldthisbe.testnet',
              nearPrivateKey:
                '25AA362350E8A994772AB30E41A1C18B8741055B790C8B5A4CF0437B37E6614F',
            },
            {
              slug: nanoid(),
              filename: 'solvesEverything.wasm',
              nearAccountId: 'solvesalmosteverything.testnet',
              nearPrivateKey:
                '25AA362350E8A994772AB30E41A1C18B8741055B790C8B5A4CF0437B37E6614F',
            },
          ],
        },
      },
      frontendDeployConfigs: {
        createMany: {
          data: [
            { slug: nanoid(), packageName: 'worldhunger' },
            { slug: nanoid(), packageName: 'solvesEverything' },
          ],
        },
      },
    },
    include: {
      frontendDeployConfigs: true,
      contractDeployConfigs: true,
    },
  });

  await deploys.repoDeployment.create({
    data: {
      slug: nanoid(),
      commitHash: fakeHash(),
      commitMessage: 'Solving problems one piece of code at a time',
      repositorySlug: repository.slug,
      frontendDeployments: {
        createMany: {
          data: [
            {
              slug: nanoid(),
              url: 'https://mycoolhungersolver.com',
              cid: fakeCid(),
              frontendDeployConfigSlug:
                repository.frontendDeployConfigs[0].slug,
            },
            {
              slug: nanoid(),
              url: 'https://admin.mycoolhungersolver.com',
              cid: fakeCid(),
              frontendDeployConfigSlug:
                repository.frontendDeployConfigs[1].slug,
            },
          ],
        },
      },
      contractDeployments: {
        createMany: {
          data: [
            {
              slug: nanoid(),
              deployTransactionHash: fakeHash(),
              contractDeployConfigSlug:
                repository.contractDeployConfigs[0].slug,
            },
            {
              slug: nanoid(),
              deployTransactionHash: fakeHash(),
              contractDeployConfigSlug:
                repository.contractDeployConfigs[1].slug,
            },
          ],
        },
      },
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await core.$disconnect();
    await deploys.$disconnect();
  });
