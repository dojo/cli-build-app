const { describe, it, after, beforeEach } = intern.getInterface('bdd');
const { assert } = intern.getPlugin('chai');
import * as path from 'path';
import * as fs from 'fs';
import * as rimraf from 'rimraf';
import * as execa from 'execa';
import * as globby from 'globby';

const projectRootDir = path.join(__dirname, '..', '..', '..');

function getPathsToAssert(mode: string) {
	const filePaths: string[] = [];

	[
		...globby.sync(`${projectRootDir}/test-app/output/${mode}/**/*`),
		...globby.sync(`${projectRootDir}/test-app/fixtures/output/${mode}/**/*`)
	].forEach(filePath => {
		const fileName = filePath.match(/\/output\/(.*)/)![0];
		if (filePaths.indexOf(fileName) === -1) {
			filePaths.push(fileName);
		}
	});

	return filePaths;
}

describe('functional build tests', () => {
	beforeEach(() => {
		rimraf.sync(path.join(projectRootDir, 'test-app', 'output'));
		rimraf.sync(path.join(projectRootDir, 'test-app', 'src', 'app.m.css.d.ts'));
	});

	after(() => {
		rimraf.sync(path.join(projectRootDir, 'test-app', 'output'));
		rimraf.sync(path.join(projectRootDir, 'test-app', 'src', 'app.m.css.d.ts'));
	});

	it('correctly builds with dist configuration', () => {
		execa.shellSync('./node_modules/.bin/dojo build --mode dist', { cwd: path.join(projectRootDir, 'test-app') });
		const paths = getPathsToAssert('dist');
		paths.forEach(value => {
			assert.strictEqual(
				fs.readFileSync(path.join(projectRootDir, 'test-app', value), 'utf8'),
				fs.readFileSync(path.join(projectRootDir, 'test-app', 'fixtures', value), 'utf8')
			);
		});
	});

	it('correctly builds with dev configuration', () => {
		execa.shellSync('./node_modules/.bin/dojo build --mode dev', { cwd: path.join(projectRootDir, 'test-app') });
		const paths = getPathsToAssert('dev');
		paths.forEach(value => {
			assert.strictEqual(
				fs.readFileSync(path.join(projectRootDir, 'test-app', value), 'utf8'),
				fs.readFileSync(path.join(projectRootDir, 'test-app', 'fixtures', value), 'utf8')
			);
		});
	});

	it('correctly builds with test configuration', () => {
		execa.shellSync('./node_modules/.bin/dojo build --mode test', { cwd: path.join(projectRootDir, 'test-app') });
		const paths = getPathsToAssert('test');
		paths.forEach(value => {
			assert.strictEqual(
				fs.readFileSync(path.join(projectRootDir, 'test-app', value), 'utf8'),
				fs.readFileSync(path.join(projectRootDir, 'test-app', 'fixtures', value), 'utf8')
			);
		});
	});
});
