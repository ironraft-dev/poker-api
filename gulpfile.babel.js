'use strict';

const gulp = require('gulp');
const babel = require('gulp-babel');
const gutil = require('gulp-util');
const del = require('del');

const Cache = require('gulp-file-cache');
let cache = new Cache();

const SRC = {
  API: 'api-dev/**/*.js'
};

const DEST = {
  API: 'api/controllers'
};

gulp.task('api', () => {
  return gulp.src(SRC.API)
    .pipe(cache.filter())
    .pipe(babel({
      presets: ['@babel/preset-env']
    }))
    .pipe(cache.cache())
    .pipe(gulp.dest(DEST.API));
});


gulp.task('clean', () => {
  return del([DEST.API]).then(paths => {
    console.log('Deleted files and folders:\n', paths.join('\n'));
  });
});


gulp.task('watch', () => {
  let watcher = {
    api: gulp.watch(SRC.API, ['api'])
  };

  let notify = (event) => {
    gutil.log('File', gutil.colors.yellow(event.path), 'was', gutil.colors.magenta(event.type));
  };

  for(let key in watcher) {
    watcher[key].on('change', notify);
  }
});

let tasks =  [ 'api'];
gulp.task('default', gulp.series(tasks), () => {
  return gutil.log('Gulp is running');
});
