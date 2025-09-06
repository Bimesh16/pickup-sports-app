// Mock for expo-location when not available
export const requestForegroundPermissionsAsync = async () => ({
  status: 'denied',
  granted: false,
});

export const getCurrentPositionAsync = async () => {
  throw new Error('Location services not available');
};
