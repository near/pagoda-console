import { getAuth, getIdToken } from 'firebase/auth';

import LogoIconSvg from '@/public/images/brand/pagoda-icon.svg';
import LogoSvg from '@/public/images/brand/pagoda-logo.svg';
import config from '@/utils/config';

import * as S from './styles';

export function Logo({ collapsed }: { collapsed?: boolean }) {
  function clickHandler() {
    if (config.deployEnv === 'LOCAL' || config.deployEnv === 'DEVELOPMENT') {
      getIdToken(getAuth().currentUser!).then((token) =>
        navigator.clipboard.writeText(token).then(() => alert('Copied token to clipboard')),
      );
    }
  }

  return (
    <S.LogoContainer onClick={clickHandler}>
      {!collapsed && <LogoSvg style={{ height: '1.75rem', overflow: 'visible' }} />}
      {collapsed && <LogoIconSvg style={{ height: '1.75rem', overflow: 'visible' }}></LogoIconSvg>}
    </S.LogoContainer>
  );
}
