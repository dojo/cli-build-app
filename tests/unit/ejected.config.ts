const { describe, it, beforeEach, afterEach } = intern.getInterface('bdd');
const { assert } = intern.getPlugin('chai');
import * as fs from 'fs';
import { stub } from 'sinon';
import MockModule from '../support/MockModule';

let mockModule: MockModule;
let mockDevConfig: any;
let mockDistConfig: any;
let mockTestConfig: any;
let rc: any = { 'build-app': { bundles: {} } };

describe('ejected config', () => {
	beforeEach(() => {
		mockModule = new MockModule('../../src/ejected.config', require);
		mockModule.dependencies([
			'@dojo/cli-build-app/dev.config',
			'@dojo/cli-build-app/dist.config',
			'@dojo/cli-build-app/test.config'
		]);

		stub(fs, 'existsSync').returns(true);
		const readFileSync = fs.readFileSync;
		stub(fs, 'readFileSync').callsFake((path: string, ...args: any[]) => {
			if (path.indexOf('.dojorc') > -1) {
				return JSON.stringify(rc);
			}
			return readFileSync(path, ...args);
		});

		const configs = ['dev', 'dist', 'test'].map(name => {
			const config = mockModule.getMock(`@dojo/cli-build-app/${name}.config`);
			config.default = stub();
			return config.default;
		});

		mockDevConfig = configs[0];
		mockDistConfig = configs[1];
		mockTestConfig = configs[2];
	});

	afterEach(() => {
		mockModule.destroy();
		(fs as any).existsSync.restore();
		(fs as any).readFileSync.restore();
	});

	it('can run dev mode', () => {
		const config = mockModule.getModuleUnderTest();
		config({ mode: 'dev' });
		assert.isTrue(mockDevConfig.calledOnce);
		assert.isTrue(mockDevConfig.calledWith(rc['build-app']));
	});

	it('can run dist mode', () => {
		const config = mockModule.getModuleUnderTest();
		config();
		assert.isTrue(mockDistConfig.calledOnce);
		assert.isTrue(mockDistConfig.calledWith(rc['build-app']));
	});

	it('can run test mode', () => {
		const config = mockModule.getModuleUnderTest();
		config({ mode: 'test' });
		assert.isTrue(mockTestConfig.calledOnce);
		assert.isTrue(mockTestConfig.calledWith(rc['build-app']));
	});

	it('can read build options from the dojorc', () => {
		let config = mockModule.getModuleUnderTest();
		config();
		assert.isTrue(mockDistConfig.calledWith(rc['build-app']));

		mockDistConfig.reset();
		(fs as any).existsSync.returns(false);
		config();

		assert.isTrue(mockDistConfig.calledWith({}));
	});
});
