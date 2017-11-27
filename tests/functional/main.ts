const { describe, it, after } = intern.getInterface('bdd');
const { assert } = intern.getPlugin('chai');
import * as path from 'path';
import command from './../../src/main';
import * as fs from 'fs';

function getMockConfiguration(config?: any) {
	return {
		configuration: {
			get() { return {}; }
		}
	};
}

const projectRootDir = path.join(__dirname, '..', '..', '..');
const fixturesDir = path.join(projectRootDir,  'tests', 'fixtures');
const testAppDir = path.join(projectRootDir,  'tests', 'test-app');

describe('functional build tests', () => {

	after(() => {
		process.chdir(projectRootDir);
	});

	it('correctly builds with dev configuration', () => {
		return command.run(getMockConfiguration() as any, { mode: 'dev' }).then(() => {
			const expectedIndex = fs.readFileSync(path.join(fixturesDir, 'output', 'dev', 'index.html'), 'utf8');
			const actualIndex = fs.readFileSync(path.join(testAppDir, 'output', 'dev', 'index.html'), 'utf8');
			assert.strictEqual(actualIndex, expectedIndex);
			const expectedMain = fs.readFileSync(path.join(fixturesDir, 'output', 'dev', 'src', 'main.js'), 'utf8');
			const actualMain = fs.readFileSync(path.join(testAppDir, 'output', 'dev', 'src', 'main.js'), 'utf8');
			assert.strictEqual(actualMain, expectedMain);
			const expectedFoo = fs.readFileSync(path.join(fixturesDir, 'output', 'dev', 'src', 'Foo.js'), 'utf8');
			const actualFoo = fs.readFileSync(path.join(testAppDir, 'output', 'dev', 'src', 'Foo.js'), 'utf8');
			assert.strictEqual(actualFoo, expectedFoo);
		});
	});

	// it('correctly builds with dist configuration', () => {
	// 	return command.run(getMockConfiguration() as any, { mode: 'dist' }).then(() => {
	// 		console.warn('runs');
	// 	});
	// });

	// it('correctly builds with test configuration', () => {
	// 	return command.run(getMockConfiguration() as any, { mode: 'test' }).then(() => {
	// 		console.warn('runs');
	// 	});
	// });

});
