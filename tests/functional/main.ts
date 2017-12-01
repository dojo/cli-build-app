const { describe, it, after, beforeEach } = intern.getInterface('bdd');
const { assert } = intern.getPlugin('chai');
import * as path from 'path';
import * as fs from 'fs';
import * as rimraf from 'rimraf';
import * as execa from 'execa';
import * as globby from 'globby';
const normalise = require('normalize-newline');

const appRootDir = path.join(__dirname, '..', '..', '..', 'test-app');

function assertOutput(mode: string, stripSourceMaps: boolean = false) {
	const fixtureManifest = require(path.join(appRootDir, 'fixtures', 'output', mode, 'manifest'));
	const outputManifest = require(path.join(appRootDir, 'output', mode, 'manifest'));
	const fixtureFileIdentifiers = Object.keys(fixtureManifest);
	const outputFileIdentifiers = Object.keys(outputManifest);
	assert.deepEqual(outputFileIdentifiers, fixtureFileIdentifiers);
	fixtureFileIdentifiers.forEach(id => {
		if (id !== 'runtime.js.map') {
			const fixtureFilePath = path.join(appRootDir, 'fixtures', 'output', mode, fixtureManifest[id]);
			const outputFilePath = path.join(appRootDir, 'output', mode, outputManifest[id]);
			let fixtureContents = fs.readFileSync(fixtureFilePath, 'utf8');
			let outputContents = fs.readFileSync(outputFilePath, 'utf8');

			if (stripSourceMaps || id === 'runtime.js') {
				fixtureContents = fixtureContents.split('//# sourceMappingURL')[0];
				outputContents = outputContents.split('//# sourceMappingURL')[0];
			}

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
		execa.shellSync('./node_modules/.bin/dojo build --mode dist', { cwd: appRootDir });
		assertOutput('dist');
	});

	it('correctly builds with dev configuration', () => {
		execa.shellSync('./node_modules/.bin/dojo build --mode dev', { cwd: appRootDir });
		assertOutput('dev');
	});

	it('correctly builds with test configuration', () => {
		execa.shellSync('./node_modules/.bin/dojo build --mode test', { cwd: appRootDir });
		assertOutput('test', true);
	});
});
