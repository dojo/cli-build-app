const { describe, it, beforeEach, afterEach } = intern.getInterface('bdd');
const { assert } = intern.getPlugin('chai');
import { stub } from 'sinon';
import MockModule from '../support/MockModule';

const configJson: any = { bundles: {} };
let mockModule: MockModule;
let mockDevConfig: any;
let mockDistConfig: any;
let mockTestConfig: any;

describe('ejected config', () => {
	beforeEach(() => {
		mockModule = new MockModule('../../src/ejected.config', require);
		mockModule.dependencies(['./dev.config', './dist.config', './test.config', './build-options.json']);

		const configs = ['dev', 'dist', 'test'].map((name) => {
			const config = mockModule.getMock(`./${name}.config`);
			config.default = stub();
			return config.default;
		});

		Object.assign(mockModule.getMock('./build-options.json'), configJson);
		mockDevConfig = configs[0];
		mockDistConfig = configs[1];
		mockTestConfig = configs[2];
	});

	afterEach(() => {
		mockModule.destroy();
	});

	it('can run dev mode', () => {
		const config = mockModule.getModuleUnderTest();
		config({ mode: 'dev' });
		assert.isTrue(mockDevConfig.calledOnce);
		assert.isTrue(mockDevConfig.calledWith(configJson));
	});

	it('can run dist mode', () => {
		const config = mockModule.getModuleUnderTest();
		config();
		assert.isTrue(mockDistConfig.calledOnce);
		assert.isTrue(mockDistConfig.calledWith(configJson));
	});

	it('can run test mode', () => {
		const config = mockModule.getModuleUnderTest();
		config({ mode: 'test' });
		assert.isTrue(mockTestConfig.calledOnce);
		assert.isTrue(mockTestConfig.calledWith(configJson));
	});
});
