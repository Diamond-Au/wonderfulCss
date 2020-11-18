const gulp = require('gulp');
const sass = require('gulp-sass');
const Fiber = require('fibers');
const concat = require('gulp-concat');
const autoprefixer = require('autoprefixer');
const webserver = require('gulp-webserver');
const postcss = require('gulp-postcss');
const { watch } = require('gulp');
const babel = require('gulp-babel');
const htmlReplace = require('gulp-html-replace');
const rename = require('gulp-rename');
const path = require('path');
const browserifyJs = require('browserify');
const babelify = require('babelify');
const stream = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const uglify = require('gulp-uglify');
sass.compiler = require('node-sass');

// 编译scss文件
function sassT() {
  return gulp
    .src('./src/**/*.scss')
    .pipe(
      sass({ fiber: Fiber, outputStyle: 'compressed' }).on(
        'error',
        sass.logError
      )
    )
    .pipe(postcss([autoprefixer()]))
    .pipe(gulp.dest('./dist/'));
}

const watchJSX = watch('./src/**/*.jsx');
watchJSX.on('change', async function (pathL, stats) {
  console.log(`File, ${pathL} change`);
  let templatePath = [];
  templatePath.push(pathL);
  let dirname = path.parse(pathL).dir.replace('src\\', '');
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
  console.log('jsx finish');
});

// 监视html文件
const watchHTML = watch('./src/**/*.html');
watchHTML.on('change', function (pathL, stats) {
  console.log(`File, ${pathL} change`);
  let dirname = path.parse(pathL).dir.replace('src\\', '');
  console.log(dirname);
  gulp
    .src(pathL)
    .pipe(
      htmlReplace({
        css: './index.css',
        js: './index.js',
      })
    )
    .pipe(
      rename({
        dirname: dirname,
        basename: 'index',
        extname: '.html',
      })
    )
    .pipe(gulp.dest('./dist/'));
});

exports.default = () => {};
