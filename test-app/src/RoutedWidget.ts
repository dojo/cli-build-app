import WidgetBase from '@dojo/framework/core/WidgetBase';
import ChildRoutedWidget from './ChildRoutedWidget';
import Route from '@dojo/framework/routing/Route';
import { w } from '@dojo/framework/core/vdom';

export default class RoutedWidget extends WidgetBase {
	protected render() {
		return w(Route, {
			id: 'bar',
			renderer() {
				return w(ChildRoutedWidget, {});
			}
		});
	}
}
