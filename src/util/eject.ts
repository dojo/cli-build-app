import { Config } from '@dojo/cli/interfaces';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

/**
 * @private
 * Clear the rc data for the specified key (e.g., "build-app") from the dojorc and return
 * the cleared data.
 *
 * @param key The rc key
 * @return The cleared data
 */
function clearBuildOptions(key: string): Config {
	const rcPath = path.join(process.cwd(), '.dojorc');
	if (fs.existsSync(rcPath)) {
		const rc = JSON.parse(fs.readFileSync(rcPath, 'utf8'));
		const config = rc[key] || {};
		rc[key] = {};
		fs.writeFileSync(rcPath, JSON.stringify(rc));
		return config;
	}
	return {};
}

/**
 * Extract the rc data for the provided key to a temporary file and remove it from the dojorc.
 * This utility is necessary given that "eject" is treated as a full command (see
 * https://github.com/dojo/cli/issues/192 for more details).
 *
 * @param key The rc key (e.g., "build-app")
 * @return The path to the temporary file
 */
export function moveBuildOptions(key: string): string {
	const tmpDir = fs.mkdtempSync(`${os.tmpdir()}${path.sep}`);
	const tmpRc = path.join(tmpDir, 'build-options.json');
	const rc = clearBuildOptions(key);
	fs.writeFileSync(tmpRc, JSON.stringify(rc));
	return tmpRc;
}
