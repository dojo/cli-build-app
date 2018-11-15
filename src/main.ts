import { Command, EjectOutput, Helper, OptionsHelper } from '@dojo/cli/interfaces';
import * as express from 'express';
import * as logUpdate from 'log-update';
import * as ora from 'ora';
import * as path from 'path';
import * as url from 'url';
import * as webpack from 'webpack';
import chalk from 'chalk';
import * as fs from 'fs';
import * as https from 'https';
import * as proxy from 'http-proxy-middleware';
import * as history from 'connect-history-api-fallback';

const pkgDir = require('pkg-dir');
const expressStaticGzip = require('express-static-gzip');
import devConfigFactory from './dev.config';
import unitConfigFactory from './unit.config';
import functionalConfigFactory from './functional.config';
import distConfigFactory from './dist.config';
import logger from './logger';
import { moveBuildOptions } from './util/eject';

const fixMultipleWatchTrigger = require('webpack-mild-compile');
const hotMiddleware = require('webpack-hot-middleware');
const webpackMiddleware = require('webpack-dev-middleware');

const testModes = ['test', 'unit', 'functional'];

function createCompiler(config: webpack.Configuration) {
	const compiler = webpack(config);
	fixMultipleWatchTrigger(compiler);
	return compiler;
}

function createWatchCompiler(config: webpack.Configuration) {
	const compiler = createCompiler(config);
	const spinner = ora('building').start();
	compiler.hooks.invalid.tap('@dojo/cli-build-app', () => {
		logUpdate('');
		spinner.start();
	});
	compiler.hooks.done.tap('@dojo/cli-build-app', () => {
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
				const hasErrors = logger(stats.toJson({ warningsFilter }), config, runningMessage);
				if (hasErrors) {
					reject({});
					return;
				}
			}
			if (args.mode === 'test') {
				console.warn(
					'Using `--mode=test` is deprecated and has only built the unit test bundle. This mode will be removed in the next major release, please use `unit` or `functional` explicitly instead.'
				);
			}
			resolve(args.serve);
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
				logger(stats.toJson({ warningsFilter }), config, runningMessage);
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
	Object.keys(entry).forEach((name) => {
		entry[name].unshift(`webpack-hot-middleware/client?timeout=${timeout}&reload=true`);
		entry[name].unshift('eventsource-polyfill');
	});

	const watchOptions = config.watchOptions as webpack.Compiler.WatchOptions;
	const compiler = createWatchCompiler(config);

	compiler.hooks.done.tap('@dojo/cli-build-app', (stats) => {
		logger(stats.toJson({ warningsFilter }), config, `Listening on port ${args.port}...`);
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
	let isHttps = false;

	const app = express();

	app.use(
		history({
			rewrites: [
				{
					from: /^.*\.(?!html).*$/,
					to: (context: any) => {
						const { host, referer } = context.request.headers;
						const { url: originalUrl } = context.request;
						if (!referer || referer.endsWith(host + originalUrl)) {
							return originalUrl;
						}
						const parsedUrl = url.parse(referer);
						const pathnames = parsedUrl && parsedUrl.pathname ? parsedUrl.pathname.split('/') : [];
						const urlRewrite = pathnames.reduce((rewrite, segment) => {
							if (!segment) {
								return rewrite;
							}
							return rewrite.replace(`/${segment}`, '');
						}, context.parsedUrl.pathname);
						return urlRewrite;
					}
				}
			]
		})
	);

	if (args.watch !== 'memory') {
		const outputDir = (config.output && config.output.path) || process.cwd();
		if (args.mode === 'dist' && Array.isArray(args.compression)) {
			const useBrotli = args.compression.includes('brotli');
			app.use(
				expressStaticGzip(outputDir, {
					enableBrotli: useBrotli,
					orderPreference: useBrotli ? ['br'] : undefined
				})
			);
		} else {
			app.use(express.static(outputDir));
		}
	}

	if (args.proxy) {
		Object.keys(args.proxy).forEach((context) => {
			const options = args.proxy[context];

			if (typeof options === 'string') {
				app.use(proxy(context, { target: options }));
			} else {
				app.use(proxy(context, options));
			}
		});
	}

	const defaultKey = path.resolve('.cert', 'server.key');
	const defaultCrt = path.resolve('.cert', 'server.crt');

	if (fs.existsSync(defaultKey) && fs.existsSync(defaultCrt)) {
		isHttps = true;
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
				if (isHttps) {
					https
						.createServer(
							{
								key: fs.readFileSync(defaultKey),
								cert: fs.readFileSync(defaultCrt)
							},
							app
						)
						.listen(args.port, (error: Error) => {
							if (error) {
								reject(error);
							} else {
								resolve();
							}
						});
				} else {
					app.listen(args.port, (error: Error) => {
						if (error) {
							reject(error);
						} else {
							resolve();
						}
					});
				}
			});
		});
}

function warningsFilter(warning: string) {
	return warning.includes('[mini-css-extract-plugin]\nConflicting order between');
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
			choices: ['dist', 'dev', 'test', 'unit', 'functional']
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

		options('single-bundle', {
			describe: 'Limits the built output to single bundle',
			default: false,
			type: 'boolean'
		});

		options('legacy', {
			describe: 'build app with legacy browser support',
			alias: 'l',
			default: false,
			type: 'boolean'
		});

		options('feature', {
			describe: 'List of features to include',
			alias: 'f',
			array: true,
			coerce: (args: string[]) => {
				return args.reduce(
					(newArgs, arg) => {
						const parts = arg.split('=');
						if (parts.length === 1) {
							newArgs[arg] = true;
						} else if (parts.length === 2) {
							newArgs[parts[0]] = parts[1];
						}
						return newArgs;
					},
					{} as any
				);
			}
		});
	},
	run(helper: Helper, args: any) {
		console.log = () => {};
		let config: webpack.Configuration;
		let { feature, ...remainingArgs } = args;
		remainingArgs = { ...remainingArgs, features: { ...remainingArgs.features, ...feature } };
		if (args.mode === 'dev') {
			config = devConfigFactory(remainingArgs);
		} else if (args.mode === 'unit' || args.mode === 'test') {
			config = unitConfigFactory(remainingArgs);
		} else if (args.mode === 'functional') {
			config = functionalConfigFactory(remainingArgs);
		} else {
			config = distConfigFactory(remainingArgs);
		}

		if (args.serve) {
			if (testModes.indexOf(args.mode) !== -1) {
				return Promise.reject(new Error(`Cannot use \`--serve\` with \`--mode=${args.mode}\``));
			}
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
					'./base.test.config.js',
					'./dev.config.js',
					'./dist.config.js',
					'./ejected.config.js',
					'./unit.config.js',
					'./functional.config.js'
				]
			},
			hints: [
				`to build run ${chalk.underline(
					'./node_modules/.bin/webpack --config ./config/build-app/ejected.config.js --env.mode={dev|dist|unit|functional}'
				)}`
			],
			npm: {
				devDependencies: { ...buildNpmDependencies() }
			}
		};
	}
};
export default command;
