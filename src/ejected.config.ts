import * as fs from 'fs';
import * as path from 'path';
import * as webpack from 'webpack';

import devConfigFactory from './dev.config';
import distConfigFactory from './dist.config';
import testConfigFactory from './test.config';

export interface EnvOptions {
	mode?: 'dev' | 'dist' | 'test';
}

const basePath = process.cwd();

function loadRc() {
	const rcPath = path.join(basePath, '.dojorc');
	const rcJson = fs.existsSync(rcPath) && fs.readFileSync(rcPath, 'utf-8');
	let rc: any;
	if (rcJson) {
		rc = JSON.parse(rcJson)['build-app'];
	}
	return rc || {};
}

function webpackConfig(env: EnvOptions = {}): webpack.Configuration {
	const { mode = 'dist' } = env;
	const rc = loadRc();
	let config: webpack.Configuration;
	if (mode === 'dev') {
		config = devConfigFactory(rc);
	} else if (mode === 'test') {
		config = testConfigFactory(rc);
	} else {
		config = distConfigFactory(rc);
	}
	return config;
}

module.exports = webpackConfig;
