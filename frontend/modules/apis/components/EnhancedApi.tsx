import { API } from '@stoplight/elements';
import { useState } from 'react';

import { Flex } from '@/components/lib/Flex';
import { Message } from '@/components/lib/Message';
import { Spinner } from '@/components/lib/Spinner';
import { Text } from '@/components/lib/Text';
import { useSureProjectContext } from '@/hooks/project-context';
import config from '@/utils/config';
import { mapEnvironmentSubIdToNet } from '@/utils/helpers';

import * as S from './styles';

/* 
  NOTE: The styles for this component are imported in _app.tsx via import '@/styles/enhanced-api.scss';
  This allows us to customize and properly scope the styles with the `.e-api` selector. Otherwise,
  their styles would be applied globally (overriding our own variables like --color-primary).
*/

/*
  NOTE: In local dev mode, the `API` component will log an error:
  "Warning: Legacy context API has been detected within a strict-mode tree."
  This appears to be a harmless error that we can ignore for now.
*/

const EnhancedAPI = () => {
  const [displayMessage, setDisplayMessage] = useState(true);
  const { environmentSubId } = useSureProjectContext();
  const url = config.url.eapiSpec[mapEnvironmentSubIdToNet(environmentSubId)];

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
