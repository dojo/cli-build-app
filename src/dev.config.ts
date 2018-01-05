import baseConfigFactory from './base.config';
import * as HtmlWebpackPlugin from 'html-webpack-plugin';
import * as path from 'path';
import webpack = require('webpack');
import * as CleanWebpackPlugin from 'clean-webpack-plugin';

const OfflinePlugin = require('offline-plugin');

function webpackConfig(args: any): webpack.Configuration {
	const config = baseConfigFactory(args);
	const { plugins, output } = config;

	config.plugins = [
		...plugins,
		new HtmlWebpackPlugin({ inject: true, chunks: ['runtime', 'main'], template: 'src/index.html' }),
		new CleanWebpackPlugin(['dev'], { root: output.path, verbose: false }),
		new webpack.optimize.CommonsChunkPlugin({
			name: 'runtime'
		})
	];

	if (args.pwa && args.pwa.serviceWorker) {
		config.plugins.push(
			new OfflinePlugin({
				ServiceWorker: {
					entry: path.join(__dirname, 'service-worker.js')
				},
				...args.pwa.serviceWorker,
				AppCache: false
			})
		);
	}

	config.output = {
		...output,
		path: path.join(output.path!, 'dev')
	};

	config.devtool = 'inline-source-map';
	return config;
}

export default webpackConfig;
