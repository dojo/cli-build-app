import baseConfigFactory from './base.config';
import * as path from 'path';
import * as webpack from 'webpack';
const globby = require('globby');

const basePath = process.cwd();

function webpackConfig(args: any) {
	const config: webpack.Configuration = baseConfigFactory(args);
	const { output = {} } = config;
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
