import React from 'react';

import { NetContext } from '@/components/explorer/utils/NetContext';

export const useNet = () => {
  const net = React.useContext(NetContext);
  if (!net) {
    throw new Error('Expected to have net in context');
  }
  return net;
};
