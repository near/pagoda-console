import { z } from 'zod';

export const query = {
  inputs: {},

  outputs: {},

  errors: {},
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
