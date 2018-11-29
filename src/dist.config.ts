import BuildTimeRender from '@dojo/webpack-contrib/build-time-render/BuildTimeRender';
import BundleAnalyzerPlugin from '@dojo/webpack-contrib/webpack-bundle-analyzer/BundleAnalyzerPlugin';
import ServiceWorkerPlugin, {
	ServiceWorkerOptions
} from '@dojo/webpack-contrib/service-worker-plugin/ServiceWorkerPlugin';
import * as CleanWebpackPlugin from 'clean-webpack-plugin';
import * as CopyWebpackPlugin from 'copy-webpack-plugin';
import * as fs from 'fs';
import * as HtmlWebpackPlugin from 'html-webpack-plugin';
import * as MiniCssExtractPlugin from 'mini-css-extract-plugin';
import * as path from 'path';
import * as webpack from 'webpack';
import * as WebpackChunkHash from 'webpack-chunk-hash';
import * as ManifestPlugin from 'webpack-manifest-plugin';
import baseConfigFactory, { mainEntry, packageName } from './base.config';
import { WebAppManifest } from './interfaces';

const BrotliPlugin = require('brotli-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const WebpackPwaManifest = require('webpack-pwa-manifest');

const banner = `
[Dojo](https://dojo.io/)
Copyright [JS Foundation](https://js.foundation/) & contributors
[New BSD license](https://github.com/dojo/meta/blob/master/LICENSE)
All rights reserved
`;

function webpackConfig(args: any): webpack.Configuration {
	const config = baseConfigFactory(args);
	const manifest: WebAppManifest = args.pwa && args.pwa.manifest;
	const serviceWorker: ServiceWorkerOptions = args.pwa && args.pwa.serviceWorker;
	const { plugins, output } = config;
	const outputPath = path.join(output!.path!, 'dist');
	const assetsDir = path.join(process.cwd(), 'assets');
	const assetsDirExists = fs.existsSync(assetsDir);

	config.mode = 'production';

	config.optimization = {
		...config.optimization,
		minimizer: [
			new TerserPlugin({ sourceMap: true, cache: true }),
			new OptimizeCssAssetsPlugin({
				cssProcessor: require('cssnano'),
				cssProcessorPluginOptions: {
					preset: ['default', { calc: false }]
				}
			})
		]
	};

	if (!args.singleBundle) {
		config.optimization.runtimeChunk = {
			name: 'runtime'
		};
	}

	config.plugins = [
		...plugins!,
		assetsDirExists && new CopyWebpackPlugin([{ from: assetsDir, to: path.join(outputPath, 'assets') }]),
		new ManifestPlugin(),
		new BundleAnalyzerPlugin({
			analyzerMode: 'static',
			openAnalyzer: false,
			generateStatsFile: true,
			reportFilename: '../info/report.html',
			statsFilename: '../info/stats.json'
		}),
		new HtmlWebpackPlugin({
			inject: true,
			chunks: args.singleBundle ? ['main'] : ['runtime', 'main'],
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
		new webpack.BannerPlugin(banner),
		new WebpackChunkHash(),
		new CleanWebpackPlugin(['dist'], { root: output!.path, verbose: false })
	].filter((item) => item);

	if (serviceWorker) {
		const serviceWorkerOptions =
			typeof serviceWorker === 'string' ? serviceWorker : { cachePrefix: packageName, ...serviceWorker };
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
				entries: args.singleBundle ? Object.keys(config.entry!) : ['runtime', ...Object.keys(config.entry!)],
				useManifest: true
			})
		);
	}

	config.plugins = config.plugins.map((plugin) => {
		if (plugin instanceof MiniCssExtractPlugin) {
			return new MiniCssExtractPlugin({
				filename: '[name].[contenthash].bundle.css'
			});
		}
		return plugin;
	});

	if (Array.isArray(args.compression)) {
		const compressionPlugins: any = {
			gzip: CompressionPlugin,
			brotli: BrotliPlugin
		};
		args.compression.forEach((algorithm: 'brotli' | 'gzip') => {
			const options = { algorithm, test: /\.(js|css|html|svg)$/ };
			const Plugin = compressionPlugins[algorithm];
			config.plugins!.push(new Plugin(options));
		});
	}

	config.output = {
		...output,
		path: outputPath,
		chunkFilename: '[name].[chunkhash].bundle.js',
		filename: '[name].[chunkhash].bundle.js'
	};

	return config;
}

export default webpackConfig;
