import Config from 'react-native-config';

export const getFullImageUrl = (relativeUrl: string | undefined): string => {
  if (!relativeUrl) {
    return ''; // Return empty string or a placeholder image URL if relativeUrl is undefined
  }

  // Check if the URL is already absolute (starts with http or https)
  if (relativeUrl.startsWith('http')) {
    return relativeUrl;
  }

  // Otherwise, prepend the base URL
  return `https://backend-practice.eurisko.me${relativeUrl}`;
};
