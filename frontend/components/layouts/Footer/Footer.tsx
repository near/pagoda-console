import type { ComponentProps } from '@stitches/react';

import { Flex } from '@/components/lib/Flex';
import { TextLink } from '@/components/lib/TextLink';

import * as S from './styles';

type Props = ComponentProps<typeof S.Footer>;

export function Footer(props: Props) {
  return (
    <S.Footer {...props}>
      <Flex justify="center">
        <TextLink size="s" color="neutral" href="/Terms.pdf" target="_blank" rel="noopener noreferrer">
          Terms of Use
        </TextLink>
        <TextLink size="s" color="neutral" href="/PrivacyPolicy.pdf" target="_blank" rel="noopener noreferrer">
          Privacy Policy
        </TextLink>
      </Flex>
    </S.Footer>
  );
}
