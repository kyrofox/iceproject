var gulp = require('gulp');
var minifyCss = require('gulp-minify-css');
var zip = require('gulp-zip');
var del = require('del');
var uglify = require("gulp-uglify");
var pump = require('pump');

//Where we save the .zip.
var zipFile = 'iceproject.zip';


//Copy over files that need no handling.
gulp.task('assets', function() {
	gulp.src(['src/img/**/*', 'src/manifest.json'], {base: 'src'})
	.pipe(gulp.dest('dist/'));
});

//Make js files smaller.
gulp.task('js', function(cb) {
	pump([
        gulp.src('src/js/**/*.js', {base: 'src'}),
        uglify(),
        gulp.dest('dist/')
    ],
    cb
  );
})

//Minify our css.
gulp.task('css', function() {
    gulp.src('src/css/**/*', {base: 'src'})
    .pipe(minifyCss())
    .pipe(gulp.dest('dist/'));
});

//Delte old files.
gulp.task('clean', function() {
	return del([
		'dist/**/*',
		zipFile
	]);
});

//Create a zip file.
gulp.task('zip', function() {
	gulp.src('dist/**/*')
	.pipe(zip(zipFile))
	.pipe(gulp.dest('./'));
});

//Default creates the entire distribution.
gulp.task('default', ['assets', 'js', 'css'], function() {

});
