import baseConfigFactory, { mainEntry, packageName } from './base.config';
import { WebAppManifest } from './interfaces';
import { getHtmlMetaTags } from './util/pwa';
import webpack = require('webpack');
import * as path from 'path';
import { deepAssign } from '@dojo/core/lang';
import BuildTimeRender from '@dojo/webpack-contrib/build-time-render/BuildTimeRender';
import ServiceWorkerPlugin, {
	ServiceWorkerOptions
} from '@dojo/webpack-contrib/service-worker-plugin/ServiceWorkerPlugin';
import * as HtmlWebpackPlugin from 'html-webpack-plugin';
import * as ExtractTextPlugin from 'extract-text-webpack-plugin';
import * as CleanWebpackPlugin from 'clean-webpack-plugin';
import * as ManifestPlugin from 'webpack-manifest-plugin';
import * as WebpackChunkHash from 'webpack-chunk-hash';

const BundleAnalyzerPlugin = require('webpack-bundle-analyzer-sunburst').BundleAnalyzerPlugin;
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

function webpackConfig(args: any): webpack.Configuration {
	const config = baseConfigFactory(args);
	const manifest: WebAppManifest = args.pwa && args.pwa.manifest;
	const serviceWorker: ServiceWorkerOptions = args.pwa && args.pwa.serviceWorker;
	const { plugins, output } = config;

	config.plugins = [
		...plugins,
		new ManifestPlugin(),
		new BundleAnalyzerPlugin({
			analyzerMode: 'static',
			openAnalyzer: false,
			reportType: 'sunburst',
			generateStatsFile: true,
			reportFilename: '../info/report.html',
			statsFilename: '../info/stats.json'
		}),
		new HtmlWebpackPlugin({
			inject: true,
			chunks: ['runtime', 'main'],
			meta: manifest ? getHtmlMetaTags(manifest) : {},
			template: 'src/index.html'
		}),
		new UglifyJsPlugin({ sourceMap: true, cache: true }),
		new WebpackChunkHash(),
		new CleanWebpackPlugin(['dist'], { root: output.path, verbose: false }),
		new webpack.optimize.CommonsChunkPlugin({
			name: 'runtime'
		})
	];

	if (serviceWorker) {
		const serviceWorkerOptions =
			typeof serviceWorker === 'string' ? serviceWorker : deepAssign(serviceWorker, { cachePrefix: packageName });
		config.plugins.push(new ServiceWorkerPlugin(serviceWorkerOptions));

		if (typeof serviceWorker !== 'string') {
			const entry = config.entry as any;
			entry[mainEntry].push('@dojo/webpack-contrib/service-worker-plugin/service-worker-entry');
		}
	}

	if (args.watch !== 'memory' && args['build-time-render']) {
		config.plugins.push(
			new BuildTimeRender({
				...args['build-time-render'],
				entries: ['runtime', ...Object.keys(config.entry!)],
				useManifest: true
			})
		);
	}

	config.plugins = config.plugins.map(plugin => {
		if (plugin instanceof ExtractTextPlugin) {
			return new ExtractTextPlugin({
				filename: '[name].[contenthash].bundle.css',
				allChunks: true
			});
		}
		return plugin;
	});

	config.output = {
		...output,
		path: path.join(output.path!, 'dist'),
		chunkFilename: '[name].[chunkhash].bundle.js',
		filename: '[name].[chunkhash].bundle.js'
	};

	return config;
}

export default webpackConfig;
