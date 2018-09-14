import baseTestConfigFactory from './base.test.config';
import * as path from 'path';
import { WebpackConfiguration } from './interfaces';
import * as globby from 'globby';
import * as CleanWebpackPlugin from 'clean-webpack-plugin';

const basePath = process.cwd();

function webpackConfig(args: any): WebpackConfiguration {
	const config = baseTestConfigFactory(args);
	const { output, plugins } = config;
	config.entry = () => {
		const functional = globby
			.sync([`${basePath}/tests/functional/**/*.ts`])
			.map((filename: string) => filename.replace(/\.ts$/, ''));

		const tests: any = {};

		if (functional.length) {
			tests.functional = functional;
		}

		return tests;
	};
	config.plugins = [
		...plugins,
		new CleanWebpackPlugin(['functional'], { root: path.join(output.path, 'test'), verbose: false })
	];
	config.output = {
		...output,
		path: path.join(output.path, 'test', 'functional')
	};
	return config;
}

export default webpackConfig;
