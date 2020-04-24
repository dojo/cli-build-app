import * as path from 'path';
import * as _ from 'lodash';
import * as gzipSize from 'gzip-size';
import Folder from './tree/Folder';
import { parseBundle } from './parseUtils';

const FILENAME_QUERY_REGEXP = /\?.*$/;

export function getViewerData(bundleStats: any, bundleDir?: string | null) {
	if (_.isEmpty(bundleStats.assets) && !_.isEmpty(bundleStats.children)) {
		bundleStats = bundleStats.children[0];
	}

	bundleStats.assets = _.filter(bundleStats.assets, (asset) => {
		asset.name = asset.name.replace(FILENAME_QUERY_REGEXP, '');
		return _.endsWith(asset.name, '.js') && !_.isEmpty(asset.chunks);
	});

	let bundlesSources: any = null;
	let parsedModules: any = null;

	if (bundleDir) {
		bundlesSources = {};
		parsedModules = {};

		for (const statAsset of bundleStats.assets) {
			const assetFile = path.join(bundleDir, statAsset.name);
			let bundleInfo;

			try {
				bundleInfo = parseBundle(assetFile);
			} catch (err) {
				bundleInfo = null;
			}

			if (bundleInfo) {
				bundlesSources[statAsset.name] = bundleInfo.src;
				_.assign(parsedModules, bundleInfo.modules);
			}
		}
	}

	const assets = _.transform(
		bundleStats.assets,
		(result: any, statAsset: any) => {
			const asset: any = (result[statAsset.name] = _.pick(statAsset, 'size'));

			if (bundlesSources && bundlesSources[statAsset.name]) {
				asset.parsedSize = bundlesSources[statAsset.name].length;
				asset.gzipSize = gzipSize.sync(bundlesSources[statAsset.name]);
			}

			asset.modules = _(bundleStats.modules)
				.filter((statModule) => assetHasModule(statAsset, statModule))
				.each((statModule) => {
					if (parsedModules) {
						statModule.parsedSrc = parsedModules[statModule.id];
					}
				});

			asset.tree = createModulesTree(asset.modules);
			asset.chunks = statAsset.chunkNames || statAsset.chunks;
		},
		{}
	);

	return _.transform(
		assets,
		(result: any, asset: any, filename: any) => {
			result.push({
				label: filename,
				statSize: asset.tree.size,
				parsedSize: asset.parsedSize,
				gzipSize: asset.gzipSize,
				groups: _.invokeMap(asset.tree.children, 'toChartData'),
				chunks: asset.chunks
			});
		},
		[]
	);
}

function assetHasModule(statAsset: any, statModule: any) {
	return _.some(statModule.chunks, (moduleChunk) => _.includes(statAsset.chunks, moduleChunk));
}

function createModulesTree(modules: any) {
	const root = new Folder('.');

	_.each(modules, (module) => root.addModule(module));

	return root;
}
