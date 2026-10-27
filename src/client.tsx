import { hydrateRoot } from 'react-dom/client';
import { StartClient } from '@tanstack/react-start';
import React from 'react';
import { createRouter } from './router';

const router = createRouter();

hydrateRoot(document, <StartClient router={router} />);
