const gulp = require('gulp');
const ts = require('gulp-typescript');
const uglify = require('gulp-uglify');
// See https://www.npmjs.com/package/gulp-npm-files
const gnf = require('gulp-npm-files');
const concat = require('gulp-concat');
const useref = require('gulp-useref-plus');
const gulpif = require('gulp-if');
var htmlreplace = require('gulp-html-replace');
var addsrc = require('gulp-add-src');

// See this article: http://caveofcode.com/2016/03/gulp-tasks-for-minification-and-concatenation-of-dependencies-in-angularjs/

gulp.task('app-bundle', function () {
  var tsProject = ts.createProject('tsconfig.json', {
	  typescript: require('typescript'),
	  outFile: 'app.js',
    rootDir: 'app'
  });

  var tsResult = gulp.src('app/**/*.ts')
					.pipe(ts(tsProject));

  return tsResult.js/*.pipe(addsrc.append('config-prod.js'))*/
                    .pipe(concat('app.min.js'))
                    //.pipe(uglify())
                    .pipe(gulp.dest('./dist'));
});

gulp.task('vendor-bundle', function() {
	gulp.src([
			'node_modules/es6-shim/es6-shim.min.js',
			'node_modules/systemjs/dist/system-polyfills.js',
			'node_modules/angular2/bundles/angular2-polyfills.js',
			'node_modules/systemjs/dist/system.src.js',
			'node_modules/rxjs/bundles/Rx.js',
			'node_modules/angular2/bundles/angular2.dev.js',
			'node_modules/angular2/bundles/http.dev.js'
		])
		.pipe(concat('vendors.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./dist'));
});

gulp.task('htmlreplace', function() {
  gulp.src('gulp.html')
    .pipe(htmlreplace({
        'vendor': 'vendors.min.js',
        'app': 'app.min.js',
        'boot': 'boot.min.js'
    }))
    .pipe(gulp.dest('dist'));
});

gulp.task('html', function () {
  var tsProject = ts.createProject('tsconfig.json', {
	  typescript: require('typescript'),
	  out: 'app.js'
  });

  var tsResult = gulp.src('./app/**/*.ts')
					.pipe(ts(tsProject));

    return gulp.src([ 'gulp.html' ])
        .pipe(useref({
           additionalStreams: [tsResult],
           transformPath: function(filePath) {
                //return filePath.replace('/rootpath','')
                console.log('filepath');
                console.log(filePath);
                if (filePath.endsWith('config.js')) {
                	return filePath.replace('config.js', 'config-prod.js');
                } else {
                	return filePath;
                }
           }
        }))
        //.pipe(gulpif('*.js', uglify()))
        //.pipe(gulpif('*.css', minifyCss()))
        .pipe(gulp.dest('dist'));
});