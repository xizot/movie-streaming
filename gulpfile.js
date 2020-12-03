const del = require('del');
const gulp = require('gulp');
const rename = require('gulp-rename');


const browserSync = require('browser-sync').create();
const imagemin = require("gulp-imagemin");

//Import sass - Build scss to css
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const cleanCss = require('gulp-clean-css');


//Import Js - Clean Js
const terser = require('gulp-terser');
require('es6-promise').polyfill();

//Import ejs - Build ejs to html
const ejs = require('gulp-ejs');


//var replace = require('gulp-replace');
var cachebust = require('gulp-cache-bust');

//dirname
const devDir = './dev';
const buildDir = './public';


// Clean assets
function clean() {
    return del([buildDir+"/assets/"]);
}

//Compile scss to css
function style(){
    return gulp
        //1. Where is my scss file
        .src(devDir+'/assets/sass/**/*.scss')

        //2. sourceMap scss
        .pipe(sourcemaps.init())

        //3. pass that file through sass compilier
        .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))

        //4. auto prefix
        .pipe(autoprefixer({
            cascade: false
        }))

        //5. source map css
        // .pipe(sourcemaps.write('.'))
        
        //6. Where do I save the compiled CSS?
        .pipe(gulp.dest(buildDir+'/assets/css'))
        //7. minify
        .pipe(
            rename({
            suffix: ".min",
        }))
        .pipe(cleanCss())
        .pipe(gulp.dest(buildDir+'/assets/css'))
        //8. stream changes to all browser
        .pipe(browserSync.stream());
}

//JS
function scripts(){
    return gulp
        .src(devDir+'/assets/js/**/*.js')
        .pipe(gulp.dest(buildDir+'/assets/js'))
        .pipe(
            rename({
            suffix: ".min",
        }))
        .pipe(terser())
        .pipe(gulp.dest(buildDir+'/assets/js'));
}


//JS
function vendor(){
    return gulp
        .src(devDir+'/assets/vendor/')
        .pipe(gulp.dest(buildDir+'/assets/vendor'));
}


//Images
function images(){
    return gulp
        .src(devDir+'/assets/img/**/*.+(jpg|jpeg|png|gif|svg)')
        .pipe(imagemin())
        .pipe(gulp.dest(buildDir+ "/assets/img"));
}
//vendor
function vendor(){
    return gulp
        .src(devDir+'/assets/vendor/**/*')
        .pipe(gulp.dest(buildDir+ "/assets/vendor"));
}

//Compile ejs to html
function ejsTemplate(){
    return gulp
        .src(devDir+'/ejs/*.ejs')
        .pipe(ejs({ title: 'gulp-ejs' }))
        .pipe(rename({ extname: '.html' }))
        .pipe(cachebust({
            type: 'timestamp'
        }))
        .pipe(gulp.dest(buildDir))
}

function watch(){
    browserSync.init({
        server: {
            baseDir: buildDir
        },
        port: 8080
    });
    gulp.watch(devDir+'/assets/sass/**/*.scss', gulp.parallel(style, ejsTemplate));
    gulp.watch(devDir+'/assets/js/**/*.js', gulp.parallel(scripts, ejsTemplate));
    gulp.watch(devDir+'/assets/img/*', images);
    gulp.watch(devDir+'/assets/vendor/*', vendor);
    gulp.watch(devDir+'/ejs/**/*.ejs',ejsTemplate);
    gulp.watch(buildDir+'/*.html').on('change', browserSync.reload);
}

exports.build = gulp.series(clean, gulp.parallel(style, scripts, images, ejsTemplate,vendor));
exports.watch = watch;



