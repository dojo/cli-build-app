import WidgetBase from '@dojo/framework/widget-core/WidgetBase';
import { v } from '@dojo/framework/widget-core/d';

export default class PublicAssetWidget extends WidgetBase {
	render() {
		return v('img', {
			src: '/assets/dojo.svg'
		});
	}
}
