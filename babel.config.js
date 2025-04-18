module.exports = function (api) {
  api.cache(true);

  const isWeb = process.env.EXPO_PLATFORM === 'web';

  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      !isWeb && 'nativewind/babel',
    ].filter(Boolean),

    plugins: [
    ],
  };
};
