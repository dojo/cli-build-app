import ElectronPlugin from '@dojo/webpack-contrib/electron-plugin/ElectronPlugin';
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

import * as webpack from 'webpack';
import * as path from 'path';
import * as fs from 'fs';

const basePath = process.cwd();
const srcPath = path.join(basePath, 'src');
const extensions = ['.ts', '.tsx', '.mjs', '.js'];
const removeEmpty = (items: any[]) => items.filter((item) => item);
const mainPath = path.join(srcPath, 'main.electron.ts');

function webpackConfig(args: any): webpack.Configuration {
	const experimental = args.experimental || {};
	const electron = args.electron || {};
	const isExperimentalSpeed = !!experimental.speed && args.mode === 'dev';
	const baseOutputPath = path.resolve('./output');
	const outputPath = path.join(baseOutputPath, args.mode);

	return {
		name: 'electron',
		entry: {
			'main.electron': removeEmpty([
				'@dojo/webpack-contrib/electron-plugin/bootstrap',
				fs.existsSync(mainPath) ? mainPath : null
			])
		},
		resolveLoader: {
			modules: [path.resolve(__dirname, 'node_modules'), 'node_modules']
		},
		resolve: {
			modules: [basePath, path.join(basePath, 'node_modules')],
			extensions,
			plugins: [new TsconfigPathsPlugin({ configFile: path.join(basePath, 'tsconfig.json') })]
		},
		mode: args.mode === 'dev' ? 'development' : 'production',
		devtool: 'source-map',
		watchOptions: { ignored: /node_modules/ },
		target: 'electron-main',
		plugins: [
			new ElectronPlugin({
				electron: {
					browser: electron.browser || {},
					packaging: electron.packaging || {}
				},
				dist: args.mode === 'dist',
				watch: !!args.watch,
				serve: !!args.serve,
				port: args.port,
				basePath,
				outputPath
			})
		],
		module: {
			rules: [
				{
					test: /\.(gif|png|jpe?g|svg|eot|ttf|woff|woff2|ico)$/i,
					loader: 'file-loader?hash=sha512&digest=hex&name=[name].[hash:base64:8].[ext]'
				},
				{
					test: /@dojo(\/|\\).*\.(js|mjs)$/,
					enforce: 'pre',
					loader: 'source-map-loader-cli',
					options: { includeModulePaths: true }
				},
				{
					include: srcPath,
					test: /\.ts(x)?$/,
					use: removeEmpty([
						{
							loader: 'ts-loader',
							options: {
								onlyCompileBundledFiles: true,
								instance: 'dojo',
								transpileOnly: isExperimentalSpeed,
								compilerOptions: {
									target: 'es2017',
									module: 'esnext',
									downlevelIteration: false
								}
							}
						}
					])
				}
			]
		},
		output: {
			chunkFilename: '[name].js',
			filename: '[name].js',
			path: outputPath
		}
	};
}

export default webpackConfig;
