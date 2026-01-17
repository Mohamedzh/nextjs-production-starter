/**
 * Auth Utilities
 * Helper functions for authentication
 */

import { getServerSession } from 'next-auth';
import { authConfig } from './config';

export { authConfig };

// Wrapper function for getting session in server components
export async function auth() {
  return await getServerSession(authConfig);
}

// Re-export signIn and signOut from next-auth/react for client components
export { signIn, signOut } from 'next-auth/react';
