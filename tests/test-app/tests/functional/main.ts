const { describe, it } = intern.getInterface('bdd');
const { assert } = intern.getPlugin('chai');
import foo from '../../src/Foo';

describe('functional test', () => {
	it('my functional test', () => {
		assert.strictEqual(foo(), 'foo');
	});
});
