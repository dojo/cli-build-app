import WidgetBase from '@dojo/framework/widget-core/WidgetBase';
import { v, w } from '@dojo/framework/widget-core/d';
import Outlet from '@dojo/framework/routing/Outlet';
import LazyWidget from './LazyWidget';
import StaticAssetWidget from './StaticAssetWidget';
import RoutedWidget from './RoutedWidget';
import theme from '@dojo/themes/dojo';
import Button from '@dojo/widgets/button';
import Icon from '@dojo/widgets/icon';

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
			v('i', { classes: ['fab', 'fa-d-and-d'] }),
			v('div', { id: 'dojo-theme' }, [w(Button, { theme, popup: true }, [w(Icon, { theme, type: 'mailIcon' })])])
		]);
	}
}
