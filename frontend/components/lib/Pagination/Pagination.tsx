import type { Pagination } from '@/hooks/pagination';

import { Button } from '../Button';
import { FeatherIcon } from '../FeatherIcon';
import { Flex } from '../Flex';
import { Text } from '../Text';

interface Props {
  pagination: Pagination;
  totalCount?: number;
}

export function Pagination({ pagination, totalCount }: Props) {
  if (pagination.numberOfPages <= 1) return null;

  return (
    <Flex align="center" justify="spaceBetween">
      <Text size="bodySmall" color="text3" css={{ whiteSpace: 'nowrap' }}>
        Records {pagination.currentPageFirstItem} - {pagination.currentPageLastItem} of {totalCount}
      </Text>

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
