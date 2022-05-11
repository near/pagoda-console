import type { PersistedStore } from '@/utils/types';

export interface ProjectSettings {
  nftContract?: string;
  selectedEnvironmentSubId?: number;
}

export interface UserSettings {
  projects: Record<string, ProjectSettings | undefined>;
  selectedProjectSlug?: string;
}

export interface SettingsStore extends PersistedStore {
  users: Record<string, UserSettings | undefined>;
  updateSettings: (userId: string, settings: Partial<UserSettings>) => void;
  updateProjectSettings: (userId: string, projectSlug: string, settings: Partial<ProjectSettings>) => void;
}
