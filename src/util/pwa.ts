import { WebAppManifest } from '../interfaces';

/**
 * Return an object of HTML meta tag names to values, based on the options specified by the provided
 * manifest options object.
 *
 * @param manifest The PWA manifest options
 * @return The meta tag object
 */
export function getHtmlMetaTags({ icons }: WebAppManifest) {
	const tags: { [key: string]: string } = {
		'mobile-web-app-capable': 'yes',
		'apple-mobile-web-app-capable': 'yes'
	};
	if (Array.isArray(icons)) {
		tags['apple-touch-icon'] = icons[0].src;
	}
	return tags;
}
