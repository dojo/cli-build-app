import * as CleanWebpackPlugin from 'clean-webpack-plugin';
import * as globby from 'globby';
import * as path from 'path';
import * as webpack from 'webpack';
import baseTestConfigFactory from './base.test.config';

const basePath = process.cwd();

function webpackConfig(args: any): webpack.Configuration {
	const config = baseTestConfigFactory(args);
	const { output, plugins } = config;
	const outputPath = output!.path as string;
	config.entry = () => {
		const unit = globby
			.sync([`${basePath}/tests/unit/**/*.{ts,tsx}`, `${basePath}/src/**/*.spec.{ts,tsx}`])
			.map((filename: string) => filename.replace(/\.ts$/, ''));

		const tests: any = {};

		if (unit.length) {
			tests.all = unit;
		}

		return tests;
	};
	config.plugins = [
		...plugins!,
		new CleanWebpackPlugin(['unit'], { root: path.join(outputPath, 'test'), verbose: false })
	];
	config.output = {
		...output,
		path: path.join(outputPath, 'test', 'unit')
	};
	return config;
}

export default webpackConfig;
