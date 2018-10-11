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

export default function logger(stats: any, config: any, runningMessage: string = ''): boolean {
	const assets = stats.assets
		.map((asset: any) => {
			const size = (asset.size / 1000).toFixed(2);
			const assetInfo = `${asset.name} ${chalk.yellow(`(${size}kb)`)}`;
			const contentFilePath = path.join(config.output.path, asset.name);

			if (!fs.existsSync(contentFilePath)) {
				return assetInfo;
			}

			const content = fs.readFileSync(contentFilePath, 'utf-8');
			const compressedSize = (gzipSize.sync(content) / 1000).toFixed(2);
			return `${assetInfo} / ${chalk.blue(`(${compressedSize}kb gz)`)}`;
		})
		.filter((output: string) => output);

	const chunks = stats.chunks.map((chunk: any) => {
		return `${chunk.names[0]}`;
	});

	let errors = '';
	let warnings = '';
	let signOff = chalk.green('The build completed successfully.');

	if (stats.warnings.length) {
		signOff = chalk.yellow('The build completed with warnings.');
		warnings = `
${chalk.yellow('warnings:')}
${chalk.gray(stats.warnings.map((warning: string) => stripAnsi(warning)))}
`;
	}

	if (stats.errors.length) {
		signOff = chalk.red('The build completed with errors.');
		errors = `
${chalk.yellow('errors:')}
${chalk.red(stats.errors.map((error: string) => stripAnsi(error)))}
`;
	}

	if (runningMessage) {
		signOff += `\n\n${runningMessage}`;
	}

	logUpdate(`
${logSymbols.info} cli-build-app: ${version}
${logSymbols.info} typescript: ${typescript.version}
${logSymbols.success} hash: ${stats.hash}
${logSymbols.error} errors: ${stats.errors.length}
${logSymbols.warning} warnings: ${stats.warnings.length}
${errors}${warnings}
${chalk.yellow('chunks:')}
${columns(chunks)}
${chalk.yellow('assets:')}
${columns(assets)}
${chalk.yellow(`output at: ${chalk.cyan(chalk.underline(`file:///${config.output.path}`))}`)}

${signOff}
	`);
	return !!errors;
}
