const { describe, it, beforeEach, afterEach } = intern.getInterface('bdd');
const { assert } = intern.getPlugin('chai');
import * as path from 'path';

import MockModule from '../../support/MockModule';

const key = 'build-app';
const rc = { [key]: { bundles: {} } };
let mockModule: MockModule;

describe('util/eject', () => {
	beforeEach(() => {
		mockModule = new MockModule('../../../src/util/eject', require);
		mockModule.dependencies(['fs']);
		mockModule.getMock('fs').existsSync.returns(true);
		mockModule.getMock('fs').mkdtempSync.returns('/tmp');
		mockModule.getMock('fs').readFileSync.returns(JSON.stringify(rc));
	});

	afterEach(() => {
		mockModule.destroy();
	});

	describe('moveBuildOptions', () => {
		it('should move the build options to a new file', () => {
			const fs = mockModule.getMock('fs');
			const { moveBuildOptions } = mockModule.getModuleUnderTest();
			const buildOptions = JSON.stringify(rc[key]);

			moveBuildOptions(key);

			assert.isTrue(fs.writeFileSync.calledWith(path.join('/tmp', 'build-options.json'), buildOptions));
			assert.isTrue(fs.writeFileSync.calledWith(path.join(process.cwd(), '.dojorc'), JSON.stringify({ [key]: {} })));
		});

		it('should default to an empty object when the key is missing from the rc', () => {
			const fs = mockModule.getMock('fs');
			const { moveBuildOptions } = mockModule.getModuleUnderTest();
			const buildOptions = JSON.stringify({});

			fs.readFileSync.returns(buildOptions);
			moveBuildOptions(key);

			assert.isTrue(fs.writeFileSync.calledWith(path.join('/tmp', 'build-options.json'), buildOptions));
			assert.isTrue(fs.writeFileSync.calledWith(path.join(process.cwd(), '.dojorc')));
		});

		it('should always write a config even without a dojorc', () => {
			const fs = mockModule.getMock('fs');
			const { moveBuildOptions } = mockModule.getModuleUnderTest();
			const buildOptions = JSON.stringify({});

			fs.existsSync.returns(false);
			moveBuildOptions(key);

			assert.isTrue(fs.writeFileSync.calledWith(path.join('/tmp', 'build-options.json'), buildOptions));
			assert.isFalse(fs.writeFileSync.calledWith(path.join(process.cwd(), '.dojorc')));
		});
	});
});
