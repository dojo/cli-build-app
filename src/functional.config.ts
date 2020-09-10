import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import * as globby from 'globby';
import * as path from 'path';
import * as webpack from 'webpack';
import baseTestConfigFactory from './base.test.config';

const basePath = process.cwd();

function webpackConfig(args: any): webpack.Configuration {
	const config = baseTestConfigFactory(args);
	const { output, plugins } = config;
	const outputPath = output!.path as string;
	config.target = 'node';
	config.entry = () => {
		const functional = globby
			.sync([`${basePath}/tests/functional/**/*.ts`])
			.map((filename: string) => filename.replace(/\.ts$/, ''));

		const tests: any = {};

		if (functional.length) {
			tests.all = functional;
		}

		return tests;
	};
	config.plugins = [
		...plugins!,
		new CleanWebpackPlugin({ cleanAfterEveryBuildPatterns: ['test/functional'], verbose: false })
	];
	config.output = {
		...output,
		path: path.join(outputPath, 'test', 'functional')
	};
	return config;
}

export default webpackConfig;
