import Module from './Module';

export default class ContentModule extends Module {
	private ownerModule: any;

	constructor(name: string, data: any, ownerModule: any, parent?: any) {
		super(name, data, parent);
		this.ownerModule = ownerModule;
	}

	get parsedSize() {
		return this.getSize('parsedSize');
	}

	get gzipSize() {
		return this.getSize('gzipSize');
	}

	getSize(sizeType: any) {
		const ownerModuleSize = this.ownerModule[sizeType];

		if (ownerModuleSize !== undefined) {
			return Math.floor((this.size / this.ownerModule.size) * ownerModuleSize);
		}
	}

	toChartData() {
		return {
			...super.toChartData(),
			inaccurateSizes: true
		};
	}
}
