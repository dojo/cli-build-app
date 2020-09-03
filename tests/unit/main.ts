const { describe, it, beforeEach, afterEach } = intern.getInterface('bdd');
const { assert } = intern.getPlugin('chai');
import { join } from 'path';
import { SinonStub, stub } from 'sinon';
import chalk from 'chalk';
import MockModule from '../support/MockModule';
import { readFileSync, existsSync } from 'fs';
import Ajv = require('ajv');
import { Helper } from '@dojo/cli/interfaces';

let mockModule: MockModule;
let mockLogger: any;
let mockSpinner: any;
let mockDevConfig: any;
let mockDistConfig: any;
let mockUnitTestConfig: any;
let mockFunctionalTestConfig: any;
let mockElectronTestConfig: any;
let compiler: any;
let isError: boolean;
let stats: any;
let consoleStub: any;
let consoleWarnStub: any;
let doneHookStub: SinonStub;
let invalidHookStub: SinonStub;
let runStub: SinonStub;
let watchStub: SinonStub;
let exitStub: SinonStub;

function getMockHelper(config: any = {}): Partial<Helper> {
	return {
		configuration: {
			get() {
				return { ...config };
			},
			set() {
				return {};
			}
		},
		validation: {
			validate: () => Promise.resolve(true)
		}
	};
}

describe('command', () => {
	beforeEach(() => {
		exitStub = stub(process, 'exit');
		isError = false;
		stats = {
			toJson: stub().returns('stats')
		};
		mockModule = new MockModule('../../src/main', require);
		mockModule.dependencies([
			'./dev.config',
			'./dist.config',
			'./functional.config',
			'./electron.config',
			'./logger',
			'./unit.config',
			'connect-history-api-fallback',
			'express',
			'express-static-gzip',
			'http-proxy-middleware',
			'https',
			'log-update',
			'ora',
			'webpack',
			'webpack-dev-middleware',
			'webpack-hot-middleware',
			'webpack-mild-compile',
			'@dojo/webpack-contrib/build-time-render/BuildTimeRenderMiddleware'
		]);
		invalidHookStub = stub().callsFake((name: string, callback: Function) => callback());
		doneHookStub = stub().callsFake((name: string, callback: Function) => callback(stats));
		runStub = stub().callsFake((callback: Function) => {
			callback(isError, stats);
		});
		watchStub = stub().callsFake((options: any, callback: Function) => {
			callback(isError, stats);
		});
		mockSpinner = {
			start: stub().returnsThis(),
			stop: stub().returnsThis()
		};
		mockModule.getMock('ora').ctor.returns(mockSpinner);
		compiler = {
			hooks: {
				done: { tap: doneHookStub },
				invalid: { tap: invalidHookStub }
			},
			run: runStub,
			watch: watchStub
		};
		mockModule.getMock('webpack').ctor.returns(compiler);
		mockDevConfig = mockModule.getMock('./dev.config').default;
		mockDistConfig = mockModule.getMock('./dist.config').default;
		mockUnitTestConfig = mockModule.getMock('./unit.config').default;
		mockFunctionalTestConfig = mockModule.getMock('./functional.config').default;
		mockElectronTestConfig = mockModule.getMock('./electron.config').default;
		mockDevConfig.returns('dev config');
		mockDistConfig.returns('dist config');
		mockUnitTestConfig.returns('unit config');
		mockFunctionalTestConfig.returns('functional config');
		mockElectronTestConfig.returns('electron config');
		mockLogger = mockModule.getMock('./logger').default;
		consoleWarnStub = stub(console, 'warn');
		consoleStub = stub(console, 'log');
	});

	afterEach(() => {
		mockModule.destroy();
		consoleStub.restore();
		consoleWarnStub.restore();
		exitStub.restore();
	});

	it('registers the command options', () => {
		const main = mockModule.getModuleUnderTest().default;
		const optionsStub = stub();
		main.register(optionsStub);
		assert.isTrue(
			optionsStub.calledWith('mode', {
				describe: 'the output mode',
				alias: 'm',
				default: 'dist',
				choices: ['dist', 'dev', 'test', 'unit', 'functional']
			})
		);
	});

	it('can run dev mode', () => {
		const main = mockModule.getModuleUnderTest().default;
		main.run(getMockHelper(), { mode: 'dev' }).then(() => {
			assert.isTrue(mockDevConfig.called);
			assert.isTrue(mockLogger.calledWith('stats', ['dev config']));
		});
	});

	it('can run dist mode', () => {
		const main = mockModule.getModuleUnderTest().default;
		return main.run(getMockHelper(), { mode: 'dist' }).then(() => {
			assert.isTrue(mockDistConfig.called);
			assert.isTrue(mockLogger.calledWith('stats', ['dist config']));
		});
	});

	it('can run unit mode', () => {
		const main = mockModule.getModuleUnderTest().default;
		return main.run(getMockHelper(), { mode: 'unit' }).then(() => {
			assert.isTrue(mockUnitTestConfig.called);
			assert.isTrue(mockLogger.calledWith('stats', ['unit config']));
		});
	});

	it('can run functional mode', () => {
		const main = mockModule.getModuleUnderTest().default;
		return main.run(getMockHelper(), { mode: 'functional' }).then(() => {
			assert.isTrue(mockFunctionalTestConfig.called);
			assert.isTrue(mockLogger.calledWith('stats', ['functional config']));
		});
	});

	it('can run electron target', () => {
		const main = mockModule.getModuleUnderTest().default;
		return main.run(getMockHelper(), { target: 'electron' }).then(() => {
			assert.isTrue(mockDistConfig.called);
			assert.isTrue(mockElectronTestConfig.called);
			assert.isTrue(mockLogger.calledWith('stats', ['dist config', 'electron config']));
		});
	});

	it('falls back to unit mode and logs a warning when deprecated test mode is used', () => {
		const main = mockModule.getModuleUnderTest().default;
		return main.run(getMockHelper(), { mode: 'test' }).then(() => {
			assert.isTrue(mockUnitTestConfig.called);
			assert.isTrue(mockLogger.calledWith('stats', ['unit config']));
			assert.isTrue(consoleWarnStub.calledOnce);
			assert.isTrue(
				consoleWarnStub.calledWith(
					'Using `--mode=test` is deprecated and has only built the unit test bundle. This mode will be removed in the next major release, please use `unit` or `functional` explicitly instead.'
				)
			);
		});
	});

	it('logger not called if stats are not returned', () => {
		stats = null;
		const main = mockModule.getModuleUnderTest().default;
		return main.run(getMockHelper(), { mode: 'unit' }).then(() => {
			assert.isTrue(mockUnitTestConfig.called);
			assert.isTrue(mockLogger.notCalled);
		});
	});

	it('filters CSS module order warnings from the logger', () => {
		const main = mockModule.getModuleUnderTest().default;
		return main.run(getMockHelper(), { mode: 'unit' }).then(() => {
			const [{ warningsFilter }] = stats.toJson.firstCall.args;
			assert.isTrue(warningsFilter('[mini-css-extract-plugin]\nConflicting order between'));
			assert.isFalse(warningsFilter('[mini-css-extract-plugin]'));
			assert.isFalse(warningsFilter(''));
			assert.isFalse(warningsFilter('some other warning'));
		});
	});

	it('rejects if an error occurs', () => {
		isError = true;
		const main = mockModule.getModuleUnderTest().default;
		return main.run(getMockHelper(), { mode: 'test' }).then(
			() => {
				throw new Error();
			},
			(e: Error) => {
				assert.isTrue(e);
			}
		);
	});

	it('console.log is silenced during run', () => {
		const main = mockModule.getModuleUnderTest().default;
		return main.run(getMockHelper(), {}).then(() => {
			console.log('called');
			assert.isTrue(consoleStub.notCalled);
		});
	});

	it('shows a building spinner on start', () => {
		const main = mockModule.getModuleUnderTest().default;
		return main.run(getMockHelper(), {}).then(() => {
			assert.isTrue(mockModule.getMock('ora').ctor.calledWith('building'));
			assert.isTrue(mockSpinner.start.called);
			assert.isTrue(mockSpinner.stop.called);
		});
	});

	describe('watch option', () => {
		it('automatically rebuilds after file changes', function() {
			const dfd = this.async();
			const main = mockModule.getModuleUnderTest().default;
			main.run(getMockHelper(), { watch: true }).then(
				() => dfd.reject(new Error('Promise should not resolve or reject')),
				() => dfd.reject(new Error('Promise should not resolve or reject'))
			);
			setTimeout(
				dfd.callback(() => {
					assert.isFalse(runStub.called);
					assert.isTrue(watchStub.calledOnce);
				}),
				1000
			);
		});

		it('rejects if an error occurs', () => {
			isError = true;
			const main = mockModule.getModuleUnderTest().default;
			return main.run(getMockHelper(), { watch: true }).then(
				() => {
					throw new Error();
				},
				(e: Error) => {
					assert.isTrue(e);
				}
			);
		});

		it('shows a building spinner', function() {
			const dfd = this.async();
			const main = mockModule.getModuleUnderTest().default;
			main.run(getMockHelper(), { watch: true }).then(
				() => dfd.reject(new Error('Promise should not resolve or reject')),
				() => dfd.reject(new Error('Promise should not resolve or reject'))
			);
			setTimeout(
				dfd.callback(() => {
					assert.isTrue(mockModule.getMock('ora').ctor.calledWith('building'));
					assert.isTrue(mockSpinner.start.called);
					assert.isTrue(mockSpinner.stop.called);
				}),
				1000
			);
		});

		it('provides custom logging', function() {
			const dfd = this.async();
			const main = mockModule.getModuleUnderTest().default;
			const filename = '/changed/file.ts';

			doneHookStub.callsFake((name: string, callback: Function) => callback(stats));
			invalidHookStub.callsFake((name: string, callback: Function) => callback(filename));

			main.run(getMockHelper(), { watch: true }).then(
				() => dfd.reject(new Error('Promise should not resolve or reject')),
				() => dfd.reject(new Error('Promise should not resolve or reject'))
			);
			setTimeout(
				dfd.callback(() => {
					assert.isTrue(mockLogger.calledWith('stats', ['dist config'], 'watching...'));
				}),
				1000
			);
		});
	});
	describe('serve option', () => {
		const entry = { main: [] };
		const watchOptions = {};
		let listenStub: SinonStub;
		let output: any;
		let plugins: any[];
		let useStub: SinonStub;
		let webpack: any;

		beforeEach(() => {
			webpack = mockModule.getMock('webpack').ctor;
			entry.main.length = 0;
			output = { publicPath: '/' };
			plugins = [];
			mockDevConfig.returns({ entry, output, plugins, watchOptions });
			mockDistConfig.returns({ entry, output, plugins, watchOptions });

			webpack.NoEmitOnErrorsPlugin = stub();

			useStub = stub();
			listenStub = stub().callsFake((port: string, callback: Function) => {
				callback(false);
			});

			const expressMock = mockModule.getMock('express').ctor;
			expressMock.static = stub();
			expressMock.returns({
				listen: listenStub,
				use: useStub
			});
		});

		it('should disallow serve in test mode', () => {
			const main = mockModule.getModuleUnderTest().default;
			return main
				.run(getMockHelper(), { serve: true, mode: 'test' })
				.then(() => {
					throw new Error('should not resolve');
				})
				.catch((error: Error) => {
					assert.strictEqual(error.message, 'Cannot use `--serve` with `--mode=test`');
				});
		});

		it('should disallow serve in unit mode', () => {
			const main = mockModule.getModuleUnderTest().default;
			return main
				.run(getMockHelper(), { serve: true, mode: 'unit' })
				.then(() => {
					throw new Error('should not resolve');
				})
				.catch((error: Error) => {
					assert.strictEqual(error.message, 'Cannot use `--serve` with `--mode=unit`');
				});
		});

		it('should disallow serve in functional mode', () => {
			const main = mockModule.getModuleUnderTest().default;
			return main
				.run(getMockHelper(), { serve: true, mode: 'functional' })
				.then(() => {
					throw new Error('should not resolve');
				})
				.catch((error: Error) => {
					assert.strictEqual(error.message, 'Cannot use `--serve` with `--mode=functional`');
				});
		});

		it('starts a webserver on the specified port', function() {
			const dfd = this.async();
			const main = mockModule.getModuleUnderTest().default;
			const port = 3000;
			main.run(getMockHelper(), { serve: true, port }).then(
				() => dfd.reject(new Error('Promise should not resolve or reject')),
				() => dfd.reject(new Error('Promise should not resolve or reject'))
			);
			setTimeout(
				dfd.callback(() => {
					assert.isTrue(listenStub.calledWith(port));
				}),
				1000
			);
		});

		it('should not terminate the process when serving', function() {
			const dfd = this.async();
			const main = mockModule.getModuleUnderTest().default;
			const port = 3000;
			main.run(getMockHelper(), { serve: true, port }).then(
				() => dfd.reject(new Error('Promise should not resolve or reject')),
				() => dfd.reject(new Error('Promise should not resolve or reject'))
			);
			setTimeout(
				dfd.callback(() => {
					assert.isFalse(exitStub.called);
				}),
				1000
			);
		});

		it('serves from the output directory', function() {
			const dfd = this.async();
			const main = mockModule.getModuleUnderTest().default;
			const express = mockModule.getMock('express').ctor;
			const outputDir = '/output/dist';
			output.path = outputDir;
			main.run(getMockHelper(), { serve: true, watch: true }).then(
				() => dfd.reject(new Error('Promise should not resolve or reject')),
				() => dfd.reject(new Error('Promise should not resolve or reject'))
			);
			setTimeout(
				dfd.callback(() => {
					assert.isTrue(express.static.calledWith(outputDir));
					assert.isTrue(watchStub.called);
				}),
				1000
			);
		});

		it('fails on error', () => {
			const main = mockModule.getModuleUnderTest().default;
			listenStub.callsFake((port: string, callback: Function) => {
				callback(true);
			});
			return main.run(getMockHelper(), { serve: true }).then(
				() => {
					throw new Error();
				},
				(e: Error) => {
					assert.isTrue(e);
				}
			);
		});

		it('fails for build errors', () => {
			const main = mockModule.getModuleUnderTest().default;
			mockLogger.returns(true);
			listenStub.callsFake((port: string, callback: Function) => {
				callback(null, 'stats');
			});
			return main.run(getMockHelper(), {}).then(
				() => {
					throw new Error();
				},
				(e: Error) => {
					assert.deepEqual(e, {});
				}
			);
		});

		it('rewrites nested routes', function() {
			const dfd = this.async();
			const main = mockModule.getModuleUnderTest().default;
			main.run(getMockHelper(), { serve: true }).then(
				() => dfd.reject(new Error('Promise should not resolve or reject')),
				() => dfd.reject(new Error('Promise should not resolve or reject'))
			);
			setTimeout(
				dfd.callback(() => {
					const mockHistory = mockModule.getMock('connect-history-api-fallback');
					const rewriter = mockHistory.ctor.firstCall.args[0].rewrites[0].to;
					const urlRewrite = rewriter({
						parsedUrl: {
							pathname: '/nested/main.js'
						},
						request: {
							url: '/nested/main.js',
							headers: {
								host: 'localhost:9999',
								referer: 'http://localhost:9999/nested/route'
							}
						}
					});
					assert.strictEqual(urlRewrite, '/main.js');
				}),
				1000
			);
		});

		it('does not rewrite routes when there is no referer', function() {
			const dfd = this.async();
			const main = mockModule.getModuleUnderTest().default;
			main.run(getMockHelper(), { serve: true }).then(
				() => dfd.reject(new Error('Promise should not resolve or reject')),
				() => dfd.reject(new Error('Promise should not resolve or reject'))
			);
			setTimeout(
				dfd.callback(() => {
					const mockHistory = mockModule.getMock('connect-history-api-fallback');
					const rewriter = mockHistory.ctor.firstCall.args[0].rewrites[0].to;
					const urlRewrite = rewriter({
						parsedUrl: {
							pathname: '/main.js'
						},
						request: {
							url: '/main.js',
							headers: {
								host: 'localhost:9999'
							}
						}
					});
					assert.strictEqual(urlRewrite, '/main.js');
				}),
				1000
			);
		});

		it('does not rewrite self-referential routes like service worker files', function() {
			const dfd = this.async();
			const main = mockModule.getModuleUnderTest().default;
			main.run(getMockHelper(), { serve: true }).then(
				() => dfd.reject(new Error('Promise should not resolve or reject')),
				() => dfd.reject(new Error('Promise should not resolve or reject'))
			);
			setTimeout(
				dfd.callback(() => {
					const mockHistory = mockModule.getMock('connect-history-api-fallback');
					const rewriter = mockHistory.ctor.firstCall.args[0].rewrites[0].to;
					const urlRewrite = rewriter({
						parsedUrl: {
							pathname: '/service-worker.js'
						},
						request: {
							url: '/service-worker.js',
							headers: {
								host: 'localhost:9999',
								referer: 'http://localhost:9999/service-worker.js'
							}
						}
					});
					assert.strictEqual(urlRewrite, '/service-worker.js');
				}),
				1000
			);
		});

		it('registers middleware', function() {
			const dfd = this.async();
			const main = mockModule.getModuleUnderTest().default;
			const hotMiddleware = mockModule.getMock('webpack-hot-middleware').ctor;
			main.run(getMockHelper(), {
				mode: 'dev',
				serve: true,
				watch: true
			}).then(
				() => dfd.reject(new Error('Promise should not resolve or reject')),
				() => dfd.reject(new Error('Promise should not resolve or reject'))
			);
			setTimeout(
				dfd.callback(() => {
					assert.strictEqual(useStub.callCount, 7);
					assert.isTrue(
						hotMiddleware.calledWith(compiler, {
							heartbeat: 10000
						})
					);
				}),
				1000
			);
		});

		it('serves compressed files in dist mode', function() {
			const dfd = this.async();
			const expressStaticGzip = mockModule.getMock('express-static-gzip').ctor;
			const main = mockModule.getModuleUnderTest().default;
			const outputDir = '/output/dist';
			const rc = {
				mode: 'dist',
				compression: ['gzip'],
				serve: true
			};
			output.path = outputDir;
			main.run(getMockHelper(), rc).then(
				() => dfd.reject(new Error('Promise should not resolve or reject')),
				() => dfd.reject(new Error('Promise should not resolve or reject'))
			);
			setTimeout(
				dfd.callback(() => {
					assert.isTrue(
						expressStaticGzip.calledWith(outputDir, {
							enableBrotli: false,
							orderPreference: undefined
						})
					);
				}),
				1000
			);
		});

		it('does not serve compressed files in dev mode', function() {
			const dfd = this.async();
			const expressStaticGzip = mockModule.getMock('express-static-gzip').ctor;
			const main = mockModule.getModuleUnderTest().default;
			const rc = {
				mode: 'dev',
				compression: ['gzip'],
				serve: true
			};
			main.run(getMockHelper(), rc).then(
				() => dfd.reject(new Error('Promise should not resolve or reject')),
				() => dfd.reject(new Error('Promise should not resolve or reject'))
			);
			setTimeout(
				dfd.callback(() => {
					assert.isFalse(expressStaticGzip.called);
				}),
				1000
			);
		});

		it('favors brotli over gzip', function() {
			const dfd = this.async();
			const expressStaticGzip = mockModule.getMock('express-static-gzip').ctor;
			const main = mockModule.getModuleUnderTest().default;
			const outputDir = '/output/dist';
			const rc = {
				mode: 'dist',
				compression: ['gzip', 'brotli'],
				serve: true
			};
			output.path = outputDir;
			main.run(getMockHelper(), rc).then(
				() => dfd.reject(new Error('Promise should not resolve or reject')),
				() => dfd.reject(new Error('Promise should not resolve or reject'))
			);
			setTimeout(
				dfd.callback(() => {
					assert.isTrue(
						expressStaticGzip.calledWith(outputDir, {
							enableBrotli: true,
							orderPreference: ['br']
						})
					);
				}),
				1000
			);
		});

		describe('https', () => {
			beforeEach(() => {
				mockModule.dependencies(['fs']);
				mockModule.getMock('fs').existsSync = stub().returns(true);
				mockModule.getMock('fs').readFileSync = stub().returns('data');
			});

			it('starts an https server if key and cert are available', function() {
				const dfd = this.async();
				const main = mockModule.getModuleUnderTest().default;

				const listenStub = stub().callsFake((port: string, callback: Function) => {
					callback(false);
				});
				const createServerStub = mockModule.getMock('https').createServer;
				createServerStub.returns({
					listen: listenStub
				});

				main.run(getMockHelper(), {
					serve: true
				}).then(
					() => dfd.reject(new Error('Promise should not resolve or reject')),
					() => dfd.reject(new Error('Promise should not resolve or reject'))
				);

				setTimeout(
					dfd.callback(() => {
						assert.isTrue(
							createServerStub.calledWith({
								cert: 'data',
								key: 'data'
							})
						);
					}),
					1000
				);
			});

			it('throws https server errors', () => {
				const main = mockModule.getModuleUnderTest().default;

				const listenStub = stub().callsFake((port: string, callback: Function) => {
					callback('there is an error');
				});
				const createServerStub = mockModule.getMock('https').createServer;
				createServerStub.returns({
					listen: listenStub
				});

				return main
					.run(getMockHelper(), {
						serve: true
					})
					.then(() => {
						throw new Error('should not resolve');
					})
					.catch((e: any) => {
						assert.strictEqual(e, 'there is an error');
					});
			});
		});

		describe('proxy', () => {
			it('enables proxy configurations', () => {
				const proxyMock = mockModule.getMock('http-proxy-middleware');

				const main = mockModule.getModuleUnderTest().default;

				return main
					.run(getMockHelper(), {
						proxy: {
							'/string': 'test',
							'/options': {
								target: 'options'
							}
						}
					})
					.then(() => {
						assert.isTrue(proxyMock.calledWith('/string', { target: 'test' }));
						assert.isTrue(proxyMock.calledWith('/options', { target: 'options' }));
					})
					.catch(() => {});
			});
		});
	});

	describe('eject', () => {
		const basePath = process.cwd();

		beforeEach(() => {
			mockModule.dependencies(['pkg-dir']);
			mockModule.getMock('pkg-dir').ctor.sync = stub().returns(basePath);
		});

		it('outputs the ejected config and updates package dev dependencies', () => {
			const main = mockModule.getModuleUnderTest().default;
			const packageJson = require(join(basePath, 'package.json'));
			const ejectOptions = main.eject(getMockHelper());
			const rcPattern = /build-options\.json$/;

			assert.lengthOf(ejectOptions.copy.files.filter((file: string) => rcPattern.test(file)), 1);

			ejectOptions.copy.files = ejectOptions.copy.files.filter((file: string) => !rcPattern.test(file));
			assert.deepEqual(ejectOptions, {
				copy: {
					path: join(basePath, 'dist/dev/src'),
					files: [
						'./base.config.js',
						'./base.test.config.js',
						'./dev.config.js',
						'./dist.config.js',
						'./ejected.config.js',
						'./unit.config.js',
						'./functional.config.js'
					]
				},
				hints: [
					`to build run ${chalk.underline(
						'./node_modules/.bin/webpack --config ./config/build-app/ejected.config.js --env.mode={dev|dist|unit|functional}'
					)}`
				],
				npm: {
					devDependencies: {
						[packageJson.name]: packageJson.version,
						...packageJson.dependencies
					}
				}
			});
		});

		it('throws an error when ejecting when deps cannot be read', () => {
			const message = 'Keyboard not found. Press F1 to resume.';
			mockModule.getMock('pkg-dir').ctor.sync.throws(() => new Error(message));
			assert.throws(
				() => {
					const main = mockModule.getModuleUnderTest().default;
					main.eject(getMockHelper());
				},
				Error,
				`Failed reading dependencies from package.json - ${message}`
			);
		});
	});

	describe('validate', () => {
		beforeEach(() => {
			mockModule.dependencies(['fs', 'path']);
			mockModule.getMock('fs').readFileSync = stub().returns('{}');
			mockModule.getMock('path').join = stub().returns('schema.json');
		});

		it('validate is called and reads the schema file', async () => {
			const readFileSyncStub = mockModule.getMock('fs').readFileSync;
			const main = mockModule.getModuleUnderTest().default;
			const result = main.validate(getMockHelper());
			result
				.then((valid: boolean) => {
					assert.isTrue(valid);
					assert.equal(readFileSyncStub.callCount, 1, 'readFileSync should only be called once');
					assert.equal(
						readFileSyncStub.getCall(0).args[0],
						'schema.json',
						'validate should be called with schema.json as schema'
					);
				})
				.catch((error: Error) => {
					throw new Error('validation should not throw an error');
				});
		});

		it('throw an error if schema.json is not found', async () => {
			const main = mockModule.getModuleUnderTest().default;
			const readFileError = "ENOENT: no such file or directory, open 'schema.json'";
			mockModule.getMock('fs').readFileSync = stub().throws(readFileError);
			main.validate(getMockHelper())
				.then(() => {
					throw new Error('should not resolve');
				})
				.catch((error: Error) => {
					assert.strictEqual(
						error.message,
						`The dojorc schema for cli-build-app could not be read: ${readFileError}`
					);
				});
		});
	});

	describe('schema', () => {
		let path: string;

		beforeEach(() => {
			path = join(__dirname, '../../src/schema.json');
		});

		it('is well formed json', () => {
			const exists = existsSync(path);
			assert.isTrue(exists, 'schema file should exist');
			assert.doesNotThrow(() => {
				const schema = readFileSync(path).toString();
				JSON.parse(schema);
			}, 'schema.json should be readable and valid JSON');
		});

		it('is a valid JSON Schema', () => {
			const schema = JSON.parse(readFileSync(path).toString());

			const ajv = new Ajv({ allErrors: true, verbose: true });
			const validate = ajv.compile(schema);
			validate({});

			assert.equal(validate.errors, null, `schema should have no errors`);
		});
	});
});
