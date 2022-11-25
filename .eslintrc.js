// eslint-disable-next-line unicorn/prefer-module
module.exports = {
  env: {
    browser: true,
    es6: true,
    jest: true,
    node: true,
  },
  extends: ['airbnb', 'prettier', 'plugin:@typescript-eslint/recommended', 'plugin:unicorn/recommended'],
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
  overrides: [
    {
      files: ['**/*.{ts,tsx}'],
      rules: {
        'react/prop-types': 'off',
      },
    },
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    createDefaultProgram: true,
    sourceType: 'module',
  },
  plugins: ['react', 'react-hooks', '@typescript-eslint', 'import'],
  root: true,
  rules: {
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-implied-eval': 'off',
    '@typescript-eslint/no-shadow': ['error'],
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
    'import/order': [
      'error',
      {
        groups: [
          'builtin', // node
          'external', // third party
          'internal', // local webpack
          'parent', // ../*
          'sibling', // ./*
          'index', // ./
          'object', // import log = console.log;
          'type', // import type *
          'unknown', //
        ],
        'newlines-between': 'always',
        alphabetize: {
          /* sort in ascending order. Options: ["ignore", "asc", "desc"] */
          order: 'asc',
          /* ignore case. Options: [true, false] */
          caseInsensitive: true,
        },
      },
    ],
    'import/prefer-default-export': 'off',
    indent: ['error', 2, { SwitchCase: 1 }],
    'jsx-a11y/control-has-associated-label': 'off',
    'jsx-a11y/label-has-associated-control': ['error', { assert: 'either' }],
    'jsx-quotes': ['error', 'prefer-double'],
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
    'no-shadow': 'off',
    'react/no-string-refs': 'off',
    'object-curly-newline': [
      'error',
      {
        consistent: true,
        minProperties: 9,
        multiline: true,
      },
    ],
    'operator-linebreak': ['error', 'before'],
    quotes: ['error', 'single', { avoidEscape: true }],
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
    'react/static-property-placement': 'off',
    'react/sort-comp': 'off',
    'react/state-in-constructor': 'off',
    semi: ['error', 'never'],
    'sort-imports': [
      'error',
      {
        ignoreCase: false,
        ignoreDeclarationSort: true, // don"t want to sort import lines, use eslint-plugin-import instead
        ignoreMemberSort: false,
        memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
        allowSeparatedGroups: true,
      },
    ],

    'unicorn/consistent-destructuring': 'off',
    'unicorn/filename-case': 'off',
    'unicorn/no-array-reduce': 'off',
    'unicorn/no-console-spaces': 'off',
    'unicorn/no-for-loop': 'off',
    'unicorn/no-null': 'off',
    'unicorn/prefer-export-from': 'off',
    'unicorn/prefer-module': 'off',
    'unicorn/prevent-abbreviations': 'off',

    'unicorn/no-array-for-each': 'off',
    'unicorn/no-array-callback-reference': 'off',
    'unicorn/consistent-function-scoping': 'off',

    'no-restricted-syntax': 'off',
    'unicorn/better-regex': 'off',
    'unicorn/catch-error-name': 'off',
    'unicorn/explicit-length-check': 'off',
    'unicorn/import-index': 'off',
    'unicorn/no-abusive-eslint-disable': 'off',
    'unicorn/no-array-push-push': 'off',
    'unicorn/no-empty-file': 'off',
    'unicorn/no-keyword-prefix': 'off',
    'unicorn/no-lonely-if': 'off',
    'unicorn/no-nested-ternary': 'off',
    'unicorn/no-new-array': 'off',
    'unicorn/no-object-as-default-parameter': 'off',
    'unicorn/no-useless-fallback-in-spread': 'off',
    'unicorn/no-useless-undefined': 'off',
    'unicorn/no-zero-fractions': 'off',
    'unicorn/numeric-separators-style': 'off',
    'unicorn/prefer--includes': 'off',
    'unicorn/prefer-array-some': 'off',
    'unicorn/prefer-date-now': 'off',
    'unicorn/prefer-dom-node-dataset': 'off',
    'unicorn/prefer-dom-node-remove': 'off',
    'unicorn/prefer-includes': 'off',
    'unicorn/prefer-node-protocol': 'off',
    'unicorn/prefer-number-properties': 'off',
    'unicorn/prefer-object-from-entries': 'off',
    'unicorn/prefer-optional-catch-binding': 'off',
    'unicorn/prefer-query-selector': 'off',
    'unicorn/prefer-regexp-test': 'off',
    'unicorn/prefer-set-has': 'off',
    'unicorn/prefer-spread': 'off',
    'unicorn/prefer-string-slice': 'off',
    'unicorn/prefer-switch': 'off',
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.ts', '.jsx', '.tsx'],
        paths: ['src', 'src/packages'],
        moduleDirectory: ['src', 'src/packages', 'node_modules'],
      },
      typescript: {
        project: './tsconfig.json',
      },
    },
    react: {
      pragma: 'React',
      version: '18',
    },
  },
}
