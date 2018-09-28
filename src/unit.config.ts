import baseTestConfigFactory from './base.test.config';
import * as path from 'path';
import * as globby from 'globby';
import * as CleanWebpackPlugin from 'clean-webpack-plugin';
import { WebpackConfiguration } from './interfaces';

const basePath = process.cwd();

function webpackConfig(args: any): WebpackConfiguration {
	const config = baseTestConfigFactory(args);
	const { output, plugins } = config;
	config.entry = () => {
		const unit = globby
			.sync([`${basePath}/tests/unit/**/*.ts`])
			.map((filename: string) => filename.replace(/\.ts$/, ''));

		const tests: any = {};

		if (unit.length) {
			tests.all = unit;
		}

		return tests;
	};
	config.plugins = [
		...plugins,
		new CleanWebpackPlugin(['unit'], { root: path.join(output.path, 'test'), verbose: false })
	];
	config.output = {
		...output,
		path: path.join(output.path, 'test', 'unit')
	};
	return config;
}

export default webpackConfig;
