import type { Api } from '@pc/common/types/api';

export const getProjectGroups = (data?: Api.Query.Output<'/projects/list'>) => {
  return data
    ? Object.entries(
        data.reduce<Record<string, Api.Query.Output<'/projects/list'>>>((acc, project) => {
          const orgName = project.org.isPersonal ? 'Personal' : project.org.name;
          if (!acc[orgName]) {
            acc[orgName] = [];
          }
          acc[orgName].push(project);
          return acc;
        }, {}),
      ).sort(([, [projectA]], [, [projectB]]) => {
        if (projectA.org.isPersonal && projectB.org.isPersonal) {
          return 0;
        }
        if (projectA.org.isPersonal) {
          return -1;
        }
        if (projectB.org.isPersonal) {
          return 1;
        }
        return projectA.name.localeCompare(projectB.name);
      })
    : [];
};
