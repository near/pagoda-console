import { useEffect, useState } from 'react';

import { Flex } from '@/components/lib/Flex';
import { Message } from '@/components/lib/Message';
import { Spinner } from '@/components/lib/Spinner';
import { TextLink } from '@/components/lib/TextLink';

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
          <Flex>
            Want to interact directly with NEAR RPC API? Check out the
            <TextLink href="https://docs.near.org/api/rpc/introduction" external color="neutral">
              RPC docs
            </TextLink>
          </Flex>
        </Message>
      )}
      {!isLoading ? (
        <div className="enhanced-api">
          <elements-api
            apiDescriptionUrl="https://near-enhanced-api-server-testnet-uxqf.onrender.com/api/spec/v3.json"
            router="hash"
            layout="sidebar"
          />
        </div>
      ) : (
        <Spinner center />
      )}
    </>
  );
};

export default EnhancedAPI;
