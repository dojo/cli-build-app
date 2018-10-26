import has from '@dojo/framework/has/has';
import renderer from '@dojo/framework/widget-core/vdom';
import { w } from '@dojo/framework/widget-core/d';
import Registry from '@dojo/framework/widget-core/Registry';
import { registerRouterInjector } from '@dojo/framework/routing/RouterInjector';
import App from './App';
import * as css from './app.m.css';
import './Bar';
import LazyApp from './LazyApp';
import routes from './routes';
import myTheme from './themes/test-app/theme';

console.log(myTheme);

'!has("bar")';

if (has('foo')) {
	console.log('foo');
}

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
	div.setAttribute('hasBtr', 'true');
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
const root = document.getElementById('app');
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
