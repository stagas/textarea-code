module.exports = {
  testEnvironment: 'jsdom',
  rootDir: 'src',
  testMatch: ['**/*.spec.{js,jsx,ts,tsx}'],
  coverageDirectory: '../coverage',

  // enable this for real typescript builds (slow but accurate)
  // preset: 'ts-jest',

  // enable this for fast, correct sourcemaps but not all features supported
  transform: {
    '\\.(js|jsx|ts|tsx)$': [
      '@stagas/sucrase-jest-plugin',
      {
        jsxPragma: 'h',
        jsxFragmentPragma: 'Fragment',
        production: true,
        disableESTransforms: true,
      },
    ],
  },

  // enable this for fast, incorrect sourcemaps but more features supported

  // transform: {
  //   '\\.(js|jsx|ts|tsx)$': [
  //     '@swc-node/jest',
  //     {
  //       experimentalDecorators: true,
  //       emitDecoratorMetadata: true,
  //       react: {
  //         pragma: 'h',
  //         pragmaFrag: 'Fragment',
  //       },
  //     },
  //   ],
  // },
}
