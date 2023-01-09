import Image from 'next/image';

import { Flex } from '@/components/lib/Flex';
import { styled } from '@/styles/stitches';

const Template = styled('div', {
  width: '100%',
  height: '9.5rem',
  position: 'relative',

  '@smallTablet': {
    height: '7rem',
  },
  '@mobile': {
    height: '5rem',
  },
});

const TemplateArchitecture = ({ architectureUrl }) => (
  <Flex stack>
    Template Architecture
    <Template>
      <Image layout="fill" src={architectureUrl} alt="" />
    </Template>
  </Flex>
);

export default TemplateArchitecture;
