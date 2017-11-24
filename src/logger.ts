import * as fs from 'fs';
import * as path from 'path';

const pkgDir = require('pkg-dir');
const logUpdate = require('log-update');
const columns = require('cli-columns');
const chalk = require('chalk');
const logSymbols = require('log-symbols');
const gzipSize = require('gzip-size');
const stripAnsi = require('strip-ansi');
const typescript = require('typescript');
const version = require(path.join(pkgDir.sync(), 'package.json')).version;

export default function logger(stats: any, config: any) {
	const assets = stats.assets
		.map((asset: any) => {
			const size = (asset.size / 1000).toFixed(2);
			const content = fs.readFileSync(config.output.path + '/' + asset.name, 'utf-8');
			const compressedSize = (gzipSize.sync(content) / 1000).toFixed(2);
			return `${asset.name} ${chalk.yellow(`(${size}kb)`)} / ${chalk.blue(`(${compressedSize}kb gz)`)}`;
		})
		.filter((output: string) => output);

	const chunks = stats.chunks.map((chunk: any) => {
		return `${chunk.names[0]}`;
	});

	let errors = '';
	let warnings = '';

	if (stats.errors.length) {
		errors =  `
${chalk.yellow('errors:')}
${chalk.red(stats.errors.map((error: string) => stripAnsi(error)))}
`;
	}

	if (stats.warnings.length) {
		warnings = `
${chalk.yellow('warnings:')}
${chalk.gray(stats.warnings.map((warning: string) => stripAnsi(warning)))}
`;
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
	`);
}
