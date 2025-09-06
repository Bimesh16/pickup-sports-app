// Mock for expo-image-picker when not available
export const requestMediaLibraryPermissionsAsync = async () => ({
  status: 'denied',
  granted: false,
});

export const launchImageLibraryAsync = async () => ({
  canceled: true,
  assets: null,
});

export const MediaTypeOptions = {
  Images: 'Images',
  Videos: 'Videos',
  All: 'All',
};
