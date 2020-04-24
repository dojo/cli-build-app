import * as path from 'path';
import * as fs from 'fs';
import * as mkdir from 'mkdirp';
import * as viewer from './viewer';
const bfj = require('bfj');

export interface BundleAnalyzerOptions {
	reportFilename: string;
	generateStatsFile: boolean;
	statsFilename: string;
	statsOptions: string | null;
	analyzerMode: string;
	openAnalyzer: boolean;
	excludeBundles?: string;
}

export default class BundleAnalyzer {
	private opts: BundleAnalyzerOptions;
	private _outputDirectory!: string;
	private _outputPath!: string;
	private _webpackOutputPath!: string;

	constructor(opts: Partial<BundleAnalyzerOptions>) {
		this.opts = {
			reportFilename: 'report.html',
			generateStatsFile: false,
			statsFilename: 'stats.json',
			statsOptions: null,
			analyzerMode: '',
			openAnalyzer: false,
			...opts
		};
	}

	analyze(stats: any, config: any) {
		const singleConfig = Array.isArray(config) ? config[0] : config;
		this._webpackOutputPath = singleConfig.output.path;
		this._outputPath = path.resolve(singleConfig.output.path, this.opts.statsFilename);
		this._outputDirectory = path.dirname(this._outputPath);
		stats = stats.toJson(this.opts.statsOptions);
		stats = this.updateStatsHash(stats);
		if (this.opts.generateStatsFile) {
			this.generateStatsFile(stats);
		}
		return this.generateStaticReport(stats);
	}

	updateStatsHash(stats: any): any {
		try {
			const manifest = JSON.parse(fs.readFileSync(path.join(this._webpackOutputPath, 'manifest.json'), 'utf8'));
			const originalManifest = JSON.parse(
				fs.readFileSync(path.join(this._outputDirectory, 'manifest.original.json'), 'utf8')
			);
			let updatedStats = JSON.stringify(stats);
			Object.keys(manifest).forEach((key) => {
				if (originalManifest[key]) {
					updatedStats = updatedStats.replace(new RegExp(originalManifest[key], 'g'), manifest[key]);
				}
			});
			return JSON.parse(updatedStats);
		} catch (e) {
			return stats;
		}
	}

	async generateStatsFile(stats: any) {
		mkdir.sync(this._outputDirectory);

		try {
			await bfj.write(this._outputPath, stats, {
				promises: 'ignore',
				buffers: 'ignore',
				maps: 'ignore',
				iterables: 'ignore',
				circular: 'ignore'
			});
		} catch {}
	}

	generateStaticReport(stats: any) {
		return viewer.generateReportData(stats, {
			reportFilename: path.resolve(this._webpackOutputPath, this.opts.reportFilename),
			bundleDir: this._webpackOutputPath,
			excludeBundle: this.opts.excludeBundles
		});
	}
}
