import has, { add } from '@dojo/framework/core/has';
import renderer, { w } from '@dojo/framework/core/vdom';
import Registry from '@dojo/framework/core/Registry';
import { registerRouterInjector } from '@dojo/framework/routing/RouterInjector';
import App from './App';
import * as css from './app.m.css';
import './Bar';
import LazyApp from './LazyApp';
import routes from './routes';
import test from './test.block';

'!has("bar")';

if (has('foo')) {
	console.log('foo');
}

add('foo', () => false);
add('bar', () => false);

const root = document.getElementById('app');

const btr = has('build-time-render');

App().then((result) => {
	console.log(result());
	console.log(require('foo/bar'));
});
let div = document.getElementById('div');
if (!div) {
	div = document.createElement('div');
	div.id = 'div';
}
if (btr) {
	test('./src/foo.txt').then((result: string) => {
		const nodeBtr = document.createElement('div');
		nodeBtr.id = 'nodeBtr';
		nodeBtr.innerHTML = result;
		root!.appendChild(nodeBtr);
	});
	div.setAttribute('hasBtr', 'true');
} else {
	const nodeBtrCache = document.createElement('div');
	nodeBtrCache.id = 'nodeBtrCache';
	test('./src/foo.txt').then((result: string) => {
		nodeBtrCache.innerHTML = result;
	});
	root!.appendChild(nodeBtrCache);
}

if (process.env.NODE_ENV === 'production') {
	div.setAttribute('nodeenv', 'production');
}

if (has('dojo-debug')) {
	div.setAttribute('dojo-debug', 'true');
}

if (has('env') === 'prod') {
	div.setAttribute('has-prod', 'prod');
}

if (has('env') === 'ci') {
	div.setAttribute('has-ci', 'ci');
}

div.textContent = `Built with Build Time Render: ${!!div.getAttribute('hasBtr')}
Currently Rendered by BTR: ${has('build-time-render')}`;

div.classList.add(...css.root.split(' '));
if (div.parentNode === null) {
	root!.appendChild(div);
}

const appRoot = document.getElementById('app-root')!;
console.log(appRoot);

const registry = new Registry();
const router = registerRouterInjector(routes, registry);

if (!btr) {
	router.setPath('/foo/bar');
}

const r = renderer(() => w(LazyApp, {}));
r.mount({ domNode: appRoot, registry });
