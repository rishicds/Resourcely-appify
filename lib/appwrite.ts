import { Account, Client, Databases, ID } from 'react-native-appwrite';

// Appwrite configuration
export const appwriteConfig = {
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1',
  platform: process.env.EXPO_PUBLIC_APPWRITE_PLATFORM || 'com.rishi.resourcely',
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || 'resourcely',
  databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID || 'dbandroid',
  userCollectionId: process.env.EXPO_PUBLIC_APPWRITE_USER_COLLECTION_ID || 'users',
};

// Initialize Appwrite client
const client = new Client();

client
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId)
  .setPlatform(appwriteConfig.platform);

// Initialize services
export const account = new Account(client);
export const databases = new Databases(client);

export { ID };

