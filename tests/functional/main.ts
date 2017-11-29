const { describe, it, after, beforeEach } = intern.getInterface('bdd');
const { assert } = intern.getPlugin('chai');
import * as path from 'path';
import * as fs from 'fs';
import * as rimraf from 'rimraf';
import * as execa from 'execa';
import * as globby from 'globby';
const normalise = require('normalize-newline');

const projectRootDir = path.join(__dirname, '..', '..', '..');

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
		const fixtureManifest = require(path.join(projectRootDir, 'test-app', 'fixtures', 'output', 'dist', 'manifest'));
		const outputManifest = require(path.join(projectRootDir, 'test-app', 'output', 'dist', 'manifest'));
		const fixtureFileIdentifiers = Object.keys(fixtureManifest);
		const outputFileIdentifiers = Object.keys(outputManifest);
		assert.deepEqual(outputFileIdentifiers, fixtureFileIdentifiers);
		fixtureFileIdentifiers.forEach(id => {
			if (id !== 'runtime.js') {
				const fixtureContents = fs.readFileSync(
					path.join(projectRootDir, 'test-app', 'fixtures', 'output', 'dist', fixtureManifest[id]),
					'utf8'
				);
				const outputContents = fs.readFileSync(
					path.join(projectRootDir, 'test-app', 'output', 'dist', outputManifest[id]),
					'utf8'
				);

				const fixtureContentSections = fixtureContents.split('//# sourceMappingURL');
				const outputContentSections = outputContents.split('//# sourceMappingURL');

				assert.strictEqual(normalise(fixtureContentSections[0]), normalise(outputContentSections[0]), id);
				// assert.strictEqual(normalise(fixtureContents), normalise(outputContents), id);
			}
		});
	});

	it('correctly builds with dev configuration', () => {
		execa.shellSync('./node_modules/.bin/dojo build --mode dev', { cwd: path.join(projectRootDir, 'test-app') });
		const fixtureManifest = require(path.join(projectRootDir, 'test-app', 'fixtures', 'output', 'dev', 'manifest'));
		const outputManifest = require(path.join(projectRootDir, 'test-app', 'output', 'dev', 'manifest'));
		const fixtureFileIdentifiers = Object.keys(fixtureManifest);
		const outputFileIdentifiers = Object.keys(outputManifest);
		assert.deepEqual(outputFileIdentifiers, fixtureFileIdentifiers);
		fixtureFileIdentifiers.forEach(id => {
			if (id !== 'runtime.js') {
				const fixtureContents = fs.readFileSync(
					path.join(projectRootDir, 'test-app', 'fixtures', 'output', 'dev', fixtureManifest[id]),
					'utf8'
				);
				const outputContents = fs.readFileSync(
					path.join(projectRootDir, 'test-app', 'output', 'dev', outputManifest[id]),
					'utf8'
				);

				const fixtureContentSections = fixtureContents.split('//# sourceMappingURL');
				const outputContentSections = outputContents.split('//# sourceMappingURL');

				assert.strictEqual(normalise(fixtureContentSections[0]), normalise(outputContentSections[0]), id);
				// assert.strictEqual(normalise(fixtureContents), normalise(outputContents), id);
			}
		});
	});

	it('correctly builds with test configuration', () => {
		execa.shellSync('./node_modules/.bin/dojo build --mode test', { cwd: path.join(projectRootDir, 'test-app') });
		const fixtureManifest = require(path.join(projectRootDir, 'test-app', 'fixtures', 'output', 'test', 'manifest'));
		const outputManifest = require(path.join(projectRootDir, 'test-app', 'output', 'test', 'manifest'));
		const fixtureFileIdentifiers = Object.keys(fixtureManifest);
		const outputFileIdentifiers = Object.keys(outputManifest);
		assert.deepEqual(outputFileIdentifiers, fixtureFileIdentifiers);
		fixtureFileIdentifiers.forEach(id => {
			if (id !== 'runtime.js') {
				const fixtureContents = fs.readFileSync(
					path.join(projectRootDir, 'test-app', 'fixtures', 'output', 'test', fixtureManifest[id]),
					'utf8'
				);
				const outputContents = fs.readFileSync(
					path.join(projectRootDir, 'test-app', 'output', 'test', outputManifest[id]),
					'utf8'
				);

				const fixtureContentSections = fixtureContents.split('//# sourceMappingURL');
				const outputContentSections = outputContents.split('//# sourceMappingURL');

				assert.strictEqual(normalise(fixtureContentSections[0]), normalise(outputContentSections[0]), id);
				// assert.strictEqual(normalise(fixtureContents), normalise(outputContents), id);
			}
		});
	});
});
