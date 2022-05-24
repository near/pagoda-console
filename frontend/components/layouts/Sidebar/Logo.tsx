import { getAuth, getIdToken } from 'firebase/auth';

import PagodaIcon from '@/public/brand/pagoda_icon_small.svg';
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
      <PagodaIcon />
    </S.LogoContainer>
  );
}
