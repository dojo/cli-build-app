import * as webpack from 'webpack';
import baseConfigFactory, { libraryName } from './base.config';

const WrapperPlugin = require('wrapper-webpack-plugin');

function webpackConfig(args: any): webpack.Configuration {
	const config = baseConfigFactory(args);
	const { plugins, module } = config;
	const externals: any[] = (config.externals as any[]) || [];

	const instrumenterOptions = args.legacy ? {} : { esModules: true };

	config.plugins = [
		...plugins!,
		new WrapperPlugin({
			test: /(all.*(\.js$))/,
			footer: `typeof define === 'function' && define.amd && define(['${libraryName}'], function() {});`
		})
	];

	if (module) {
		module.rules = module.rules.map((rule) => {
			if (Array.isArray(rule.use)) {
				rule.use = rule.use.map((loader) => {
					if (typeof loader === 'string') {
						return loader;
					}
					const { loader: loaderName } = loader as webpack.RuleSetLoader;
					if (loaderName === 'umd-compat-loader') {
						return {
							loader: loaderName,
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
	}

	externals.push(/^intern/);
	config.externals = externals;
	config.devtool = 'inline-source-map';
	return config;
}

export default webpackConfig;
