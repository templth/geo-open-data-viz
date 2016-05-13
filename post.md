http://stackoverflow.com/questions/36285064/how-do-i-actually-deploy-an-angular-2-typescript-systemjs-app


The key thing to understand at this level is that using the following configuration, you can contain concat compiled JS files directly.

At the TypeScript compiler configuration:

    {
      "compilerOptions": {
        "emitDecoratorMetadata": true,
        "experimentalDecorators": true,
        "declaration": false,
        "stripInternal": true,
        "module": "system",
        "moduleResolution": "node",
        "noEmitOnError": false,
        "rootDir": ".",
        "inlineSourceMap": true,
        "inlineSources": true,
        "target": "es5"
      },
      "exclude": [
        "node_modules"
      ]
    }


In the HTML

    System.config({
      packages: {
        app: {
          defaultExtension: 'js',
          format: 'register'
        }
      }
    });

As a matter of fact, these JS files will contain anonymous modules. An anonymous module is a JS file that uses `System.register` but without the module name as first parameter. This is what the typescript compiler generates by default when systemjs is configured as module manager.

So to have all your modules into a single JS file, you need to leverage the `outFile` property within your TypeScript compiler configuration.

You can use the following inside gulp to do that:

    const gulp = require('gulp');
    const ts = require('gulp-typescript');

    var tsProject = ts.createProject('tsconfig.json', {
	  typescript: require('typescript'),
      outFile: 'app.js'
    });

    gulp.task('tscompile', function () {
      var tsResult = gulp.src('./app/**/*.ts')
                         .pipe(ts(tsProject));

      return tsResult.js.pipe(gulp.dest('./dist'));
    });

This could be combined with some other processing:

* to uglify things