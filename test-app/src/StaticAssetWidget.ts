import WidgetBase from '@dojo/framework/core/WidgetBase';
import { v } from '@dojo/framework/core/vdom';

export default class PublicAssetWidget extends WidgetBase {
	render() {
		return v('img', {
			src: '/assets/dojo.svg'
		});
	}
}
