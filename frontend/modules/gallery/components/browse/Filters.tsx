import { Box } from '@/components/lib/Box';
import { HR } from '@/components/lib/HorizontalRule';

import FiltersButtons from './FiltersButtons';
import FiltersCheckboxes from './FiltersCheckboxes';
import type { Options } from './types';

const Filters = () => {
  const categoriesOptions: Array<Options> = [
    {
      option: 'DeFi',
      value: 'DeFi',
    },
    {
      option: 'NFTs',
      value: 'NFTs',
    },
    {
      option: 'Fungible Tokens',
      value: 'Fungible Tokens',
    },
  ];

  const languagesOptions: Array<Options> = [
    {
      option: 'JavaScript',
      value: 'JavaScript',
    },
    {
      option: 'Rust',
      value: 'Rust',
    },
  ];

  const toolsUsedOptions: Array<Options> = [
    {
      option: 'NEAR-API-JS',
      value: '',
    },
    {
      option: 'Pagoda Enhanced API',
      value: '',
    },
    {
      option: 'NEAR-JS-SDK',
      value: '',
    },
    {
      option: 'Wallet Selector',
      value: '',
    },
    {
      option: 'NEP-141',
      value: '',
    },
  ];

  return (
    <Box>
      <FiltersCheckboxes title="Categories" options={categoriesOptions} name="categories" />
      <HR color="border2" margin="m" />
      <FiltersCheckboxes title="Languages" options={languagesOptions} name="languages" />
      <HR color="border2" margin="m" />
      <FiltersButtons title="Tools Used" options={toolsUsedOptions} name="tools-used" />
    </Box>
  );
};

export default Filters;
