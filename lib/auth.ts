import AsyncStorage from '@react-native-async-storage/async-storage';
import { Models, Permission, Role } from 'react-native-appwrite';
import { account, appwriteConfig, databases, ID } from './appwrite';
import { transformUserForAppwrite, transformUserFromAppwrite } from './user-utils';

export interface User extends Models.Document {
  $id: string;
  name: string;
  email: string;
  avatar?: string;
  skills?: string[];
  tools?: string[];
  isAvailable?: boolean;
  hasCompletedOnboarding?: boolean;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Storage keys
const STORAGE_KEYS = {
  USER: 'resourcely_user',
  SESSION: 'resourcely_session',
} as const;

// Timeout wrapper for async operations
const withTimeout = <T>(promise: Promise<T>, timeoutMs: number = 10000): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error('Operation timed out')), timeoutMs)
    )
  ]);
};

class AuthService {
  // Cache user data to local storage
  private async cacheUser(user: User | null) {
    try {
      if (user) {
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      } else {
        await AsyncStorage.removeItem(STORAGE_KEYS.USER);
      }
    } catch (error) {
      console.log('Failed to cache user data:', error);
    }
  }

  // Get cached user data
  private async getCachedUser(): Promise<User | null> {
    try {
      const cachedUser = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      return cachedUser ? JSON.parse(cachedUser) : null;
    } catch (error) {
      console.log('Failed to get cached user data:', error);
      return null;
    }
  }

  // Cache session status
  private async cacheSessionStatus(hasSession: boolean) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SESSION, hasSession.toString());
    } catch (error) {
      console.log('Failed to cache session status:', error);
    }
  }

  // Get cached session status
  private async getCachedSessionStatus(): Promise<boolean> {
    try {
      const cached = await AsyncStorage.getItem(STORAGE_KEYS.SESSION);
      return cached === 'true';
    } catch (error) {
      console.log('Failed to get cached session status:', error);
      return false;
    }
  }
  // Sign up with email and password
  async createAccount(email: string, password: string, name: string) {
    try {
      // Sign out any existing session before creating account
      try {
        await this.signOut();
      } catch {
        // Ignore errors if no session exists
      }
      
      const newAccount = await account.create(ID.unique(), email, password, name);
      
      if (newAccount) {
        // Try to create user document in database
        try {
          const userDoc = await this.createUserDocument(newAccount.$id, {
            name: newAccount.name,
            email: newAccount.email,
            hasCompletedOnboarding: false,
            isAvailable: false,
            skills: [],
            tools: [],
          });
          
          return { account: newAccount, user: userDoc };
        } catch (docError) {
          // If document creation fails, still return the account
          console.warn('Failed to create user document, will retry on login:', docError);
          return { account: newAccount, user: null };
        }
      }
    } catch (error) {
      console.error('Error creating account:', error);
      throw error;
    }
  }

  // Sign in with email and password
  async signIn(email: string, password: string) {
    console.log('AuthService signIn called with email:', email);
    try {
      // Check if there's already an active session
      console.log('Checking for active session...');
      const hasActiveSession = await withTimeout(this.checkSession(), 5000);
      console.log('Has active session:', hasActiveSession);
      
      if (hasActiveSession) {
        // If there's already a session, just return the current user
        console.log('Active session found, getting current user...');
        const user = await withTimeout(this.getCurrentUser(), 8000);
        console.log('Current user:', user?.name);
        if (user) {
          await this.cacheUser(user);
          await this.cacheSessionStatus(true);
        }
        return { session: null, user };
      }
      
      console.log('Creating new session...');
      const session = await withTimeout(
        account.createEmailPasswordSession(email, password),
        10000
      );
      console.log('Session created:', !!session);
      
      if (session) {
        console.log('Getting user after session creation...');
        const user = await withTimeout(this.getCurrentUser(), 8000);
        console.log('User retrieved:', user?.name);
        if (user) {
          await this.cacheUser(user);
          await this.cacheSessionStatus(true);
        }
        return { session, user };
      }
      
      // If no session was created, throw an error
      console.log('No session created, throwing error');
      throw new Error('Failed to create session');
    } catch (error) {
      console.error('Error signing in:', error);
      // In case of network error, try to use cached data
      if (error instanceof Error && error.message.includes('timeout')) {
        console.log('Network timeout, checking cached data...');
        const cachedUser = await this.getCachedUser();
        const cachedSession = await this.getCachedSessionStatus();
        if (cachedUser && cachedSession) {
          console.log('Using cached authentication data');
          return { session: null, user: cachedUser };
        }
      }
      throw error;
    }
  }

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    try {
      const currentAccount = await withTimeout(account.get(), 8000);
      
      if (currentAccount) {
        try {
          // Get user document from database
          const userDoc = await withTimeout(
            databases.getDocument(
              appwriteConfig.databaseId,
              appwriteConfig.userCollectionId,
              currentAccount.$id
            ),
            10000
          );
          
          const user = transformUserFromAppwrite(userDoc) as User;
          await this.cacheUser(user);
          return user;
        } catch (dbError) {
          // If user document doesn't exist, create it
          console.log('User document not found, creating...', dbError);
          try {
            const userDoc = await this.createUserDocument(currentAccount.$id, {
              name: currentAccount.name,
              email: currentAccount.email,
              hasCompletedOnboarding: false,
              isAvailable: false,
              skills: [],
              tools: [],
            });
            
            await this.cacheUser(userDoc);
            return userDoc;
          } catch (createError) {
            console.error('Failed to create user document:', createError);
            // Check if we have cached user data
            const cachedUser = await this.getCachedUser();
            if (cachedUser && cachedUser.$id === currentAccount.$id) {
              console.log('Using cached user data');
              return cachedUser;
            }
            
            // Return basic user info even if document creation fails
            const basicUser = {
              $id: currentAccount.$id,
              name: currentAccount.name,
              email: currentAccount.email,
              hasCompletedOnboarding: false,
              isAvailable: false,
              skills: [],
              tools: [],
              $collectionId: '',
              $databaseId: '',
              $createdAt: '',
              $updatedAt: '',
              $permissions: [],
              $sequence: 0,
            } as User;
            
            await this.cacheUser(basicUser);
            return basicUser;
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      // Try to return cached user data
      const cachedUser = await this.getCachedUser();
      const cachedSession = await this.getCachedSessionStatus();
      if (cachedUser && cachedSession) {
        console.log('Network error, using cached user data');
        return cachedUser;
      }
      return null;
    }
  }

  // Sign out
  async signOut() {
    try {
      await account.deleteSession('current');
      await this.cacheUser(null);
      await this.cacheSessionStatus(false);
    } catch (error) {
      console.error('Error signing out:', error);
      // Even if the network call fails, clear local cache
      await this.cacheUser(null);
      await this.cacheSessionStatus(false);
      throw error;
    }
  }

  // Create user document in database
  async createUserDocument(userId: string, userData: Partial<User>) {
    try {
      const transformedData = transformUserForAppwrite(userData);
      const userDoc = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId,
        userId,
        transformedData,
        [
          Permission.read(Role.user(userId)),
          Permission.update(Role.user(userId)),
          Permission.delete(Role.user(userId))
        ]
      );
      
      return transformUserFromAppwrite(userDoc) as User;
    } catch (error) {
      console.error('Error creating user document:', error);
      throw error;
    }
  }

  // Update user document
  async updateUserDocument(userId: string, userData: Partial<User>) {
    try {
      const transformedData = transformUserForAppwrite(userData);
      const updatedDoc = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId,
        userId,
        transformedData
      );
      
      return transformUserFromAppwrite(updatedDoc) as User;
    } catch (error) {
      console.error('Error updating user document:', error);
      throw error;
    }
  }

  // Complete onboarding
  async completeOnboarding(userId: string, onboardingData: {
    skills: string[];
    tools: string[];
    isAvailable: boolean;
  }) {
    try {
      return await this.updateUserDocument(userId, {
        ...onboardingData,
        hasCompletedOnboarding: true,
      });
    } catch (error) {
      console.error('Error completing onboarding:', error);
      throw error;
    }
  }

  // Check if user has active session
  async checkSession() {
    try {
      const session = await withTimeout(account.getSession('current'), 5000);
      return !!session;
    } catch (error) {
      // In production builds, network timeouts or other issues can cause this to fail
      console.log('No active session found:', error);
      return false;
    }
  }
}

export const authService = new AuthService();
