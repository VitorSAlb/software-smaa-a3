module.exports = {
    hooks: {
      'pre-commit': 'cd frontend && npm run lint && npm test && commitlint -E HUSKY_GIT_PARAMS',
    },
  };
  