import baseConfigFactory, { mainEntry, packageName } from './base.config';
import { WebAppManifest } from './interfaces';
import * as HtmlWebpackPlugin from 'html-webpack-plugin';
import * as fs from 'fs';
import * as path from 'path';
import webpack = require('webpack');
import { deepAssign } from '@dojo/framework/core/lang';
import BuildTimeRender from '@dojo/webpack-contrib/build-time-render/BuildTimeRender';
import ServiceWorkerPlugin, {
	ServiceWorkerOptions
} from '@dojo/webpack-contrib/service-worker-plugin/ServiceWorkerPlugin';
import * as CleanWebpackPlugin from 'clean-webpack-plugin';
import * as CopyWebpackPlugin from 'copy-webpack-plugin';
import * as ManifestPlugin from 'webpack-manifest-plugin';

const WebpackPwaManifest = require('webpack-pwa-manifest');

function webpackConfig(args: any): webpack.Configuration {
	const config = baseConfigFactory(args);
	const manifest: WebAppManifest = args.pwa && args.pwa.manifest;
	const serviceWorker: string | ServiceWorkerOptions = args.pwa && args.pwa.serviceWorker;
	const { plugins, output, module } = config;
	const outputPath = path.join(output.path!, 'dev');
	const assetsDir = path.join(process.cwd(), 'assets');
	const assetsDirExists = fs.existsSync(assetsDir);

	config.plugins = [
		...plugins,
		assetsDirExists && new CopyWebpackPlugin([{ from: assetsDir, to: path.join(outputPath, 'assets') }]),
		new ManifestPlugin(),
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
		new CleanWebpackPlugin(['dev'], { root: output.path, verbose: false }),
		new webpack.optimize.CommonsChunkPlugin({
			name: 'runtime'
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

	module.rules = module.rules.map((rule) => {
		if (Array.isArray(rule.use)) {
			rule.use.forEach((loader: any) => {
				if (typeof loader === 'string') {
					return loader;
				}
				if (loader.loader === 'css-loader') {
					loader.options.localIdentName = '[name]__[local]__[hash:base64:5]';
					return loader;
				}
			});
		}
		return rule;
	});

	config.output = {
		...output,
		path: outputPath
	};

	config.devtool = 'inline-source-map';
	return config;
}

export default webpackConfig;
