import * as path from 'path';
import * as logUpdate from 'log-update';
import * as logSymbols from 'log-symbols';
import * as typescript from 'typescript';
import * as jsonFile from 'jsonfile';
import BundleAnalyzer from './webpack-bundle-analyzer/BundleAnalyzer';
import chalk from 'chalk';
import { findLargestGroup } from './webpack-bundle-analyzer/parseUtils';

const pkgDir = require('pkg-dir');
const columns = require('cli-columns');
const stripAnsi = require('strip-ansi');
const version = jsonFile.readFileSync(path.join(pkgDir.sync(__dirname), 'package.json')).version;

export default function logger(stats: any, config: any, runningMessage: string = '', args: any = {}): boolean {
	const singleConfig = Array.isArray(config) ? config[0] : config;
	const outputPath = singleConfig.output.path;
	const loggerStats = stats.toJson({ warningsFilter });
	let chunks: undefined | string[];

	let chunkMap: { [chunk: string]: any };
	if (args.mode === 'dist') {
		chunkMap = new BundleAnalyzer({
			analyzerMode: 'static',
			openAnalyzer: false,
			generateStatsFile: true,
			reportFilename: '../info/report.html',
			statsFilename: '../info/stats.json'
		}).analyze(stats, config);
	}
	chunks = (Array.isArray(config)
		? loggerStats.children.reduce((chunks: any[], current: any) => [...chunks, ...current.chunks], [])
		: loggerStats.chunks
	).map((chunk: any) => {
		const chunkName: string = chunk.names[0];
		if (!chunkMap) {
			return chunkName;
		} else {
			const chunkStats = chunkMap[chunkName];
			const size = chunkStats && (chunkStats.parsedSize || chunkStats.statSize);
			const gzipSize = chunkStats && chunkStats.gzipSize;

			const chunkInfo = `${chunkName} ${chalk.yellow(`(${size}kb)`)}${
				gzipSize ? `/ ${chalk.blue(`(${gzipSize}kb gz)`)}` : ''
			}`;

			if (size > 1000) {
				const largestGroup = findLargestGroup(chunkStats, 'node_modules');
				if (largestGroup) {
					return `${chunkInfo}\nDependency: ${largestGroup.label} is ${largestGroup.statSize}kb`;
				}
			}
			return chunkInfo;
		}
	});

	let errors = '';
	let warnings = '';
	let chunkAndAssetLog = '';
	let signOff = chalk.green('The build completed successfully.');

	if (loggerStats.warnings.length) {
		signOff = chalk.yellow('The build completed with warnings.');
		warnings = `
${chalk.yellow('warnings:')}${chalk.gray(
			loggerStats.warnings.reduce((warnings: string, warning: string) => `${warnings}\n${stripAnsi(warning)}`, '')
		)}
`;
	}

	if (loggerStats.errors.length) {
		signOff = chalk.red('The build completed with errors.');
		errors = `
${chalk.yellow('errors:')}${chalk.red(
			loggerStats.errors.reduce((errors: string, error: string) => `${errors}\n${stripAnsi(error)}`, '')
		)}
`;
	}

	if (runningMessage) {
		signOff += `\n\n${runningMessage}`;
	}

	if (chunks) {
		chunkAndAssetLog = `${chalk.yellow('chunks:')}
${columns(chunks)}`;
	}

	logUpdate(`
${logSymbols.info} cli-build-app: ${version}
${logSymbols.info} typescript: ${typescript.version}
${logSymbols.success} hash: ${loggerStats.hash}
${logSymbols.error} errors: ${loggerStats.errors.length}
${logSymbols.warning} warnings: ${loggerStats.warnings.length}
${errors}${warnings}
${chunkAndAssetLog}
${chalk.yellow(`output at: ${chalk.cyan(chalk.underline(`file:///${outputPath}`))}`)}

${signOff}
	`);
	return !!errors;
}

function warningsFilter(warning: string) {
	return warning.includes('[mini-css-extract-plugin]\nConflicting order between');
}
