import { getAuth, getIdToken } from 'firebase/auth';

import LogoSvg from '@/public/images/brand/pagoda-icon.svg';
import Config from '@/utils/config';

import * as S from './styles';

export function Logo() {
  function clickHandler() {
    if (Config.deployEnv === 'LOCAL' || Config.deployEnv === 'DEVELOPMENT') {
      getIdToken(getAuth().currentUser!).then((token) =>
        navigator.clipboard.writeText(token).then(() => alert('Copied token to clipboard')),
      );
    }
  }

  return (
    <S.LogoContainer onClick={clickHandler}>
      <LogoSvg style={{ width: '3rem' }} />
    </S.LogoContainer>
  );
}
