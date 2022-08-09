import React from 'react';

import type { NetOption } from '@/utils/types';

export const NetContext = React.createContext<NetOption | null>(null);
