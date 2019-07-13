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
	const manifestPath = path.join(config.output.path, 'manifest.json');
	let assets: undefined | string[];
	let chunks: undefined | string[];
	if (fs.existsSync(manifestPath)) {
		const manifestContent = JSON.parse(fs.readFileSync(path.join(config.output.path, 'manifest.json'), 'utf8'));
		assets = Object.keys(manifestContent).map((item) => {
			const assetName = manifestContent[item];
			const filePath = path.join(config.output.path, assetName);
			if (fs.existsSync(filePath)) {
				if (args.mode === 'dev' || args.mode === 'test') {
					return `${assetName}`;
				} else {
					const fileStats = fs.statSync(filePath);
					const size = (fileStats.size / 1000).toFixed(2);
					const assetInfo = `${assetName} ${chalk.yellow(`(${size}kb)`)}`;
					const content = fs.readFileSync(filePath, 'utf8');
					const compressedSize = (gzipSize.sync(content) / 1000).toFixed(2);
					return `${assetInfo} / ${chalk.blue(`(${compressedSize}kb gz)`)}`;
				}
			}
			return '';
		});

		chunks = stats.chunks.map((chunk: any) => {
			return `${chunk.names[0]}`;
		});
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
${chalk.yellow(`output at: ${chalk.cyan(chalk.underline(`file:///${config.output.path}`))}`)}

${signOff}
	`);
	return !!errors;
}
