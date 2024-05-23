module.exports = {
    testEnvironment: 'node',
    testMatch: ['**/tests/**/*.js?(x)', '**/?(*.)+(spec|test).js?(x)'],
    transform: {
        '^.+\\.js$': 'babel-jest',
      },
  };