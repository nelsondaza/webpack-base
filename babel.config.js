module.exports = {
  babelrcRoots: [
    '.',
    './packages/*',
  ],
  "presets": [
    [
      "@babel/preset-env",
      {
        corejs: 3,
        modules: false,
        targets: {
          browsers: 'last 3 versions, not ie < 11, not ie_mob < 11',
        },
        useBuiltIns: 'usage',
      }
    ],
    ["@babel/preset-react", {
      "runtime": "automatic"
    }]
  ],
  "plugins": [
    ['module-resolver', { root: ['./src', './src/packages'] }],
  ]
}
