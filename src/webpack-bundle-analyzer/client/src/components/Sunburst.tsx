import { dom, create } from '@dojo/framework/core/vdom';
import cache from '@dojo/framework/core/middleware/cache';
import * as d3 from 'd3';

import * as css from './Sunburst.m.css';

interface SunburstProperties {
	chartData: any;
	onHover: Function;
}

const factory = create({ cache }).properties<SunburstProperties>();

export const Sunburst = factory(function S({ middleware: { cache }, properties: { chartData, onHover } }) {
	let sunburst = cache.get('sunburst');
	if (!sunburst) {
		sunburst = document.createElement('div');
		cache.set('sunburst', sunburst);
	}

	if (chartData) {
		let svg = cache.get('svg');
		if (svg) {
			svg.remove();
		}
		const color = d3.scale.category20c();
		const width = 1000;
		const height = width + 50;

		const radius = Math.min(width, height) / 2.2;
		const x = d3.scale.linear().range([0, 2 * Math.PI]);
		const y = d3.scale.sqrt().range([0, radius]);

		svg = d3
			.select(sunburst)
			.append('svg')
			.attr('width', '100%')
			.attr('height', '100%')
			.attr('viewBox', `0 0 ${Math.min(width, height)} ${Math.min(width, height)}`)
			.attr('preserveAspectRatio', 'xMinYMin')
			.append('g')
			.attr('transform', `translate(${Math.min(width, height) / 2}, ${Math.min(width, height) / 2})`);

		const partition = d3.layout
			.partition()
			.value((d: any) => d.statSize)
			.children((d: any) => d.groups);

		const arc = d3.svg
			.arc()
			.startAngle((d: any) => Math.max(0, Math.min(2 * Math.PI, x(d.x))))
			.endAngle((d: any) => Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx))))
			.innerRadius((d: any) => Math.max(0, y(d.y)))
			.outerRadius((d: any) => Math.max(0, y(d.y + d.dy)));

		function arcTween(d: any) {
			const xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]);
			const yd = d3.interpolate(y.domain(), [d.y, 1]);
			const yr = d3.interpolate(y.range(), [d.y ? 20 : 0, radius]);

			return (d: any, i: any) => {
				return i
					? () => {
							return arc(d);
					  }
					: (t: any) => {
							x.domain(xd(t));
							y.domain(yd(t)).range(yr(t));
							return arc(d);
					  };
			};
		}

		const path = svg
			.selectAll('path')
			.data(partition.nodes(chartData))
			.enter()
			.append('path')
			.attr('d', arc)
			.style('fill', (d: any) => color((d.children || !d.parent ? d : d.parent).label))
			.on('click', (d: any) => {
				path.transition()
					.duration(750)
					.attrTween('d', arcTween(d));
			})
			.on('mouseover', (d: any) => {
				onHover(d);
			});
		onHover(chartData);
		return dom({
			node: sunburst,
			props: { key: 'sunburst', classes: [css.sunburst] }
		});
	}
});
