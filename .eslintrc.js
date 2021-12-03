module.exports = {
  env: {
    browser: true,
    es6: true,
    jest: true,
    node: true,
  },
  extends: ['airbnb', 'plugin:@typescript-eslint/recommended', 'prettier'],
  globals: {
    ajaxIntercept: true,
    createTestComponent: true,
    createTestComponentConnected: true,
    cy: true,
    Cypress: true,
    epicToPromise: true,
    expectBecameFalse: true,
    expectBecameTrue: true,
    expectChange: true,
    expectKeys: true,
    expectNoChange: true,
    FEATURES_FLAGS: true,
    SYSTEM: true,
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    createDefaultProgram: true,
    sourceType: 'module',
  },
  plugins: ['react', 'react-hooks', '@typescript-eslint'],
  root: true,
  rules: {
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-implied-eval': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    'arrow-parens': ['error', 'always'],
    'comma-dangle': ['error', 'always-multiline'],
    curly: ['error', 'all'],
    'global-require': 'off',
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
    'import/no-cycle': 'off',
    'import/no-extraneous-dependencies': 'off',
    'import/no-import-module-exports': 'off',
    'import/prefer-default-export': 'off',
    'jsx-a11y/control-has-associated-label': 'off',
    'max-classes-per-file': ['error', 2],
    'max-len': [
      'error',
      {
        code: 120,
        ignoreRegExpLiterals: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
        ignoreUrls: true,
        tabWidth: 2,
      },
    ],
    'no-multiple-empty-lines': ['error', { max: 1, maxBOF: 1, maxEOF: 1 }],
    'object-curly-newline': [
      'error',
      {
        consistent: true,
        minProperties: 9,
        multiline: true,
      },
    ],
    'operator-linebreak': ['error', 'before'],
    'react-hooks/exhaustive-deps': 'error',
    'react-hooks/rules-of-hooks': 'error',
    'react/destructuring-assignment': 'off',
    'react/forbid-prop-types': 'off',
    'react/function-component-definition': 'off',
    'react/jsx-filename-extension': ['error', { extensions: ['.js', '.jsx', '.ts', '.tsx'] }],
    'react/jsx-one-expression-per-line': 'off',
    'react/jsx-props-no-spreading': 'off',
    'react/jsx-uses-react': 'off',
    'react/no-deprecated': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/require-default-props': 'off',
    'react/sort-comp': 'off',
    'react/state-in-constructor': 'off',
    semi: ['error', 'never'],
  },
  settings: {
    'import/resolver': { node: { extensions: ['.js', '.ts', '.jsx', '.tsx'], paths: ['src', 'src/packages'] } },
    react: {
      pragma: 'React',
      version: '17',
    },
  },
}
