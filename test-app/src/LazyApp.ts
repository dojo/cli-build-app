import ProjectorMixin from '@dojo/framework/widget-core/mixins/Projector';
import WidgetBase from '@dojo/framework/widget-core/WidgetBase';
import { v, w } from '@dojo/framework/widget-core/d';
import LazyWidget from './LazyWidget';

export default class Projector extends ProjectorMixin(WidgetBase)<any> {
	render() {
		return v('div', [this.properties.render ? w(LazyWidget, {}) : null, v('a', { href: '' }, ['link'])]);
	}
}
