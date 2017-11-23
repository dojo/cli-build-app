import baseConfigFactory from './base.config';
import * as path from 'path';
import webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

function webpackConfig(args: any) {
	const config: webpack.Configuration = baseConfigFactory(args);
	const { plugins = [], output = { } } = config;

	config.plugins = [
		...plugins,
		new HtmlWebpackPlugin({ inject: true, chunks: [ 'src/main' ], template: 'src/index.html' })
	];

	config.output = {
		...output,
		path: path.join(output.path!, 'dev')
	};

	config.devtool = 'inline-source-map';
	return config;
}

export default webpackConfig;
