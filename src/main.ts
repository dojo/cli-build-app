import { Command, Helper, OptionsHelper } from '@dojo/interfaces/cli';

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
			choices: [ 'dist', 'dev', 'test' ]
		});
	},
	run(helper: Helper, args: any) {
		console.log('I ran with,', args);
		return {} as Promise<void>;
	}
};
export default command;
