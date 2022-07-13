import type { Pagination } from '@/hooks/pagination';

import { Button } from '../Button';
import { FeatherIcon } from '../FeatherIcon';
import { Flex } from '../Flex';
import { Spinner } from '../Spinner';
import { Text } from '../Text';

interface Props {
  isLoadingPage: boolean;
  pagination: Pagination;
  totalCount?: number;
}

export function Pagination({ isLoadingPage, pagination, totalCount }: Props) {
  return (
    <Flex align="center" justify="spaceBetween">
      {isLoadingPage ? (
        <Spinner size="s" />
      ) : (
        <Text size="bodySmall" color="text3" css={{ whiteSpace: 'nowrap' }}>
          Records {pagination.currentPageFirstItem} - {pagination.currentPageLastItem} of {totalCount}
        </Text>
      )}

      <Flex align="center" css={{ width: 'auto' }}>
        <Button
          aria-label="Previous Page"
          color="neutral"
          size="s"
          disabled={pagination.state.currentPage <= 1}
          onClick={pagination.goToPreviousPage}
        >
          <FeatherIcon icon="chevron-left" /> Prev
        </Button>
        <Text css={{ whiteSpace: 'nowrap' }}>
          Page {pagination.state.currentPage} / {pagination.numberOfPages}
        </Text>
        <Button
          aria-label="Next Page"
          color="neutral"
          size="s"
          disabled={pagination.state.currentPage >= pagination.numberOfPages}
          onClick={pagination.goToNextPage}
        >
          Next <FeatherIcon icon="chevron-right" />
        </Button>
      </Flex>
    </Flex>
  );
}
