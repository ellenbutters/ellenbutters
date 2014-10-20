module.exports = function(grunt) {

    // Load build config
    var conf = grunt.file.readJSON('build.json');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        watch: {
            files: ['assets/js/**/*.js'],
            tasks: ['default']
        },

        concat: {
            js : {
                src : conf.js,
                dest : 'assets/build/combined.js'
            }
        },

        uglify : {
            js: {
                files: {

                    'assets/build/combined.js' : [ 'assets/build/combined.js' ]
                }
            }
        }

    });


    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.registerTask('default', ['concat:js', 'uglify:js']);
};