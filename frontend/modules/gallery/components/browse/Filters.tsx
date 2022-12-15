import { Box } from '@/components/lib/Box';
import { HR } from '@/components/lib/HorizontalRule';
import { useGalleryStore } from '@/stores/gallery';
import { selectFilterOptions } from '@/stores/gallery/gallery';

import FiltersButtons from './FiltersButtons';
import FiltersCheckboxes from './FiltersCheckboxes';

const Filters = () => {
  const options = useGalleryStore(selectFilterOptions);

  return (
    <Box>
      <FiltersCheckboxes title="Categories" options={options.categories} name="categories" />
      <HR color="border2" margin="m" />
      <FiltersCheckboxes title="Languages" options={options.languages} name="languages" />
      <HR color="border2" margin="m" />
      <FiltersButtons title="Tools Used" options={options.tools} name="tools" />
    </Box>
  );
};

export default Filters;
