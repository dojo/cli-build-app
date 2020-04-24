import * as _ from 'lodash';

import Module from './Module';
import ContentModule from './ContentModule';
import ContentFolder from './ContentFolder';
import { getModulePathParts } from './utils';
import BaseNode from './Node';

export default class ConcatenatedModule extends Module {
	private children: any;

	constructor(name: string, data: any, parent?: BaseNode) {
		super(name, data, parent);
		this.name += ' (concatenated)';
		this.children = Object.create(null);
		this.fillContentModules();
	}

	fillContentModules() {
		_.each(this.data.modules, (moduleData: any) => this.addContentModule(moduleData));
	}

	addContentModule(moduleData: any) {
		const pathParts = getModulePathParts(moduleData);

		if (!pathParts) {
			return;
		}

		const [folders, fileName] = [pathParts.slice(0, -1), _.last(pathParts)];
		let currentFolder = this;

		_.each(folders, (folderName: any) => {
			let childFolder = currentFolder.getChild(folderName);

			if (!childFolder) {
				childFolder = currentFolder.addChildFolder(new ContentFolder(folderName, this));
			}

			currentFolder = childFolder;
		});

		const module = new ContentModule(fileName, moduleData, this);
		currentFolder.addChildModule(module);
	}

	getChild(name: any) {
		return this.children[name];
	}

	addChildModule(module: any) {
		module.parent = this;
		this.children[module.name] = module;
	}

	addChildFolder(folder: any) {
		folder.parent = this;
		this.children[folder.name] = folder;
		return folder;
	}

	toChartData() {
		return {
			...super.toChartData(),
			concatenated: true,
			groups: _.invokeMap(this.children, 'toChartData')
		};
	}
}
