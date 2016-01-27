module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		ngAnnotate: {
			options: {
				singleQuotes: true
			},
			app: {
				files: {
					'./public/js/min/min-safe/lib.js': ['./public/js/lib/*.js'],
					'./public/js/min/min-safe/app.js': ['./public/js/app.js']
				}
			}
		},
		concat: {
			js: {
				src: ['./public/js/min/min-safe/app.js', './public/js/min/min-safe/lib.js'],
				dest: './public/js/min/min-safe/concat.js'
			},
			css: {
				src: './public/styles/*.css',
				dest: './public/concat.css'
			}
		},
		uglify: {
			js: {
				src: ['./public/js/min/min-safe/concat.js'],
				dest: './public/js/min/app-min.js'
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-ng-annotate');

	grunt.registerTask('default', ['ngAnnotate', 'concat', 'uglify']);
};
