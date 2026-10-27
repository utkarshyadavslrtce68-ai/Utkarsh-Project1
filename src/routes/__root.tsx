import { createRootRoute, Outlet, ScrollRestoration } from '@tanstack/react-router';
import React from 'react';
import '../styles.css';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <React.Fragment>
      <Outlet />
      <ScrollRestoration />
    </React.Fragment>
  );
}
