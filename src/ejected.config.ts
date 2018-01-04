import * as webpack from 'webpack';

import devConfigFactory from './dev.config';
import distConfigFactory from './dist.config';
import testConfigFactory from './test.config';

export interface EnvOptions {
	mode?: 'dev' | 'dist' | 'test';
}

function webpackConfig(env: EnvOptions = {}): webpack.Configuration {
	const { mode = 'dist' } = env;
	const rc = require('./build-options.json');
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
