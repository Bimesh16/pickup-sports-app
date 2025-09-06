const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  
  // Add externals for optional dependencies to prevent webpack warnings
  config.externals = {
    ...config.externals,
    'expo-image-picker': 'expo-image-picker',
    'expo-haptics': 'expo-haptics',
    'expo-location': 'expo-location',
  };

  // Add fallback modules for web platform
  config.resolve.fallback = {
    ...config.resolve.fallback,
    'expo-image-picker': false,
    'expo-haptics': false,
    'expo-location': false,
  };

  return config;
};
