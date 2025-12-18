import { API_BASE_URL } from './constants';

/**
 * Converts a profile image string to a displayable URI
 * Handles three formats:
 * 1. Base64 with data URI prefix (data:image/...) - return as-is
 * 2. Raw base64 string - add data URI prefix
 * 3. File path - construct full URL
 */
export const getImageUrl = (profileImage) => {
  if (!profileImage) return null;

  // Check if it's already a data URI (base64 with prefix)
  if (profileImage.startsWith('data:image')) {
    return profileImage;
  }

  // Check if it's a raw base64 string (long string without slashes)
  if (profileImage.length > 100 && !profileImage.includes('/') && !profileImage.includes('\\')) {
    return `data:image/jpeg;base64,${profileImage}`;
  }

  // If profileImage already starts with http, use it as is
  if (profileImage.startsWith('http')) {
    return profileImage;
  }

  // Otherwise, construct full URL for file path
  const baseUrl = API_BASE_URL.replace('/api', '');
  return `${baseUrl}${profileImage.startsWith('/') ? profileImage : '/' + profileImage}`;
};
