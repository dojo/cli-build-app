import * as css from './app.m.css';

const App = async function() {
	const Foo = await import('./Foo');
	return Foo.default;
};

App().then(result => {
	console.log(result());
	console.log(css);
});
