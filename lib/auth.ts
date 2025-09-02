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

class AuthService {
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
      const hasActiveSession = await this.checkSession();
      console.log('Has active session:', hasActiveSession);
      
      if (hasActiveSession) {
        // If there's already a session, just return the current user
        console.log('Active session found, getting current user...');
        const user = await this.getCurrentUser();
        console.log('Current user:', user?.name);
        return { session: null, user };
      }
      
      console.log('Creating new session...');
      const session = await account.createEmailPasswordSession(email, password);
      console.log('Session created:', !!session);
      
      if (session) {
        console.log('Getting user after session creation...');
        const user = await this.getCurrentUser();
        console.log('User retrieved:', user?.name);
        return { session, user };
      }
      
      // If no session was created, throw an error
      console.log('No session created, throwing error');
      throw new Error('Failed to create session');
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  }

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    try {
      const currentAccount = await account.get();
      
      if (currentAccount) {
        try {
          // Get user document from database
          const userDoc = await databases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            currentAccount.$id
          );
          
          return transformUserFromAppwrite(userDoc) as User;
        } catch {
          // If user document doesn't exist, create it
          console.log('User document not found, creating...');
          const userDoc = await this.createUserDocument(currentAccount.$id, {
            name: currentAccount.name,
            email: currentAccount.email,
            hasCompletedOnboarding: false,
            isAvailable: false,
            skills: [],
            tools: [],
          });
          
          return userDoc;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Sign out
  async signOut() {
    try {
      await account.deleteSession('current');
    } catch (error) {
      console.error('Error signing out:', error);
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
      const session = await account.getSession('current');
      return !!session;
    } catch {
      return false;
    }
  }
}

export const authService = new AuthService();
