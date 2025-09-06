const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  
  // Add externals for optional dependencies to prevent webpack warnings
  config.externals = {
    ...config.externals,
    'expo-image-picker': '{}',
    'expo-haptics': '{}',
    'expo-location': '{}',
  };

  // Add fallback modules for web platform
  config.resolve.fallback = {
    ...config.resolve.fallback,
    'expo-image-picker': require.resolve('./src/mocks/expo-image-picker.js'),
    'expo-haptics': require.resolve('./src/mocks/expo-haptics.js'),
    'expo-location': require.resolve('./src/mocks/expo-location.js'),
  };

  return config;
};
