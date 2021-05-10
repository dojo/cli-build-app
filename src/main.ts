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
import * as expressCompression from 'compression';
import * as proxy from 'http-proxy-middleware';
import * as history from 'connect-history-api-fallback';
import OnDemandBtr from '@dojo/webpack-contrib/build-time-render/BuildTimeRenderMiddleware';
import {
	read as readCache,
	write as writeCache,
	remove as removeFromCache
} from '@dojo/webpack-contrib/build-time-render/cache';
import { formatDistance } from 'date-fns';
const columns = require('cli-columns');

const pkgDir = require('pkg-dir');
const expressStaticGzip = require('express-static-gzip');
import devConfigFactory from './dev.config';
import unitConfigFactory from './unit.config';
import functionalConfigFactory from './functional.config';
import distConfigFactory from './dist.config';
import electronConfigFactory from './electron.config';
import logger from './logger';
import { moveBuildOptions } from './util/eject';
import { readFileSync } from 'fs';

const packageJsonPath = path.join(process.cwd(), 'package.json');
const packageJson = fs.existsSync(packageJsonPath) ? require(packageJsonPath) : {};
export const packageName = packageJson.name || '';

function getLibraryName(name: string) {
	return name
		.replace(/[^a-z0-9_]/g, ' ')
		.trim()
		.replace(/\s+/g, '_');
}

const libraryName = packageName ? getLibraryName(packageName) : 'main';

const hotMiddleware = require('webpack-hot-middleware');
const connectInject = require('connect-inject');

const testModes = ['test', 'unit', 'functional'];

// for some reason the MultiCompiler type doesn't include hooks, even though they are clearly defined on the
// object coming back.
interface MultiCompilerWithHooks extends webpack.MultiCompiler {
	hooks: webpack.compilation.CompilerHooks;
}

function createWatchCompiler(configs: webpack.Configuration[]) {
	const compiler = webpack(configs) as MultiCompilerWithHooks;
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

function serveStatic(
	app: express.Application,
	outputDir: string,
	mode: string,
	compression?: string[],
	base: string = '/'
) {
	if (mode === 'dist' && Array.isArray(compression)) {
		const useBrotli = compression.indexOf('brotli') > -1;
		app.use(
			base,
			expressStaticGzip(outputDir, {
				enableBrotli: useBrotli,
				orderPreference: useBrotli ? ['br'] : undefined
			})
		);
	} else {
		app.use(base, express.static(outputDir));
	}
}

function build(configs: webpack.Configuration[], args: any) {
	const compiler = webpack(configs);
	const spinner = ora('building').start();
	return new Promise<webpack.MultiCompiler>((resolve, reject) => {
		compiler.run((err, stats) => {
			spinner.stop();
			if (err) {
				reject(err);
			}
			if (stats) {
				const runningMessage = args.serve ? `Listening on port ${args.port}...` : '';
				const hasErrors = logger(stats.toJson({ warningsFilter }), configs, runningMessage, args);
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
			resolve(compiler);
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

function fileWatch(configs: webpack.Configuration[], args: any, shouldResolve = false): Promise<webpack.MultiCompiler> {
	const [mainConfig] = configs;
	let compiler: webpack.MultiCompiler;

	return new Promise<webpack.MultiCompiler>((resolve, reject) => {
		const watchOptions = mainConfig.watchOptions as webpack.Compiler.WatchOptions;

		compiler = createWatchCompiler(configs);

		compiler.watch(watchOptions, (err, stats) => {
			if (err) {
				reject(err);
			}
			if (stats) {
				const runningMessage = args.serve
					? `Listening on port ${
							args.port
					  }\nPlease note the serve option is not intended to be used to serve applications in production.`
					: 'watching...';
				logger(stats.toJson({ warningsFilter }), configs, runningMessage, args);
			}
			if (shouldResolve) {
				resolve(compiler);
			}
		});
	});
}

async function serve(configs: webpack.Configuration[], args: any, esbuild = false) {
	const [mainConfig] = configs;

	let isHttps = false;
	const base = args.base || '/';

	const app = express();
	app.use(base, function(req, _, next) {
		const { pathname } = url.parse(req.url);
		if (req.accepts('html') && pathname && !pathname.match(/\..*$/)) {
			req.url = `${req.url}/`;
		}
		next();
	});

	let compiler;
	if (esbuild) {
		const { compiler: escompiler } = require('./esbuild');
		compiler = escompiler({ features: args.features });
	} else {
		compiler = args.watch ? await fileWatch(configs, args, true) : await build(configs, args);
	}

	const outputDir = (mainConfig.output && mainConfig.output.path) || process.cwd();
	let btrOptions = args['build-time-render'];
	if (btrOptions) {
		if (args.singleBundle || (args.experimental && !!args.experimental.speed)) {
			btrOptions = { ...btrOptions, sync: true };
		}
		const jsonpName = (mainConfig.output && mainConfig.output.jsonpFunction) || 'unknown';
		const onDemandBtr = new OnDemandBtr({
			buildTimeRenderOptions: btrOptions,
			scope: libraryName,
			base,
			compiler: (compiler as any).compilers ? (compiler as any).compilers[0] : compiler,
			entries: mainConfig.entry ? Object.keys(mainConfig.entry) : [],
			outputPath: outputDir,
			jsonpName
		});
		app.use(base, (req, res, next) => onDemandBtr.middleware(req, res, next));
	}

	if (args.mode !== 'dist' || !Array.isArray(args.compression)) {
		app.use(base, expressCompression());
	}
	app.use(
		base,
		connectInject({
			rules: [
				{
					match: /<body>/,
					snippet:
						"<script>window.DojoHasEnvironment = { staticFeatures: { 'build-serve': true } };</script>",
					fn: (match: string, snippet: string) => {
						return match + snippet;
					}
				}
			]
		})
	);

	if (args.proxy) {
		Object.keys(args.proxy).forEach((context) => {
			const options =
				typeof args.proxy[context] === 'string' ? { target: args.proxy[context] } : args.proxy[context];

			const parsedTarget = url.parse(options.target);
			if (parsedTarget.protocol === 'https:') {
				options.agent = https.globalAgent;
				options.headers = {
					host: parsedTarget.host
				};
			}
			app.use(base, proxy(context, options));
		});
	}

	serveStatic(app, outputDir, args.mode, args.compression, base);

	app.use(
		base,
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

	app.use(
		base,
		history({
			disableDotRule: true
		})
	);

	serveStatic(app, outputDir, args.mode, args.compression, base);

	const defaultKey = path.resolve('.cert', 'server.key');
	const defaultCrt = path.resolve('.cert', 'server.crt');

	if (fs.existsSync(defaultKey) && fs.existsSync(defaultCrt)) {
		isHttps = true;
	}

	if (args.watch) {
		const timeout = 20 * 1000;
		app.use(base, hotMiddleware(compiler, { heartbeat: timeout / 2 }));
	}

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
					}
				});
		} else {
			app.listen(args.port, (error: Error) => {
				if (error) {
					reject(error);
				}
			});
		}
	});
}

function warningsFilter(warning: string) {
	return warning.includes('[mini-css-extract-plugin]\nConflicting order between');
}

function isEsBuild() {
	return process.argv.indexOf('--fast') !== -1;
}

const command: Command = {
	group: 'build',
	name: 'app',
	description: 'create a build of your application',
	register(options: OptionsHelper) {
		const esBuild = isEsBuild();

		options('fast', {
			describe: 'enable fast mode for dev',
			type: 'boolean',
			default: false
		});

		!esBuild &&
			options('mode', {
				describe: 'the output mode',
				alias: 'm',
				default: 'dist',
				choices: ['dist', 'dev', 'test', 'unit', 'functional']
			});

		!esBuild &&
			options('target', {
				describe: 'the target',
				alias: 't',
				default: 'web',
				choices: ['web', 'electron']
			});

		options('watch', {
			describe: 'watch for file changes',
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

		!esBuild &&
			options('single-bundle', {
				describe: 'limits the built output to a single bundle',
				default: false,
				type: 'boolean'
			});

		!esBuild &&
			options('omit-hash', {
				describe: 'omits hashes from output file names in dist mode',
				defaultDescription: '(always false for dev builds)',
				default: false,
				type: 'boolean'
			});

		!esBuild &&
			options('legacy', {
				describe: 'build app with legacy browser support',
				alias: 'l',
				default: false,
				type: 'boolean'
			});

		!esBuild &&
			options('features', {
				describe: 'list of has() features to include',
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

		!esBuild &&
			options('evict-cache-paths', {
				describe: 'evict paths from the Build Time Render cache',
				array: true
			});

		!esBuild &&
			options('list-cache-paths', {
				describe: 'list paths in the Build Time Render cache',
				type: 'boolean'
			});
	},
	run(helper: Helper, args: any) {
		console.log = () => {};
		let configs: webpack.Configuration[] = [];
		args.experimental = args.experimental || {};
		args.base = url.resolve('/', args.base || '');
		if (!args.base.endsWith('/')) {
			args.base = `${args.base}/`;
		}

		if (args['list-cache-paths']) {
			return readCache().then(({ pages }) => {
				const column = Object.keys(pages).map((page) => {
					const result = formatDistance(new Date(pages[page].time!), new Date(Date.now()), {
						addSuffix: true
					});
					return `${page} ${chalk.blue('(' + result + ')')}`;
				});
				logUpdate(columns(column));
			});
		}

		if (args['evict-cache-paths']) {
			return readCache().then((cache) => {
				const before = Object.keys(cache.pages).length;
				cache = removeFromCache(cache, args['evict-cache-paths']);
				const after = Object.keys(cache.pages).length;
				logUpdate(`${before - after} entries removed from cache`);
				return writeCache(cache);
			});
		}

		if (args.fast) {
			const { build: esbuild, compiler: escompiler } = require('./esbuild');
			if (args.serve) {
				return serve([{ output: { path: 'output/dev' } }], args, true);
			}
			if (args.watch) {
				return new Promise(() => escompiler({ features: args.features }));
			} else {
				return esbuild({ features: args.features });
			}
		} else {
			if (args.mode === 'dev') {
				configs.push(devConfigFactory(args));
			} else if (args.mode === 'unit' || args.mode === 'test') {
				configs.push(unitConfigFactory(args));
			} else if (args.mode === 'functional') {
				configs.push(functionalConfigFactory(args));
			} else {
				configs.push(distConfigFactory(args));
			}

			if (args.target === 'electron') {
				configs.push(electronConfigFactory(args));
			}

			if (args.serve) {
				if (testModes.indexOf(args.mode) !== -1) {
					return Promise.reject(new Error(`Cannot use \`--serve\` with \`--mode=${args.mode}\``));
				}
				return serve(configs, args);
			}

			if (args.watch) {
				return fileWatch(configs, args);
			}

			return build(configs, args);
		}
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
	},
	validate(helper: Helper) {
		const esBuild = isEsBuild();
		let schema;
		try {
			if (esBuild) {
				schema = JSON.parse(readFileSync(path.join(__dirname, 'schema-esbuild.json')).toString());
			} else {
				schema = JSON.parse(readFileSync(path.join(__dirname, 'schema.json')).toString());
			}
		} catch (error) {
			return Promise.reject(Error('The dojorc schema for cli-build-app could not be read: ' + error));
		}
		return helper.validation.validate({
			commandGroup: command.group as string,
			commandName: command.name,
			commandSchema: schema,
			commandConfig: helper.configuration.get(),
			silentSuccess: true
		});
	}
};
export default command;
