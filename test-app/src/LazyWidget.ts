import WidgetBase from '@dojo/widget-core/WidgetBase';
import { v } from '@dojo/widget-core/d';

export default class LazyWidget extends WidgetBase {
	render() {
		return v('div', ['Lazy Widget using dojorc configuration']);
	}
}
