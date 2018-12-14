const { describe, it, beforeEach, afterEach } = intern.getInterface('bdd');
const { assert } = intern.getPlugin('chai');
import { join } from 'path';
import { SinonStub, stub } from 'sinon';
import chalk from 'chalk';
import MockModule from '../support/MockModule';
import * as fs from 'fs';

let mockModule: MockModule;
let mockLogger: any;
let mockSpinner: any;
let mockDevConfig: any;
let mockDistConfig: any;
let mockUnitTestConfig: any;
let mockFunctionalTestConfig: any;
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

function getMockConfiguration(config: any = {}) {
	return {
		configuration: {
			get() {
				return { ...config };
			}
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
			'webpack-mild-compile'
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
		mockDevConfig.returns('dev config');
		mockDistConfig.returns('dist config');
		mockUnitTestConfig.returns('unit config');
		mockFunctionalTestConfig.returns('functional config');
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
		main.run(getMockConfiguration(), { mode: 'dev' }).then(() => {
			assert.isTrue(mockDevConfig.called);
			assert.isTrue(mockLogger.calledWith('stats', 'dev config'));
		});
	});

	it('can run dist mode', () => {
		const main = mockModule.getModuleUnderTest().default;
		return main.run(getMockConfiguration(), { mode: 'dist' }).then(() => {
			assert.isTrue(mockDistConfig.called);
			assert.isTrue(mockLogger.calledWith('stats', 'dist config'));
		});
	});

	it('can run unit mode', () => {
		const main = mockModule.getModuleUnderTest().default;
		return main.run(getMockConfiguration(), { mode: 'unit' }).then(() => {
			assert.isTrue(mockUnitTestConfig.called);
			assert.isTrue(mockLogger.calledWith('stats', 'unit config'));
		});
	});

	it('can run functional mode', () => {
		const main = mockModule.getModuleUnderTest().default;
		return main.run(getMockConfiguration(), { mode: 'functional' }).then(() => {
			assert.isTrue(mockFunctionalTestConfig.called);
			assert.isTrue(mockLogger.calledWith('stats', 'functional config'));
		});
	});

	it('falls back to unit mode and logs a warning when depracated test mode is used', () => {
		const main = mockModule.getModuleUnderTest().default;
		return main.run(getMockConfiguration(), { mode: 'test' }).then(() => {
			assert.isTrue(mockUnitTestConfig.called);
			assert.isTrue(mockLogger.calledWith('stats', 'unit config'));
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
		return main.run(getMockConfiguration(), { mode: 'unit' }).then(() => {
			assert.isTrue(mockUnitTestConfig.called);
			assert.isTrue(mockLogger.notCalled);
		});
	});

	it('filters CSS module order warnings from the logger', () => {
		const main = mockModule.getModuleUnderTest().default;
		return main.run(getMockConfiguration(), { mode: 'unit' }).then(() => {
			const [{ warningsFilter }] = stats.toJson.firstCall.args;
			assert.isTrue(warningsFilter('[mini-css-extract-plugin]\nConflicting order between'));
			assert.isFalse(warningsFilter('[mini-css-extract-plugin]'));
			assert.isFalse(warningsFilter(''));
			assert.isFalse(warningsFilter('some other warning'));
		});
	});

	it('mixes in features from command line', () => {
		const main = mockModule.getModuleUnderTest().default;
		return main
			.run(getMockConfiguration(), { mode: 'dist', feature: { foo: true }, features: { foo: false, bar: false } })
			.then(() => {
				assert.isTrue(mockDistConfig.called);
				assert.deepEqual(mockDistConfig.firstCall.args, [
					{ mode: 'dist', features: { foo: true, bar: false } }
				]);
			});
	});

	it('rejects if an error occurs', () => {
		isError = true;
		const main = mockModule.getModuleUnderTest().default;
		return main.run(getMockConfiguration(), { mode: 'test' }).then(
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
		return main.run(getMockConfiguration(), {}).then(() => {
			console.log('called');
			assert.isTrue(consoleStub.notCalled);
		});
	});

	it('shows a building spinner on start', () => {
		const main = mockModule.getModuleUnderTest().default;
		return main.run(getMockConfiguration(), {}).then(() => {
			assert.isTrue(mockModule.getMock('ora').ctor.calledWith('building'));
			assert.isTrue(mockSpinner.start.called);
			assert.isTrue(mockSpinner.stop.called);
		});
	});

	describe('watch option', () => {
		it('automatically rebuilds after file changes', () => {
			const main = mockModule.getModuleUnderTest().default;
			return main.run(getMockConfiguration(), { watch: true }).then(() => {
				assert.isFalse(runStub.called);
				assert.isTrue(watchStub.calledOnce);
			});
		});

		it('rejects if an error occurs', () => {
			isError = true;
			const main = mockModule.getModuleUnderTest().default;
			return main.run(getMockConfiguration(), { watch: true }).then(
				() => {
					throw new Error();
				},
				(e: Error) => {
					assert.isTrue(e);
				}
			);
		});

		it('shows a building spinner', () => {
			const main = mockModule.getModuleUnderTest().default;
			return main.run(getMockConfiguration(), { watch: true }).then(() => {
				assert.isTrue(mockModule.getMock('ora').ctor.calledWith('building'));
				assert.isTrue(mockSpinner.start.called);
				assert.isTrue(mockSpinner.stop.called);
			});
		});

		it('provides custom logging', () => {
			const main = mockModule.getModuleUnderTest().default;
			const filename = '/changed/file.ts';

			doneHookStub.callsFake((name: string, callback: Function) => callback(stats));
			invalidHookStub.callsFake((name: string, callback: Function) => callback(filename));

			return main.run(getMockConfiguration(), { watch: true }).then(() => {
				assert.isTrue(mockLogger.calledWith('stats', 'dist config', 'watching...'));
			});
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

			webpack.HotModuleReplacementPlugin = stub();
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
				.run(getMockConfiguration(), { serve: true, mode: 'test' })
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
				.run(getMockConfiguration(), { serve: true, mode: 'unit' })
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
				.run(getMockConfiguration(), { serve: true, mode: 'functional' })
				.then(() => {
					throw new Error('should not resolve');
				})
				.catch((error: Error) => {
					assert.strictEqual(error.message, 'Cannot use `--serve` with `--mode=functional`');
				});
		});

		it('starts a webserver on the specified port', () => {
			const main = mockModule.getModuleUnderTest().default;
			const port = 3000;
			return main.run(getMockConfiguration(), { serve: true, port }).then(() => {
				assert.isTrue(listenStub.calledWith(port));
			});
		});

		it('should not terminate the process when serving', () => {
			const main = mockModule.getModuleUnderTest().default;
			const port = 3000;
			return main.run(getMockConfiguration(), { serve: true, port }).then(() => {
				assert.isFalse(exitStub.called);
			});
		});

		it('serves from the output directory', () => {
			const main = mockModule.getModuleUnderTest().default;
			const express = mockModule.getMock('express').ctor;
			const outputDir = '/output/dist';
			output.path = outputDir;
			return main.run(getMockConfiguration(), { serve: true, watch: true }).then(() => {
				assert.isTrue(express.static.calledWith(outputDir));
				assert.isTrue(watchStub.called);
			});
		});

		it('fails on error', () => {
			const main = mockModule.getModuleUnderTest().default;
			listenStub.callsFake((port: string, callback: Function) => {
				callback(true);
			});
			return main.run(getMockConfiguration(), { serve: true }).then(
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
			return main.run(getMockConfiguration(), {}).then(
				() => {
					throw new Error();
				},
				(e: Error) => {
					assert.deepEqual(e, {});
				}
			);
		});

		it('rewrites nested routes', () => {
			const main = mockModule.getModuleUnderTest().default;
			return main.run(getMockConfiguration(), { serve: true }).then(() => {
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
			});
		});

		it('does not rewrite routes when there is no referer', () => {
			const main = mockModule.getModuleUnderTest().default;
			return main.run(getMockConfiguration(), { serve: true }).then(() => {
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
			});
		});

		it('does not rewrite self-referential routes like service worker files', () => {
			const main = mockModule.getModuleUnderTest().default;
			return main.run(getMockConfiguration(), { serve: true }).then(() => {
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
			});
		});

		it('registers middleware', () => {
			const main = mockModule.getModuleUnderTest().default;
			const hotMiddleware = mockModule.getMock('webpack-hot-middleware').ctor;
			return main
				.run(getMockConfiguration(), {
					mode: 'dev',
					serve: true,
					watch: true
				})
				.then(() => {
					assert.strictEqual(useStub.callCount, 4);
					assert.isTrue(
						hotMiddleware.calledWith(compiler, {
							heartbeat: 10000
						})
					);
				});
		});

		it('enables hot module replacement watch', () => {
			const main = mockModule.getModuleUnderTest().default;
			return main
				.run(getMockConfiguration(), {
					mode: 'dev',
					serve: true,
					watch: true
				})
				.then(() => {
					assert.lengthOf(plugins, 2);
					assert.isTrue(webpack.HotModuleReplacementPlugin.calledWithNew());
					assert.isTrue(webpack.NoEmitOnErrorsPlugin.calledWithNew());
					assert.sameMembers(entry.main, ['eventsource-polyfill']);
				});
		});

		it('serves compressed files in dist mode', () => {
			const expressStaticGzip = mockModule.getMock('express-static-gzip').ctor;
			const main = mockModule.getModuleUnderTest().default;
			const outputDir = '/output/dist';
			const rc = {
				mode: 'dist',
				compression: ['gzip'],
				serve: true
			};
			output.path = outputDir;
			return main.run(getMockConfiguration(), rc).then(() => {
				assert.isTrue(
					expressStaticGzip.calledWith(outputDir, {
						enableBrotli: false,
						orderPreference: undefined
					})
				);
			});
		});

		it('does not serve compressed files in dev mode', () => {
			const expressStaticGzip = mockModule.getMock('express-static-gzip').ctor;
			const main = mockModule.getModuleUnderTest().default;
			const rc = {
				mode: 'dev',
				compression: ['gzip'],
				serve: true
			};
			return main.run(getMockConfiguration(), rc).then(() => {
				assert.isFalse(expressStaticGzip.called);
			});
		});

		it('favors brotli over gzip', () => {
			const expressStaticGzip = mockModule.getMock('express-static-gzip').ctor;
			const main = mockModule.getModuleUnderTest().default;
			const outputDir = '/output/dist';
			const rc = {
				mode: 'dist',
				compression: ['gzip', 'brotli'],
				serve: true
			};
			output.path = outputDir;
			return main.run(getMockConfiguration(), rc).then(() => {
				assert.isTrue(
					expressStaticGzip.calledWith(outputDir, {
						enableBrotli: true,
						orderPreference: ['br']
					})
				);
			});
		});

		describe('https', () => {
			it('starts an https server if key and cert are available', () => {
				const main = mockModule.getModuleUnderTest().default;

				const listenStub = stub().callsFake((port: string, callback: Function) => {
					callback(false);
				});
				const createServerStub = mockModule.getMock('https').createServer;
				createServerStub.returns({
					listen: listenStub
				});

				const existsStub = stub(fs, 'existsSync');
				existsStub.returns(true);
				const readStub = stub(fs, 'readFileSync');
				readStub.returns('data');

				return main
					.run(getMockConfiguration(), {
						serve: true
					})
					.then(() => {
						assert.isTrue(
							createServerStub.calledWith({
								cert: 'data',
								key: 'data'
							})
						);
						existsStub.restore();
						readStub.restore();
					})
					.catch((e: any) => {
						existsStub.restore();
						readStub.restore();
						throw e;
					});
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

				const existsStub = stub(fs, 'existsSync');
				existsStub.returns(true);
				const readStub = stub(fs, 'readFileSync');
				readStub.returns('data');

				return main
					.run(getMockConfiguration(), {
						serve: true
					})
					.then(() => {
						throw new Error('should not resolve');
					})
					.catch((e: any) => {
						existsStub.restore();
						readStub.restore();
						assert.strictEqual(e, 'there is an error');
					});
			});
		});

		describe('proxy', () => {
			it('enables proxy configurations', () => {
				const proxyMock = mockModule.getMock('http-proxy-middleware');

				const main = mockModule.getModuleUnderTest().default;

				return main
					.run(getMockConfiguration(), {
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
			const ejectOptions = main.eject(getMockConfiguration());
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
					main.eject(getMockConfiguration());
				},
				Error,
				`Failed reading dependencies from package.json - ${message}`
			);
		});
	});
});
