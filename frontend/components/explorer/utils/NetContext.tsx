import type { Net } from '@pc/database/clients/core';
import React from 'react';

export const NetContext = React.createContext<Net | null>(null);
