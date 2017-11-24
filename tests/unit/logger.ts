const { describe, it, beforeEach, afterEach } = intern.getInterface('bdd');
const { assert } = intern.getPlugin('chai');
import * as path from 'path';
import * as logSymbols from 'log-symbols';
import chalk from 'chalk';
import * as sinon from 'sinon';
import MockModule from '../support/MockModule';

const stripAnsi = require('strip-ansi');
const columns = require('cli-columns');

let mockModule: MockModule;

describe('logger', () => {

	beforeEach(() => {
		mockModule = new MockModule('../../src/logger', require);
		mockModule.dependencies([
			'typescript',
			'jsonfile',
			'log-update'
		]);
		mockModule.getMock('jsonfile').readFileSync = sinon.stub().returns({ version: '9.9.9' });
		mockModule.getMock('typescript').version = '1.1.1';
	});

	afterEach(() => {
		mockModule.destroy();
	});

	it('logging output with no errors', () => {
		const logger = mockModule.getModuleUnderTest().default;
		logger(
			{
				hash: 'hash',
				assets: [
					{
						name: 'assetOne.js',
						size: 1000
					},
					{
						name: 'assetOne.js',
						size: 1000
					}
				],
				chunks: [
					{
						names: [ 'chunkOne' ]
					}
				],
				errors: [],
				warnings: []
			},
			{
				output: {
					path: path.join(__dirname, './../fixtures')
				}
			}
		);

		const expectedLog = `
${logSymbols.info} cli-build-app: 9.9.9
${logSymbols.info} typescript: 1.1.1
${logSymbols.success} hash: hash
${logSymbols.error} errors: 0
${logSymbols.warning} warnings: 0
${''}${''}
${chalk.yellow('chunks:')}
${columns([ 'chunkOne' ])}
${chalk.yellow('assets:')}
${columns([
	`assetOne.js ${chalk.yellow('(1.00kb)')} / ${chalk.blue('(0.04kb gz)')}`,
	`assetOne.js ${chalk.yellow('(1.00kb)')} / ${chalk.blue('(0.04kb gz)')}`
])}
${chalk.yellow(`output at: ${chalk.cyan(chalk.underline(`file:///${path.join(__dirname, './../fixtures')}`))}`)}
	`;
		const mockedLogUpdate = mockModule.getMock('log-update').ctor;
		assert.isTrue(mockedLogUpdate.calledWith(expectedLog));
	});

	it('logging output with errors', () => {
		const errors: any = [ 'error' ];
		const warnings: any = [ 'warning' ];
		const logger = mockModule.getModuleUnderTest().default;
		logger(
			{
				hash: 'hash',
				assets: [
					{
						name: 'assetOne.js',
						size: 1000
					},
					{
						name: 'assetOne.js',
						size: 1000
					}
				],
				chunks: [
					{
						names: [ 'chunkOne' ]
					}
				],
				errors,
				warnings
			},
			{
				output: {
					path: path.join(__dirname, './../fixtures')
				}
			}
		);

		const expectedErrors = `
${chalk.yellow('errors:')}
${chalk.red(errors.map((error: string) => stripAnsi(error)))}
`;

		const expectedWarnings = `
${chalk.yellow('warnings:')}
${chalk.gray(warnings.map((warning: string) => stripAnsi(warning)))}
`;

		const expectedLog = `
${logSymbols.info} cli-build-app: 9.9.9
${logSymbols.info} typescript: 1.1.1
${logSymbols.success} hash: hash
${logSymbols.error} errors: 1
${logSymbols.warning} warnings: 1
${expectedErrors}${expectedWarnings}
${chalk.yellow('chunks:')}
${columns([ 'chunkOne' ])}
${chalk.yellow('assets:')}
${columns([
	`assetOne.js ${chalk.yellow('(1.00kb)')} / ${chalk.blue('(0.04kb gz)')}`,
	`assetOne.js ${chalk.yellow('(1.00kb)')} / ${chalk.blue('(0.04kb gz)')}`
])}
${chalk.yellow(`output at: ${chalk.cyan(chalk.underline(`file:///${path.join(__dirname, './../fixtures')}`))}`)}
	`;
		const mockedLogUpdate = mockModule.getMock('log-update').ctor;
		assert.isTrue(mockedLogUpdate.calledWith(expectedLog));
	});

});
