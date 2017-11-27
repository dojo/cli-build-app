const { describe, it } = intern.getInterface('bdd');
const { assert } = intern.getPlugin('chai');
import foo from '../../src/Foo';

describe('unit test', () => {
	it('my unit test', () => {
		assert.strictEqual(foo(), 'foo');
	});
});
