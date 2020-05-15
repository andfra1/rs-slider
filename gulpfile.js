const gulp = require('gulp'),
    browserSync = require('browser-sync').create(),
    plumber = require('gulp-plumber'),
    rename = require('gulp-rename'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    cmq = require('gulp-merge-media-queries'),
    terser = require('gulp-terser'), //zamiast gulp-uglify (ktory BYŁ(!!) deprecated)
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    minifycss = require('gulp-clean-css'),
    eslint = require('gulp-eslint'),
    babel = require('gulp-babel'),
    cache = require('gulp-cache');

/* paths */
let path = {
    css: {
        dev: [
            '_dev/*.scss'
        ],
        prod: 'build/',
        scssDir: '_dev/'
    },
    js: {
        dev: [
            '_dev/*.js',
        ],
        src: {
            'rs-slider': [
                '_dev/*.js',
            ]

        },
        prod: 'build/'
    }
};

// tutaj dodajemy core-owe pliki SCSS z importami
let scssFileNames = [
    "rs-slider"
];


let onError = (err) => {
    console.log(err);
};

//sprawdza wszystkie core-owe pliki SCSS, wyrzuca komunikat, włącza watcher
function css(done) {
    scssFileNames.forEach((name) => {
        coreScss(name);
    });
    done();
    notify('SCSS przekręcony').write('');
}

//minifikuje wszystkie utworzone CSS-y
function cssProd(done) {
    scssFileNames.forEach((name) => {
        cssMin(name);
    });
    done();
}

//skleja wsystkie JS-y do plikow o nazwie path.js.src.-nazwa-
function js(done) {
    Object.keys(path.js.src).forEach((name) => {
        coreJs(path.js.src[name], name);
    });
    done();
    notify('JS przekręcony').write('');
}

//minifikuje wszystkie utworzone JS-y
function jsProd(done) {
    Object.keys(path.js.src).forEach((name) => {
        jsMin(path.js.src[name], name);
    });
    done();
}

//glowna funkcja od przekrecania SCSS
function coreScss(name) {
    return gulp.src(path.css.scssDir + name + '.scss')
        .pipe(plumber({
            handleError: onError
        }))
        .pipe(sass()
            .on('error', sass.logError))
        //dodaje prefixy
        .pipe(autoprefixer({
            overrideBrowserslist: "cover 100%"
        }))
        //scala media-queries
        .pipe(cmq())
        //scala i zapisuje do pliku css
        .pipe(concat(name + '.css'))
        //wrzuca do katalogu produkcji
        .pipe(gulp.dest(path.css.prod))
        //dodaje suffix min - zawczasu, plik nie jest zminifikowany tutaj!
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest(path.css.prod))
    //.pipe(notify("CSS - Utworzono: " + name + ".css"))
}

function coreJs(srcPath, name) {
    return gulp.src(srcPath, name)
        .pipe(plumber({
            handleError: onError
        }))
        // .pipe(babel({
        //     presets: ['@babel/preset-env']
        // }))
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError())
        .pipe(concat(name + '.js'))
        .pipe(gulp.dest(path.js.prod))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest(path.js.prod))
    //.pipe(notify("JS - utworzono: " + name + ".js"));

}

function cssMin(name) {
    coreScss(name)
        .pipe(gulp.dest(path.css.prod))
        .pipe(minifycss())
        .pipe(gulp.dest(path.css.prod))
        .pipe(notify("Minifikacja CSS: " + name + ".min.css"));
}

function jsMin(srcPath, name) {
    coreJs(srcPath, name)
        .pipe(terser({
            compress: {
                drop_console: true
            },
            output: {
                comments: false
            },
            toplevel: true
        }))
        .pipe(gulp.dest(path.js.prod))
        .pipe(notify("Minifikacja JS: " + name + ".min.js"));
}

function liveReload(done) {
    browserSync.init({
        proxy: path.html
    });
    done();
}

function reload(done) {
    cache.clearAll();
    browserSync.reload({stream: false});
    done();
}

function watchFiles() {
    gulp.watch(path.js.dev, gulp.series(js, reload));
    gulp.watch(path.css.dev, gulp.series(css, reload));
    gulp.watch(path.html, gulp.series(reload));
}

gulp.task('default', gulp.parallel(css, js), done => {
    done();
});

gulp.task('prod', gulp.parallel(cssProd, jsProd), done => {
    done();
});

gulp.task('watch', gulp.series(liveReload, watchFiles), done => {
    done();
});

gulp.task('test', done => {
    console.log(`
    Last update: 2019-10-02
    
  ▄████  █    ██  ██▓     ██▓███   ▐██▌ 
 ██▒ ▀█▒ ██  ▓██▒▓██▒    ▓██░  ██▒ ▐██▌ 
▒██░▄▄▄░▓██  ▒██░▒██░    ▓██░ ██▓▒ ▐██▌ 
░▓█  ██▓▓▓█  ░██░▒██░    ▒██▄█▓▒ ▒ ▓██▒ 
░▒▓███▀▒▒▒█████▓ ░██████▒▒██▒ ░  ░ ▒▄▄  
 ░▒   ▒ ░▒▓▒ ▒ ▒ ░ ▒░▓  ░▒▓▒░ ░  ░ ░▀▀▒ 
  ░   ░ ░░▒░ ░ ░ ░ ░ ▒  ░░▒ ░      ░  ░ 
░ ░   ░  ░░░ ░ ░   ░ ░   ░░           ░ 
      ░    ░         ░  ░          ░                               
    `);
    done();
});