// build.js
require('esbuild').build({
  entryPoints: ['index.js'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  outfile: 'dist/index.js',
  sourcemap: true,
  define: {
    'process.env.NODE_ENV': JSON.stringify('development'),
  },
}).catch(() => process.exit(1));