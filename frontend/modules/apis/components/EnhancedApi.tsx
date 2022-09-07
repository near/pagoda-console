import { useEffect, useState } from 'react';

import { Box } from '@/components/lib/Box';
import { Message } from '@/components/lib/Message';
import { Spinner } from '@/components/lib/Spinner';
import { Text } from '@/components/lib/Text';
import { useSelectedProject } from '@/hooks/selected-project';

import { globalStyles } from './styles';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'elements-api': { apiDescriptionUrl: string; router: string; layout?: string; apiKey?: string };
    }
  }
}

const EnhancedAPI = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [displayMessage, setDisplayMessage] = useState(true);
  const [isMainnet, setIsMainnet] = useState<boolean>(false);

  const { environment } = useSelectedProject();

  useEffect(() => {
    if (environment?.net === 'MAINNET') {
      setIsMainnet(true);
    } else {
      setIsMainnet(false);
    }
  }, [environment?.net]);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@stoplight/elements/web-components.min.js';
    script.async = true;
    document.body.appendChild(script);

    setIsLoading(false);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  globalStyles();
  return (
    <>
      {displayMessage && (
        <Message
          dismiss={() => {
            setDisplayMessage(false);
          }}
        >
          <Text>Want to interact with RPC API? Check out the key tab for the setup guide.</Text>
        </Message>
      )}
      {!isLoading ? (
        <div className="enhanced-api">
          <Box css={{ display: !isMainnet ? 'none' : undefined }}>
            <elements-api
              apiDescriptionUrl={'https://near-mainnet.api.pagoda.co/api/spec/v3.json'}
              router="hash"
              layout="sidebar"
            />
          </Box>

          <Box css={{ display: isMainnet ? 'none' : undefined }}>
            <elements-api
              apiDescriptionUrl={'https://near-testnet.api.pagoda.co/api/spec/v3.json'}
              router="hash"
              layout="sidebar"
            />
          </Box>
        </div>
      ) : (
        <Spinner center />
      )}
    </>
  );
};

export default EnhancedAPI;
