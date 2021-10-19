module.exports = {
  env: {
    browser: true,
    es6: true,
    jest: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'airbnb',
    'airbnb-typescript',
    'prettier',
  ],
  globals: {
    ajaxIntercept: true,
    createTestComponent: true,
    createTestComponentConnected: true,
    epicToPromise: true,
    expectBecameFalse: true,
    expectBecameTrue: true,
    expectChange: true,
    expectKeys: true,
    expectNoChange: true,
    FEATURES_FLAGS: true,
    SYSTEM: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    project: './tsconfig.json',
    createDefaultProgram: true,
  },
  plugins: ['react', 'react-hooks', '@typescript-eslint'],
  root: true,
  rules: {
    'arrow-parens': ['error', 'always'],
    'comma-dangle': ['error', 'always-multiline'],
    'import/no-extraneous-dependencies': 'off',
    'import/prefer-default-export': 'off',
    'jsx-a11y/control-has-associated-label': 'off',
    'max-classes-per-file': ['error', 2],
    'max-len': [
      'error',
      {
        code: 100,
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
    'react/jsx-filename-extension': ['error', { extensions: ['.js', '.jsx', '.ts', '.tsx'] }],
    'react/jsx-one-expression-per-line': 'off',
    'react/jsx-props-no-spreading': 'off',
    'react/jsx-uses-react': 'off',
    'react/no-deprecated': 'error',
    'react/react-in-jsx-scope': 'off',
    'react/sort-comp': [
      'error',
      {
        order: [
          'static-methods',
          'instance-variables',
          'lifecycle',
          'everything-else',
          'sub-rendering',
          'render',
        ],
        groups: { 'sub-rendering': ['/^(shouldRender|render).+$/'] },
      },
    ],
    'react/state-in-constructor': 'off',
    semi: ['error', 'never'],
  },
  settings: {
    'import/resolver': { node: { paths: ['src', 'src/packages'] } },
    react: {
      pragma: 'React',
      version: '17',
    },
  },
}
