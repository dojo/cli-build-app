import App from './App';
import LazyApp from './LazyApp';
import * as css from './app.m.css';
import has from '@dojo/has/has';
'!has("bar")';
import './Bar';

if (has('foo')) {
	console.log('foo');
}

const btr = has('build-time-render');

App().then(result => {
	console.log(result());
});
let div = document.getElementById('div');
if (!div) {
	div = document.createElement('div');
	div.id = 'div';
}
if (btr) {
	div.setAttribute('hasBtr', 'true');
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

const projector = new LazyApp();
projector.append(appRoot);

if (!btr) {
	setTimeout(() => {
		projector.setProperties({ render: true });
	}, 2000);
}
