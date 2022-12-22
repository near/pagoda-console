import type { FilterCustomData } from '@/stores/gallery/gallery';

export interface FilterButtonsProps {
  title: string;
  options: Array<FilterCustomData>;
  name: string;
}
