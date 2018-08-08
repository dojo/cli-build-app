import baseConfigFactory, { mainEntry, packageName } from './base.config';
import { WebAppManifest } from './interfaces';
import webpack = require('webpack');
import * as fs from 'fs';
import * as path from 'path';
import { deepAssign } from '@dojo/framework/core/lang';
import BuildTimeRender from '@dojo/webpack-contrib/build-time-render/BuildTimeRender';
import ServiceWorkerPlugin, {
	ServiceWorkerOptions
} from '@dojo/webpack-contrib/service-worker-plugin/ServiceWorkerPlugin';
import * as HtmlWebpackPlugin from 'html-webpack-plugin';
import * as ExtractTextPlugin from 'extract-text-webpack-plugin';
import * as CleanWebpackPlugin from 'clean-webpack-plugin';
import * as CopyWebpackPlugin from 'copy-webpack-plugin';
import * as ManifestPlugin from 'webpack-manifest-plugin';
import * as WebpackChunkHash from 'webpack-chunk-hash';

const BundleAnalyzerPlugin = require('webpack-bundle-analyzer-sunburst').BundleAnalyzerPlugin;
const WebpackPwaManifest = require('webpack-pwa-manifest');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

function webpackConfig(args: any): webpack.Configuration {
	const config = baseConfigFactory(args);
	const manifest: WebAppManifest = args.pwa && args.pwa.manifest;
	const serviceWorker: ServiceWorkerOptions = args.pwa && args.pwa.serviceWorker;
	const { plugins, output } = config;
	const outputPath = path.join(output.path!, 'dist');
	const assetsDir = path.join(process.cwd(), 'assets');
	const assetsDirExists = fs.existsSync(assetsDir);

	config.plugins = [
		...plugins,
		assetsDirExists && new CopyWebpackPlugin([{ from: assetsDir, to: path.join(outputPath, 'assets') }]),
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
			meta: manifest ? { 'mobile-web-app-capable': 'yes' } : {},
			template: 'src/index.html'
		}),
		manifest &&
			new WebpackPwaManifest({
				...manifest,
				ios: true,
				icons: Array.isArray(manifest.icons)
					? manifest.icons.map((icon) => ({ ...icon, ios: true }))
					: manifest.icons
			}),
		new UglifyJsPlugin({ sourceMap: true, cache: true }),
		new WebpackChunkHash(),
		new CleanWebpackPlugin(['dist'], { root: output.path, verbose: false }),
		new webpack.optimize.CommonsChunkPlugin({
			name: 'runtime'
		}),
		new webpack.DefinePlugin({
			'process.env': {
				NODE_ENV: '"production"'
			}
		})
	].filter((item) => item);

	if (serviceWorker) {
		const serviceWorkerOptions =
			typeof serviceWorker === 'string' ? serviceWorker : deepAssign({ cachePrefix: packageName }, serviceWorker);
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

	config.plugins = config.plugins.map((plugin) => {
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
		path: outputPath,
		chunkFilename: '[name].[chunkhash].bundle.js',
		filename: '[name].[chunkhash].bundle.js'
	};

	return config;
}

export default webpackConfig;
