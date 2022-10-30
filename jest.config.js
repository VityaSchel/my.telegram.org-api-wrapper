/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // testMatch: ['<rootDir>/**/test/**/*.test.ts'],
  // testPathIgnorePatterns: ['<rootDir>/node_modules/'],
  collectCoverage: true,
  coverageDirectory: './coverage',
  coveragePathIgnorePatterns: ['node_modules', 'src/database', 'src/test', 'src/types'],
  testPathIgnorePatterns: ['<rootDir>/node_modules/node-fetch', '<rootDir>/dist/'],
  // reporters: ['default', 'jest-junit'],
  // globals: { 'ts-jest': { diagnostics: false } },
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
    '^.+\\.(ts|tsx)?$': [
      'ts-jest',
      // {
      //   useESM: true,
      // },
    ],
  }
}