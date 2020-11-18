const gulp = require('gulp');
const sass = require('gulp-sass');
const Fiber = require('fibers');
const autoprefixer = require('autoprefixer');
const postcss = require('gulp-postcss');
const { watch } = require('gulp');
const htmlReplace = require('gulp-html-replace');
const rename = require('gulp-rename');
const path = require('path');
const browserifyJs = require('browserify');
const babelify = require('babelify');
const stream = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const uglify = require('gulp-uglify');
sass.compiler = require('node-sass');

// sass 编译
function sassCompile(path, dirname) {
  gulp
    .src(path)
    .pipe(
      sass({ fiber: Fiber, outputStyle: 'compressed' }).on(
        'error',
        sass.logError
      )
    )
    .pipe(postcss([autoprefixer()]))
    .pipe(
      rename({
        dirname,
        basename: 'index',
        extname: '.css',
      })
    )
    .pipe(gulp.dest('./dist/'));
}
// html编译
function htmlCompile(path, dirname) {
  gulp
    .src(path)
    .pipe(
      htmlReplace({
        css: './index.css',
        js: './index.js',
      })
    )
    .pipe(
      rename({
        dirname,
        basename: 'index',
        extname: '.html',
      })
    )
    .pipe(gulp.dest('./dist/'));
}
// jsx编译
function jsxCompile(path, dirname) {
  let templatePath = [];
  templatePath.push(path);
  browserifyJs({
    entries: templatePath,
    debug: true,
    transform: [
      babelify.configure({
        presets: ['@babel/preset-env', '@babel/preset-react'],
      }),
    ],
  })
    .bundle()
    .pipe(stream('index.js'))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(
      rename({
        dirname: dirname,
        basename: 'index',
        extname: '.js',
      })
    )
    .pipe(gulp.dest('./dist/'));
}

const watcher = watch(
  ['./src/**/*.scss', './src/**/*.html', './src/**/*.jsx'],
  {}
);
watcher.on('change', function (pathL, stats) {
  console.log(`File, ${pathL} change`);
  let pathName = path.parse(pathL);
  let dirname = pathName.dir.replace('src\\', '');
  let extname = pathName.ext;
  if (extname === '.html') {
    htmlCompile(pathL, dirname);
  } else if (extname === '.scss') {
    sassCompile(pathL, dirname);
  } else if (extname === '.jsx') {
    jsxCompile(pathL, dirname);
  }
});

watcher.on('add', function (pathL, stats) {
  console.log(`File, ${pathL} add`);
});

exports.default = () => {};
