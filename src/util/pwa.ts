import { WebAppIcon, WebAppManifest } from '../interfaces';

export interface PwaManifestOptions extends WebAppManifest {
	ios?: boolean;
	icons?: Array<WebAppIcon & { ios?: boolean }>;
}

/**
 * Map the PWA manifest to the necessary format required by the webpack-pwa-manifest plugin.
 */
export function getManifestOptions(manifest: WebAppManifest): PwaManifestOptions {
	const options: PwaManifestOptions = { ...manifest, ios: true };
	if (Array.isArray(manifest.icons)) {
		options.icons = manifest.icons.map(icon => ({ ...icon, ios: true }));
	}
	return options;
}
