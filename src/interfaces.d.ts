import * as webpack from 'webpack';

export interface Output extends webpack.Output {
	path: string;
}

export interface ServiceWorkerOptions {
	[key: string]: any;
	request?: ServiceWorkerRoute[];
}

export interface ServiceWorkerRoute {
	method: string;
	origin?: string | RegExp;
	path: string;
	strategy: 'cacheFirst' | 'cacheOnly' | 'fastest' | 'networkFirst' | 'networkOnly';
}

export interface Module extends webpack.NewModule {
	rules: webpack.NewUseRule[];
}

export interface WebpackConfiguration extends webpack.Configuration {
	plugins: webpack.Plugin[];
	output: Output;
	module: Module;
}

export interface WebAppIcons {
	sizes: string;
	src: string;
	type: string;
}

export interface WebAppManifest {
	background_color?: string;
	description?: string;
	dir?: 'auto' | 'ltr' | 'rtl';
	display?: 'browser' | 'fullscreen' | 'minimal-ui' | 'standalone';
	icons?: WebAppIcons[];
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
