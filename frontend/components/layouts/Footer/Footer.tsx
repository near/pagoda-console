import type { ComponentProps } from '@stitches/react';

import { Flex } from '@/components/lib/Flex';
import { TextLink } from '@/components/lib/TextLink';
import { StableId } from '@/utils/stable-ids';

import * as S from './styles';

type Props = ComponentProps<typeof S.Footer>;

export function Footer(props: Props) {
  return (
    <S.Footer {...props}>
      <Flex justify="center">
        <TextLink
          stableId={StableId.FOOTER_TERMS_OF_USE_LINK}
          size="s"
          color="neutral"
          href="/Terms.pdf"
          target="_blank"
          rel="noopener noreferrer"
        >
          Terms of Use
        </TextLink>
        <TextLink
          stableId={StableId.FOOTER_PRIVACY_POLICY_LINK}
          size="s"
          color="neutral"
          href="/PrivacyPolicy.pdf"
          target="_blank"
          rel="noopener noreferrer"
        >
          Privacy Policy
        </TextLink>
        <TextLink
          stableId={StableId.FOOTER_PAGODA_STATUS_LINK}
          size="s"
          color="neutral"
          href="https://pagoda.statuspage.io/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Pagoda Status
        </TextLink>
      </Flex>
    </S.Footer>
  );
}
