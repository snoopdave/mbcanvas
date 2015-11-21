
module.exports = function (grunt) {
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-typescript');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-open');

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    connect: {
      server: {
        options: {
          port: 8080,
          base: './'
        }
      }
    },
    typescript: {
      base: {
        src: ['src/*.ts'],
        options: {
          target: 'es5',
          "module": "commonjs"
        }
      }
    },
    watch: {
      files: 'src/*.ts',
      tasks: ['typescript']
    },
    open: {
      dev: {
        path: 'http://localhost:8080/index.html'
      }
    },
    browserify: {
      'public/app.js': ['src/index.js', 'src/Graphics.js', 'src/MandelbrotCanvas.js'],
      'browserifyOptions': {
        standalone: 'MbCanvas'
      }
    }
  })
    
  grunt.registerTask('default', ['typescript', 'browserify', 'connect', 'open', 'watch']);
}
