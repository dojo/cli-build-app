import * as fs from 'fs';
import * as _ from 'lodash';
import * as acorn from 'acorn';
const walk = require('acorn-walk/dist/walk');

export function parseBundle(bundlePath: any) {
	const content = fs.readFileSync(bundlePath, 'utf8');
	const ast = acorn.parse(content, { sourceType: 'script', ecmaVersion: 2019 });
	const walkState = {
		locations: null
	};

	walk.recursive(ast, walkState, {
		CallExpression(node: any, state: any, c: any) {
			if (state.locations) {
				return;
			}

			const args = node.arguments;
			// Main chunk with webpack loader.
			// Modules are stored in first argument:
			// (function (...) {...})(<modules>)
			if (
				node.callee.type === 'FunctionExpression' &&
				!node.callee.id &&
				args.length === 1 &&
				isSimpleModulesList(args[0])
			) {
				state.locations = getModulesLocations(args[0]);
				return;
			}

			// Async Webpack < v4 chunk without webpack loader.
			// webpackJsonp([<chunks>], <modules>, ...)
			// As function name may be changed with `output.jsonpFunction` option we can't rely on it's default name.
			if (node.callee.type === 'Identifier' && mayBeAsyncChunkArguments(args) && isModulesList(args[1])) {
				state.locations = getModulesLocations(args[1]);
				return;
			}

			// Async Webpack v4 chunk without webpack loader.
			// (window.webpackJsonp=window.webpackJsonp||[]).push([[<chunks>], <modules>, ...]);
			// As function name may be changed with `output.jsonpFunction` option we can't rely on it's default name.
			if (isAsyncChunkPushExpression(node)) {
				state.locations = getModulesLocations(args[0].elements[1]);
				return;
			}

			_.each(args, (arg) => c(arg, state));
		}
	});

	if (!walkState.locations) {
		return null;
	}

	return {
		src: content,
		modules: _.mapValues(walkState.locations, (loc: any) => content.slice(loc.start, loc.end))
	};
}

export function findLargestGroup(module: any, groupName: string, leafNodes = false) {
	const groupModule = module.groups.find(({ label }: any) => label === groupName);
	if (groupModule) {
		let children;
		if (!leafNodes) {
			children = [...groupModule.groups];
		} else {
			children = getLeafNodes(groupModule);
		}
		return children
			.sort((groupA, groupB) => {
				if (groupA.statSize < groupB.statSize) {
					return -1;
				}

				if (groupA.statSize > groupB.statSize) {
					return 1;
				}

				return 0;
			})
			.pop();
	}
}

function getLeafNodes(module: any) {
	if (module.groups && module.groups.length) {
		const leafNodes: any[] = [];
		module.groups.forEach((group: any) => {
			leafNodes.push(...getLeafNodes(group));
		});
		return leafNodes;
	} else {
		return [module];
	}
}

function isModulesList(node: any) {
	return isSimpleModulesList(node) || isOptimizedModulesArray(node);
}

function isOptimizedModulesArray(node: any) {
	// Checking whether modules are contained in `Array(<minimum ID>).concat(...modules)` array:
	// https://github.com/webpack/webpack/blob/v1.14.0/lib/Template.js#L91
	// The `<minimum ID>` + array indexes are module ids
	return (
		node.type === 'CallExpression' &&
		node.callee.type === 'MemberExpression' &&
		// Make sure the object called is `Array(<some number>)`
		node.callee.object.type === 'CallExpression' &&
		node.callee.object.callee.type === 'Identifier' &&
		node.callee.object.callee.name === 'Array' &&
		node.callee.object.arguments.length === 1 &&
		isNumericId(node.callee.object.arguments[0]) &&
		// Make sure the property X called for `Array(<some number>).X` is `concat`
		node.callee.property.type === 'Identifier' &&
		node.callee.property.name === 'concat' &&
		// Make sure exactly one array is passed in to `concat`
		node.arguments.length === 1 &&
		isModulesArray(node.arguments[0])
	);
}

function isSimpleModulesList(node: any) {
	return isModulesHash(node) || isModulesArray(node);
}

function isModulesHash(node: any) {
	return (
		node.type === 'ObjectExpression' &&
		_(node.properties)
			.map('value')
			.every(isModuleWrapper)
	);
}

function isModulesArray(node: any) {
	return node.type === 'ArrayExpression' && _.every(node.elements, (elem) => !elem || isModuleWrapper(elem));
}

function isAsyncChunkPushExpression(node: any) {
	const { callee, arguments: args } = node;

	return (
		callee.type === 'MemberExpression' &&
		callee.property.name === 'push' &&
		callee.object.type === 'AssignmentExpression' &&
		callee.object.left.object &&
		(callee.object.left.object.name === 'window' ||
			// `self` is a common output.globalObject value used to support both workers and browsers
			callee.object.left.object.name === 'self' ||
			// Webpack 4 uses `this` instead of `window`
			callee.object.left.object.type === 'ThisExpression') &&
		args.length === 1 &&
		args[0].type === 'ArrayExpression' &&
		mayBeAsyncChunkArguments(args[0].elements) &&
		isModulesList(args[0].elements[1])
	);
}

function mayBeAsyncChunkArguments(args: any[]) {
	return args.length >= 2 && isChunkIds(args[0]);
}

function isChunkIds(node: any) {
	// Array of numeric or string ids. Chunk IDs are strings when NamedChunksPlugin is used
	return node.type === 'ArrayExpression' && _.every(node.elements, isModuleId);
}

function isModuleWrapper(node: any) {
	return (
		((node.type === 'FunctionExpression' || node.type === 'ArrowFunctionExpression') && !node.id) ||
		isModuleId(node) ||
		(node.type === 'ArrayExpression' && node.elements.length > 1 && isModuleId(node.elements[0]))
	);
}

function isModuleId(node: any) {
	return node.type === 'Literal' && (isNumericId(node) || typeof node.value === 'string');
}

function isNumericId(node: any) {
	return node.type === 'Literal' && Number.isInteger(node.value) && node.value >= 0;
}

function getModulesLocations(arg: any) {
	if (arg.type === 'ObjectExpression') {
		// Modules hash
		const modulesNodes = arg.properties;

		return _.transform(
			modulesNodes,
			(result, moduleNode: any) => {
				const moduleId = moduleNode.key.name || moduleNode.key.value;

				result[moduleId] = getModuleLocation(moduleNode.value);
			},
			{}
		);
	}

	const isOptimizedArray = arg.type === 'CallExpression';

	if (arg.type === 'ArrayExpression' || isOptimizedArray) {
		const minId = isOptimizedArray ? arg.callee.object.arguments[0].value : 0;
		const modulesNodes = isOptimizedArray ? arg.arguments[0].elements : arg.elements;

		return _.transform(
			modulesNodes,
			(result, moduleNode, i) => {
				if (!moduleNode) {
					return;
				}
				result[i + minId] = getModuleLocation(moduleNode);
			},
			{}
		);
	}

	return {};
}

function getModuleLocation(node: any) {
	return _.pick(node, 'start', 'end');
}
