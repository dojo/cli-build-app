import { Command, Helper, OptionsHelper } from '@dojo/interfaces/cli';
import * as webpack from 'webpack';

import baseConfigFactory from './base.config';
import distConfigFactory from './dist.config';

const fixMultipleWatchTrigger = require('webpack-mild-compile');

const command: Command<any> = {
	group: 'build',
	name: 'app',
	description: 'create a build of your application',
	register(options: OptionsHelper) {
		options('watch', {
			describe: 'watch',
			alias: 'w',
			default: false,
			type: 'boolean'
		});
		options('mode', {
			describe: 'the output mode',
			alias: 'm',
			default: 'dist',
			choices: ['dist', 'dev', 'test']
		});
	},
	run(helper: Helper, args: any) {
		let config: webpack.Configuration;
		if (args.mode === 'dist') {
			config = distConfigFactory({});
		}
		else {
			config = baseConfigFactory({});
		}
		const compiler = webpack(config);
		fixMultipleWatchTrigger(compiler);
		return new Promise((resolve, reject) => {
			compiler.run((err, stats) => {
				console.log(stats);
				if (err) {
					console.log(err);
					reject(err);
				}
				resolve();
			});
		});
	}
};
export default command;
