import { useAuth } from "../context/AuthContext";

export interface CurrentUser {
  id: number;
  phone_number: string;
  full_name: string;
  role: string;
  store: number;
}

/**
 * Hook to get the current user data from the auth context
 * This is a wrapper around the auth context to maintain backward compatibility
 * with existing code that uses useCurrentUser()
 */
export function useCurrentUser() {
  const { currentUser, isLoading } = useAuth();

  // Return in the same format as the original useQuery hook
  return {
    data: currentUser,
    isLoading,
    isError: false,
    error: null,
    isSuccess: !isLoading && currentUser !== null,
  };
}
