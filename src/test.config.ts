import baseConfigFactory from './base.config';
import * as path from 'path';
import * as webpack from 'webpack';
import * as globby from 'globby';
import * as CleanWebpackPlugin from 'clean-webpack-plugin';
import * as ExtractTextPlugin from 'extract-text-webpack-plugin';

const basePath = process.cwd();

function webpackConfig(args: any): webpack.Configuration {
	const config = baseConfigFactory(args);
	const { plugins, output, module } = config;
	config.entry = () => {
		const unit = globby
			.sync([`${basePath}/tests/unit/**/*.ts`])
			.map((filename: string) => filename.replace(/\.ts$/, ''));

		const functional = globby
			.sync([`${basePath}/tests/functional/**/*.ts`])
			.map((filename: string) => filename.replace(/\.ts$/, ''));

		const tests: any = {};

		if (unit.length) {
			tests.unit = unit;
		}

		if (functional.length) {
			tests.functional = functional;
		}

		return tests;
	};
	const externals: any[] = (config.externals as any[]) || [];

	const instrumenterOptions = args.legacy ? {} : { esModules: true };

	config.plugins = [
		...plugins.map((plugin) => {
			if (plugin instanceof ExtractTextPlugin && (plugin as any).filename === 'main.css') {
				(plugin as any).options = { ...(plugin as any).options, disable: true };
			}
			return plugin;
		}),
		new CleanWebpackPlugin(['test'], { root: output.path, verbose: false })
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
	config.output = {
		...output,
		path: path.join(output.path, 'test')
	};
	return config;
}

export default webpackConfig;
