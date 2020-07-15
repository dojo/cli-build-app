import * as fs from 'fs';
import * as path from 'path';
import * as logUpdate from 'log-update';
import * as logSymbols from 'log-symbols';
import * as gzipSize from 'gzip-size';
import * as typescript from 'typescript';
import * as jsonFile from 'jsonfile';
import chalk from 'chalk';

const pkgDir = require('pkg-dir');
const columns = require('cli-columns');
const stripAnsi = require('strip-ansi');
const version = jsonFile.readFileSync(path.join(pkgDir.sync(__dirname), 'package.json')).version;

export default function logger(stats: any, config: any, runningMessage: string = '', args: any = {}): boolean {
	const singleConfig = Array.isArray(config) ? config[0] : config;
	const outputPath = singleConfig.output.path;
	const manifestPath = path.join(outputPath, 'manifest.json');
	let assets: undefined | string[];
	let chunks: undefined | string[];
	if (fs.existsSync(manifestPath)) {
		const manifestContent = JSON.parse(fs.readFileSync(path.join(outputPath, 'manifest.json'), 'utf8'));
		assets = Object.keys(manifestContent).map((item) => {
			const assetName = manifestContent[item];
			const filePath = path.join(outputPath, assetName);
			if (fs.existsSync(filePath)) {
				if (args.mode === 'dev' || args.mode === 'test') {
					return `${assetName}`;
				} else {
					const fileStats = fs.statSync(filePath);
					const size = (fileStats.size / 1000).toFixed(2);
					if (/\.(gz|br)$/.test(filePath)) {
						return `${assetName} ${chalk.blue(`(${size}kb)`)}`;
					}
					// Calculate and report size when gzipped
					const content = fs.readFileSync(filePath, 'utf8');
					const compressedSize = (gzipSize.sync(content) / 1000).toFixed(2);
					const assetInfo = `${assetName} ${chalk.yellow(`(${size}kb)`)}`;
					return `${assetInfo} / ${chalk.blue(`(${compressedSize}kb gz)`)}`;
				}
			}
			return '';
		});

		chunks = (Array.isArray(config)
			? stats.children.reduce((chunks: any[], current: any) => [...chunks, ...current.chunks], [])
			: stats.chunks
		).map((chunk: any) => `${chunk.names[0]}`);
	}

	let errors = '';
	let warnings = '';
	let chunkAndAssetLog = '';
	let signOff = chalk.green('The build completed successfully.');

	if (stats.warnings.length) {
		signOff = chalk.yellow('The build completed with warnings.');
		warnings = `
${chalk.yellow('warnings:')}${chalk.gray(
			stats.warnings.reduce((warnings: string, warning: string) => `${warnings}\n${stripAnsi(warning)}`, '')
		)}
`;
	}

	if (stats.errors.length) {
		signOff = chalk.red('The build completed with errors.');
		errors = `
${chalk.yellow('errors:')}${chalk.red(
			stats.errors.reduce((errors: string, error: string) => `${errors}\n${stripAnsi(error)}`, '')
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

	if (assets) {
		chunkAndAssetLog = `${chunkAndAssetLog}
${chalk.yellow('assets:')}
${columns(assets)}`;
	}

	logUpdate(`
${logSymbols.info} cli-build-app: ${version}
${logSymbols.info} typescript: ${typescript.version}
${logSymbols.success} hash: ${stats.hash}
${logSymbols.error} errors: ${stats.errors.length}
${logSymbols.warning} warnings: ${stats.warnings.length}
${errors}${warnings}
${chunkAndAssetLog}
${chalk.yellow(`output at: ${chalk.cyan(chalk.underline(`file:///${outputPath}`))}`)}

${signOff}
	`);
	return !!errors;
}
