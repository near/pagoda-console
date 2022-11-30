import type { ComponentProps } from '@stitches/react';
import { getAuth, getIdToken } from 'firebase/auth';

import { Flex } from '@/components/lib/Flex';
import { TextButton, TextLink } from '@/components/lib/TextLink';
import config from '@/utils/config';
import { StableId } from '@/utils/stable-ids';

import * as S from './styles';

type Props = ComponentProps<typeof S.Footer>;

export function Footer(props: Props) {
  function copyUserAuthToken() {
    getIdToken(getAuth().currentUser!).then((token) =>
      navigator.clipboard.writeText(token).then(() => alert('Copied user auth token to clipboard.')),
    );
  }

  return (
    <S.Footer {...props}>
      <Flex justify="center" wrap>
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

        {(config.deployEnv === 'LOCAL' || config.deployEnv === 'DEVELOPMENT') && (
          <TextButton stableId={StableId.FOOTER_COPY_AUTH_TOKEN} size="s" color="neutral" onClick={copyUserAuthToken}>
            Auth Token
          </TextButton>
        )}
      </Flex>
    </S.Footer>
  );
}
