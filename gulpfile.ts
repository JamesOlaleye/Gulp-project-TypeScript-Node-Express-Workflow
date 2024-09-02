import gulp from 'gulp';
import ts from 'gulp-typescript';
import sass from 'gulp-sass';
import ejs from 'gulp-ejs';
import rename from 'gulp-rename';
import eslint from 'gulp-eslint';
import mocha from 'gulp-mocha';
import browserSync from 'browser-sync';

const tsProject = ts.createProject('tsconfig.json');
const sync = browserSync.create();

// TypeScript Compilation Task
gulp.task("typescript", () => {
    return tsProject.src()
        .pipe(tsProject())
        .pipe(gulp.dest("dist"));
});

// Sass Compilation Task
gulp.task("sass", () => {
    return gulp.src("src/sass/**/*.scss")
        .pipe(sass().on("error", sass.logError))
        .pipe(gulp.dest("dist/public/stylesheets"))
        .pipe(sync.stream());
});

// EJS Compilation Task
gulp.task("ejs", () => {
    return gulp.src("src/views/**/*.ejs")
        .pipe(ejs({
            title: "Hello Semaphore!"
        }))
        .pipe(rename({ extname: ".html" }))
        .pipe(gulp.dest("dist/public"));
});

// Linting Task
gulp.task("lint", () => {
    return gulp.src(["src/**/*.ts", "!node_modules/**"])
        .pipe(eslint({}))
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

// Testing Task
gulp.task("test", () => {
    return gulp.src("test/**/*.test.ts", { read: false })
        .pipe(mocha({ require: ["ts-node/register"] }))
        .on("error", () => process.exit(1));
});

// Watch Task
gulp.task("watch", () => {
    gulp.watch("src/**/*.ts", gulp.series("typescript", "lint", "test"));
    gulp.watch("src/sass/**/*.scss", gulp.series("sass"));
    gulp.watch("src/views/**/*.ejs", gulp.series("ejs"));
});

// BrowserSync Task
gulp.task("sync", () => {
    sync.init({
        server: {
            baseDir: "./dist/public"
        }
    });

    gulp.watch("src/views/**/*.ejs", gulp.series("ejs")).on("change", sync.reload);
    gulp.watch("src/sass/**/*.scss", gulp.series("sass"));
    gulp.watch("dist/public/**/*.html").on("change", sync.reload);
});

// Default Task
gulp.task("default", gulp.series(
    "lint",
    gulp.parallel("typescript", "sass", "ejs"),
    "test",
    "sync"
));

