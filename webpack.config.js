    
const path = require('path');
var WebpackNotifierPlugin = require('webpack-notifier');

module.exports = {
  target: 'node',
  entry: './main.js',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist')
  },
  mode: 'development',
  stats: {
    warnings: false
  },
  plugins: [
    new WebpackNotifierPlugin(),
  ],
  optimization: {
    minimize: false // save time
  }
}
