/**
 * Sign In Page
 * OAuth provider selection and authentication entry point
 */

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { features } from '@/lib/features';
import { SignInButtons } from '@/components/auth/signin-button';

export const metadata = {
  title: 'Sign In',
  description: 'Sign in to your account',
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: { callbackUrl?: string };
}) {
  // Redirect if auth is not enabled
  if (!features.auth) {
    redirect('/?error=auth-disabled');
  }

  // Redirect if already signed in
  const session = await auth();
  if (session?.user) {
    redirect(searchParams.callbackUrl || '/');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600">
              Sign in to continue to your account
            </p>
          </div>

          {/* Sign In Buttons */}
          <SignInButtons callbackUrl={searchParams.callbackUrl} />

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>
              Secured by NextAuth.js with{' '}
              {features.database ? 'database sessions' : 'JWT tokens'}
            </p>
          </div>
        </div>

        {/* Info card */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
