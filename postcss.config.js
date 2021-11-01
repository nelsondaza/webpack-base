// eslint-disable-next-line @typescript-eslint/no-var-requires
const { getConfig } = require('./config/utils')

const build = getConfig('build')

module.exports = {
  plugins: [build.enableTailwindCSS && require('tailwindcss'), require('autoprefixer')].filter(Boolean),
}
