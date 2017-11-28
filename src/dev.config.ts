import baseConfigFactory from './base.config';
import * as HtmlWebpackPlugin from 'html-webpack-plugin';
import * as path from 'path';
import webpack = require('webpack');

function webpackConfig(args: any) {
	const config: webpack.Configuration = baseConfigFactory(args);
	const { plugins = [], output = {} } = config;

	config.plugins = [...plugins, new HtmlWebpackPlugin({ inject: true, chunks: ['main'], template: 'src/index.html' })];

	config.output = {
		...output,
		path: path.join(output.path!, 'dev')
	};

	config.devtool = 'inline-source-map';
	return config;
}

export default webpackConfig;
