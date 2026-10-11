'use client';

import { Auth0Provider } from '@auth0/auth0-react';
import React from 'react';
import { useRouter } from 'next/navigation';
import { requireValue } from '../lib/env';

const Auth0ProviderWithNavigate = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  // App origin is env config (no hard-coded URL — see .cline/rules/env-policy.md)
  const origin = requireValue('NEXT_PUBLIC_APP_URL', process.env.NEXT_PUBLIC_APP_URL);
  const redirectUri = `${origin}/auth/callback`;
  const domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN;
  const clientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID;
  const audience = process.env.NEXT_PUBLIC_AUTH0_AUDIENCE;

  // Safety check - render children anyway to avoid blocking the app
  if (!(domain && clientId)) {
    if (process.env.NODE_ENV === 'development') {
      console.warn("⚠️ Auth0 Config Missing - running in unauthenticated mode");
    }
    return <>{children}</>;
  }

  const onRedirectCallback = (appState?: any) => {
    router.push(appState?.returnTo || '/dashboard');
  };

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: redirectUri, 
        audience: audience,
      }}
      cacheLocation="localstorage"
      useRefreshTokens={true}
      onRedirectCallback={onRedirectCallback}
    >
      {children}
    </Auth0Provider>
  );
};

export default Auth0ProviderWithNavigate;