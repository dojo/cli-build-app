import BaseFolder from './BaseFolder';

export default class ContentFolder extends BaseFolder {
	private ownerModule: any;

	constructor(name: string, ownerModule: any, parent?: any) {
		super(name, parent);
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
			parsedSize: this.parsedSize,
			gzipSize: this.gzipSize,
			inaccurateSizes: true
		};
	}
}
