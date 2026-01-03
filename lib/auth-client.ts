import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL, // e.g. http://localhost:3000
});

// Export hooks for easy use in components
export const { useSession, signIn, signOut, signUp } = authClient;