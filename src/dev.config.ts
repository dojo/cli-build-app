import baseConfigFactory, {
	bootstrapEntry,
	mainEntry,
	packageName,
	InsertScriptPlugin,
	libraryName
} from './base.config';
import { WebAppManifest } from './interfaces';
import * as HtmlWebpackPlugin from 'html-webpack-plugin';
import ServiceWorkerPlugin, {
	ServiceWorkerOptions
} from '@dojo/webpack-contrib/service-worker-plugin/ServiceWorkerPlugin';
import * as fs from 'fs';
import * as path from 'path';
import webpack = require('webpack');
import BuildTimeRender from '@dojo/webpack-contrib/build-time-render/BuildTimeRender';
import ExternalLoaderPlugin from '@dojo/webpack-contrib/external-loader-plugin/ExternalLoaderPlugin';
import * as CleanWebpackPlugin from 'clean-webpack-plugin';
import * as CopyWebpackPlugin from 'copy-webpack-plugin';

const WebpackPwaManifest = require('webpack-pwa-manifest');

function webpackConfig(args: any): webpack.Configuration {
	const experimental = args.experimental || {};
	const isExperimentalSpeed = !!experimental.speed;
	const singleBundle = args.singleBundle || isExperimentalSpeed;
	const base = args.target === 'electron' ? './' : args.base || '/';

	const basePath = process.cwd();
	const config = baseConfigFactory(args);
	const manifest: WebAppManifest = args.pwa && args.pwa.manifest;
	const { plugins, output, module } = config;
	const outputPath = path.join(output!.path!, 'dev');
	const assetsDir = path.join(process.cwd(), 'assets');
	const assetsDirExists = fs.existsSync(assetsDir);
	const entryName = singleBundle ? mainEntry : bootstrapEntry;
	let serviceWorkerOptions: ServiceWorkerOptions | undefined;
	if (args.pwa && args.pwa.serviceWorker) {
		serviceWorkerOptions =
			typeof args.pwa.serviceWorker === 'string'
				? args.pwa.serviceWorker
				: { cachePrefix: packageName, ...args.pwa.serviceWorker };
	}

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

	const btr = args['build-time-render'];
	if (btr) {
		const cacheOptions = btr.cache || { enabled: false, excludes: [] };
		config.plugins.push(
			new BuildTimeRender({
				...btr,
				sync: singleBundle,
				entries: Object.keys(config.entry!),
				basePath,
				baseUrl: base,
				scope: libraryName,
				onDemand: Boolean(args.serve && args.watch),
				cacheOptions: { ...cacheOptions, invalidates: args['invalidate-btr-cache-paths'] || [] }
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
