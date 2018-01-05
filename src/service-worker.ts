import { ServiceWorkerRoute } from './interfaces';
const toolbox = require('sw-toolbox');

declare const SW_ROUTES: ServiceWorkerRoute[];

const routes = SW_ROUTES || [];
const strategies = {
	cacheFirst: toolbox.cacheFirst,
	cacheOnly: toolbox.cacheOnly,
	fastest: toolbox.fastest,
	networkFirst: toolbox.networkFirst,
	networkOnly: toolbox.networkOnly
};

routes.forEach(({ method, path, strategy, origin }) => {
	const options: any = {};
	if (origin) {
		options.origin = origin;
	}
	toolbox.router[method](path, strategies[strategy], options);
});
