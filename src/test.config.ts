import baseConfigFactory from './base.config';
import * as path from 'path';
import * as webpack from 'webpack';
import * as globby from 'globby';
import * as CleanWebpackPlugin from 'clean-webpack-plugin';

const basePath = process.cwd();

function webpackConfig(args: any) {
	const config: webpack.Configuration = baseConfigFactory(args);
	const { plugins = [], output = {}, module } = config as any;
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

	config.plugins = [...plugins, new CleanWebpackPlugin([path.join(output.path!, 'test')], { allowExternal: true })];

	module.rules = module.rules.map((rule: any) => {
		if (Array.isArray(rule.use)) {
			rule.use = rule.use.map((loader: any) => {
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

	externals.push(/^intern/);
	config.externals = externals;
	config.devtool = 'inline-source-map';
	config.output = {
		...output,
		path: path.join(output.path!, 'test')
	};
	return config;
}

export default webpackConfig;
