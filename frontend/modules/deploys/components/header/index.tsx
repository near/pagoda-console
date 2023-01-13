import { Flex } from '@/components/lib/Flex';

import ArrowInCircle from './ArrowInCircle';
import HeaderText from './HeaderText';

const Header = () => (
  <Flex gap="m">
    <HeaderText icon="code" color="warning">
      Testnet
    </HeaderText>
    <ArrowInCircle />
    <HeaderText icon="layers" color="primary">
      Mainnet
    </HeaderText>
  </Flex>
);

export default Header;
