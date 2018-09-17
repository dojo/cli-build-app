import ProjectorMixin from '@dojo/framework/widget-core/mixins/Projector';
import WidgetBase from '@dojo/framework/widget-core/WidgetBase';
import { v, w } from '@dojo/framework/widget-core/d';
import Outlet from '@dojo/framework/routing/Outlet';
import LazyWidget from './LazyWidget';
import StaticAssetWidget from './StaticAssetWidget';
import RoutedWidget from './RoutedWidget';

export default class Projector extends ProjectorMixin(WidgetBase)<any> {
	render() {
		return v('div', [
			this.properties.render ? w(LazyWidget, {}) : null,
			w(StaticAssetWidget, {}),
			w(Outlet, {
				id: 'foo',
				renderer() {
					return w(RoutedWidget, {});
				}
			}),
			v('a', { href: '' }, ['link'])
		]);
	}
}
