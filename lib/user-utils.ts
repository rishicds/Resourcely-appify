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
