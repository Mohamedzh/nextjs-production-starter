/**
 * Sign In Button Component
 * Displays OAuth provider buttons based on available configuration
 */

'use client';

import { signIn } from 'next-auth/react';
import { features, getEnabledProviders } from '@/lib/features';

interface SignInButtonProps {
  provider: 'github' | 'google';
  callbackUrl?: string;
}

const providerConfig = {
  github: {
    name: 'GitHub',
    icon: '🔗',
    bgColor: 'bg-gray-900 hover:bg-gray-800',
  },
  google: {
    name: 'Google',
    icon: '🔍',
    bgColor: 'bg-blue-600 hover:bg-blue-700',
  },
};

export function SignInButton({ provider, callbackUrl = '/' }: SignInButtonProps) {
  const config = providerConfig[provider];

  const handleSignIn = () => {
    signIn(provider, { callbackUrl });
  };

  return (
    <button
      onClick={handleSignIn}
      className={`w-full flex items-center justify-center gap-3 px-4 py-3 text-white rounded-lg transition-colors ${config.bgColor}`}
    >
      <span className="text-xl">{config.icon}</span>
      <span>Continue with {config.name}</span>
    </button>
  );
}

/**
 * All Sign In Buttons Component
 * Renders all available OAuth provider buttons
 */
export function SignInButtons({ callbackUrl = '/' }: { callbackUrl?: string }) {
  if (!features.auth) {
    return (
      <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          Authentication is not configured. Set <code className="bg-yellow-100 px-1 py-0.5 rounded">NEXTAUTH_SECRET</code> to enable.
        </p>
      </div>
    );
  }

  const enabledProviders = getEnabledProviders();

  if (enabledProviders.length === 0) {
    return (
      <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          No OAuth providers configured. Set <code className="bg-blue-100 px-1 py-0.5 rounded">GITHUB_ID</code> or{' '}
          <code className="bg-blue-100 px-1 py-0.5 rounded">GOOGLE_ID</code> to enable social login.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {features.githubProvider && (
        <SignInButton provider="github" callbackUrl={callbackUrl} />
      )}
      {features.googleProvider && (
        <SignInButton provider="google" callbackUrl={callbackUrl} />
      )}
    </div>
  );
}
