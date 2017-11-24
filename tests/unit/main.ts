const { registerSuite } = intern.getInterface('object');
const { assert } = intern.getPlugin('chai');

import command from '../../src/main';

registerSuite('main', {
	'validate api'() {
		assert.isOk(command);
	}
});
