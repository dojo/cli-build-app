import CssModulePlugin from '@dojo/webpack-contrib/css-module-plugin/CssModulePlugin';
import BootstrapPlugin from '@dojo/webpack-contrib/bootstrap-plugin/BootstrapPlugin';
import CldrPlugin from '@dojo/webpack-contrib/cldr/Plugin';
import registryTransformer from '@dojo/webpack-contrib/registry-transformer';
import getFeatures from '@dojo/webpack-contrib/static-build-loader/getFeatures';
import { readFileSync, existsSync } from 'fs';
import * as MiniCssExtractPlugin from 'mini-css-extract-plugin';
import * as path from 'path';
import * as tsnode from 'ts-node';
import * as ts from 'typescript';
import * as webpack from 'webpack';
import * as cssnano from 'cssnano';
import * as minimatch from 'minimatch';
import * as ManifestPlugin from 'webpack-manifest-plugin';
import * as globby from 'globby';

const CssUrlRelativePlugin = require('css-url-relative-plugin');
const postcssPresetEnv = require('postcss-preset-env');
const postcssImport = require('postcss-import');
const slash = require('slash');
const WrapperPlugin = require('wrapper-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const ExtraWatchWebpackPlugin = require('extra-watch-webpack-plugin');
const createHash = require('webpack/lib/util/createHash');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

const stylelint = require('stylelint');
const StyleLintPlugin = require('stylelint-webpack-plugin');

const basePath = process.cwd();
const srcPath = path.join(basePath, 'src');
const testPath = path.join(basePath, 'tests');
const allPaths = [srcPath, testPath];

const isTsx = existsSync(path.join(srcPath, 'main.tsx'));
const mainEntryPath = path.join(srcPath, isTsx ? 'main.tsx' : 'main.ts');
const mainCssPath = path.join(srcPath, 'main.css');
const indexHtmlPattern = /src(\/|\\)index\.html$/;

export const mainEntry = 'main';
export const bootstrapEntry = 'bootstrap';

const packageJsonPath = path.join(basePath, 'package.json');
const packageJson = existsSync(packageJsonPath) ? require(packageJsonPath) : {};
export const packageName = packageJson.name || '';

const tsLintPath = path.join(basePath, 'tslint.json');
const tsLint = existsSync(tsLintPath) ? require(tsLintPath) : false;

function getTsLintExclusions() {
	if (tsLint && tsLint.linterOptions && tsLint.linterOptions.exclude) {
		return globby.sync(tsLint.linterOptions.exclude).map((file) => path.resolve(file));
	}
	return [];
}

function getLibraryName(name: string) {
	return name
		.replace(/[^a-z0-9_]/g, ' ')
		.trim()
		.replace(/\s+/g, '_');
}

function hash(content: string): string {
	return createHash('md4')
		.update(content)
		.digest('hex')
		.substr(0, 6);
}

export const libraryName = packageName ? getLibraryName(packageName) : mainEntry;

function matchesBundle(bundles: { [key: string]: string[] }, chunkName: string, glob = false) {
	let updatedChunkName = '';
	Object.keys(bundles)
		.reverse()
		.some(function(key) {
			const bundleModules = bundles[key];
			let result = false;
			if (glob) {
				result = bundleModules.some((bundlePattern) => minimatch(chunkName, bundlePattern));
			} else {
				result = bundleModules.indexOf(chunkName) > -1;
			}

			if (result) {
				updatedChunkName = key;
				return true;
			}
			return false;
		});
	return updatedChunkName;
}

function getUMDCompatLoader(options: { bundles?: { [key: string]: string[] } }) {
	const { bundles = {} } = options;
	return {
		loader: 'umd-compat-loader',
		options: {
			imports(module: string, context: string) {
				const filePath = path.relative(basePath, path.join(context, module));
				let chunkName = slash(filePath);
				const updateChunkName = matchesBundle(bundles, chunkName) || matchesBundle(bundles, chunkName, true);
				chunkName = updateChunkName || chunkName;
				return `@dojo/webpack-contrib/promise-loader?global,${chunkName}!${module}`;
			}
		}
	};
}

export const removeEmpty = (items: any[]) => items.filter((item) => item);

function importTransformer(basePath: string, bundles: { [key: string]: string[] } = {}) {
	return function(context: any) {
		let resolvedModules: any;
		return function(file: any) {
			resolvedModules = file.resolvedModules;
			return ts.visitEachChild(file, visit, context);
		};
		function visit(node: any): any {
			if (node.kind === ts.SyntaxKind.CallExpression && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
				const moduleText = node.arguments[0].text;
				let chunkName = '[request]';
				if (moduleText) {
					const { resolvedFileName } = resolvedModules.get(moduleText);
					chunkName = slash(
						resolvedFileName
							.replace(basePath, '')
							.replace(/.ts(x)?$/, '')
							.replace(/^(\/|\\)/, '')
					);
					const updateChunkName =
						matchesBundle(bundles, chunkName) || matchesBundle(bundles, chunkName, true);
					chunkName = updateChunkName || chunkName;
				}
				node.arguments[0] = ts.addSyntheticLeadingComment(
					node.arguments[0],
					ts.SyntaxKind.MultiLineCommentTrivia,
					` webpackChunkName: "${chunkName}" `,
					false
				);
				return node;
			}
			return ts.visitEachChild(node, visit, context);
		}
	};
}

interface CssStyle {
	walkDecls(processor: (decl: { value: string }) => void): void;
}

function colorToColorMod(style: CssStyle) {
	style.walkDecls((decl) => {
		decl.value = decl.value.replace('color(', 'color-mod(');
	});
}

function loadRoutes() {
	let routes: string[] = [];
	const routesConfig = path.join(basePath, 'src', 'routes');
	try {
		if (existsSync(path.join(`${routesConfig}.ts`)) || existsSync(path.join(`${routesConfig}.tsx`))) {
			const routes: any[] = require(slash(routesConfig)).default;
			return routes.map((route) => route.id);
		}
	} catch {}
	return routes;
}

export interface InsertScriptPluginOptions {
	content: string;
	type: 'append' | 'prepend';
}

export class InsertScriptPlugin {
	private _options: InsertScriptPluginOptions[] = [];
	constructor(options: InsertScriptPluginOptions | InsertScriptPluginOptions[]) {
		options = Array.isArray(options) ? options : [options];
		this._options = options;
	}

	apply(compiler: any) {
		compiler.hooks.compilation.tap('InsertScriptPlugin', (compilation: any) => {
			compilation.hooks.htmlWebpackPluginBeforeHtmlProcessing.tapAsync(
				'InsertScriptPlugin',
				(data: any, cb: Function) => {
					this._options.forEach(({ content, type }) => {
						if (type === 'append') {
							data.html = data.html.replace('</head>', `${content}</head>`);
						} else if (type === 'prepend') {
							data.html = data.html.replace('<head>', `<head>${content}`);
						}
					});
					cb(null, data);
				}
			);
		});
	}
}

export default function webpackConfigFactory(args: any): webpack.Configuration {
	tsnode.register({ transpileOnly: true });
	const isLegacy = args.legacy;
	const experimental = args.experimental || {};
	const isExperimentalSpeed = !!experimental.speed && args.mode === 'dev';
	const isTest = args.mode === 'unit' || args.mode === 'functional' || args.mode === 'test';
	const singleBundle = args.singleBundle || isTest || isExperimentalSpeed;
	const watch = args.watch;
	const extensions = isLegacy ? ['.ts', '.tsx', '.js'] : ['.ts', '.tsx', '.mjs', '.js'];
	const compilerOptions = isLegacy ? {} : { target: 'es2017', module: 'esnext', downlevelIteration: false };
	let features = isLegacy ? args.features : { ...(args.features || {}), ...getFeatures('modern') };
	features = {
		...features,
		'dojo-debug': false,
		'cldr-elide': true,
		'build-time-rendered': !!args['build-time-render']
	};
	const staticOnly = [];
	const assetsDir = path.join(process.cwd(), 'assets');
	const assetsDirPattern = new RegExp(assetsDir);
	const lazyModules = Object.keys(args.bundles || {}).reduce(
		(lazy, key) => {
			lazy.push(...args.bundles[key]);
			return lazy;
		},
		[] as string[]
	);
	const watchExtraFiles = Array.isArray(args.watchExtraFiles) ? args.watchExtraFiles : [];
	let entry: any;
	if (!isTest) {
		features = { ...features, test: false };
	}
	if (singleBundle) {
		entry = {
			[mainEntry]: removeEmpty([
				'@dojo/framework/shim/Promise',
				'@dojo/webpack-contrib/bootstrap-plugin/sync',
				existsSync(mainCssPath) ? mainCssPath : null,
				mainEntryPath
			])
		};
	} else {
		features = { ...features, 'build-elide': true };
		staticOnly.push('build-elide');
		entry = {
			[bootstrapEntry]: removeEmpty([
				existsSync(mainCssPath) ? mainCssPath : null,
				'@dojo/framework/shim/Promise',
				'@dojo/webpack-contrib/bootstrap-plugin/async'
			])
		};
	}

	const customTransformers: any[] = [];

	const routes = loadRoutes();

	if ((lazyModules.length > 0 || routes.length > 0) && !singleBundle) {
		customTransformers.push(registryTransformer(basePath, lazyModules, false, routes));
	}

	const chunkCount = lazyModules.length + routes.length;
	let chunkPercentageThreshold = 0;
	if (chunkCount >= 10) {
		chunkPercentageThreshold = 25;
	} else if (chunkCount >= 5) {
		chunkPercentageThreshold = 30;
	} else if (chunkCount > 0) {
		chunkPercentageThreshold = 40;
	}

	if (!isLegacy && !singleBundle) {
		customTransformers.push(importTransformer(basePath, args.bundles));
	}

	const tsLoaderOptions: any = {
		onlyCompileBundledFiles: true,
		instance: 'dojo',
		transpileOnly: isExperimentalSpeed,
		compilerOptions,
		getCustomTransformers() {
			return { before: customTransformers };
		}
	};

	const postcssImportConfig = {
		filter: (path: string) => {
			return /.*variables(\.m)?\.css$/.test(path);
		},
		load: (filename: string, importOptions: any = {}) => {
			return readFileSync(filename, 'utf8').replace('color(', 'color-mod(');
		},
		resolve: (id: string, basedir: string, importOptions: any = {}) => {
			if (importOptions.filter) {
				const result = importOptions.filter(id);
				if (!result) {
					return null;
				}
			}
			if (id[0] === '~') {
				return id.substr(1);
			}
			return id;
		}
	};

	const postcssPresetConfig = {
		browsers: isLegacy ? ['last 2 versions', 'ie >= 10'] : ['last 2 versions'],
		insertBefore: {
			'color-mod-function': colorToColorMod
		},
		features: {
			'color-mod-function': true,
			'nesting-rules': true
		},
		autoprefixer: {
			grid: isLegacy
		}
	};

	const postCssModuleLoader = [
		MiniCssExtractPlugin.loader,
		'@dojo/webpack-contrib/css-module-decorator-loader',
		{
			loader: 'css-loader',
			options: {
				modules: true,
				sourceMap: true,
				importLoaders: 1,
				localIdentName: `[name]__[local]__${hash(libraryName)}[hash:base64:5]`
			}
		}
	];

	const cssLoader = [
		MiniCssExtractPlugin.loader,
		{
			loader: 'css-loader',
			options: {
				sourceMap: true,
				importLoaders: 1
			}
		}
	];

	if (!isExperimentalSpeed || isLegacy) {
		postCssModuleLoader.push({
			loader: 'postcss-loader?sourceMap',
			options: {
				ident: 'postcss',
				plugins: [postcssImport(postcssImportConfig), postcssPresetEnv(postcssPresetConfig)]
			}
		});
		cssLoader.push({
			loader: 'postcss-loader?sourceMap',
			options: {
				ident: 'postcss',
				plugins: [postcssImport(postcssImportConfig), postcssPresetEnv(postcssPresetConfig)]
			}
		});
	}

	const config: webpack.Configuration = {
		mode: 'development',
		externals: [
			function(context, request, callback) {
				const externals = (args.externals && args.externals.dependencies) || [];
				function resolveExternal(externals: (string | { name?: string; type?: string })[]): string | void {
					for (let external of externals) {
						const name = external && (typeof external === 'string' ? external : external.name);
						if (name && new RegExp(`^${name}[!(\/|\\)]?`).test(request)) {
							return typeof external === 'string'
								? request
								: external.type
									? `${external.type} ${request}`
									: {
											amd: request,
											commonjs: request,
											commonjs2: request,
											root: request
									  };
						}
					}
				}

				callback(null, resolveExternal(externals));
			}
		],
		entry,
		node: {
			dgram: 'empty',
			net: 'empty',
			tls: 'empty',
			fs: 'empty',
			process: false,
			Buffer: false,
			setImmediate: false
		},
		output: {
			chunkFilename: '[name].js',
			library: `lib_${libraryName}`,
			umdNamedDefine: true,
			filename: '[name].js',
			jsonpFunction: `dojoWebpackJsonp${libraryName}`,
			libraryTarget: 'umd',
			path: path.resolve('./output')
		},
		resolveLoader: {
			modules: [path.resolve(__dirname, 'node_modules'), 'node_modules']
		},
		resolve: {
			modules: [basePath, path.join(basePath, 'node_modules')],
			extensions,
			plugins: [new TsconfigPathsPlugin({ configFile: path.join(basePath, 'tsconfig.json') })]
		},
		optimization: {
			noEmitOnErrors: false,
			splitChunks: singleBundle
				? {}
				: {
						cacheGroups: {
							default: false,
							vendors: false,
							main: {
								chunks: 'all',
								minChunks: 1,
								name: exports.mainEntry,
								reuseExistingChunk: true,
								test: (module: any, chunks: any) => {
									if (chunks.length === 1 && chunks[0].name === 'main') {
										return true;
									}
									if (
										chunks.some((chunk: any) => chunk.name && chunk.name.indexOf('runtime/') > -1)
									) {
										return false;
									}
									if (
										chunks.some((chunk: any) => chunk.name && chunk.name.indexOf('bootstrap') > -1)
									) {
										return false;
									}
									const chunkPercentage = chunkCount
										? Math.floor((chunks.length / chunkCount) * 100)
										: 0;
									if (
										chunkPercentage ? chunkPercentage > chunkPercentageThreshold : chunks.length > 2
									) {
										return true;
									}
									return false;
								}
							}
						}
				  }
		},
		devtool: 'source-map',
		watchOptions: { ignored: /node_modules/ },
		plugins: removeEmpty([
			new StyleLintPlugin({
				config: {
					rules: {
						'selector-max-type': [0, { ignoreTypes: '.' }],
						'selector-max-universal': [0]
					}
				},
				emitErrors: false,
				formatter: (results: any) => {
					return stylelint.formatters
						.string(results)
						.replace(/selector-max-type|selector-max-universal/g, 'css-modules')
						.replace(
							/to have no more than (\d*) type selectors/g,
							'to not contain element selectors due to unsafe isolation'
						)
						.replace(
							/to have no more than (\d*) universal selectors/g,
							'to not contain universal (*) selectors due to unsafe isolation'
						);
				},
				context: srcPath,
				files: ['**/*.m.css']
			}),
			singleBundle &&
				new webpack.optimize.LimitChunkCountPlugin({
					maxChunks: 1
				}),
			new CssModulePlugin(basePath),
			new MiniCssExtractPlugin({
				filename: '[name].css'
			}),
			(args.externals || isTest) &&
				new WrapperPlugin({
					test: singleBundle ? new RegExp(`${mainEntry}.*(\.js$)`) : new RegExp(`${bootstrapEntry}.*(\.js$)`),
					footer: `\ntypeof define === 'function' && define.amd && require(['lib_${libraryName}']);`
				}),
			args.locale && new CldrPlugin(),
			new webpack.DefinePlugin({
				__MAIN_ENTRY: JSON.stringify(mainEntryPath),
				__DOJO_SCOPE: `'${libraryName}'`
			}),
			!isExperimentalSpeed &&
				new OptimizeCssAssetsPlugin({
					cssProcessor: cssnano,
					cssProcessorOptions: {
						map: {
							inline: false
						}
					},
					cssProcessorPluginOptions: {
						preset: ['default', { calc: false }]
					}
				}),
			!singleBundle &&
				new BootstrapPlugin({
					entryPath: mainEntryPath,
					shimModules: [
						{
							module: '@dojo/framework/shim/IntersectionObserver',
							has: 'intersection-observer'
						},
						{
							module: '@dojo/framework/shim/ResizeObserver',
							has: 'resize-observer'
						},
						{
							module: '@dojo/framework/shim/WebAnimations',
							has: 'web-animations'
						},
						{
							module: '@dojo/framework/shim/fetch',
							has: 'build-fetch'
						},
						{
							module: '@dojo/framework/shim/inert',
							has: 'inert'
						}
					]
				}),
			watch &&
				watchExtraFiles.length &&
				new ExtraWatchWebpackPlugin({
					files: watchExtraFiles
				}),
			new ManifestPlugin(),
			new CssUrlRelativePlugin({ root: args.base || '/' })
		]),
		module: {
			// `file` uses the pattern `loaderPath!filePath`, hence the regex test
			noParse: (file: string) => assetsDirPattern.test(file),
			rules: removeEmpty([
				{
					test: indexHtmlPattern,
					use: {
						loader: 'html-loader',
						options: {
							attrs: ['link:href', 'img:src', 'script:src']
						}
					}
				},
				{
					test: /\.(css|js)$/,
					issuer: indexHtmlPattern,
					loader: `file-loader?digest=hex&name=[path][name].[ext]`
				},
				tsLint && {
					include: allPaths,
					test: /\.(ts|tsx)$/,
					enforce: 'pre',
					loader: 'tslint-loader',
					options: { configuration: tsLint, emitErrors: true, failOnHint: true },
					exclude: getTsLintExclusions()
				},
				{
					test: /@dojo(\/|\\).*\.(js|mjs)$/,
					enforce: 'pre',
					loader: 'source-map-loader-cli',
					options: { includeModulePaths: true }
				},
				args.locale &&
					singleBundle && {
						include: /cldr(\/|\\)bootstrapSync\.js/,
						loader: '@dojo/webpack-contrib/cldr/loader',
						options: { locale: args.locale, supportedLocales: args.supportedLocales, sync: true }
					},
				args.locale &&
					!singleBundle && {
						include: /cldr(\/|\\)bootstrap\.js/,
						loader: '@dojo/webpack-contrib/cldr/loader',
						options: { locale: args.locale, supportedLocales: args.supportedLocales, sync: false }
					},
				{
					include: allPaths,
					test: /\.ts(x)?$/,
					enforce: 'pre',
					loader: '@dojo/webpack-contrib/css-module-dts-loader?type=ts&instanceName=0_dojo'
				},
				{
					include: allPaths,
					test: /\.ts(x)?$/,
					use: removeEmpty([
						features && {
							loader: '@dojo/webpack-contrib/static-build-loader',
							options: { features, staticOnly }
						},
						isLegacy && getUMDCompatLoader({ bundles: args.bundles }),
						{
							loader: 'ts-loader',
							options: tsLoaderOptions
						}
					])
				},
				{
					test: /\.mjs?$/,
					// We cannot trust that all `mjs` modules use the correct import format for all dependencies
					// (e.g., do not use `import from` for cjs modules). Setting the type to `javascript/auto` allows
					// incorrect imports to continue working.
					type: 'javascript/auto',
					use: removeEmpty([
						features && {
							loader: '@dojo/webpack-contrib/static-build-loader',
							options: { features, staticOnly }
						}
					])
				},
				{
					test: /\.js(x)?$/,
					use: removeEmpty([
						features && {
							loader: '@dojo/webpack-contrib/static-build-loader',
							options: { features, staticOnly }
						},
						'umd-compat-loader'
					])
				},
				{
					include: [/@dojo/, /globalize/],
					test: new RegExp(`globalize(\\${path.sep}|$)`),
					loader: 'imports-loader?define=>false'
				},
				{
					test: /\.(gif|png|jpe?g|svg|eot|ttf|woff|woff2|ico)$/i,
					loader: `file-loader?digest=hex&name=[path][name].[ext]`
				},
				{
					test: /\.m\.css\.js$/,
					exclude: allPaths,
					use: ['json-css-module-loader']
				},
				{
					test: /\.css$/,
					include: /.*(\/|\\)node_modules(\/|\\).*/,
					use: [
						MiniCssExtractPlugin.loader,
						{
							loader: 'css-loader',
							options: {
								sourceMap: true,
								importLoaders: 1
							}
						}
					]
				},
				{
					include: allPaths,
					test: /\.css$/,
					exclude: /\.m\.css$/,
					oneOf: [{ issuer: indexHtmlPattern, use: 'identity-loader' }, { use: cssLoader }]
				},
				{
					include: allPaths,
					test: /\.m\.css$/,
					use: postCssModuleLoader
				}
			])
		}
	};

	return config as webpack.Configuration;
}
