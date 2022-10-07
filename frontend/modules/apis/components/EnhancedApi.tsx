import { API } from '@stoplight/elements';
import { useState } from 'react';

import { Flex } from '@/components/lib/Flex';
import { Message } from '@/components/lib/Message';
import { Spinner } from '@/components/lib/Spinner';
import { Text } from '@/components/lib/Text';
import { useSelectedProject } from '@/hooks/selected-project';
import config from '@/utils/config';

import * as S from './styles';

/* 
  NOTE: The styles for this component are imported in _app.tsx via import '@/styles/enhanced-api.scss';
  This allows us to customize and properly scope the styles with the `.e-api` selector. Otherwise,
  their styles would be applied globally (overriding our own variables like --color-primary).
*/

const EnhancedAPI = () => {
  const [displayMessage, setDisplayMessage] = useState(true);
  const { environment } = useSelectedProject();
  const url = environment && config.url.eapiSpec[environment.net];

  return (
    <Flex stack>
      {displayMessage && (
        <Message
          dismiss={() => {
            setDisplayMessage(false);
          }}
        >
          <Text>Want to interact with RPC API? Check out the key tab for the setup guide.</Text>
        </Message>
      )}

      <S.Root className="e-api">
        {url ? <API apiDescriptionUrl={url} router="hash" layout="sidebar" /> : <Spinner center />}
      </S.Root>
    </Flex>
  );
};

export default EnhancedAPI;
