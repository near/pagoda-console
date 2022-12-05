import Image from 'next/image';

import { Flex } from '@/components/lib/Flex';
import ImagePlaceholder3 from '@/public/images/gallery/placeholder-3.png';
import { styled } from '@/styles/stitches';

const FilterSection = styled(Flex, {
  borderBottom: '1px solid #313538',
  marginBottom: '1.5rem',
  paddingBottom: '1.5rem',
});

const Template = styled('div', {
  width: '100%',
  height: '9.5rem',
  position: 'relative',
});

const TemplateArchitecture = () => {
  return (
    <FilterSection stack>
      Template Architecture
      <Template>
        <Image layout="fill" src={ImagePlaceholder3} alt="" />
      </Template>
    </FilterSection>
  );
};

export default TemplateArchitecture;
