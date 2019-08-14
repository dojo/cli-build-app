import baseConfigFactory, { bootstrapEntry, mainEntry } from './base.config';
import { WebAppManifest } from './interfaces';
import * as HtmlWebpackPlugin from 'html-webpack-plugin';
import * as fs from 'fs';
import * as path from 'path';
import webpack = require('webpack');
import BuildTimeRender from '@dojo/webpack-contrib/build-time-render/BuildTimeRender';
import ExternalLoaderPlugin from '@dojo/webpack-contrib/external-loader-plugin/ExternalLoaderPlugin';
import * as CleanWebpackPlugin from 'clean-webpack-plugin';
import * as CopyWebpackPlugin from 'copy-webpack-plugin';

const WebpackPwaManifest = require('webpack-pwa-manifest');

function webpackConfig(args: any): webpack.Configuration {
	const isExperimentalSpeed = !!args.experimental.speed;
	const singleBundle = args.singleBundle || isExperimentalSpeed;
	const base = args.base || '/';

	const basePath = process.cwd();
	const config = baseConfigFactory(args);
	const manifest: WebAppManifest = args.pwa && args.pwa.manifest;
	const { plugins, output, module } = config;
	const outputPath = path.join(output!.path!, 'dev');
	const assetsDir = path.join(process.cwd(), 'assets');
	const assetsDirExists = fs.existsSync(assetsDir);
	const entryName = singleBundle ? mainEntry : bootstrapEntry;

	config.plugins = [
		...plugins!,
		assetsDirExists && new CopyWebpackPlugin([{ from: assetsDir, to: path.join(outputPath, 'assets') }]),
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
		new CleanWebpackPlugin(['dev', 'info'], { root: output!.path, verbose: false })
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

	if (args['build-time-render']) {
		config.plugins.push(
			new BuildTimeRender({
				...args['build-time-render'],
				entries: Object.keys(config.entry!),
				basePath,
				baseUrl: base
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
