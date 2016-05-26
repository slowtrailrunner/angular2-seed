const gulp = require('gulp');
const autoprefixer = require('gulp-autoprefixer');
const sass = require('gulp-sass');
const cssClean = require('gulp-clean-css');

/* JS & TS */
const typescript = require('gulp-typescript');
const sourcemaps = require('gulp-sourcemaps');

const del = require('del');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const minifyCss = require('gulp-minify-css');
const filter = require('gulp-filter');
const useref = require('gulp-useref');
const gulpif = require('gulp-if');
const minimist = require('minimist');


const assetsDev = 'assets/';
const assetsProd = 'src/';

const appDev = 'dev/';
const appProd = 'app/';

var knownOptions = {
    string: 'env',
    default: {env: 'development'}
};

var options = minimist(process.argv.slice(2), knownOptions);

var tsProject = typescript.createProject('tsconfig.json',{
    typescript: require('typescript'),
        outFile: 'app.js'
});


gulp.task('build-css', function () {
    return gulp.src(assetsDev + 'scss/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass({}).on('error', sass.logError))
        .pipe(sourcemaps.write())
        .pipe(autoprefixer({
            browsers: ['last 3 versions'],
            cascade: false
        }))
        .pipe(cssClean({compatibility: 'ie8'}))
        .pipe(gulpif(options.env === 'production', minifyCss()))
        .pipe(gulp.dest(assetsProd + 'css/'));
});

gulp.task('build-ts', function () {
    return gulp.src(appDev + '**/*.ts')
        .pipe(sourcemaps.init())
        .pipe(typescript(tsProject))
        .pipe(sourcemaps.write())
        .pipe(gulpif(options.env === 'production', uglify()))
        .pipe(gulp.dest(appProd));
});

gulp.task('bundle-ts', ['build-ts'], function() {
    var path = require("path");
    var Builder = require('systemjs-builder');

// optional constructor options
// sets the baseURL and loads the configuration file
    var builder = new Builder('', 'systemjs.config.js');

    builder
        .buildStatic('app/boot.js', 'app/bundle.js', { minify: true, sourceMaps: true})
        .then(function() {
            console.log('Build complete');
        })
        .catch(function(err) {
            console.log('Build error');
            console.log(err);
        });
});

// clean the contents of the distribution directory
gulp.task('clean', function () {
    return del(config.buildDir+'/**/*');
});

gulp.task('watch', function () {
    gulp.watch(appDev + '**/*.ts', ['build-ts']);
    gulp.watch(assetsDev + 'scss/**/*.scss', ['build-css']);
});

gulp.task('default', ['watch', 'build-ts', 'bundle-ts', 'build-css']);