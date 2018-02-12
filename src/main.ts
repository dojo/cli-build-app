import { Command, EjectOutput, Helper, OptionsHelper } from '@dojo/cli/interfaces';
import * as express from 'express';
import * as logUpdate from 'log-update';
import * as ora from 'ora';
import * as path from 'path';
import * as webpack from 'webpack';
import chalk from 'chalk';

const pkgDir = require('pkg-dir');
import devConfigFactory from './dev.config';
import testConfigFactory from './test.config';
import distConfigFactory from './dist.config';
import logger from './logger';
import { moveBuildOptions } from './util';

const fixMultipleWatchTrigger = require('webpack-mild-compile');
const hotMiddleware = require('webpack-hot-middleware');
const webpackMiddleware = require('webpack-dev-middleware');

function createCompiler(config: webpack.Configuration) {
	const compiler = webpack(config);
	fixMultipleWatchTrigger(compiler);
	return compiler;
}

function createWatchCompiler(config: webpack.Configuration) {
	const compiler = createCompiler(config);
	const spinner = ora('building').start();
	compiler.plugin('invalid', () => {
		logUpdate('');
		spinner.start();
	});
	compiler.plugin('done', () => {
		spinner.stop();
	});
	return compiler;
}

function build(config: webpack.Configuration, args: any) {
	const compiler = createCompiler(config);
	const spinner = ora('building').start();
	return new Promise<void>((resolve, reject) => {
		compiler.run((err, stats) => {
			spinner.stop();
			if (err) {
				reject(err);
			}
			if (stats) {
				const runningMessage = args.serve ? `Listening on port ${args.port}...` : '';
				logger(stats.toJson(), config, runningMessage);
			}
			resolve();
		});
	});
}

function buildNpmDependencies(): any {
	try {
		const packagePath = pkgDir.sync(__dirname);
		const packageJsonFilePath = path.join(packagePath, 'package.json');
		const packageJson = require(packageJsonFilePath);

		return {
			[packageJson.name]: packageJson.version,
			...packageJson.dependencies
		};
	} catch (e) {
		throw new Error(`Failed reading dependencies from package.json - ${e.message}`);
	}
}

function fileWatch(config: webpack.Configuration, args: any): Promise<void> {
	const compiler = createWatchCompiler(config);

	return new Promise<void>((resolve, reject) => {
		const watchOptions = config.watchOptions as webpack.Compiler.WatchOptions;
		compiler.watch(watchOptions, (err, stats) => {
			if (err) {
				reject(err);
			}
			if (stats) {
				const runningMessage = args.serve ? `Listening on port ${args.port}` : 'watching...';
				logger(stats.toJson(), config, runningMessage);
			}
			resolve();
		});
	});
}

function memoryWatch(config: webpack.Configuration, args: any, app: express.Application): Promise<void> {
	const entry = config.entry as any;
	const plugins = config.plugins as webpack.Plugin[];
	const timeout = 20 * 1000;

	plugins.push(new webpack.HotModuleReplacementPlugin(), new webpack.NoEmitOnErrorsPlugin());
	Object.keys(entry).forEach(name => {
		entry[name].unshift(`webpack-hot-middleware/client?timeout=${timeout}&reload=true`);
	});

	const watchOptions = config.watchOptions as webpack.Compiler.WatchOptions;
	const compiler = createWatchCompiler(config);

	compiler.plugin('done', stats => {
		logger(stats.toJson(), config, `Listening on port ${args.port}...`);
	});

	app.use(
		webpackMiddleware(compiler, {
			logLevel: 'silent',
			noInfo: true,
			publicPath: '/',
			watchOptions
		}),
		hotMiddleware(compiler, {
			heartbeat: timeout / 2
		})
	);

	return Promise.resolve();
}

function serve(config: webpack.Configuration, args: any): Promise<void> {
	const app = express();

	if (args.watch !== 'memory') {
		const outputDir = (config.output && config.output.path) || process.cwd();
		app.use(express.static(outputDir));
	}

	return Promise.resolve()
		.then(() => {
			if (args.watch === 'memory' && args.mode === 'dev') {
				return memoryWatch(config, args, app);
			}

			if (args.watch) {
				if (args.watch === 'memory') {
					console.warn('Memory watch requires `--mode=dev`. Using file watch instead...');
				}
				return fileWatch(config, args);
			}

			return build(config, args);
		})
		.then(() => {
			return new Promise<void>((resolve, reject) => {
				app.listen(args.port, (error: Error) => {
					if (error) {
						reject(error);
					} else {
						resolve();
					}
				});
			});
		});
}

const command: Command = {
	group: 'build',
	name: 'app',
	description: 'create a build of your application',
	register(options: OptionsHelper) {
		options('mode', {
			describe: 'the output mode',
			alias: 'm',
			default: 'dist',
			choices: ['dist', 'dev', 'test']
		});

		options('watch', {
			describe: 'watch for file changes: "memory" (dev mode only) or "file" (all modes; default)',
			alias: 'w'
		});

		options('serve', {
			describe: 'start a webserver',
			alias: 's',
			type: 'boolean'
		});

		options('port', {
			describe: 'used in conjunction with the serve option to specify the webserver port',
			alias: 'p',
			default: 9999,
			type: 'number'
		});
	},
	run(helper: Helper, args: any) {
		console.log = () => {};
		const rc = helper.configuration.get() || {};
		let config: webpack.Configuration;
		if (args.mode === 'dev') {
			config = devConfigFactory(rc);
		} else if (args.mode === 'test') {
			config = testConfigFactory(rc);
		} else {
			config = distConfigFactory(rc);
		}

		if (args.serve) {
			return serve(config, args);
		}

		if (args.watch) {
			if (args.watch === 'memory') {
				console.warn('Memory watch requires the dev server. Using file watch instead...');
			}
			return fileWatch(config, args);
		}

		return build(config, args);
	},
	eject(helper: Helper): EjectOutput {
		return {
			copy: {
				path: __dirname,
				files: [
					moveBuildOptions(`${this.group}-${this.name}`),
					'./base.config.js',
					'./dev.config.js',
					'./dist.config.js',
					'./ejected.config.js',
					'./test.config.js'
				]
			},
			hints: [
				`to build run ${chalk.underline(
					'./node_modules/.bin/webpack --config ./config/build-app/ejected.config.js --env.mode={dev|dist|test}'
				)}`
			],
			npm: {
				devDependencies: { ...buildNpmDependencies() }
			}
		};
	}
};
export default command;
