import ProjectorMixin from '@dojo/framework/widget-core/mixins/Projector';
import WidgetBase from '@dojo/framework/widget-core/WidgetBase';
import { v, w } from '@dojo/framework/widget-core/d';
import LazyWidget from './LazyWidget';
import StaticAssetWidget from './StaticAssetWidget';

export default class Projector extends ProjectorMixin(WidgetBase)<any> {
	render() {
		return v('div', [
			this.properties.render ? w(LazyWidget, {}) : null,
			w(StaticAssetWidget, {}),
			v('a', { href: '' }, ['link'])
		]);
	}
}
