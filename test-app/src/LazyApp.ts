import WidgetBase from '@dojo/framework/core/WidgetBase';
import { v, w } from '@dojo/framework/core/vdom';
import Outlet from '@dojo/framework/routing/Outlet';
import LazyWidget from './LazyWidget';
import StaticAssetWidget from './StaticAssetWidget';
import RoutedWidget from './RoutedWidget';

import * as css from './app.m.css';

export default class Projector extends WidgetBase<any> {
	render() {
		return v('div', [
			v('span', { id: 'vars', classes: [css.app, css.root] }),
			w(LazyWidget, {}),
			w(StaticAssetWidget, {}),
			w(Outlet, {
				id: 'foo',
				renderer() {
					return w(RoutedWidget, {});
				}
			}),
			v('a', { href: '' }, ['link']),
			v('i', { classes: ['fab', 'fa-d-and-d'] })
		]);
	}
}
