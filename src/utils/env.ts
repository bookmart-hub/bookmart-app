/**
 * Retrieves the API URL from the environment variables.
 * Fallback to the default production API URL if not defined.
 */
export const getApiUrl = (): string => {
  return process.env.EXPO_PUBLIC_API_URL || 'https://bookmart-backend-y6of.onrender.com';
};
