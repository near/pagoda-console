module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    sourceType: 'module',
    tsconfigRootDir: __dirname,
  },
  plugins: ['@typescript-eslint/eslint-plugin', 'custom-rules'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: 'verror',
            importNames: ['default'],
            message: "Please use `import { VError } from 'verror'` instead.",
          },
        ],
      },
    ],
    'custom-rules/require-properties-in-object': [
      'error',
      {
        objectIdentifier: 'connect',
        condition: { type: 'or', conditions: ['id', 'uid'] },
        message:
          "Consider using an 'id' or 'uid' field when connecting to a soft-deletable object through Prisma. Ignore eslint rule for this line if this object is not intended for use with Prisma.",
      },
    ],
  },
};
