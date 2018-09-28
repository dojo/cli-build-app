import baseConfigFactory, { libraryName } from './base.config';
import { WebpackConfiguration } from './interfaces';
import * as ExtractTextPlugin from 'extract-text-webpack-plugin';

const WrapperPlugin = require('wrapper-webpack-plugin');

function webpackConfig(args: any): WebpackConfiguration {
	const config = baseConfigFactory(args);
	const { plugins, module } = config;
	const externals: any[] = (config.externals as any[]) || [];

	const instrumenterOptions = args.legacy ? {} : { esModules: true };

	config.plugins = [
		...plugins.map((plugin) => {
			if (plugin instanceof ExtractTextPlugin && (plugin as any).filename === 'main.css') {
				(plugin as any).options = { ...(plugin as any).options, disable: true };
			}
			return plugin;
		}),
		new WrapperPlugin({
			test: /(all.*(\.js$))/,
			footer: `typeof define === 'function' && define.amd && define(['${libraryName}'], function() {});`
		})
	];

	module.rules = module.rules.map((rule) => {
		if (Array.isArray(rule.use)) {
			rule.use = rule.use.map((loader) => {
				if (typeof loader === 'string') {
					return loader;
				}
				if (loader.loader === 'umd-compat-loader') {
					return {
						loader: loader.loader,
						options: {}
					};
				}
				return loader;
			});
		}
		return rule;
	});
	module.rules.push({
		test: /src[\\\/].*\.ts(x)?$/,
		use: {
			loader: 'istanbul-instrumenter-loader',
			options: instrumenterOptions
		},
		enforce: 'post'
	});

	externals.push(/^intern/);
	config.externals = externals;
	config.devtool = 'inline-source-map';
	return config;
}

export default webpackConfig;
