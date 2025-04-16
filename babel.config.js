const path = require('path');

module.exports = function (api) {
  api.cache(true);

  const isWeb = process.env.EXPO_PLATFORM === 'web';

  return {
    presets: ['babel-preset-expo'],
    plugins: [
      !isWeb && 'nativewind/babel', // skip nativewind for web
      require.resolve('expo-router/babel'),
    ].filter(Boolean),
  };
};
