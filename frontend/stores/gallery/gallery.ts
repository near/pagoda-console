import produce from 'immer';
import create from 'zustand';

import { fetchFromCMS } from '@/utils/cms';

export type Templates = Array<Template>;

export interface TemplateAttributes {
  architectureUrl: string | null;
  githubUrl: string;
  name: string;
  nameSlug: string;
  contractLanguage?: 'rust' | 'javascript' | 'typescript';
  tools: { data: Array<FilterDB> };
  categories: { data: Array<FilterDB> };
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface FiltersDB {
  categories: Array<FilterDB>;
  tools: Array<FilterDB>;
  languages: Array<FilterDB>;
}

export interface FilterDB {
  id: number;
  attributes: FilterAttributes;
}

export interface FilterAttributes {
  createdAt: string;
  name: string;
  updatedAt: string;
}

export interface FilterCustom {
  dataObject: Record<string, FilterCustomData>;
}

export interface FilterCustomData {
  option: string;
  value: number;
  checked: boolean;
  loader: boolean;
}

export interface FiltersCustom {
  categories: FilterCustom;
  tools: FilterCustom;
  languages: FilterCustom;
}

export interface GalleryStore {
  dbLoader: boolean;
  filters: FiltersCustom;
  templates: Templates;
  templatesFiltered: Templates;
  template: Template | any;
  moreLikeThis: Templates;
  setTemplates: (templates: Templates) => void;
  setFilters: (filters: FiltersDB) => void;
  switchFilter: (id: string | number, filter: string) => Promise<void>;
  resetFilters: () => void;
  setTemplate: (template: Template) => void;
  setMoreLikeThis: (moreLikeThis: Templates) => void;
}

export interface Template {
  id: number;
  attributes: TemplateAttributes;
}

const filterState = {
  dataObject: {},
};

const templateInitialState = {
  tools: {
    allUsed: [],
  },
};

const filtersInitialState = {
  categories: filterState,
  tools: filterState,
  languages: filterState,
};

const initialState = {
  dbLoader: false,
  filters: filtersInitialState,
  templates: [],
  templatesFiltered: [],
  template: templateInitialState,
  moreLikeThis: [],
};

export const useGalleryStore = create<GalleryStore>((set, get: () => GalleryStore) => ({
  ...initialState,
  setTemplates: (templates: Templates) => {
    set(
      produce((state: GalleryStore) => {
        state.templatesFiltered = templates;
        state.templates = templates;
      }),
    );

    // --- TODO: to be removed when languages will be available
    set(
      produce((state) => {
        state.templates.map((template) => (template.attributes.languages = { data: [], ids: [] }));
      }),
    );
    // ---

    const filtersArray = Object.keys(get().filters);

    set(
      produce((state: GalleryStore) => {
        state.templates.map(({ attributes }) =>
          filtersArray.map(
            (filter) => (attributes[filter].ids = attributes[filter]?.data.map((filter) => filter.id) || []),
          ),
        );
      }),
    );
  },
  setFilters: (filters) => {
    const filtersArray = Object.keys(filters);

    filtersArray.map((filter) => {
      set(
        produce((state: GalleryStore) => {
          state.filters[filter] = filterState;
        }),
      );

      set(
        produce((state: GalleryStore) => {
          filters[filter].map((f) => {
            state.filters[filter].dataObject[f.id] = {
              option: f.attributes.name,
              value: f.id,
              checked: false,
            };
          });
        }),
      );
    });
  },
  switchFilter: async (id, filter) => {
    set(
      produce((state: GalleryStore) => {
        const dataObject = selectFiltersDataObject(state, filter)[id];
        dataObject.checked = !dataObject.checked;
        dataObject.loader = true;
        state.dbLoader = true;
      }),
    );

    let url = '/templates?';
    Object.keys(get().filters).map((filter, i) => {
      const dataObject: FilterCustomData = get().filters[filter].dataObject;
      Object.values(dataObject).map(
        (data, j) => (url += data.checked ? `filters[$and][${i}][$or][${j}][${filter}][id][$eq]=${data.value}&` : ''),
      );
    });
    const templatesFiltered = await fetchFromCMS({ url });

    set({ templatesFiltered });

    set(
      produce((state: GalleryStore) => {
        const dataObject = selectFiltersDataObject(state, filter)[id];
        dataObject.loader = false;
        state.dbLoader = false;
      }),
    );
  },
  resetFilters: () => {
    set(
      produce((state: GalleryStore) => {
        Object.values(state.filters).map((filter: FilterCustom) =>
          Object.values(filter.dataObject).map((data) => (data.checked = false)),
        );
      }),
    );
    set({ templatesFiltered: get().templates });
  },
  setTemplate: (template) => {
    set({
      template: {
        ...templateInitialState,
        ...template,
      },
    });

    // --- TODO: to be removed when languages will be available
    set(
      produce((state: GalleryStore) => {
        state.template.attributes.languages = { data: [], ids: [] };
      }),
    );
    // ---

    Object.keys(get().filters).map((gf) => {
      set(
        produce((state: GalleryStore) => {
          state.template.tools[gf] = [];
          state.template.tools[gf] =
            template.attributes[gf]?.data.map((filter) => ({ name: filter.attributes.name, id: filter.id })) || [];

          state.template.tools.allUsed.push(...state.template.tools[gf]);
        }),
      );
    });
  },
  setMoreLikeThis: (moreLikeThis) => {
    set({ moreLikeThis });
  },
}));

// SELECTORS - filters
export const selectFilters = (state: GalleryStore) => state.filters;

export const selectFilterOptions = (state: GalleryStore): { [key: string]: Array<FilterCustomData> } =>
  Object.keys(selectFilters(state)).reduce(
    (x, filter) => ({
      ...x,
      [filter]: Object.values(state.filters[filter].dataObject),
    }),
    {},
  ) || {};

export const selectFiltersFilter = (state: GalleryStore, filter: string) => selectFilters(state)[filter] || {};

export const selectFiltersDataObject = (state: GalleryStore, filter: string) =>
  selectFiltersFilter(state, filter).dataObject || {};

// SELECTORS - MoreLikeThis
export const selectMoreLikeThis = (state: GalleryStore) => state.moreLikeThis;

// SELECTORS - Templates
export const selectTemplates = (state: GalleryStore) => state.templates;

export const selectTemplatesFiltered = (state: GalleryStore) => state.templatesFiltered || [];

export const selectNumberOfResults = (state: GalleryStore) => selectTemplatesFiltered(state).length;

// SELECTORS - Template
export const selectTemplate = (state: GalleryStore) => state.template;

export const selectTemplateAttributes = (state: GalleryStore) => selectTemplate(state).attributes || {};

export const selectTemplateTools = (state: GalleryStore) => selectTemplate(state).tools || [];
