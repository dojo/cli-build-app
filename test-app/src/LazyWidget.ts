import WidgetBase from '@dojo/framework/core/WidgetBase';
import { v } from '@dojo/framework/core/vdom';

export default class LazyWidget extends WidgetBase {
	render() {
		return v('div', ['Lazy Widget using dojorc configuration']);
	}
}
