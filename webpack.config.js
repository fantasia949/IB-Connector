const path = require('path')

module.exports = {
	target: 'node',
	entry: './main.js',
	output: {
		filename: 'index.js',
		path: path.resolve(__dirname, 'dist')
	},
	mode: 'development',
	externals: [ /node_modules/, 'bufferutil', 'utf-8-validate' ],
	stats: {
		warnings: false
	},
	plugins: [],
	optimization: {
		minimize: false // save time
	}
}
