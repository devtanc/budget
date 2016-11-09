var gulp = require('gulp')
var concat = require('gulp-concat')
var sourcemaps = require('gulp-sourcemaps')
var uglify = require('gulp-uglify')
var ngAnnotate = require('gulp-ng-annotate')
var cleanCSS = require('gulp-clean-css');

var clientJS  = ['public/js/app.js', 'public/js/lib/*.js'];
var clientCSS = ['public/styles/*.css'];
var serverJS  = [];

gulp.task('client-js', function () {
  gulp.src(clientJS)
  .pipe(sourcemaps.init())
    .pipe(concat('app.min.js'))
    .pipe(ngAnnotate())
    .pipe(uglify())
  .pipe(sourcemaps.write())
  .pipe(gulp.dest('./public/min'))
});

gulp.task('server-js', function() {
  gulp.src(serverJS)
  .pipe(sourcemaps.init())
    .pipe(concat('server.min.js'))
    .pipe(uglify())
  .pipe(sourcemaps.write())
  .pipe(gulp.dest('.'))
});

gulp.task('css', function() {
  gulp.src(clientCSS)
  .pipe(sourcemaps.init())
    .pipe(concat('styles.min.css'))
    .pipe(cleanCSS())
  .pipe(sourcemaps.write())
  .pipe(gulp.dest('./public/min'))
});

gulp.task('build', ['client-js', 'css']);

gulp.task('watch', ['build'], function () {
  gulp.watch(clientJS, ['client-js'])
  gulp.watch(clientCSS, ['css'])
  // gulp.watch(serverJS, ['server-js'])
});
