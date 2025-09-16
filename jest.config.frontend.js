module.exports = {
  testEnvironment: 'jsdom',
  testMatch: ['**/client/src/**/*.test.js', '**/src/**/*.test.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.frontend.js'],
  moduleNameMapper: {
    "\.css$": "<rootDir>/__mocks__/styleMock.js",
  },
};