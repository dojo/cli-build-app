import baseConfigFactory from './base.config';
import * as HtmlWebpackPlugin from 'html-webpack-plugin';
import * as path from 'path';
import webpack = require('webpack');
import * as CleanWebpackPlugin from 'clean-webpack-plugin';
import * as ManifestPlugin from 'webpack-manifest-plugin';

function webpackConfig(args: any): webpack.Configuration {
	const config = baseConfigFactory(args);
	const { plugins, output } = config;

	config.plugins = [
		...plugins,
		new ManifestPlugin(),
		new HtmlWebpackPlugin({ inject: true, chunks: ['runtime', 'main'], template: 'src/index.html' }),
		new CleanWebpackPlugin(['dev'], { root: output.path, verbose: false }),
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
