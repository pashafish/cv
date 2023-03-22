const {src, dest, series, watch} = require('gulp');
const concat = require('gulp-concat');
const pug = require('gulp-pug');
const autoPrefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const sass = require('gulp-sass')(require('sass'));
const img = require('gulp-image');
const svg = require('gulp-svg-sprite');
const uglify = require('gulp-uglify-es').default;
const babel = require('gulp-babel');
const notify = require('gulp-notify');
const sourcemaps = require('gulp-sourcemaps');
const del = require('del');
const browserSync = require('browser-sync').create();

const pugToHtml = () => {
  return src('src/pug/*.pug')
  .pipe(pug())
  .pipe(dest('dist/'))
  .pipe(browserSync.stream())
}

const sassToCssDev = () => {
  return src('src/scss/main.scss')
  .pipe(sass().on('error', sass.logError))
  .pipe(sourcemaps.init())
  .pipe(autoPrefixer({
    cascade: false
  }))
  .pipe(cleanCSS({
    level: 2
  }))
  .pipe(sourcemaps.write())
  .pipe(dest('dist/css'))
  .pipe(browserSync.stream())
}

const sassToCssProd = () => {
  return src('src/scss/main.scss')
  .pipe(sass().on('error', sass.logError))
  .pipe(autoPrefixer({
    cascade: false
  }))
  .pipe(cleanCSS({
    level: 2
  }))
  .pipe(dest('dist/css'))
  .pipe(browserSync.stream())
}

const styles = () => {
  return src('src/css/**/*.css')
  .pipe(autoPrefixer({
    cascade: false
  }))
  .pipe(cleanCSS({
    level: 2
  }))
  .pipe(dest('dist/css'))
  .pipe(browserSync.stream())
}

const svgSprite = () => {
  return src('src/img/svg/**/*.svg')
  .pipe(svg({
    mode: {
      symbol: {
        sprite: '../sprite.svg',
      }
    },
    svg: {
      namespaceClassnames: false
    }
  }))
  .pipe(dest('dist/img'))
  .pipe(browserSync.stream())
}

const catSprite = () => {
  return src('src/img/cat-animation/*.svg')
  .pipe(svg({
    mode: {
      defs: {
        sprite: '../cat-animation.svg',
      }
    }
  }))
  .pipe(dest('dist/img'))
  .pipe(browserSync.stream())
}

const images = () => {
  return(src(['src/img/*.jpg', 'src/img/*.png', 'src/img/*.svg', 'src/img/*.jpeg']))
  .pipe(img())
  .pipe(dest('dist/img'))
  .pipe(browserSync.stream())
}

const scriptsDev= () => {
  return src('src/js/**/*.js')
  .pipe(sourcemaps.init())
  .pipe(babel({
    presets: ['@babel/env']
  }))
  .pipe(concat('main.js'))
  .pipe(uglify().on('error', notify.onError()))
  .pipe(sourcemaps.write())
  .pipe(dest('dist/js'))
  .pipe(browserSync.stream())
}

const scriptsProd = () => {
  return src('src/js/**/*.js')
  .pipe(babel({
    presets: ['@babel/env']
  }))
  .pipe(concat('main.js'))
  .pipe(uglify().on('error', notify.onError()))
  .pipe(dest('dist/js'))
  .pipe(browserSync.stream())
}

const plugins = () => {
  return src('src/plugins/**/*.js')
  .pipe(dest('dist/plugins'))
  .pipe(browserSync.stream())
}

const clean = () => {
  return del(['dist'])
}

const lang = () => {
  return src('src/lang/*.json')
  .pipe(dest('dist/lang'))
  .pipe(browserSync.stream())
}

const watchFiles = () => {
  browserSync.init({
    server: {
      baseDir: 'dist'
    }
  })
}

watch('src/pug/*.pug', pugToHtml);
watch('src/css/**/*.css', styles);
watch('src/scss/**/*.scss', sassToCssDev);
watch('src/js/**/*.js', scriptsDev);
watch('src/plugins/**/*.js', plugins);
watch('src/img/svg/**/*.svg', svgSprite);
watch('src/img/cat-animation/*.svg', catSprite);
watch(['src/img/*.jpg', 'src/img/*.png', 'src/img/*.svg', 'src/img/*.jpeg'], images);
watch('src/lang/*.json', lang);

exports.default = series( clean, svgSprite, catSprite, pugToHtml, sassToCssDev, styles, scriptsDev, plugins, images, lang, watchFiles );
exports.prod = series( clean, svgSprite, catSprite, pugToHtml, sassToCssProd, styles, scriptsProd, plugins, images, lang, watchFiles );
exports.fast = series( clean, svgSprite, catSprite, pugToHtml, sassToCssProd, styles, scriptsProd, plugins, lang, watchFiles );
