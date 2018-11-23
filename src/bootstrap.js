import has from '@dojo/framework/has/has';
import global from '@dojo/framework/shim/global';

const modules = [];

if (!has('dom-intersection-observer')) {
	modules.push(import(/* webpackChunkName: "IntersectionObserver" */ 'intersection-observer'));
}

if (!has('dom-webanimation')) {
	modules.push(import(/* webpackChunkName: "WebAnimations" */ 'web-animations-js/web-animations-next-lite.min'));
}

if (!has('dom-resize-observer')) {
	const resizePromise = import(/* webpackChunkName: "ResizeObserver" */ 'resize-observer-polyfill').then((module) => {
		global.ResizeObserver = module.default;
	});
	modules.push(resizePromise);
}

Promise.all(modules).then(() => {
	import(/* webpackChunkName: "main" */ __MAIN_ENTRY);
});
