import App from './App';
import * as css from './app.m.css';

App().then((result) => {
	console.log(result());
	const div = document.createElement('div');
	div.classList.add(css.root);
	document.body.appendChild(div);
});

