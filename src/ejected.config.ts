import * as webpack from 'webpack';
import createLiveLogger from '@dojo/webpack-contrib/logger/logger';

import devConfigFactory from './dev.config';
import distConfigFactory from './dist.config';
import unitConfigFactory from './unit.config';
import functionalConfigFactory from './functional.config';

export interface EnvOptions {
	mode?: 'dev' | 'dist' | 'unit' | 'functional';
}

function webpackConfig(env: EnvOptions = {}): webpack.Configuration {
	const { mode = 'dist' } = env;
	const rc = require('./build-options.json');
	let config: webpack.Configuration;
	if (mode === 'dev') {
		config = devConfigFactory(rc);
	} else if (mode === 'unit') {
		config = unitConfigFactory(rc);
	} else if (mode === 'functional') {
		config = functionalConfigFactory(rc);
	} else {
		config = distConfigFactory(rc, createLiveLogger('building'));
	}
	return config;
}

module.exports = webpackConfig;
