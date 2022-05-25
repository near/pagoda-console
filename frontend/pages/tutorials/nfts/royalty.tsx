import components from '@/components/tutorials/components';
import NextStepButton from '@/components/tutorials/NextStepButton';
import TableOfContents from '@/components/tutorials/TableOfContents';
import TutorialFooter from '@/components/tutorials/TutorialFooter';
import { useDashboardLayout } from '@/hooks/layouts';
import Content from '@/tutorials/nfts/md/6-royalty.mdx';
import type { NextPageWithLayout } from '@/utils/types';

const Royalty: NextPageWithLayout = () => {
  return (
    <>
      <TableOfContents />
      <Content components={components} />
      <TutorialFooter>
        <NextStepButton path="/tutorials/nfts/events" label="Step 9: Events" />
      </TutorialFooter>
    </>
  );
};

Royalty.getLayout = useDashboardLayout;

export default Royalty;
