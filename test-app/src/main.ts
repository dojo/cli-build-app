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
	div.classList.add(css.root);
	document.body.appendChild(div);
});
