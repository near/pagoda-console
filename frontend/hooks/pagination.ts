import { useState } from 'react';

import config from '@/utils/config';

export interface PagingState {
  currentPage: number;
  itemCount: number;
  liveRefreshEnabled: boolean;
  pageSize: number;
  pagingDateTime: Date | undefined;
}

export function usePagination() {
  const [state, setState] = useState<PagingState>({
    currentPage: 1,
    itemCount: 0,
    liveRefreshEnabled: true,
    pageSize: config.defaultPageSize,
    pagingDateTime: undefined,
  });

  function updateState(newState: Partial<PagingState>) {
    setState({
      ...state,
      ...newState,
    });
  }

  function goToNextPage() {
    if (state.currentPage >= numberOfPages) return;

    updateState({
      currentPage: state.currentPage + 1,
      liveRefreshEnabled: false,
      pagingDateTime: state.pagingDateTime || new Date(),
    });
  }

  function goToPreviousPage() {
    if (state.currentPage <= 1) return;

    updateState({
      currentPage: state.currentPage - 1,
      liveRefreshEnabled: false,
      pagingDateTime: state.pagingDateTime || new Date(),
    });
  }

  function updateLiveRefresh(isEnabled: boolean) {
    updateState({
      currentPage: 1,
      liveRefreshEnabled: isEnabled,
      pagingDateTime: isEnabled ? undefined : new Date(),
    });
  }

  function updateItemCount(itemCount?: number) {
    if (itemCount === undefined || itemCount === state.itemCount) return;

    updateState({
      itemCount,
    });
  }

  function updatePageSize(pageSize: number) {
    if (state.pageSize === pageSize) return;

    updateState({
      pageSize,
    });
  }

  const numberOfPages = Math.ceil(state.itemCount / state.pageSize);
  const currentPageFirstItem = (state.currentPage - 1) * state.pageSize + 1;
  const currentPageItemRange = currentPageFirstItem + state.pageSize - 1;
  const currentPageLastItem = currentPageItemRange < state.itemCount ? currentPageItemRange : state.itemCount;

  return {
    currentPageFirstItem,
    currentPageLastItem,
    goToNextPage,
    goToPreviousPage,
    numberOfPages,
    state,
    updateLiveRefresh,
    updateItemCount,
    updatePageSize,
  };
}

export type Pagination = ReturnType<typeof usePagination>;
