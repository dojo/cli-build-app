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

	it('correctly builds with dist configuration', () => {
		return command.run(getMockConfiguration() as any, { mode: 'dist' }).then(() => {
			const expectedIndex = fs.readFileSync(path.join(fixturesDir, 'output', 'dist', 'index.html'), 'utf8');
			const actualIndex = fs.readFileSync(path.join(testAppDir, 'output', 'dist', 'index.html'), 'utf8');
			assert.strictEqual(actualIndex, expectedIndex);
			const expectedBundleOne = fs.readFileSync(path.join(fixturesDir, 'output', 'dist', '7f9cc48e2029b083e4d7.bundle.js'), 'utf8');
			const actualBundleOne = fs.readFileSync(path.join(testAppDir, 'output', 'dist', '7f9cc48e2029b083e4d7.bundle.js'), 'utf8');
			assert.strictEqual(actualBundleOne, expectedBundleOne);
			const expectedBundleTwo = fs.readFileSync(path.join(fixturesDir, 'output', 'dist', '43b109ab8dee11c14d11.bundle.js'), 'utf8');
			const actualBundleTwo = fs.readFileSync(path.join(testAppDir, 'output', 'dist', '43b109ab8dee11c14d11.bundle.js'), 'utf8');
			assert.strictEqual(actualBundleTwo, expectedBundleTwo);
			const expectedCss = fs.readFileSync(path.join(fixturesDir, 'output', 'dist', 'dd6bd622ac265356e59ca05bdc9794ad.bundle.css'), 'utf8');
			const actualCss = fs.readFileSync(path.join(testAppDir, 'output', 'dist', 'dd6bd622ac265356e59ca05bdc9794ad.bundle.css'), 'utf8');
			assert.strictEqual(actualCss, expectedCss);
			const expectedCssSourceMap = fs.readFileSync(path.join(fixturesDir, 'output', 'dist', 'dd6bd622ac265356e59ca05bdc9794ad.bundle.css.map'), 'utf8');
			const actualCssSourceMap = fs.readFileSync(path.join(testAppDir, 'output', 'dist', 'dd6bd622ac265356e59ca05bdc9794ad.bundle.css.map'), 'utf8');
			assert.strictEqual(actualCssSourceMap, expectedCssSourceMap);
		});
	});

	// it('correctly builds with test configuration', () => {
	// 	return command.run(getMockConfiguration() as any, { mode: 'test' }).then(() => {
	// 		console.warn('runs');
	// 	});
	// });

});
