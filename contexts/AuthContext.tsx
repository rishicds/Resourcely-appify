import { authService, AuthState, User } from '@/lib/auth';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  completeOnboarding: (onboardingData: {
    skills: string[];
    tools: string[];
    isAvailable: boolean;
  }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Check for existing session on app start
  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      // Add a small delay to prevent immediate crashes on app startup
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // First try to get cached user for immediate UI feedback
      const cachedUser = await authService.getCachedUser();
      if (cachedUser) {
        setState({
          user: cachedUser,
          isLoading: true, // Still loading while we verify the session
          isAuthenticated: true,
        });
      }
      
      const hasSession = await authService.checkSession();
      
      if (hasSession) {
        try {
          const user = await authService.getCurrentUser();
          setState({
            user,
            isLoading: false,
            isAuthenticated: !!user,
          });
        } catch (error) {
          console.error('Error getting current user:', error);
          // If we have cached user, keep using it but mark as not loading
          if (cachedUser) {
            setState({
              user: cachedUser,
              isLoading: false,
              isAuthenticated: true,
            });
          } else {
            setState({
              user: null,
              isLoading: false,
              isAuthenticated: false,
            });
          }
        }
      } else {
        setState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
      // If there's an error, try to clean up any broken session
      try {
        await authService.signOut();
      } catch (signOutError) {
        // Ignore cleanup errors in production
        console.log('Cleanup error (can be ignored):', signOutError);
      }
      
      // Check if we have cached user data to fallback to
      try {
        const cachedUser = await authService.getCachedUser();
        if (cachedUser) {
          console.log('Using cached user data as fallback');
          setState({
            user: cachedUser,
            isLoading: false,
            isAuthenticated: true,
          });
          return;
        }
      } catch {
        console.log('No cached user data available');
      }
      
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log('AuthContext signIn called with email:', email);
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      console.log('Auth state set to loading');
      
      const result = await authService.signIn(email, password);
      console.log('AuthService signIn result:', result);
      
      if (result && result.user) {
        console.log('Setting authenticated state with user:', result.user.name);
        setState({
          user: result.user,
          isLoading: false,
          isAuthenticated: true,
        });
      } else {
        console.log('No user in result, throwing error');
        setState(prev => ({ ...prev, isLoading: false }));
        throw new Error('Failed to authenticate user');
      }
    } catch (error) {
      console.error('AuthContext signIn error:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      await authService.createAccount(email, password, name);
      
      // Automatically sign in after successful registration
      const signInResult = await authService.signIn(email, password);
      
      setState({
        user: signInResult?.user || null,
        isLoading: false,
        isAuthenticated: !!signInResult?.user,
      });
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      await authService.signOut();
      
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    try {
      if (!state.user) throw new Error('No user logged in');
      
      setState(prev => ({ ...prev, isLoading: true }));
      
      const updatedUser = await authService.updateUserDocument(state.user.$id, userData);
      
      setState(prev => ({
        ...prev,
        user: updatedUser,
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const completeOnboarding = async (onboardingData: {
    skills: string[];
    tools: string[];
    isAvailable: boolean;
  }) => {
    try {
      if (!state.user) throw new Error('No user logged in');
      
      setState(prev => ({ ...prev, isLoading: true }));
      
      const updatedUser = await authService.completeOnboarding(state.user.$id, onboardingData);
      
      setState(prev => ({
        ...prev,
        user: updatedUser,
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const value: AuthContextType = {
    ...state,
    signIn,
    signUp,
    signOut,
    updateUser,
    completeOnboarding,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
