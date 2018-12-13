const fs = require('fs');

export default function(path: string) {
	return fs.readFileSync(path, 'utf-8');
}
