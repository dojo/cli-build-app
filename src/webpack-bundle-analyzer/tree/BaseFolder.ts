import * as _ from 'lodash';
import BaseNode from './Node';

export default class BaseFolder extends BaseNode {
	private children: any = Object.create(null);
	private _src: any;
	private _size: any;

	constructor(name: string, parent?: BaseNode) {
		super(name, parent);
	}

	get src() {
		if (!this._src) {
			this._src = this.walk(
				(node: any, src: any, stop: any) => {
					if (node.src === undefined) {
						return stop(undefined);
					}
					return (src += node.src);
				},
				'',
				false
			);
		}

		return this._src;
	}

	get size() {
		if (!_.has(this, '_size')) {
			this._size = this.walk((node: any, size: any) => size + node.size, 0, false);
		}

		return this._size;
	}

	getChild(name: any) {
		return this.children[name];
	}

	addChildModule(module: any) {
		const { name } = module;
		const currentChild = this.children[name];

		// For some reason we already have this node in children and it's a folder.
		if (currentChild && currentChild instanceof BaseFolder) {
			return;
		}

		if (currentChild) {
			// We already have this node in children and it's a module.
			// Merging it's data.
			currentChild.mergeData(module.data);
		} else {
			// Pushing new module
			module.parent = this;
			this.children[name] = module;
		}

		delete this._size;
		delete this._src;
	}

	addChildFolder(folder: any) {
		folder.parent = this;
		this.children[folder.name] = folder;
		delete this._size;
		delete this._src;

		return folder;
	}

	walk(walker: any, state = {}, deep = true) {
		let stopped = false;

		_.each(this.children, (child) => {
			if (deep && child.walk) {
				state = child.walk(walker, state, stop);
			} else {
				state = walker(child, state, stop);
			}

			if (stopped) {
				return false;
			}
		});

		return state;

		function stop(finalState: any) {
			stopped = true;
			return finalState;
		}
	}

	toChartData() {
		return {
			label: this.name,
			path: this.path,
			statSize: this.size,
			groups: _.invokeMap(this.children, 'toChartData')
		};
	}
}
