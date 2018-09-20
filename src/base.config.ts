import * as webpack from 'webpack';
import * as path from 'path';
import { existsSync } from 'fs';
import CssModulePlugin from '@dojo/webpack-contrib/css-module-plugin/CssModulePlugin';
import ExternalLoaderPlugin from '@dojo/webpack-contrib/external-loader-plugin/ExternalLoaderPlugin';
import registryTransformer from '@dojo/webpack-contrib/registry-transformer';
import I18nPlugin from '@dojo/webpack-contrib/i18n-plugin/I18nPlugin';
import * as ExtractTextPlugin from 'extract-text-webpack-plugin';
import { WebpackConfiguration } from './interfaces';
import * as loaderUtils from 'loader-utils';
import * as ts from 'typescript';
import * as tsnode from 'ts-node';
import getFeatures from '@dojo/webpack-contrib/static-build-loader/getFeatures';

const postcssPresetEnv = require('postcss-preset-env');
const IgnorePlugin = require('webpack/lib/IgnorePlugin');
const slash = require('slash');
const WrapperPlugin = require('wrapper-webpack-plugin');

const basePath = process.cwd();
const srcPath = path.join(basePath, 'src');
const testPath = path.join(basePath, 'tests');
const allPaths = [srcPath, testPath];

const isTsx = existsSync(path.join(srcPath, 'main.tsx'));
const mainEntryPath = path.join(srcPath, isTsx ? 'main.tsx' : 'main.ts');
const mainCssPath = path.join(srcPath, 'main.css');
const indexHtmlPattern = /src\/index\.html$/;

export const mainEntry = 'main';

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

const libraryName = packageName ? getLibraryName(packageName) : mainEntry;

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
		if (loaderContext.options && typeof loaderContext.options.context === 'string') {
			options.context = loaderContext.options.context;
		} else {
			options.context = loaderContext.context;
		}
	}
	const request = slash(path.relative(options.context, loaderContext.resourcePath));
	options.content = `${options.hashPrefix}${request}+${localName}`;
	localIdentName = localIdentName.replace(/\[local\]/gi, localName);
	const hash = loaderUtils.interpolateName(loaderContext, localIdentName, options);
	return hash.replace(new RegExp('[^a-zA-Z0-9\\-_\u00A0-\uFFFF]', 'g'), '-').replace(/^((-?[0-9])|--)/, '_$1');
}

const removeEmpty = (items: any[]) => items.filter((item) => item);

const banner = `
[Dojo](https://dojo.io/)
Copyright [JS Foundation](https://js.foundation/) & contributors
[New BSD license](https://github.com/dojo/meta/blob/master/LICENSE)
All rights reserved
`;

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
				const { resolvedFileName } = resolvedModules.get(moduleText);
				let chunkName = slash(
					resolvedFileName
						.replace(basePath, '')
						.replace('.ts', '')
						.replace(/^(\/|\\)/, '')
				);
				Object.keys(bundles).some(function(name) {
					if (bundles[name].indexOf(slash(chunkName)) !== -1) {
						chunkName = name;
						return true;
					}
					return false;
				});
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
			tsnode.register();
			const routes: any[] = require(slash(routesConfig)).default;
			return routes.map((route) => route.outlet);
		}
	} catch {}
	return outlets;
}

export default function webpackConfigFactory(args: any): WebpackConfiguration {
	const extensions = args.legacy ? ['.ts', '.tsx', '.js'] : ['.ts', '.tsx', '.mjs', '.js'];
	const compilerOptions = args.legacy ? {} : { target: 'es6', module: 'esnext' };
	let features = args.legacy ? args.features : { ...(args.features || {}), ...getFeatures('chrome') };
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
	const singleBundle =
		args.singleBundle || args.mode === 'unit' || args.mode === 'functional' || args.mode === 'test';

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

	const postCssModuleLoader = ExtractTextPlugin.extract({
		fallback: ['style-loader'],
		use: [
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
					plugins: [
						require('postcss-import')(),
						require('postcss-url')({
							url: 'rebase'
						}),
						postcssPresetEnv(postcssPresetConfig)
					]
				}
			}
		]
	});
	const cssLoader = ExtractTextPlugin.extract({
		fallback: ['style-loader'],
		use: [
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
					plugins: [
						require('postcss-import')(),
						require('postcss-url')({
							url: 'rebase'
						}),
						postcssPresetEnv(postcssPresetConfig)
					]
				}
			}
		]
	});

	const config: webpack.Configuration = {
		externals: [
			function(context, request, callback) {
				const externals = (args.externals && args.externals.dependencies) || [];
				function resolveExternal(externals: (string | { name?: string; type?: string })[]): string | void {
					for (let external of externals) {
						const name = external && (typeof external === 'string' ? external : external.name);
						if (name && new RegExp(`^${name}[!\/]?`).test(request)) {
							return typeof external === 'string'
								? request
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
		entry: {
			[mainEntry]: removeEmpty([
				'@dojo/webpack-contrib/build-time-render/hasBuildTimeRender',
				existsSync(mainCssPath) ? mainCssPath : null,
				mainEntryPath
			])
		},
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
		devtool: 'source-map',
		watchOptions: { ignored: /node_modules/ },
		plugins: removeEmpty([
			singleBundle &&
				new webpack.optimize.LimitChunkCountPlugin({
					maxChunks: 1
				}),
			new CssModulePlugin(basePath),
			new webpack.BannerPlugin(banner),
			new IgnorePlugin(/request\/providers\/node/),
			new ExtractTextPlugin({
				filename: 'main.css',
				allChunks: true
			}),
			new webpack.NamedChunksPlugin(),
			new webpack.NamedModulesPlugin(),
			new WrapperPlugin({
				test: /(main.*(\.js$))|(all.*(\.js$))/,
				footer: `typeof define === 'function' && define.amd && require(['${libraryName}']);`
			}),
			args.locale &&
				new I18nPlugin({
					defaultLocale: args.locale,
					supportedLocales: args.supportedLocales,
					cldrPaths: args.cldrPaths,
					target: mainEntryPath
				}),
			args.externals &&
				args.externals.dependencies &&
				new ExternalLoaderPlugin({
					dependencies: args.externals.dependencies,
					hash: true,
					outputPath: args.externals.outputPath
				})
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
					test: /@dojo\/.*\.(js|mjs)$/,
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
					exclude: allPaths,
					use: ExtractTextPlugin.extract({
						fallback: ['style-loader'],
						use: {
							loader: 'css-loader',
							options: {
								sourceMap: true,
								importLoaders: 1
							}
						}
					})
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

	return config as WebpackConfiguration;
}
