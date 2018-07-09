import * as webpack from 'webpack';

export interface Output extends webpack.Output {
	path: string;
}

export interface Module extends webpack.NewModule {
	rules: webpack.NewUseRule[];
}

export interface ServiceWorkerOptions {
	importScripts?: string[];
	routes?: ServiceWorkerRoute[];
	precache?: ServiceWorkerPrecacheOptions;
}

export interface ServiceWorkerPrecacheOptions {
	prefix?: string;
	clientsClaim?: boolean;
	index?: string;
	baseDir?: string;
	follow?: boolean;
	ignore?: string[];
	patterns?: string | string[];
	maxCacheSize?: number;
	skipWaiting?: boolean;
	strict?: boolean;
}

export interface ServiceWorkerRoute {
	urlPattern: string;
	strategy: ServiceWorkerStrategy;
	options?: ServiceWorkerRouteOptions;
}

export interface ServiceWorkerRouteOptions {
	broadcastUpdate?: {
		channelName: string;
		options: { headersToCheck?: string[]; source?: string };
	};
	cacheName?: string;
	cacheableResponse?: { statuses?: number[]; headers?: { [key: string]: string } };
	expiration?: { maxEntries?: number; maxAgeSeconds?: number };
	networkTimeoutSeconds?: number;
}

export type ServiceWorkerStrategy =
	| 'cacheFirst'
	| 'cacheOnly'
	| 'networkFirst'
	| 'networkOnly'
	| 'staleWhileRevalidate';

export interface WebpackConfiguration extends webpack.Configuration {
	plugins: webpack.Plugin[];
	output: Output;
	module: Module;
}

export interface WebAppIcon {
	sizes: string;
	src: string;
	type?: string;
}

export interface WebAppManifest {
	background_color?: string;
	description?: string;
	dir?: 'auto' | 'ltr' | 'rtl';
	display?: 'browser' | 'fullscreen' | 'minimal-ui' | 'standalone';
	icons?: WebAppIcon[];
	lang?: string;
	name?: string;
	orientation?:
		| 'any'
		| 'landscape'
		| 'landscape-primary'
		| 'landscape-secondary'
		| 'natural'
		| 'portrait'
		| 'portrait-primary'
		| 'portrait-secondary';
	prefer_related_applications?: boolean;
	related_applications?: WebAppRelatedApplications[];
	scope?: string;
	short_name?: string;
	start_url?: string;
	theme_color?: string;
}

export interface WebAppRelatedApplications {
	platform: string;
	url?: string;
	id?: string;
}
