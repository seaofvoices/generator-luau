import copy from 'rollup-plugin-copy'

const generators = ['app', 'foreman', 'package', 'license']

export default generators.map((name) => ({
  input: `src/${name}/index.js`,
  output: {
    file: `generators/${name}/index.js`,
  },
  plugins: [
    copy({
      targets: [{ src: `src/${name}/templates`, dest: `generators/${name}` }],
    }),
  ],
}))
