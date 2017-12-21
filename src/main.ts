import { Command, Helper, OptionsHelper } from '@dojo/interfaces/cli';
import * as logUpdate from 'log-update';
import * as ora from 'ora';
import * as webpack from 'webpack';

import devConfigFactory from './dev.config';
import testConfigFactory from './test.config';
import distConfigFactory from './dist.config';
import logger from './logger';

const fixMultipleWatchTrigger = require('webpack-mild-compile');
const hotMiddleware = require('webpack-hot-middleware');
const webpackMiddleware = require('webpack-dev-middleware');
const express = require('express');

function createCompiler(config: webpack.Configuration) {
	const compiler = webpack(config);
	fixMultipleWatchTrigger(compiler);
	return compiler;
}

function build(config: webpack.Configuration) {
	const compiler = createCompiler(config);
	const spinner = ora('building').start();
	return new Promise((resolve, reject) => {
		compiler.run((err, stats) => {
			spinner.stop();
			if (err) {
				reject(err);
			}
			if (stats) {
				logger(stats.toJson(), config);
			}
			resolve();
		});
	});
}

function serve(config: webpack.Configuration, args: any): Promise<void> {
	const entry = config.entry as any;
	const plugins = config.plugins as webpack.Plugin[];
	const timeout = 20 * 1000;

	plugins.push(new webpack.HotModuleReplacementPlugin(), new webpack.NoEmitOnErrorsPlugin());
	Object.keys(entry).forEach(name => {
		entry[name].unshift(`webpack-hot-middleware/client?timeout=${timeout}&reload=true`);
	});

	const watchOptions = config.watchOptions as webpack.Compiler.WatchOptions;
	const app = express();
	const compiler = createCompiler(config);

	compiler.plugin('invalid', filename => {
		logUpdate(`Recompiling; updated file: ${filename}`);
	});
	compiler.plugin('done', stats => {
		logger(stats.toJson(), config, true);
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

	return new Promise((resolve, reject) => {
		logUpdate(`Listening on port ${args.port}`);
		app.listen(args.port, (error: Error) => {
			if (error) {
				reject(error);
			} else {
				resolve();
			}
		});
	});
}

function watch(config: webpack.Configuration): Promise<void> {
	const compiler = createCompiler(config);
	const spinner = ora('building').start();
	compiler.plugin('invalid', () => {
		logUpdate('');
		spinner.start();
	});
	compiler.plugin('done', () => {
		spinner.stop();
	});
	return new Promise((resolve, reject) => {
		const watchOptions = config.watchOptions as webpack.Compiler.WatchOptions;
		compiler.watch(watchOptions, (err, stats) => {
			if (err) {
				reject(err);
			}
			if (stats) {
				logger(stats.toJson(), config);
			}
			resolve();
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
			describe: 'watch for file changes (all modes)',
			alias: 'w',
			type: 'boolean'
		});

		options('serve', {
			describe: 'start a webserver and reload after source changes (dev mode only)',
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
		if (args.mode === 'dev' || args.serve) {
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
			return watch(config);
		}

		return build(config);
	}
};
export default command;
