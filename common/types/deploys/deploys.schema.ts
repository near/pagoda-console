import { z } from 'zod';

const frontendDeployments = z.array(
  z.strictObject({
    slug: z.string(),
    url: z.string().or(z.null()),
    cid: z.string().or(z.null()),
  }),
);

const contractDeployments = z.array(
  z.strictObject({
    slug: z.string(),
    deployTransactionHash: z.string().or(z.null()),
  }),
);

const repoDeployments = z.array(
  z.strictObject({
    slug: z.string(),
    commitHash: z.string(),
    commitMessage: z.string(),
    createdAt: z.date(),
    frontendDeployments,
    contractDeployments,
  }),
);

export const query = {
  inputs: {
    listRepositories: z.strictObject({
      projectSlug: z.string(),
      environmentSubId: z.number(),
    }),
    listDeployments: z.strictObject({
      projectSlug: z.string(),
      environmentSubId: z.number().optional(),
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
        ),
        repoDeployments,
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
