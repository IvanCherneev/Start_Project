var gulp = require('gulp'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    concat = require('gulp-concat'),
    cssnano = require('gulp-cssnano'),
    compass = require('gulp-compass'),
    clean = require('gulp-clean'),
    notify = require('gulp-notify'),
    plumber = require('gulp-plumber'),
    sourcemaps = require('gulp-sourcemaps'),
    uglify = require('gulp-uglify'),
    wiredep = require('gulp-wiredep'),
    useref = require('gulp-useref'),
    browserSync = require('browser-sync').create(),
    filter = require('gulp-filter'),
    order = require('gulp-order'),
    mainBowerFiles = require('main-bower-files');

// Задача запускаемая по умолчанию режим разработчика по команде Gulp 
gulp.task('default', ['clean'], function() {
  gulp.run('dev');
});

// Задача запускаемая готовую продакшн сборку
gulp.task('production', ['clean'], function() {
  gulp.run('build');
});

// Задача запускаемая режим разработчика
gulp.task('dev', ['build', 'watch', 'browser-sync']);

// Задача запускаемая режим продакшн. Сборка проекта
gulp.task('build', ['html', 'styles', 'styles:vendor', 'scripts', 'scripts:vendor', 'script:modernizr', 'fonts', 'images']);

// Слежка за изменением файлов в проекте и если это произошло, то запускаются соответствующие задачи
gulp.task('watch', function() {
  gulp.watch('_dev/css/**/*.scss', ['styles']); // стили
    gulp.watch('./_dev/js/**/*.js', ['scripts']); // скрипты
    gulp.watch('_dev/index.html', ['html']); // html
    gulp.watch('./bower.json', ['styles:vendor', 'scripts:vendor']); // Вендорные стили и скрипты
    gulp.watch('./_dev/fonts/**/*.*', ['fonts']); // шрифты
    gulp.watch('./_dev/images/**/*.*', ['images']); // изображения
    gulp.watch('_dev/**/*.*').on('change', browserSync.reload); // перезапуск browserSynс
});

// Сборка и перемещение стилей в папку _production
gulp.task('styles', function() {
  return gulp.src('_dev/css/styles.scss')
    .pipe(plumber({ // ловля ошибок
      errorHandler: notify.onError(function(err) { // отображение ошибок в удобной форме
        return {
          title: 'Styles',
          message: err.message
        }
      })
    }))
    .pipe(sourcemaps.init()) // Начала записи файла для отладки стилей в devTools
    .pipe(sass().on('error', sass.logError)) // Компиляция SASS
    .pipe(autoprefixer({ // Добавление автопрефиксов.
      browsers: ['last 2 versions']
    }))
    .pipe(concat('main.min.css')) // объединение файлов стилей в один
    .pipe(cssnano()) // минификация файла стилей
    .pipe(sourcemaps.write()) // Конец записи файла для отладки в devTools
    .pipe(gulp.dest('_production/css'));
});

// Перемещение Вендорных стилей в папку _production
gulp.task('styles:vendor', function () {
  var vendors = mainBowerFiles({
    paths: {
      bowerDirectory: './bower_components',
      bowerJson: './bower.json'
    }
  });
   
  return gulp.src(vendors)
     .pipe(filter(['**/*.css']))
     .pipe(concat('vendor.css'))
     .pipe(cssnano()) // Минификация стилей
     .pipe(gulp.dest('_production/css'));
});

//Задача для удаление папки _production
gulp.task('clean', function() {
  return gulp.src('_production/')
    .pipe(clean());
});

// Перемещение HTML в папку _production
gulp.task('html', function() {
  return gulp.src('_dev/index.html')
    .pipe(gulp.dest('_production/'))
});

// Перемещение скриптов в папку _production
gulp.task('scripts', function() {
  return gulp.src(['./_dev/js/**/*.js', '!./_dev/js/vendor/modernizr.js'])
    .pipe(concat('main.min.js'))
    .pipe(uglify()) // Минификация скриптов
    .pipe(gulp.dest('_production/js'));
});

// Перемещение Вендорных скриптов в папку _production
gulp.task('scripts:vendor', function () {
  var vendors = mainBowerFiles({
    paths: {
      bowerDirectory: './bower_components',
      bowerJson: './bower.json'
    }
  });
   
  return gulp.src(vendors)
     .pipe(filter(['**/*.js']))
     .pipe(concat('vendor.js'))
     .pipe(uglify()) // Минификация скриптов
     .pipe(gulp.dest('_production/js'));
});

// Перемещение скрипта Modernizr в папку _production
gulp.task('script:modernizr', function() {
  return gulp.src('./_dev/js/vendor/modernizr.js')
    .pipe(gulp.dest('_production/js'));
});

// Задача для запуска сервера
gulp.task('browser-sync', function() {
  return browserSync.init({
    server: {
      baseDir: './_production/'
    }
  });
});

// Перемещение шрифтов в папку _production
gulp.task('fonts', function() {
  return gulp.src('./_dev/fonts/**/*.*')
    .pipe(gulp.dest('./_production/fonts'));
});

// Перемещение изображений в папку _production
gulp.task('images', function() {
  return gulp.src('./_dev/images/**/*.*')
    .pipe(gulp.dest('./_production/images'));
});