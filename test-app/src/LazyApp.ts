import ProjectorMixin from '@dojo/widget-core/mixins/Projector';
import WidgetBase from '@dojo/widget-core/WidgetBase';
import { v, w } from '@dojo/widget-core/d';
import LazyWidget from './LazyWidget';

export default class Projector extends ProjectorMixin(WidgetBase)<any> {
	render() {
		return v('div', [this.properties.render ? w(LazyWidget, {}) : null]);
	}
}
