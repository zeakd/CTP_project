var gulp = require('gulp');
var gutil = require("gulp-util");
var sass = require("gulp-sass");

var browserSync = require("browser-sync").create();

gulp.task("default", function () {
  
});

gulp.task("script");
gulp.task("style", ["sass"]);
gulp.task("serve", ["browserSync:dev"]);

gulp.task("browserSync:dev", ["sass"], function () {
    browserSync.init({
        server: {
            baseDir: ["./src", "./tmp"]
        },
        browser: "google chrome"
    });
    gulp.watch("src/assets/styles/**/*.scss", ['sass']);
    gulp.watch([
        'src/*.html',
        'src/assets/scripts/**/*.js',
        'tmp/assets/styles/**/*.css'
    ]).on('change', browserSync.reload);
})

gulp.task("browserify", function () {
    return browserify("src/scripts/main.js")
      .bundle()
      .pipe(source("main.js"))
      .pipe(gulp.dest("dist/scripts"));
});

gulp.task("sass", function () {
    gulp.src("src/assets/styles/**/*.scss")
      .pipe(sass().on('error', sass.logError))
      .pipe(gulp.dest("tmp/assets/styles"));
});
