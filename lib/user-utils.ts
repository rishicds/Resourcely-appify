// Get a single user's name by their ID
import { appwriteConfig, databases } from './appwrite';
export async function getUserNameById(userId: string): Promise<string | undefined> {
  try {
    const user = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      userId
    );
    return user.name;
  } catch {
    return undefined;
  }
}

// Fetch user profiles by IDs (for chat sender population)
export async function getUsersByIds(userIds: string[]): Promise<Record<string, { $id: string; name: string; avatar?: string }>> {
  if (!userIds.length) return {};
  const uniqueIds = Array.from(new Set(userIds));
  const users: Record<string, { $id: string; name: string; avatar?: string }> = {};
  try {
    // Appwrite only allows up to 100 queries at once
    const batchSize = 100;
    for (let i = 0; i < uniqueIds.length; i += batchSize) {
      const batch = uniqueIds.slice(i, i + batchSize);
      const res = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId,
        [
          // @ts-ignore
          { method: 'equal', args: ['$id', batch] },
        ]
      );
      for (const user of res.documents) {
        users[user.$id] = { $id: user.$id, name: user.name, avatar: user.avatar };
      }
    }
  } catch (e) {
    // fallback: just return empty
  }
  return users;
}
// Utility functions to handle skills/tools as arrays in Appwrite
// Keep arrays as arrays since Appwrite is configured to accept them

export const arrayToString = (arr: string[]): string => {
  return arr.join(',');
};

export const stringToArray = (str: string | undefined): string[] => {
  if (!str || str.trim() === '') return [];
  return str.split(',').map(item => item.trim()).filter(item => item.length > 0);
};

// Transform user data for Appwrite (keep arrays as arrays)
export const transformUserForAppwrite = (userData: any) => {
  const transformed = { ...userData };
  
  // Ensure skills and tools are arrays
  if (userData.skills && !Array.isArray(userData.skills)) {
    transformed.skills = stringToArray(userData.skills);
  } else if (!userData.skills) {
    transformed.skills = [];
  }
  
  if (userData.tools && !Array.isArray(userData.tools)) {
    transformed.tools = stringToArray(userData.tools);
  } else if (!userData.tools) {
    transformed.tools = [];
  }
  
  return transformed;
};

// Transform user data from Appwrite (arrays should stay as arrays)
export const transformUserFromAppwrite = (userData: any) => {
  const transformed = { ...userData };
  
  // Ensure skills and tools are arrays
  if (userData.skills && !Array.isArray(userData.skills)) {
    transformed.skills = stringToArray(userData.skills);
  } else if (!userData.skills) {
    transformed.skills = [];
  }
  
  if (userData.tools && !Array.isArray(userData.tools)) {
    transformed.tools = stringToArray(userData.tools);
  } else if (!userData.tools) {
    transformed.tools = [];
  }
  
  return transformed;
};
