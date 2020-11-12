const { describe, it, beforeEach, afterEach } = intern.getInterface('bdd');
const { assert } = intern.getPlugin('chai');
import * as fs from 'fs';
import * as path from 'path';
import * as logSymbols from 'log-symbols';
import chalk from 'chalk';
import * as sinon from 'sinon';
import MockModule from '../support/MockModule';

const columns = require('cli-columns');

let mockModule: MockModule;

function assertOutput(isServing = false, hasManifest = true) {
	const logger = mockModule.getModuleUnderTest().default;
	const runningMessage = isServing ? 'running...' : undefined;
	const toJson = sinon.stub().returns({
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
				names: ['chunkOne']
			}
		],
		errors: [],
		warnings: []
	});

	const hasErrors = logger(
		{ toJson },
		{
			output: {
				path: path.join(__dirname, '..', 'fixtures')
			}
		},
		runningMessage
	);

	let signOff = chalk.green('The build completed successfully.');
	if (runningMessage) {
		signOff += `\n\n${runningMessage}`;
	}
	let chunks = '';
	chunks = `${chalk.yellow('chunks:')}
${columns(['chunkOne'])}`;

	const expectedLog = `
${logSymbols.info} cli-build-app: 9.9.9
${logSymbols.info} typescript: 1.1.1
${logSymbols.success} hash: hash
${logSymbols.error} errors: 0
${logSymbols.warning} warnings: 0
${''}${''}
${chunks}
${chalk.yellow(`output at: ${chalk.cyan(chalk.underline(`file:///${path.join(__dirname, '..', 'fixtures')}`))}`)}

${signOff}
	`;
	const mockedLogUpdate = mockModule.getMock('log-update').ctor;
	assert.isTrue(mockedLogUpdate.calledWith(expectedLog));
	assert.isFalse(hasErrors);

	const [{ warningsFilter }] = toJson.firstCall.args;
	assert.isTrue(warningsFilter('[mini-css-extract-plugin]\nConflicting order between'));
	assert.isFalse(warningsFilter('[mini-css-extract-plugin]'));
	assert.isFalse(warningsFilter(''));
	assert.isFalse(warningsFilter('some other warning'));
}

describe('logger', () => {
	beforeEach(() => {
		mockModule = new MockModule('../../src/logger', require);
		mockModule.dependencies([
			'typescript',
			'jsonfile',
			'log-update',
			'@dojo/webpack-contrib/webpack-bundle-analyzer/AnalyzeBundles',
			'@dojo/webpack-contrib/webpack-bundle-analyzer/parseUtils'
		]);
		mockModule.getMock('jsonfile').readFileSync = sinon.stub().returns({ version: '9.9.9' });
		mockModule.getMock('typescript').version = '1.1.1';
		mockModule.getMock(
			'@dojo/webpack-contrib/webpack-bundle-analyzer/AnalyzeBundles'
		).default = sinon.stub().returns({
			chunkOne: {
				parsedSize: 251 * 1000,
				gzipSize: 800
			}
		});
		mockModule.getMock(
			'@dojo/webpack-contrib/webpack-bundle-analyzer/parseUtils'
		).findLargestPackage = sinon.stub().returns({
			size: 1000,
			name: 'foo'
		});
	});

	afterEach(() => {
		mockModule.destroy();

		const existsSync = fs.existsSync as any;
		if (typeof existsSync.restore === 'function') {
			existsSync.restore();
		}
	});

	it('logging output with no errors', () => {
		assertOutput();
	});

	it('logging output while serving', () => {
		assertOutput(true);
	});

	it('logging output with errors', () => {
		const errors: any = ['error', 'otherError'];
		const warnings: any = ['warning', 'otherWarning'];
		const logger = mockModule.getModuleUnderTest().default;
		const hasErrors = logger(
			{
				toJson: () => ({
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
							names: ['chunkOne']
						}
					],
					errors,
					warnings
				})
			},
			{
				output: {
					path: path.join(__dirname, '..', 'fixtures')
				}
			}
		);

		const expectedErrors = `
${chalk.yellow('errors:')}${chalk.red('\nerror\notherError')}
`;

		const expectedWarnings = `
${chalk.yellow('warnings:')}${chalk.gray('\nwarning\notherWarning')}
`;

		const expectedLog = `
${logSymbols.info} cli-build-app: 9.9.9
${logSymbols.info} typescript: 1.1.1
${logSymbols.success} hash: hash
${logSymbols.error} errors: 2
${logSymbols.warning} warnings: 2
${expectedErrors}${expectedWarnings}
${chalk.yellow('chunks:')}
${columns(['chunkOne'])}
${chalk.yellow(`output at: ${chalk.cyan(chalk.underline(`file:///${path.join(__dirname, '..', 'fixtures')}`))}`)}

${chalk.red('The build completed with errors.')}
	`;
		const mockedLogUpdate = mockModule.getMock('log-update').ctor;
		assert.strictEqual(mockedLogUpdate.firstCall.args[0], expectedLog);
		assert.isTrue(mockedLogUpdate.calledWith(expectedLog));
		assert.isTrue(hasErrors);
	});

	it('logging output in dist mode with a large chunk', () => {
		const logger = mockModule.getModuleUnderTest().default;
		const hasErrors = logger(
			{
				toJson: () => ({
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
							names: ['chunkOne']
						}
					],
					errors: [],
					warnings: []
				})
			},
			{
				output: {
					path: path.join(__dirname, '..', 'fixtures')
				}
			},
			'',
			{ mode: 'dist' }
		);

		const expectedLog = `
${logSymbols.info} cli-build-app: 9.9.9
${logSymbols.info} typescript: 1.1.1
${logSymbols.success} hash: hash
${logSymbols.error} errors: 0
${logSymbols.warning} warnings: 0
${''}${''}
${chalk.yellow('chunks:')}
${columns([
			`chunkOne ${chalk.yellow('(251kB)')} / ${chalk.blue(
				'(0.8kB gz)'
			)}\nLargest dependency is foo ${chalk.yellow('(1kB)')}`
		])}
${chalk.yellow(`output at: ${chalk.cyan(chalk.underline(`file:///${path.join(__dirname, '..', 'fixtures')}`))}`)}

${chalk.green('The build completed successfully.')}
	`;
		const mockedLogUpdate = mockModule.getMock('log-update').ctor;
		assert.strictEqual(mockedLogUpdate.firstCall.args[0], expectedLog);
		assert.isTrue(mockedLogUpdate.calledWith(expectedLog));
		assert.isFalse(hasErrors);
	});

	it('logging output in dist mode with a small chunk', () => {
		mockModule.getMock('@dojo/webpack-contrib/webpack-bundle-analyzer/AnalyzeBundles').default.returns({
			chunkOne: {
				parsedSize: 249 * 1000,
				gzipSize: 800
			}
		});
		const logger = mockModule.getModuleUnderTest().default;
		const hasErrors = logger(
			{
				toJson: () => ({
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
							names: ['chunkOne']
						}
					],
					errors: [],
					warnings: []
				})
			},
			{
				output: {
					path: path.join(__dirname, '..', 'fixtures')
				}
			},
			'',
			{ mode: 'dist' }
		);

		const expectedLog = `
${logSymbols.info} cli-build-app: 9.9.9
${logSymbols.info} typescript: 1.1.1
${logSymbols.success} hash: hash
${logSymbols.error} errors: 0
${logSymbols.warning} warnings: 0
${''}${''}
${chalk.yellow('chunks:')}
${columns([`chunkOne ${chalk.yellow('(249kB)')} / ${chalk.blue('(0.8kB gz)')}`])}
${chalk.yellow(`output at: ${chalk.cyan(chalk.underline(`file:///${path.join(__dirname, '..', 'fixtures')}`))}`)}

${chalk.green('The build completed successfully.')}
	`;
		const mockedLogUpdate = mockModule.getMock('log-update').ctor;
		assert.strictEqual(mockedLogUpdate.firstCall.args[0], expectedLog);
		assert.isTrue(mockedLogUpdate.calledWith(expectedLog));
		assert.isFalse(hasErrors);
	});

	it('logging output in dist mode when unable to find packages', () => {
		mockModule
			.getMock('@dojo/webpack-contrib/webpack-bundle-analyzer/parseUtils')
			.findLargestPackage.returns(undefined);
		const logger = mockModule.getModuleUnderTest().default;
		const hasErrors = logger(
			{
				toJson: () => ({
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
							names: ['chunkOne']
						}
					],
					errors: [],
					warnings: []
				})
			},
			{
				output: {
					path: path.join(__dirname, '..', 'fixtures')
				}
			},
			'',
			{ mode: 'dist' }
		);

		const expectedLog = `
${logSymbols.info} cli-build-app: 9.9.9
${logSymbols.info} typescript: 1.1.1
${logSymbols.success} hash: hash
${logSymbols.error} errors: 0
${logSymbols.warning} warnings: 0
${''}${''}
${chalk.yellow('chunks:')}
${columns([`chunkOne ${chalk.yellow('(251kB)')} / ${chalk.blue('(0.8kB gz)')}`])}
${chalk.yellow(`output at: ${chalk.cyan(chalk.underline(`file:///${path.join(__dirname, '..', 'fixtures')}`))}`)}

${chalk.green('The build completed successfully.')}
	`;
		const mockedLogUpdate = mockModule.getMock('log-update').ctor;
		assert.strictEqual(mockedLogUpdate.firstCall.args[0], expectedLog);
		assert.isTrue(mockedLogUpdate.calledWith(expectedLog));
		assert.isFalse(hasErrors);
	});
});
