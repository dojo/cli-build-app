const { describe, it, beforeEach, afterEach } = intern.getInterface('bdd');
const { assert } = intern.getPlugin('chai');
import { join } from 'path';
import { SinonStub, stub } from 'sinon';
import chalk from 'chalk';
import MockModule from '../support/MockModule';

let mockModule: MockModule;
let mockLogger: any;
let mockSpinner: any;
let mockDevConfig: any;
let mockDistConfig: any;
let mockTestConfig: any;
let isError: boolean;
let stats: any;
let consoleStub = stub(console, 'log');
let pluginStub: SinonStub;
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
			toJson() {
				return 'stats';
			}
		};
		mockModule = new MockModule('../../src/main', require);
		mockModule.dependencies([
			'./dev.config',
			'./dist.config',
			'./test.config',
			'express',
			'log-update',
			'ora',
			'webpack',
			'webpack-mild-compile',
			'webpack-dev-middleware',
			'webpack-hot-middleware',
			'./logger'
		]);
		pluginStub = stub().callsFake((name: string, callback: Function) => {
			callback();
		});
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
		mockModule.getMock('webpack').ctor.returns({
			plugin: pluginStub,
			run: runStub,
			watch: watchStub
		});
		mockDevConfig = mockModule.getMock('./dev.config').default;
		mockDistConfig = mockModule.getMock('./dist.config').default;
		mockTestConfig = mockModule.getMock('./test.config').default;
		mockDevConfig.returns('dev config');
		mockDistConfig.returns('dist config');
		mockTestConfig.returns('test config');
		mockLogger = mockModule.getMock('./logger').default;
	});

	afterEach(() => {
		mockModule.destroy();
		consoleStub.restore();
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
				choices: ['dist', 'dev', 'test']
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

	it('can run test mode', () => {
		const main = mockModule.getModuleUnderTest().default;
		return main.run(getMockConfiguration(), { mode: 'test' }).then(() => {
			assert.isTrue(mockTestConfig.called);
			assert.isTrue(mockLogger.calledWith('stats', 'test config'));
		});
	});

	it('logger not called if stats are not returned', () => {
		stats = null;
		const main = mockModule.getModuleUnderTest().default;
		return main.run(getMockConfiguration(), { mode: 'test' }).then(() => {
			assert.isTrue(mockTestConfig.called);
			assert.isTrue(mockLogger.notCalled);
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

			pluginStub.callsFake((name: string, callback: Function) => {
				const value = name === 'invalid' ? filename : stats;
				callback(value);
			});

			return main.run(getMockConfiguration(), { watch: true }).then(() => {
				assert.isTrue(mockLogger.calledWith('stats', 'dist config', 'watching...'));
			});
		});

		it('warns when attempting memory watch without the dev server', () => {
			const main = mockModule.getModuleUnderTest().default;
			stub(console, 'warn');
			return main
				.run(getMockConfiguration(), { watch: 'memory' })
				.then(() => {
					assert.isTrue(
						(console as any).warn.calledWith('Memory watch requires the dev server. Using file watch instead...')
					);
					(console as any).warn.restore();
				})
				.catch(() => {
					(console as any).warn.restore();
				});
		});
	});

	describe('serve option', () => {
		const entry = { main: [] };
		const watchOptions = {};
		let compiler: any;
		let listenStub: SinonStub;
		let output: any;
		let pluginStub: SinonStub;
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

			pluginStub = stub();
			useStub = stub();
			listenStub = stub().callsFake((port: string, callback: Function) => {
				callback(false);
			});

			compiler = { plugin: pluginStub, run: runStub, watch: watchStub };
			mockModule.getMock('webpack').ctor.returns(compiler);

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

		it('limits --watch=memory to --mode=dev', () => {
			const main = mockModule.getModuleUnderTest().default;
			stub(console, 'warn');
			return main
				.run(getMockConfiguration(), { serve: true, watch: 'memory' })
				.then(() => {
					assert.isTrue(
						(console as any).warn.calledWith('Memory watch requires `--mode=dev`. Using file watch instead...')
					);
					(console as any).warn.restore();
				})
				.catch(() => {
					(console as any).warn.restore();
				});
		});

		it('registers middleware with --watch=memory', () => {
			const main = mockModule.getModuleUnderTest().default;
			const webpackMiddleware = mockModule.getMock('webpack-dev-middleware').ctor;
			const hotMiddleware = mockModule.getMock('webpack-hot-middleware').ctor;
			return main
				.run(getMockConfiguration(), {
					mode: 'dev',
					serve: true,
					watch: 'memory'
				})
				.then(() => {
					assert.strictEqual(useStub.callCount, 1);
					assert.isTrue(
						webpackMiddleware.calledWith(compiler, {
							logLevel: 'silent',
							noInfo: true,
							publicPath: '/',
							watchOptions
						})
					);
					assert.isTrue(
						hotMiddleware.calledWith(compiler, {
							heartbeat: 10000
						})
					);
				});
		});

		it('enables hot module replacement with --watch=memory', () => {
			const main = mockModule.getModuleUnderTest().default;
			return main
				.run(getMockConfiguration(), {
					mode: 'dev',
					serve: true,
					watch: 'memory'
				})
				.then(() => {
					assert.lengthOf(plugins, 2);
					assert.isTrue(webpack.HotModuleReplacementPlugin.calledWithNew());
					assert.isTrue(webpack.NoEmitOnErrorsPlugin.calledWithNew());
					assert.sameMembers(entry.main, ['webpack-hot-middleware/client?timeout=20000&reload=true']);
				});
		});

		it('provides custom logging with --watch=memory', () => {
			const main = mockModule.getModuleUnderTest().default;

			pluginStub.callsFake((name: string, callback: Function) => {
				callback(stats);
			});

			return main
				.run(getMockConfiguration(), {
					mode: 'dev',
					port: 3000,
					serve: true,
					watch: 'memory'
				})
				.then(() => {
					assert.isTrue(
						mockLogger.calledWith('stats', { entry, output, plugins, watchOptions }, 'Listening on port 3000...')
					);
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
					path: join(basePath, '_build/src'),
					files: ['./base.config.js', './dev.config.js', './dist.config.js', './ejected.config.js', './test.config.js']
				},
				hints: [
					`to build run ${chalk.underline(
						'./node_modules/.bin/webpack --config ./config/build-app/ejected.config.js --env.mode={dev|dist|test}'
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
