module.exports = function(grunt) {
	require('grunt-dojo2').initConfig(grunt, {
		staticDefinitionFiles: [ '**/*.d.ts', '**/*.html', '**/*.md', '**/*.json' ],
		copy: {
			'staticDefinitionFiles-dev': {
				expand: true,
				cwd: 'src',
				src: [ '**/*.md', '**/*.json' ],
				dest: '<%= devDirectory %>/src/'
			}
		},
        intern: {
		    version: 4
        }
	});
};
