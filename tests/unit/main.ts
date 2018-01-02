const { describe, it, beforeEach, afterEach } = intern.getInterface('bdd');
const { assert } = intern.getPlugin('chai');
import * as sinon from 'sinon';
import { SinonStub } from 'sinon';
import MockModule from '../support/MockModule';

let mockModule: MockModule;
let mockLogger: any;
let mockSpinner: any;
let mockDevConfig: any;
let mockDistConfig: any;
let mockTestConfig: any;
let isError: boolean;
let stats: any;
let consoleStub = sinon.stub(console, 'log');
let pluginStub: SinonStub;
let runStub: SinonStub;
let watchStub: SinonStub;

function getMockConfiguration(config?: any) {
	return {
		configuration: {
			get() {
				{
				}
			}
		}
	};
}

describe('command', () => {
	beforeEach(() => {
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
			'log-update',
			'ora',
			'webpack',
			'webpack-mild-compile',
			'./logger'
		]);
		pluginStub = sinon.stub().callsFake((name: string, callback: Function) => {
			callback();
		});
		runStub = sinon.stub().callsFake((callback: Function) => {
			callback(isError, stats);
		});
		watchStub = sinon.stub().callsFake((options: any, callback: Function) => {
			callback(isError, stats);
		});
		mockSpinner = {
			start: sinon.stub().returnsThis(),
			stop: sinon.stub().returnsThis()
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
	});

	it('registers the command options', () => {
		const main = mockModule.getModuleUnderTest().default;
		const optionsStub = sinon.stub();
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

	it('can automatically rebuild after file changes', () => {
		const main = mockModule.getModuleUnderTest().default;
		return main.run(getMockConfiguration(), { watch: true }).then(() => {
			assert.isFalse(runStub.called);
			assert.isTrue(watchStub.calledOnce);
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

	it('rejects if an error occurs in watch mode', () => {
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

	it('shows a building spinner in watch mode', () => {
		const main = mockModule.getModuleUnderTest().default;
		return main.run(getMockConfiguration(), { watch: true }).then(() => {
			assert.isTrue(mockModule.getMock('ora').ctor.calledWith('building'));
			assert.isTrue(mockSpinner.start.called);
			assert.isTrue(mockSpinner.stop.called);
		});
	});
});
