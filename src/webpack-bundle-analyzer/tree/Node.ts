export default class BaseNode {
	public name: string;
	public parent: BaseNode | undefined;

	constructor(name: string, parent?: BaseNode) {
		this.name = name;
		this.parent = parent;
	}

	get path() {
		const path = [];
		let node: BaseNode | undefined = this;

		while (node) {
			path.push(node.name);
			node = node.parent;
		}

		return path.reverse().join('/');
	}
}
