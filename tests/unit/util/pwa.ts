const { describe, it } = intern.getInterface('bdd');
const { assert } = intern.getPlugin('chai');
import { getHtmlMetaTags } from '../../../src/util/pwa';

describe('util/pwa', () => {
	describe('getHtmlMetaTags', () => {
		it('should return an object of PWA-specific meta tags', () => {
			assert.deepEqual(getHtmlMetaTags({}), {
				'mobile-web-app-capable': 'yes',
				'apple-mobile-web-app-capable': 'yes'
			});

			const src = 'path/to/icon.svg';
			assert.deepEqual(
				getHtmlMetaTags({
					icons: [{ src } as any]
				}),
				{
					'mobile-web-app-capable': 'yes',
					'apple-mobile-web-app-capable': 'yes',
					'apple-touch-icon': src
				}
			);
		});
	});
});
