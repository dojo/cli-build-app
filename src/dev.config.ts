import baseConfigFactory from './base.config';
import * as HtmlWebpackPlugin from 'html-webpack-plugin';
import * as path from 'path';
import webpack = require('webpack');
import * as CleanWebpackPlugin from 'clean-webpack-plugin';

const basePath = process.cwd();

function webpackConfig(args: any): webpack.Configuration {
	const config = baseConfigFactory(args);
	const { plugins, output } = config;

	config.plugins = [
		...plugins,
		new HtmlWebpackPlugin({ inject: true, chunks: ['runtime', 'main'], template: 'src/index.html' }),
		new CleanWebpackPlugin(['dev'], { root: output.path }),
		new webpack.optimize.CommonsChunkPlugin({
			name: 'runtime'
		})
	];

	config.output = {
		...output,
		path: path.join(output.path!, 'dev')
	};

	config.devtool = 'inline-source-map';
	return config;
}

export default webpackConfig;
