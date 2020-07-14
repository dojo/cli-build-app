import BuildTimeRender from '@dojo/webpack-contrib/build-time-render/BuildTimeRender';
import ExternalLoaderPlugin from '@dojo/webpack-contrib/external-loader-plugin/ExternalLoaderPlugin';
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
import baseConfigFactory, {
	bootstrapEntry,
	mainEntry,
	InsertScriptPlugin,
	packageName,
	libraryName
} from './base.config';
import { WebAppManifest } from './interfaces';

const CompressionPlugin = require('compression-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const WebpackPwaManifest = require('webpack-pwa-manifest');

const banner = `
[Dojo](https://dojo.io/)
Copyright [JS Foundation](https://js.foundation/) & contributors
[New BSD license](https://github.com/dojo/meta/blob/master/LICENSE)
All rights reserved
`;

function webpackConfig(args: any): webpack.Configuration {
	const basePath = process.cwd();
	const base = args.base || '/';
	const config = baseConfigFactory(args);
	const manifest: WebAppManifest = args.pwa && args.pwa.manifest;
	const { plugins, output } = config;
	const outputPath = path.join(output!.path!, 'dist');
	const assetsDir = path.join(process.cwd(), 'assets');
	const assetsDirExists = fs.existsSync(assetsDir);
	const entryName = args.singleBundle ? mainEntry : bootstrapEntry;
	let serviceWorkerOptions: ServiceWorkerOptions | undefined;
	if (args.pwa && args.pwa.serviceWorker) {
		serviceWorkerOptions =
			typeof args.pwa.serviceWorker === 'string'
				? args.pwa.serviceWorker
				: { cachePrefix: packageName, ...args.pwa.serviceWorker };
	}

	config.mode = 'production';

	config.optimization = {
		...config.optimization,
		namedChunks: true,
		minimizer: [new TerserPlugin({ sourceMap: true, cache: true })],
		flagIncludedChunks: false
	};

	config.plugins = [
		...plugins!,
		assetsDirExists && new CopyWebpackPlugin([{ from: assetsDir, to: path.join(outputPath, 'assets') }]),
		new BundleAnalyzerPlugin({
			analyzerMode: 'static',
			openAnalyzer: false,
			generateStatsFile: true,
			reportFilename: '../info/report.html',
			statsFilename: '../info/stats.json'
		}),
		new HtmlWebpackPlugin({
			base,
			inject: true,
			chunks: [entryName],
			meta: manifest ? { 'mobile-web-app-capable': 'yes' } : {},
			template: 'src/index.html',
			cache: false
		}),
		args.externals &&
			args.externals.dependencies &&
			new ExternalLoaderPlugin({
				dependencies: args.externals.dependencies,
				hash: true,
				outputPath: args.externals.outputPath
			}),
		manifest &&
			new WebpackPwaManifest({
				...manifest,
				ios: true,
				icons: Array.isArray(manifest.icons)
					? manifest.icons.map((icon) => ({ ...icon, ios: true }))
					: manifest.icons
			}),
		new InsertScriptPlugin([
			{ content: `<base href="${base}">`, type: 'prepend' },
			{
				content: `<script>
	if (!window['${libraryName}']) {
		window['${libraryName}'] = {}
	}
	window['${libraryName}'].base = '${base}'</script>`,
				type: 'append'
			}
		]),
		serviceWorkerOptions && new ServiceWorkerPlugin(serviceWorkerOptions),
		serviceWorkerOptions &&
			new InsertScriptPlugin({
				content: `<script>
		if ('serviceWorker' in window.navigator) {
			window.addEventListener('load', function() {
				window.navigator.serviceWorker.register('service-worker.js');
			});
		}
	</script>`,
				type: 'append'
			}),
		new webpack.BannerPlugin({
			banner,
			test: /^.*\.js$/i
		}),
		new CleanWebpackPlugin(['dist', 'info'], { root: output!.path, verbose: false })
	].filter((item) => item);

	if (args['build-time-render']) {
		config.plugins.push(
			new BuildTimeRender({
				...args['build-time-render'],
				entries: Object.keys(config.entry!),
				sync: args.singleBundle,
				basePath,
				baseUrl: base,
				scope: libraryName,
				onDemand: Boolean(args.serve && args.watch)
			})
		);
	}

	config.plugins = config.plugins.map((plugin) => {
		if (plugin instanceof MiniCssExtractPlugin) {
			return new MiniCssExtractPlugin({
				filename: args.omitHash ? '[name].bundle.css' : '[name].[contenthash].bundle.css'
			});
		}
		return plugin;
	});

	if (Array.isArray(args.compression)) {
		args.compression.forEach((algorithm: 'brotli' | 'gzip') => {
			config.plugins!.push(
				new CompressionPlugin({
					algorithm: algorithm === 'brotli' ? 'brotliCompress' : 'gzip',
					test: /\.(js|css|html|svg)$/
				})
			);
		});
	}

	config.output = {
		...output,
		path: outputPath,
		chunkFilename: args.omitHash ? '[name].bundle.js' : '[name].[chunkhash].bundle.js',
		filename: args.omitHash ? '[name].bundle.js' : '[name].[chunkhash].bundle.js'
	};

	return config;
}

export default webpackConfig;
