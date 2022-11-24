import type { Projects, Users } from '@pc/common/types/core';

import type { PersistedStore } from '@/utils/types';

export interface ProjectSettings {
  nftContract?: string;
  selectedEnvironmentSubId?: Projects.EnvironmentId;
}

export interface UserSettings {
  projects: Record<Projects.ProjectSlug, ProjectSettings | undefined>;
  selectedProjectSlug?: Projects.ProjectSlug;
}

export interface SettingsStore extends PersistedStore {
  currentUser: UserSettings | undefined;
  hasInitialized: boolean;
  users: Record<Users.UserUid, UserSettings | undefined>;
  initializeCurrentUserSettings: (userId: Users.UserUid) => void;
  updateSettings: (userId: Users.UserUid, settings: Partial<UserSettings>) => void;
  updateProjectSettings: (
    userId: Users.UserUid,
    projectSlug: Projects.ProjectSlug,
    settings: Partial<ProjectSettings>,
  ) => void;
}
