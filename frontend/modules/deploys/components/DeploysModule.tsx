import { Flex } from '@/components/lib/Flex';
import { HR } from '@/components/lib/HorizontalRule';
import { Section } from '@/components/lib/Section';
import { styled } from '@/styles/stitches';

import Header from './header/index';
import History from './history/index';
import Mainnet from './mainnet/index';
import Testnet from './testnet/index';

const TopFlex = styled(Flex, {
  margin: 'var(--space-m) 0 0 0',
});

const BottomFlex = styled(Flex, {
  margin: 'var(--space-xl) 0 0 0',
});

const DeploysModule = () => {
  return (
    <Section>
      <Header />
      <HR color="border2" margin="s" />
      <TopFlex gap="xl">
        <Testnet />
        <Mainnet />
      </TopFlex>
      <BottomFlex>
        <History />
      </BottomFlex>
    </Section>
  );
};

export default DeploysModule;
