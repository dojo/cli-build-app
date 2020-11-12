import * as webpack from 'webpack';
import baseConfigFactory, { libraryName, removeEmpty } from './base.config';
import ExternalLoaderPlugin from '@dojo/webpack-contrib/external-loader-plugin/ExternalLoaderPlugin';

const WrapperPlugin = require('wrapper-webpack-plugin');

function webpackConfig(args: any): webpack.Configuration {
	const config = baseConfigFactory(args);
	const { plugins, module } = config;
	const externals: any[] = (config.externals as any[]) || [];

	const instrumenterOptions = args.legacy ? {} : { esModules: true };

	config.plugins = removeEmpty([
		...plugins!,
		args.externals &&
			args.externals.dependencies &&
			new ExternalLoaderPlugin({
				dependencies: args.externals.dependencies,
				hash: true,
				outputPath: args.externals.outputPath
			}),
		new WrapperPlugin({
			test: /(all.*(\.js$))/,
			footer: `typeof define === 'function' && define.amd && define(['${libraryName}'], function() {});`
		})
	]);

	if (module) {
		module.rules = (module.rules || []).map((rule: webpack.RuleSetRule) => {
			if (Array.isArray(rule.use)) {
				rule.use = rule.use.map((loader: any) => {
					if (typeof loader === 'string') {
						return loader;
					}
					const { loader: loaderName } = loader;
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
			exclude: /\.spec\.ts(x)?$/,
			enforce: 'post'
		});
	}

	externals.push(/^intern/);
	config.externals = externals;
	config.devtool = 'inline-source-map';
	return config;
}

export default webpackConfig;
