import React, { useEffect, useRef } from 'react';
import { ClerkProvider, useUser, useClerk } from '@clerk/clerk-react';
import { AuthProvider, useAuth } from '../context/AuthContext';

function ClerkSyncConsumer({ children, clerkPubKey }) {
  const { isLoaded, isSignedIn, user: clerkUser } = useUser();
  const clerk = useClerk();
  const { syncClerkSession, user: appUser, pendingClerkRole } = useAuth();
  const lastSyncedIdRef = useRef(null);

  useEffect(() => {
    if (isLoaded && isSignedIn && clerkUser) {
      // Sync with MongoDB backend if this Clerk user hasn't been synced this session
      if (lastSyncedIdRef.current !== clerkUser.id) {
        lastSyncedIdRef.current = clerkUser.id;
        syncClerkSession(clerkUser, { role: pendingClerkRole }).catch(err => {
          console.error('Failed to sync Clerk user with backend:', err);
        });
      }
    } else if (isLoaded && !isSignedIn) {
      lastSyncedIdRef.current = null;
    }
  }, [isLoaded, isSignedIn, clerkUser, pendingClerkRole, syncClerkSession]);

  return children;
}

function ClerkInnerBridge({ children, clerkPubKey }) {
  const clerk = useClerk();
  const { isLoaded, isSignedIn, user: clerkUser } = useUser();

  const clerkBridge = {
    isReady: true,
    isLoaded,
    isSignedIn,
    clerkUser,
    openSignIn: (opts) => clerk.openSignIn(opts),
    openSignUp: (opts) => clerk.openSignUp(opts),
    signOut: () => clerk.signOut(),
    clerk,
  };

  return (
    <AuthProvider clerkBridge={clerkBridge}>
      <ClerkSyncConsumer clerkPubKey={clerkPubKey}>
        {children}
      </ClerkSyncConsumer>
    </AuthProvider>
  );
}

export default function ClerkWrapper({ children }) {
  // Check for Clerk Publishable Key in Vite env or local storage
  const envKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  const localKey = typeof window !== 'undefined' ? localStorage.getItem('clerk_publishable_key') : null;
  const clerkPubKey = (envKey || localKey || '').trim();

  // If a valid publishable key starting with pk_ exists, wrap with ClerkProvider
  if (clerkPubKey && (clerkPubKey.startsWith('pk_test_') || clerkPubKey.startsWith('pk_live_'))) {
    return (
      <ClerkProvider publishableKey={clerkPubKey}>
        <ClerkInnerBridge clerkPubKey={clerkPubKey}>
          {children}
        </ClerkInnerBridge>
      </ClerkProvider>
    );
  }

  // Graceful fallback when key is not yet configured: AuthProvider works natively
  return (
    <AuthProvider clerkBridge={null}>
      {children}
    </AuthProvider>
  );
}
