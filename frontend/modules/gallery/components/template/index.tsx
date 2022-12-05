import { Box } from '@/components/lib/Box';
import { H5 } from '@/components/lib/Heading';
import { styled } from '@/styles/stitches';

import Header from './Header';
import RunExample from './RunExample';
import Share from './Share';
import TemplateArchitecture from './TemplateArchitecture';
import ToolsUsed from './ToolsUsed';

const Grid = styled('div', {
  display: 'grid',
  gridTemplateColumns: '2fr 1fr',
});

const Details = styled('div', {
  paddingLeft: '2.5rem',
});

const CustomUL = styled('ul', {
  listStyleType: 'disc',
  padding: '2rem 0',

  '& li': {
    margin: '0 0 0.625rem 1.25rem',
  },
});

const CustomBox = styled(Box, {
  color: 'var(--color-text-3)',
});

const TemplateDetails = () => {
  return (
    <>
      <Header />
      <RunExample />
      <Grid>
        <CustomBox>
          This is a description of this template. By reading this you&apos;ll be able to get a rough idea of what this
          template is and how it might be used.
          <br />
          <br />
          <H5>Key Features</H5>
          <CustomUL>
            <li>Create your own native loyalty program using a NEAR Fungible Token </li>
            <li>End-users can earn tokens at time of purchase without needing a NEAR wallet </li>
            <li>End-users can redeem their tokens for goods instead of purchasing with their fiat currency </li>
            <li>Interact with the loyalty system using a web & mobile web UI </li>
          </CustomUL>
          <br />
          <H5>Blockchain Benefits</H5>
          <CustomUL>
            <li>
              FTs act similarly to loyalty program currency since FTs can be divided into smaller amounts, can be
              exchanged easily, and each token is of the same type with identical specification, and functionality with
              the same inherent value.
            </li>
            <li>
              The NEAR blockchain manages your user accounts so you don&apos;t have to. Simply send FT to an address
              associated with your user and use the Pagoda APIs to retrieve user data from on-chain.
            </li>
            <li>
              NEAR is scalable, and fast because of a technology we call sharding. All the cross-shard communication is
              built into the protocol so you can trust that balances are up-to-date and accurate.
            </li>
          </CustomUL>
        </CustomBox>
        <Details>
          <TemplateArchitecture />
          <ToolsUsed />
          <Share />
        </Details>
      </Grid>
    </>
  );
};

export default TemplateDetails;
