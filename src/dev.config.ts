import baseConfigFactory, { bootstrapEntry, mainEntry, packageName } from './base.config';
import { WebAppManifest } from './interfaces';
import * as HtmlWebpackPlugin from 'html-webpack-plugin';
import * as fs from 'fs';
import * as path from 'path';
import webpack = require('webpack');
import BuildTimeRender from '@dojo/webpack-contrib/build-time-render/BuildTimeRender';
import ExternalLoaderPlugin from '@dojo/webpack-contrib/external-loader-plugin/ExternalLoaderPlugin';
import ServiceWorkerPlugin, {
	ServiceWorkerOptions
} from '@dojo/webpack-contrib/service-worker-plugin/ServiceWorkerPlugin';
import * as CleanWebpackPlugin from 'clean-webpack-plugin';
import * as CopyWebpackPlugin from 'copy-webpack-plugin';
import * as ManifestPlugin from 'webpack-manifest-plugin';

const WebpackPwaManifest = require('webpack-pwa-manifest');

function webpackConfig(args: any): webpack.Configuration {
	const basePath = process.cwd();
	const config = baseConfigFactory(args);
	const manifest: WebAppManifest = args.pwa && args.pwa.manifest;
	const serviceWorker: string | ServiceWorkerOptions = args.pwa && args.pwa.serviceWorker;
	const { plugins, output, module } = config;
	const outputPath = path.join(output!.path!, 'dev');
	const assetsDir = path.join(process.cwd(), 'assets');
	const assetsDirExists = fs.existsSync(assetsDir);
	const entryName = args.singleBundle ? mainEntry : bootstrapEntry;

	config.plugins = [
		...plugins!,
		assetsDirExists && new CopyWebpackPlugin([{ from: assetsDir, to: path.join(outputPath, 'assets') }]),
		new ManifestPlugin(),
		new HtmlWebpackPlugin({
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
		new CleanWebpackPlugin(['dev'], { root: output!.path, verbose: false })
	].filter((item) => item);

	if (module) {
		module.rules = module.rules.map((rule) => {
			if (Array.isArray(rule.use)) {
				rule.use = rule.use.map((loader) => {
					if (typeof loader === 'string') {
						return loader;
					}
					const { loader: loaderName, options } = loader as webpack.RuleSetLoader;
					if (loaderName === '@dojo/webpack-contrib/static-build-loader') {
						if (typeof options === 'object') {
							options.features = { ...(options.features || {}), 'dojo-debug': true };
						}

						return {
							loader: loaderName,
							options
						};
					}
					return loader;
				});
			}
			return rule;
		});
	}

	if (serviceWorker) {
		const serviceWorkerOptions =
			typeof serviceWorker === 'string' ? serviceWorker : { cachePrefix: packageName, ...serviceWorker };
		config.plugins.push(new ServiceWorkerPlugin(serviceWorkerOptions));

		if (typeof serviceWorker !== 'string') {
			const entry = config.entry as any;
			entry[entryName].push('@dojo/webpack-contrib/service-worker-plugin/service-worker-entry');
		}
	}

	if (args['build-time-render']) {
		config.plugins.push(
			new BuildTimeRender({
				...args['build-time-render'],
				entries: Object.keys(config.entry!),
				basePath
			})
		);
	}

	config.output = {
		...output,
		path: outputPath
	};

	return config;
}

export default webpackConfig;
