import CssModulePlugin from '@dojo/webpack-contrib/css-module-plugin/CssModulePlugin';
import BootstrapPlugin from '@dojo/webpack-contrib/bootstrap-plugin/BootstrapPlugin';
import I18nPlugin from '@dojo/webpack-contrib/i18n-plugin/I18nPlugin';
import registryTransformer from '@dojo/webpack-contrib/registry-transformer';
import getFeatures from '@dojo/webpack-contrib/static-build-loader/getFeatures';
import { readFileSync, existsSync } from 'fs';
import * as loaderUtils from 'loader-utils';
import * as MiniCssExtractPlugin from 'mini-css-extract-plugin';
import * as path from 'path';
import * as tsnode from 'ts-node';
import * as ts from 'typescript';
import * as webpack from 'webpack';
import * as cssnano from 'cssnano';
import * as ManifestPlugin from 'webpack-manifest-plugin';

const postcssPresetEnv = require('postcss-preset-env');
const postcssImport = require('postcss-import');
const IgnorePlugin = require('webpack/lib/IgnorePlugin');
const slash = require('slash');
const WrapperPlugin = require('wrapper-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const ExtraWatchWebpackPlugin = require('extra-watch-webpack-plugin');

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

function getLibraryName(name: string) {
	return name
		.replace(/[^a-z0-9_]/g, ' ')
		.trim()
		.replace(/\s+/g, '_');
}

export const libraryName = packageName ? getLibraryName(packageName) : mainEntry;

function getUMDCompatLoader(options: { bundles?: { [key: string]: string[] } }) {
	const { bundles = {} } = options;
	return {
		loader: 'umd-compat-loader',
		options: {
			imports(module: string, context: string) {
				const filePath = path.relative(basePath, path.join(context, module));
				let chunkName = slash(filePath);
				Object.keys(bundles).some((name) => {
					if (bundles[name].indexOf(slash(filePath)) > -1) {
						chunkName = name;
						return true;
					}
					return false;
				});
				return `@dojo/webpack-contrib/promise-loader?global,${chunkName}!${module}`;
			}
		}
	};
}

function getLocalIdent(
	loaderContext: webpack.loader.LoaderContext,
	localIdentName: string,
	localName: string,
	options: any
) {
	if (!options.context) {
		const { context, rootContext } = loaderContext;
		options.context = typeof rootContext === 'string' ? rootContext : context;
	}
	const request = slash(path.relative(options.context, loaderContext.resourcePath));
	options.content = `${options.hashPrefix}${request}+${localName}`;
	localIdentName = localIdentName.replace(/\[local\]/gi, localName);
	const hash = loaderUtils.interpolateName(loaderContext, localIdentName, options);
	return hash.replace(new RegExp('[^a-zA-Z0-9\\-_\u00A0-\uFFFF]', 'g'), '-').replace(/^((-?[0-9])|--)/, '_$1');
}

export const removeEmpty = (items: any[]) => items.filter((item) => item);

function importTransformer(basePath: string, bundles: any = {}) {
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
					Object.keys(bundles).some(function(name) {
						if (bundles[name].indexOf(slash(chunkName)) !== -1) {
							chunkName = name;
							return true;
						}
						return false;
					});
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

function loadRoutingOutlets() {
	let outlets: string[] = [];
	const routesConfig = path.join(basePath, 'src', 'routes.ts');
	try {
		if (existsSync(routesConfig)) {
			const routes: any[] = require(slash(routesConfig)).default;
			return routes.map((route) => route.outlet);
		}
	} catch {}
	return outlets;
}

export default function webpackConfigFactory(args: any): webpack.Configuration {
	tsnode.register();
	const extensions = args.legacy ? ['.ts', '.tsx', '.js'] : ['.ts', '.tsx', '.mjs', '.js'];
	const compilerOptions = args.legacy ? {} : { target: 'es6', module: 'esnext' };
	let features = args.legacy ? args.features : { ...(args.features || {}), ...getFeatures('modern') };
	features = { ...features, 'dojo-debug': false };
	const assetsDir = path.join(process.cwd(), 'assets');
	const assetsDirPattern = new RegExp(assetsDir);
	const lazyModules = Object.keys(args.bundles || {}).reduce(
		(lazy, key) => {
			lazy.push(...args.bundles[key]);
			return lazy;
		},
		[] as string[]
	);
	const isTest = args.mode === 'unit' || args.mode === 'functional' || args.mode === 'test';
	const singleBundle = args.singleBundle || isTest;
	const watch = args.watch;
	let entry: any;
	if (singleBundle) {
		entry = {
			[mainEntry]: removeEmpty([
				'@dojo/webpack-contrib/bootstrap-plugin/sync',
				existsSync(mainCssPath) ? mainCssPath : null,
				mainEntryPath
			])
		};
	} else {
		features = { ...features, 'build-elide': true };
		entry = {
			[bootstrapEntry]: removeEmpty([
				existsSync(mainCssPath) ? mainCssPath : null,
				'@dojo/webpack-contrib/bootstrap-plugin/async'
			])
		};
	}

	const customTransformers: any[] = [];

	const outlets = loadRoutingOutlets();

	if ((lazyModules.length > 0 || outlets.length > 0) && !singleBundle) {
		customTransformers.push(registryTransformer(basePath, lazyModules, false, outlets));
	}

	if (!args.legacy && !singleBundle) {
		customTransformers.push(importTransformer(basePath, args.bundles));
	}

	const tsLoaderOptions: any = {
		onlyCompileBundledFiles: true,
		instance: 'dojo',
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
		browsers: args.legacy ? ['last 2 versions', 'ie >= 10'] : ['last 2 versions'],
		insertBefore: {
			'color-mod-function': colorToColorMod
		},
		features: {
			'color-mod-function': true,
			'nesting-rules': true
		},
		autoprefixer: {
			grid: args.legacy
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
				localIdentName: '[name]__[local]__[hash:base64:5]',
				getLocalIdent
			}
		},
		{
			loader: 'postcss-loader?sourceMap',
			options: {
				ident: 'postcss',
				plugins: [postcssImport(postcssImportConfig), postcssPresetEnv(postcssPresetConfig)]
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
		},
		{
			loader: 'postcss-loader?sourceMap',
			options: {
				ident: 'postcss',
				plugins: [postcssImport(postcssImportConfig), postcssPresetEnv(postcssPresetConfig)]
			}
		}
	];

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
		node: { dgram: 'empty', net: 'empty', tls: 'empty', fs: 'empty' },
		output: {
			chunkFilename: '[name].js',
			library: libraryName,
			umdNamedDefine: true,
			filename: '[name].js',
			jsonpFunction: `dojoWebpackJsonp${libraryName}`,
			libraryTarget: 'umd',
			path: path.resolve('./output')
		},
		resolve: {
			modules: [basePath, path.join(basePath, 'node_modules')],
			extensions
		},
		optimization: {
			noEmitOnErrors: false,
			splitChunks: {
				cacheGroups: {
					vendors: false,
					default: false,
					main: {
						chunks: 'initial',
						minChunks: 1,
						name: singleBundle ? mainEntry : bootstrapEntry,
						reuseExistingChunk: true
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
				files: ['**/*.m.css']
			}),
			singleBundle &&
				new webpack.optimize.LimitChunkCountPlugin({
					maxChunks: 1
				}),
			new CssModulePlugin(basePath),
			new IgnorePlugin(/request\/providers\/node/),
			new MiniCssExtractPlugin({
				filename: '[name].css'
			}),
			(args.externals || isTest) &&
				new WrapperPlugin({
					test: singleBundle ? new RegExp(`${mainEntry}.*(\.js$)`) : new RegExp(`${bootstrapEntry}.*(\.js$)`),
					footer: `\ntypeof define === 'function' && define.amd && require(['${libraryName}']);`
				}),
			args.locale &&
				new I18nPlugin({
					defaultLocale: args.locale,
					supportedLocales: args.supportedLocales,
					cldrPaths: args.cldrPaths,
					target: mainEntryPath
				}),
			!singleBundle &&
				new webpack.DefinePlugin({
					__MAIN_ENTRY: JSON.stringify(mainEntryPath)
				}),
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
						}
					]
				}),
			watch &&
				new ExtraWatchWebpackPlugin({
					files: ['!(output|.*|node_modules)/**']
				}),
			new ManifestPlugin()
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
					loader: 'file-loader?hash=sha512&digest=hex&name=[name].[hash:base64:8].[ext]'
				},
				tsLint && {
					include: allPaths,
					test: /\.ts$/,
					enforce: 'pre',
					loader: 'tslint-loader',
					options: { configuration: tsLint, emitErrors: true, failOnHint: true }
				},
				{
					test: /@dojo(\/|\\).*\.(js|mjs)$/,
					enforce: 'pre',
					loader: 'source-map-loader-cli',
					options: { includeModulePaths: true }
				},
				{
					include: allPaths,
					test: /\.ts(x)?$/,
					enforce: 'pre',
					loader: '@dojo/webpack-contrib/css-module-dts-loader?type=ts&instanceName=0_dojo'
				},
				{
					include: allPaths,
					test: /\.m\.css$/,
					enforce: 'pre',
					loader: '@dojo/webpack-contrib/css-module-dts-loader?type=css'
				},
				{
					include: allPaths,
					test: /\.ts(x)?$/,
					use: removeEmpty([
						features && {
							loader: '@dojo/webpack-contrib/static-build-loader',
							options: { features }
						},
						args.legacy && getUMDCompatLoader({ bundles: args.bundles }),
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
							options: { features }
						}
					])
				},
				{
					test: /\.js(x)?$/,
					use: removeEmpty([
						features && {
							loader: '@dojo/webpack-contrib/static-build-loader',
							options: { features }
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
					loader: 'file-loader?hash=sha512&digest=hex&name=[name].[hash:base64:8].[ext]'
				},
				{
					test: /\.m\.css\.js$/,
					exclude: allPaths,
					use: ['json-css-module-loader']
				},
				{
					test: /\.css$/,
					exclude: (path: string) => {
						if (path.indexOf(srcPath) > -1 || path.indexOf(testPath) > -1) {
							return true;
						}
						return (
							/\.m\.css$/.test(path) &&
							!/.*(\/|\\)node_modules(\/|\\)@dojo(\/|\\)widgets(\/|\\).*/.test(path)
						);
					},
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
					exclude: /.*(\/|\\)node_modules(\/|\\)@dojo(\/|\\)widgets(\/|\\).*/,
					test: /\.m\.css$/,
					use: postCssModuleLoader
				}
			])
		}
	};

	return config as webpack.Configuration;
}
