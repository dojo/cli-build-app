const { describe, it } = intern.getInterface('bdd');
const { assert } = intern.getPlugin('chai');

import { getManifestOptions } from '../../../src/util/pwa';

describe('util/pwa', () => {
	describe('getManifestOptions', () => {
		it('should add the `ios` flag to the manifest and any icons', () => {
			assert.deepEqual(getManifestOptions({}), { ios: true });
			assert.deepEqual(
				getManifestOptions({
					icons: [{ src: 'path/to/icon.svg', sizes: '48x48' }]
				}),
				{
					ios: true,
					icons: [{ src: 'path/to/icon.svg', sizes: '48x48', ios: true }]
				}
			);
		});
	});
});
