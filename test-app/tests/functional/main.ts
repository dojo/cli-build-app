const { describe, it } = intern.getInterface('bdd');
const { assert } = intern.getPlugin('chai');
import App from '../../src/App';

describe('functional test', () => {
	it('my functional test', () => {
		return App().then((foo) => {
			assert.strictEqual(foo(), 'foo');
		});
	});
});
