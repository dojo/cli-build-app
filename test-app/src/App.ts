import * as css from './app.m.css';

const App = async function() {
	const Foo = await import('./Foo');
	return Foo.default;
};

export default function() {
	console.log(css);
	return App();
}
