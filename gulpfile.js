const gulp = require("gulp");
const { watch } = require("gulp");
const sass = require("gulp-sass");
const Fiber = require("fibers");
const autoprefixer = require("autoprefixer");
const postcss = require("gulp-postcss");
const htmlReplace = require("gulp-html-replace");
const rename = require("gulp-rename");
const path = require("path");
const browserifyJs = require("browserify");
const babelify = require("babelify");
const stream = require("vinyl-source-stream");
const buffer = require("vinyl-buffer");
const uglify = require("gulp-uglify");
const babel = require("gulp-babel");
const ejs = require("gulp-ejs");
const fs = require("fs");
const webserver = require("gulp-webserver");
sass.compiler = require("node-sass");

// sass 编译
function sassCompile(path, dirname) {
  gulp
    .src(path)
    .pipe(
      sass({ fiber: Fiber, outputStyle: "compressed" }).on(
        "error",
        sass.logError
      )
    )
    .pipe(postcss([autoprefixer()]))
    .pipe(
      rename({
        dirname,
        basename: "index",
        extname: ".css",
      })
    )
    .pipe(gulp.dest("./dist/"));
}
// html编译
function htmlCompile(path, dirname) {
  gulp
    .src(path)
    .pipe(
      htmlReplace({
        css: "./index.css",
        js: "./index.js",
      })
    )
    .pipe(
      rename({
        dirname,
        basename: "index",
        extname: ".html",
      })
    )
    .pipe(gulp.dest("./dist/"));
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
        presets: ["@babel/preset-env", "@babel/preset-react"],
      }),
    ],
  })
    .bundle()
    .pipe(stream("index.js"))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(
      rename({
        dirname: dirname,
        basename: "index",
        extname: ".js",
      })
    )
    .pipe(gulp.dest("./dist/"));
}
const watcher = watch(
  ["./src/**/*.scss", "./src/**/*.html", "./src/**/*.jsx"],
  {}
);
watcher.on("change", function (pathL, stats) {
  console.log(`File, ${pathL} change`);
  let pathName = path.parse(pathL);
  let dirname = pathName.dir.replace("src\\", "");
  let extname = pathName.ext;
  if (extname === ".html") {
    htmlCompile(pathL, dirname);
  } else if (extname === ".scss") {
    sassCompile(pathL, dirname);
  } else if (extname === ".jsx") {
    jsxCompile(pathL, dirname);
  }
});

const RouterWatch = watch("./src/*");
RouterWatch.on("addDir", function (router) {
  console.log(`${router} change`);
  const { name } = path.parse(router);
  gulp
    .src("./template/index1.ejs")
    .pipe(
      ejs({
        name,
      })
    )
    .pipe(
      rename({
        basename: "index",
        extname: ".html",
      })
    )
    .pipe(gulp.dest(router));
  htmlCompile(`./${router}/index.html`, name);
  buildRouter();
});

// 生成路由
function buildRouter() {
  let routers = fs.readdirSync("./src");
  routers = routers.map((router) => {
    let template = path.join("./src", router);
    let stat = fs.lstatSync(template);
    if (stat.isDirectory()) {
      return {
        link: "./" + router,
        fileName: "index.html",
        linkName: router,
      };
    }
  });
  routers = routers.filter((v) => v !== undefined);
  return gulp
    .src("./src/index.ejs")
    .pipe(
      ejs({
        routes: routers,
      })
    )
    .pipe(
      rename({
        extname: ".html",
      })
    )
    .pipe(gulp.dest("./dist"));
}

function server() {
  return gulp.src("./dist").pipe(
    webserver({
      open: false,
      fallback: "index.html",
      allowEmpty: true,
      livereload: {
        enable: true,
        filter: function (fileName) {
          if (fileName === "index.html") {
            return true;
          } else {
            return false;
          }
        },
      },
    })
  );
}

function build() {
  buildRouter();
  htmlCompile("./src/ios-switch/index.html", "ios-switch");
  sassCompile("./src/ios-switch/index.scss", "ios-switch");
  jsxCompile("./src/ios-switch/index.jsx", "ios-switch");
}

exports.default = gulp.parallel(server, build);
