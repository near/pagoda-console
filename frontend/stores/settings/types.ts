import type { Projects, Users } from '@pc/common/types/core';

export interface ProjectSettings {
  nftContract?: string;
  selectedEnvironmentSubId?: Projects.EnvironmentId;
}

export interface UserSettings {
  projects: Record<Projects.ProjectSlug, ProjectSettings | undefined>;
  selectedProjectSlug?: Projects.ProjectSlug;
}

interface PersistedStore {
  hasHydrated?: boolean;
}

export interface SettingsStore extends PersistedStore {
  currentUser: UserSettings | undefined;
  hasInitialized: boolean;
  users: Record<string, UserSettings | undefined>;
  initializeCurrentUserSettings: (userId: Users.UserUid) => void;
  updateSettings: (userId: Users.UserUid, settings: Partial<UserSettings>) => void;
  updateProjectSettings: (
    userId: Users.UserUid,
    projectSlug: Projects.ProjectSlug,
    settings: Partial<ProjectSettings>,
  ) => void;
}
