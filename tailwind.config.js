module.exports = {
  darkMode: false, // or 'media' or 'class'
  modes: 'jit',
  plugins: [],
  purges: [
    './src/**/*.js',
    './src/**/*.{js,jsx,ts,tsx}',
    './static/index.html',
  ],
  theme: { extend: {} },
  variants: {},
}
