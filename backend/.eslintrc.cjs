module.exports = {
  root: true,
  env: { node: true, es2020: true },
  extends: [
    'eslint:recommended',
  ],
  ignorePatterns: ['dist', 'node_modules'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    // Allow unused variables for now - can be stricter later
    'no-unused-vars': 'off',
    'no-useless-catch': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
  },
  overrides: [
    {
      files: ['**/*.spec.ts', '**/*.test.ts', '**/__tests__/**/*.ts'],
      env: { jest: true },
    }
  ]
};