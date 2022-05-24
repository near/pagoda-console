import type { ComponentProps } from '@stitches/react';

import { Flex } from '@/components/lib/Flex';
import { P } from '@/components/lib/Paragraph';
import { TextLink } from '@/components/lib/TextLink';

import * as S from './styles';

type Props = ComponentProps<typeof S.Footer>;

export function Footer(props: Props) {
  return (
    <S.Footer {...props}>
      <Flex justify="center">
        <P size="small">All Rights Reserved.</P>
        <TextLink size="small" color="neutral" href="/Terms.pdf" target="_blank" rel="noopener noreferrer">
          Terms of Use
        </TextLink>
        <TextLink size="small" color="neutral" href="/PrivacyPolicy.pdf" target="_blank" rel="noopener noreferrer">
          Privacy Policy
        </TextLink>
      </Flex>
    </S.Footer>
  );
}
