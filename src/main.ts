import { Command, Helper, OptionsHelper } from '@dojo/interfaces/cli';
import * as webpack from 'webpack';

import devConfigFactory from './dev.config';
import testConfigFactory from './test.config';
import distConfigFactory from './dist.config';
import logger from './logger';

const fixMultipleWatchTrigger = require('webpack-mild-compile');

const command: Command<any> = {
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
		const compiler = webpack(config);
		fixMultipleWatchTrigger(compiler);
		return new Promise((resolve, reject) => {
			compiler.run((err, stats) => {
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
};
export default command;
