import * as css from './app.m.css';

const App = async function() {
	const Foo = await import('./Foo');
	return Foo.default;
};

const Bar = async function() {
	const Bar = await import('./Bar');
	return Bar.default;
};

const Baz = async function() {
	const Baz = await import('./Baz');
	return Baz.default;
};

export default async function() {
	console.log(css);
	const bar = await Bar();
	const baz = await Baz();
	bar();
	baz();
	return App();
}
