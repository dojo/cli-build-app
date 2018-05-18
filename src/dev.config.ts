import baseConfigFactory from './base.config';
import * as HtmlWebpackPlugin from 'html-webpack-plugin';
import * as path from 'path';
import webpack = require('webpack');
import BuildTimeRender from '@dojo/webpack-contrib/build-time-render/BuildTimeRender';
import ExternalLoaderPlugin from '@dojo/webpack-contrib/external-loader-plugin/ExternalLoaderPlugin';
import * as CleanWebpackPlugin from 'clean-webpack-plugin';
import * as ManifestPlugin from 'webpack-manifest-plugin';

function webpackConfig(args: any): webpack.Configuration {
	const config = baseConfigFactory(args);
	const { plugins, output, module } = config;
	const externalDependencies = (args.externals && args.externals.dependencies) || [];
	const includesExternals = Boolean(externalDependencies.length);

	config.plugins = [
		...plugins,
		new ManifestPlugin(),
		new HtmlWebpackPlugin({ inject: true, chunks: ['runtime', 'main'], template: 'src/index.html' }),
		new CleanWebpackPlugin(['dev'], { root: output.path, verbose: false }),
		new webpack.optimize.CommonsChunkPlugin({
			name: 'runtime'
		})
	];

	if (args.watch !== 'memory' && args['build-time-render']) {
		config.plugins.push(
			new BuildTimeRender({
				...args['build-time-render'],
				entries: ['runtime', ...Object.keys(config.entry!)],
				useManifest: true
			})
		);
	}

	if (includesExternals) {
		config.plugins.push(
			new ExternalLoaderPlugin({
				dependencies: externalDependencies,
				outputPath: args.externals && args.externals.outputPath,
				pathPrefix: args.withTests ? '../_build/src' : ''
			})
		);
	}

	module.rules = module.rules.map(rule => {
		if (Array.isArray(rule.use)) {
			rule.use.forEach((loader: any) => {
				if (typeof loader === 'string') {
					return loader;
				}
				if (loader.loader === 'css-loader') {
					loader.options.localIdentName = '[name]__[local]__[hash:base64:5]';
					return loader;
				}
			});
		}
		return rule;
	});

	config.output = {
		...output,
		path: path.join(output.path!, 'dev')
	};

	config.devtool = 'inline-source-map';
	return config;
}

export default webpackConfig;
