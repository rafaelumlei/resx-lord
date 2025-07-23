//@ts-check

'use strict';

const path = require('path');
const { DefinePlugin } = require('webpack');

//@ts-check
/** @typedef {import('webpack').Configuration} WebpackConfig **/

/** @type WebpackConfig */
const extensionConfig = {
	target: 'node',
	mode: 'none',
	entry: './src/extension.ts',
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'extension.js',
		libraryTarget: 'commonjs2'
	},
	externals: {
		vscode: 'commonjs vscode',
		'electron-edge-js': 'commonjs2 electron-edge-js',
		'edge-cs': 'commonjs2 edge-cs',
	},
	node: {
		__dirname: true,
		__filename: true,
	},
	resolve: {
		extensions: ['.ts', '.js']
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				exclude: /node_modules/,
				use: [{ loader: 'ts-loader' }]
			}
		]
	},
	infrastructureLogging: {
		level: "log",
	},
	ignoreWarnings: [
		{
			// Ignore warnings raised by the Vue app dependencies
			message: /Critical dependency: the request of a dependency is an expression/
		}
	]
};
module.exports = [extensionConfig];