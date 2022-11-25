import type { Api } from '@pc/common/types/api';

type Projects = Api.Query.Output<'/projects/list'>;

export const getProjectGroups = (projects: Projects) => {
  return Object.entries(
    projects.reduce<Record<string, Projects>>((acc, project) => {
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
  });
};
