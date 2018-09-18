import WidgetBase from '@dojo/framework/widget-core/WidgetBase';
import { v, w } from '@dojo/framework/widget-core/d';
import Outlet from '@dojo/framework/routing/Outlet';
import LazyWidget from './LazyWidget';
import StaticAssetWidget from './StaticAssetWidget';
import RoutedWidget from './RoutedWidget';

export default class Projector extends WidgetBase<any> {
	render() {
		return v('div', [
			w(LazyWidget, {}),
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
