import { z } from 'zod';
import { stringifiedDate } from '../schemas';

const frontendDeployments = z.array(
  z.strictObject({
    slug: z.string(),
    url: z.string().or(z.null()),
    cid: z.string().or(z.null()),
    frontendDeployConfig: z.strictObject({
      packageName: z.string(),
    }),
  }),
);

const nearSocialComponentDeployments = z.array(
  z.strictObject({
    slug: z.string(),
    deployTransactionHash: z.string().or(z.null()),
    nearSocialComponentDeployConfig: z.strictObject({
      componentName: z.string(),
      componentPath: z.string(),
    }),
  }),
);

const contractDeployments = z.array(
  z.strictObject({
    slug: z.string(),
    deployTransactionHash: z.string().or(z.null()),
    status: z.enum(['IN_PROGRESS', 'ERROR', 'SUCCESS']),
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
    nearSocialComponentDeployments,
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
    isRepositoryTransferred: z.strictObject({
      repositorySlug: z.string(),
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
      }),
    ),
    listDeployments: repoDeployments,
    isRepositoryTransferred: z.strictObject({
      isTransferred: z.boolean(),
    }),
  },

  errors: {
    listRepositories: z.unknown(),
    listDeployments: z.unknown(),
    isRepositoryTransferred: z.unknown(),
  },
};

export const mutation = {
  inputs: {
    addDeploy: z.strictObject({
      githubRepoFullName: z.string().regex(/[\w\.\-]+\/[\w\.\-]+/), // matches <owner/repo> e.g. 'near/pagoda-console`
      projectName: z.string(),
    }),
    transferGithubRepository: z.strictObject({
      repositorySlug: z.string(),
      newGithubUsername: z.string(),
    }),
    deployWasm: z.strictObject({
      repoDeploymentSlug: z.string(),
    }),
    addRepoDeployment: z.strictObject({
      githubRepoFullName: z.string().regex(/[\w\.\-]+\/[\w\.\-]+/), // matches <owner/repo> e.g. 'near/pagoda-console`
      commitHash: z.string(),
      commitMessage: z.string(),
    }),
    deployNearSocialComponent: z.strictObject({
      repoDeploymentSlug: z.string(),
      componentName: z
        .string()
        .regex(/^[a-zA-Z0-9]*$/)
        .optional(),
      componentDescription: z.string().optional(),
      componentIconIpfsCid: z.string().optional(),
      componentTags: z.array(z.string()).optional(),
    }),
    wasmFiles: z.array(
      z.object({ mimetype: z.string().startsWith('application/wasm') }),
    ),
    nearSocialFiles: z
      .array(z.object({ mimetype: z.string().startsWith('text/') }))
      .length(1),
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
    transferGithubRepository: z.strictObject({
      repositorySlug: z.string(),
      githubRepoFullName: z.string(),
    }),
    addRepoDeployment: z.strictObject({
      repoDeploymentSlug: z.string(),
    }),
    deployWasm: z.void(),
    wasmFiles: z.void(),
    addFrontend: z.void(),
  },

  errors: {
    addDeploy: z.unknown(),
    transferGithubRepository: z.unknown(),
    addRepoDeployment: z.unknown(),
    deployWasm: z.unknown(),
    wasmFiles: z.unknown(),
    addFrontend: z.unknown(),
  },
};
