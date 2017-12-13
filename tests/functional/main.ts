const { describe, it, after, beforeEach } = intern.getInterface('bdd');
const { assert } = intern.getPlugin('chai');
import * as path from 'path';
import * as fs from 'fs';
import * as rimraf from 'rimraf';
import * as execa from 'execa';
import * as os from 'os';

const appRootDir = path.join(__dirname, '..', '..', '..', 'test-app');

const platform = os.platform().startsWith('win') ? 'windows' : 'unix';

function normalise(value: string) {
	return value
		.split('# sourceMappingURL')[0]
		.replace(/\r\n/g, '\n')
		.replace(/\\r\\n/g, '\\n')
		.replace(/main\.[a-z0-9]+\.bundle/, 'main.[HASH].bundle');
}

function assertOutput(mode: string) {
	const fixtureManifest = require(path.join(appRootDir, 'fixtures', platform, mode, 'manifest'));
	const outputManifest = require(path.join(appRootDir, 'output', mode, 'manifest'));
	const fixtureFileIdentifiers = Object.keys(fixtureManifest);
	const outputFileIdentifiers = Object.keys(outputManifest);
	assert.deepEqual(outputFileIdentifiers, fixtureFileIdentifiers);
	fixtureFileIdentifiers.forEach(id => {
		if (id !== 'runtime.js.map') {
			const fixtureFilePath = path.join(appRootDir, 'fixtures', platform, mode, fixtureManifest[id]);
			const outputFilePath = path.join(appRootDir, 'output', mode, outputManifest[id]);
			const fixtureContents = fs.readFileSync(fixtureFilePath, 'utf8');
			const outputContents = fs.readFileSync(outputFilePath, 'utf8');

			assert.strictEqual(normalise(outputContents), normalise(fixtureContents), id);
		}
	});
}

function clean() {
	rimraf.sync(path.join(appRootDir, 'output'));
	rimraf.sync(path.join(appRootDir, 'src', 'app.m.css.d.ts'));
}

describe('functional build tests', () => {
	beforeEach(() => {
		clean();
	});

	after(() => {
		clean();
	});

	it('correctly builds with dist configuration', () => {
		execa.shellSync('npm run build-dist', { cwd: appRootDir });
		assertOutput('dist');
	});

	it('correctly builds with dev configuration', () => {
		execa.shellSync('npm run build-dev', { cwd: appRootDir });
		assertOutput('dev');
	});

	it('correctly builds with test configuration', () => {
		execa.shellSync('npm run build-test', { cwd: appRootDir });
		assertOutput('test');
	});
});
