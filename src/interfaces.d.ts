import * as webpack from 'webpack';

export interface Output extends webpack.Output {
	path: string;
}
export interface Module extends webpack.NewModule {
	rules: webpack.NewUseRule[];
}

export interface WebpackConfiguration extends webpack.Configuration {
	plugins: webpack.Plugin[];
	output: Output;
	module: Module;
}
