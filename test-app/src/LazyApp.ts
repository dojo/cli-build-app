import ProjectorMixin from '@dojo/framework/widget-core/mixins/Projector';
import WidgetBase from '@dojo/framework/widget-core/WidgetBase';
import { v, w } from '@dojo/framework/widget-core/d';
import LazyWidget from './LazyWidget';
import theme from '@dojo/themes/dojo';
import Button from '@dojo/widgets/button';
import Icon from '@dojo/widgets/icon';

export default class Projector extends ProjectorMixin(WidgetBase)<any> {
	render() {
		return v('div', [
			this.properties.render ? w(LazyWidget, {}) : null,
			v('a', { href: '' }, ['link']),
			v('i', { styles: { fontSize: '40px' }, classes: ['fab', 'fa-android'] }),
			v('div', { id: 'dojo-theme' }, [w(Button, { theme, popup: true }, [w(Icon, { theme, type: 'mailIcon' })])])
		]);
	}
}
