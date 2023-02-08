import ReactMarkdown from 'react-markdown';

import { Box } from '@/components/lib/Box';
import { HR } from '@/components/lib/HorizontalRule';
import { Text } from '@/components/lib/Text';
import { useGalleryStore } from '@/stores/gallery';
import { selectTemplateAttributes, selectTemplateTools } from '@/stores/gallery/gallery';
import { styled } from '@/styles/stitches';

import Header from './Header';
import RunExample from './RunExample';
// import Share from './Share';
import TemplateArchitecture from './TemplateArchitecture';
import ToolsUsed from './ToolsUsed';

const Grid = styled('div', {
  display: 'grid',
  gridTemplateColumns: '2fr 1fr',
});

const Details = styled('div', {
  paddingLeft: '2.5rem',
});

const CustomBox = styled(Box, {
  color: 'var(--color-text-2)',
});

const CustomText = styled(Text, {
  paddingBottom: '2rem',
  ul: {
    listStyleType: 'disc',
    paddingLeft: '2rem',
  },
});

const TemplateDetails = () => {
  const { features, featuresRich, benefitsRich, architectureUrl } = useGalleryStore(selectTemplateAttributes);
  const { tools } = useGalleryStore(selectTemplateTools);

  return (
    <>
      <Header />
      <RunExample />
      <Grid>
        <CustomBox>
          <CustomText>{features}</CustomText>
          <CustomText size="h5" color="text1">
            Key Features
          </CustomText>
          <CustomText>
            <ReactMarkdown>{featuresRich}</ReactMarkdown>
          </CustomText>
          {benefitsRich && (
            <>
              <CustomText size="h5" color="text1">
                Blockchain Benefits
              </CustomText>
              <CustomText>
                <ReactMarkdown>{benefitsRich}</ReactMarkdown>
              </CustomText>
            </>
          )}
        </CustomBox>
        <Details>
          <TemplateArchitecture architectureUrl={architectureUrl} />
          <HR color="border2" margin="m" />
          <ToolsUsed tools={tools} />
          {/* <HR color="border2" margin="m" />
          <Share /> */}
        </Details>
      </Grid>
    </>
  );
};

export default TemplateDetails;
