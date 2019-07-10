    
const path = require('path');

module.exports = {
  target: 'node',
  entry: './main.test.js',
  output: {
    filename: 'index.test.js',
    path: path.resolve(__dirname, 'dist')
  },
  mode: 'development',
  externals: [/node_modules/, 'bufferutil', 'utf-8-validate'],
  stats: {
    warnings: false
  },
  optimization: {
    minimize: false // save time
  }
}
