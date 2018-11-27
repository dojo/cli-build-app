import has, { add, exists } from '@dojo/framework/has/has';
import global from '@dojo/framework/shim/global';
import '@dojo/framework/shim/Promise';

if (!exists('build-time-render')) {
	add('build-time-render', false, false);
}

if (global.__public_path__) {
	__webpack_public_path__ = window.location.origin + global.__public_path__;
	add('public-path', global.__public_path__, true);
}

var modules = [];

if (!has('dom-intersection-observer')) {
	modules.push(import(/* webpackChunkName: "platform/IntersectionObserver" */ '@dojo/framework/shim/IntersectionObserver'));
}

if (!has('dom-webanimation')) {
	modules.push(import(/* webpackChunkName: "platform/WebAnimations" */ '@dojo/framework/shim/WebAnimations'));
}

if (!has('dom-resize-observer')) {
	modules.push(import(/* webpackChunkName: "platform/ResizeObserver" */ '@dojo/framework/shim/ResizeObserver'));
}

if (!has('dom-pointer-events')) {
	modules.push(import(/* webpackChunkName: "platform/pointerEvents" */ '@dojo/framework/shim/pointerEvents'));
}

Promise.all(modules).then(function () {
	import(/* webpackChunkName: "main" */ __MAIN_ENTRY);
});
