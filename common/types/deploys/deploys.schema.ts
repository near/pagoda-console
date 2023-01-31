import { z } from 'zod';
import { stringifiedDate } from '../schemas';

const frontendDeployments = z.array(
  z.strictObject({
    slug: z.string(),
    url: z.string().or(z.null()),
    cid: z.string().or(z.null()),
    frontendDeployConfig: z.strictObject({
      packageName: z.string()
    })
  }),
);

const contractDeployments = z.array(
  z.strictObject({
    slug: z.string(),
    deployTransactionHash: z.string().or(z.null()),
    status: z.enum(['IN_PROGRESS', 'ERROR', 'SUCCESS'])
  }),
);

const repoDeployments = z.array(
  z.strictObject({
    slug: z.string(),
    commitHash: z.string(),
    commitMessage: z.string(),
    createdAt: stringifiedDate,
    frontendDeployments,
    contractDeployments,
    githubRepoFullName: z.string(),
  }),
);

export const query = {
  inputs: {
    listRepositories: z.strictObject({
      project: z.string(),
    }),
    listDeployments: z.strictObject({
      project: z.string(),
    }),
  },

  outputs: {
    listRepositories: z.array(
      z.strictObject({
        slug: z.string(),
        projectSlug: z.string(),
        environmentSubId: z.number(),
        githubRepoFullName: z.string(),
        enabled: z.boolean(),
        frontendDeployConfigs: z.array(
          z.strictObject({
            slug: z.string(),
            packageName: z.string(),
          }),
        ),
        contractDeployConfigs: z.array(
          z.strictObject({
            slug: z.string(),
            filename: z.string(),
            nearAccountId: z.string(),
          }),
        )
      }),
    ),
    listDeployments: repoDeployments,
  },

  errors: {
    listRepositories: z.unknown(),
    listDeployments: z.unknown(),
  },
};

export const mutation = {
  inputs: {
    addDeploy: z.strictObject({
      githubRepoFullName: z.string().regex(/[\w\.\-]+\/[\w\.\-]+/), // matches <owner/repo> e.g. 'near/pagoda-console`
      projectName: z.string(),
      newGithubUsername: z.string(),
    }),
    deployWasm: z.strictObject({
      githubRepoFullName: z.string().regex(/[\w\.\-]+\/[\w\.\-]+/), // matches <owner/repo> e.g. 'near/pagoda-console`
      commitHash: z.string(),
      commitMessage: z.string(),
    }),
    wasmFiles: z.array(
      z.object({ mimetype: z.string().startsWith('application/wasm') }),
    ),
    addFrontend: z
      .strictObject({
        repoDeploymentSlug: z.string(),
        packageName: z.string(),
        frontendDeployUrl: z.string().url().optional(),
        cid: z.string().optional(),
      })
      .refine(
        (data) => !!data.frontendDeployUrl || !!data.cid,
        'Either frontendDeployUrl or cid should be filled in.',
      ),
  },

  outputs: {
    addDeploy: z.strictObject({
      repositorySlug: z.string(),
      projectSlug: z.string(),
    }),
    deployWasm: z.void(),
    wasmFiles: z.void(),
    addFrontend: z.void(),
  },

  errors: {
    addDeploy: z.unknown(),
    deployWasm: z.unknown(),
    wasmFiles: z.unknown(),
    addFrontend: z.unknown(),
  },
};
