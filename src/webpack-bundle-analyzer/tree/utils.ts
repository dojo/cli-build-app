import * as _ from 'lodash';

const MULTI_MODULE_REGEXP = /^multi /;

export function getModulePathParts(moduleData: any) {
	if (MULTI_MODULE_REGEXP.test(moduleData.identifier)) {
		return [moduleData.identifier];
	}

	const parsedPath = _.last<string>(moduleData.name.split('!'))!
		.split('/')
		.slice(1)
		.map((part) => (part === '~' ? 'node_modules' : part));

	return parsedPath.length ? parsedPath : null;
}
