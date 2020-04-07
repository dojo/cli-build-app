import WidgetBase from '@dojo/framework/core/WidgetBase';
import { v, w } from '@dojo/framework/core/vdom';
import Route from '@dojo/framework/routing/Route';
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
			w(Route, {
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
