const { describe, it, beforeEach, afterEach } = intern.getInterface('bdd');
const { assert } = intern.getPlugin('chai');
import * as path from 'path';
import * as sinon from 'sinon';
import MockModule from '../support/MockModule';

let mockModule: MockModule;

describe('logger', () => {
	beforeEach(() => {
		mockModule = new MockModule('../../src/logger', require);
		mockModule.dependencies(['typescript', 'jsonfile', 'log-update']);
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
						names: ['chunkOne']
					}
				],
				errors: [],
				warnings: []
			},
			{
				output: {
					path: path.join(__dirname, '..', 'fixtures')
				}
			}
		);

		const mockedLogUpdate = mockModule.getMock('log-update').ctor;
		console.log(
			'\n\u001b[34mℹ\u001b[39m cli-build-app: 9.9.9\n\u001b[34mℹ\u001b[39m typescript: 1.1.1\n\u001b[32m✔\u001b[39m hash: hash\n\u001b[31m✖\u001b[39m errors: 0\n\u001b[33m⚠\u001b[39m warnings: 0\n\n\u001b[33mchunks:\u001b[39m\nchunkOne  \n\u001b[33massets:\u001b[39m\nassetOne.js \u001b[33m(1.00kb)\u001b[39m / \u001b[34m(0.04kb gz)\u001b[39m  assetOne.js \u001b[33m(1.00kb)\u001b[39m / \u001b[34m(0.04kb gz)\u001b[39m  \n\u001b[33moutput at: \u001b[36m\u001b[4mfile:////Users/Anthony/development/dojo2/cli-build-app/_build/tests/fixtures\u001b[24m\u001b[33m\u001b[39m\n\t'
		);
		assert.isTrue(
			mockedLogUpdate.calledWith(
				'\n\u001b[34mℹ\u001b[39m cli-build-app: 9.9.9\n\u001b[34mℹ\u001b[39m typescript: 1.1.1\n\u001b[32m✔\u001b[39m hash: hash\n\u001b[31m✖\u001b[39m errors: 0\n\u001b[33m⚠\u001b[39m warnings: 0\n\n\u001b[33mchunks:\u001b[39m\nchunkOne  \n\u001b[33massets:\u001b[39m\nassetOne.js \u001b[33m(1.00kb)\u001b[39m / \u001b[34m(0.04kb gz)\u001b[39m  assetOne.js \u001b[33m(1.00kb)\u001b[39m / \u001b[34m(0.04kb gz)\u001b[39m  \n\u001b[33moutput at: \u001b[36m\u001b[4mfile:////Users/Anthony/development/dojo2/cli-build-app/_build/tests/fixtures\u001b[24m\u001b[33m\u001b[39m\n\t'
			)
		);
	});

	it('logging output with errors', () => {
		const errors: any = ['error'];
		const warnings: any = ['warning'];
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
						names: ['chunkOne']
					}
				],
				errors,
				warnings
			},
			{
				output: {
					path: path.join(__dirname, '..', 'fixtures')
				}
			}
		);

		const mockedLogUpdate = mockModule.getMock('log-update').ctor;
		assert.isTrue(
			mockedLogUpdate.calledWith(
				'\n\u001b[34mℹ\u001b[39m cli-build-app: 9.9.9\n\u001b[34mℹ\u001b[39m typescript: 1.1.1\n\u001b[32m✔\u001b[39m hash: hash\n\u001b[31m✖\u001b[39m errors: 1\n\u001b[33m⚠\u001b[39m warnings: 1\n\n\u001b[33merrors:\u001b[39m\n\u001b[31merror\u001b[39m\n\n\u001b[33mwarnings:\u001b[39m\n\u001b[90mwarning\u001b[39m\n\n\u001b[33mchunks:\u001b[39m\nchunkOne  \n\u001b[33massets:\u001b[39m\nassetOne.js \u001b[33m(1.00kb)\u001b[39m / \u001b[34m(0.04kb gz)\u001b[39m  assetOne.js \u001b[33m(1.00kb)\u001b[39m / \u001b[34m(0.04kb gz)\u001b[39m  \n\u001b[33moutput at: \u001b[36m\u001b[4mfile:////Users/Anthony/development/dojo2/cli-build-app/_build/tests/fixtures\u001b[24m\u001b[33m\u001b[39m\n\t'
			)
		);
	});
});
