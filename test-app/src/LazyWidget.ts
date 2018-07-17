import WidgetBase from '@dojo/framework/widget-core/WidgetBase';
import { v } from '@dojo/framework/widget-core/d';

export default class LazyWidget extends WidgetBase {
	render() {
		return v('div', ['Lazy Widget using dojorc configuration']);
	}
}
