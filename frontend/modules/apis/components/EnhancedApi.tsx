import { API } from '@stoplight/elements';

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

/*
  NOTE: In local dev mode, the `API` component will log an error:
  "Warning: Legacy context API has been detected within a strict-mode tree."
  This appears to be a harmless error that we can ignore for now.
*/

const EnhancedAPI = () => {
  const { environment } = useSelectedProject();
  const url = environment && config.url.eapiSpec[environment.net];

  return (
    <Flex stack>
      {
        <Message type="error">
          <Text>
            Enhanced API is being decomissioned by Dec 9, 2024. Please move to another solution before that date.
          </Text>
        </Message>
      }

      <S.Root className="e-api">
        {url ? <API apiDescriptionUrl={url} router="hash" layout="sidebar" /> : <Spinner center />}
      </S.Root>
    </Flex>
  );
};

export default EnhancedAPI;
