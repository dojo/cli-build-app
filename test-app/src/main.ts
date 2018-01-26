import App from './App';
import * as css from './app.m.css';
import has from '@dojo/has/has';
'!has("bar")';
import './Bar';

if (has('foo')) {
	console.log('foo');
}

App().then(result => {
	console.log(result());
	const div = document.createElement('div');
	div.innerHTML = 'hello, world';
	div.classList.add(...css.root.split(' '));
	document.body.appendChild(div);
});
