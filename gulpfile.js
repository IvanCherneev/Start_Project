"use strict";

var gulp           = require('gulp'),
    sourcemaps     = require('gulp-sourcemaps'),
    sass           = require('gulp-sass'),
    notify         = require('gulp-notify'),
    autoprefixer   = require('gulp-autoprefixer'),
    cssnano        = require('gulp-cssnano'),
    concat         = require('gulp-concat'),
    rename         = require('gulp-rename'),
    clean          = require('gulp-clean'),
    plumber        = require('gulp-plumber'),
    uglify         = require('gulp-uglify'),
    browserSync    = require('browser-sync').create(),
    filter         = require('gulp-filter'),
    mainBowerFiles = require('main-bower-files'),
    imagemin       = require('gulp-imagemin'),
    cache          = require('gulp-cache'),
    rev            = require('gulp-rev-append');

// Задача запускаемая по умолчанию режим разработчика по команде Gulp 
gulp.task('default', ['clean'], function() {
  gulp.run('dev');
});

// Задача запускаемая готовую продакшн сборку
gulp.task('prod', ['clean'], function() {
  gulp.run('build');
});

// Задача запускаемая режим разработчика
gulp.task('dev', ['build', 'watch', 'browser-sync']);

// Задача запускаемая режим продакшн. Сборка проекта
gulp.task('build', ['html', 'styles', 'styles:vendor', 'scripts', 'scripts:vendor', 'fonts', 'images']);

// Слежка за изменением файлов в проекте и если это произошло, то запускаются соответствующие задачи
gulp.task('watch', function() {
  gulp.watch('./_dev/css/**/*.scss', ['styles']); // стили
  gulp.watch('./_dev/js/**/*.js', ['scripts']); // скрипты
  gulp.watch('./_dev/*.html', ['html']); // html
  gulp.watch('./bower.json', ['styles:vendor', 'scripts:vendor']); // Вендорные стили и скрипты
  gulp.watch('./_dev/fonts/**/*.*', ['fonts']); // шрифты
  gulp.watch('./_dev/images/**/*.*', ['images']); // изображения
  gulp.watch('./_dev/**/*.*').on('change', browserSync.reload); // перезапуск browserSynс
});

// Сборка и перемещение стилей в папку _prod
gulp.task('styles', function() {
  return gulp.src('./_dev/css/styles.scss')
    .pipe(sourcemaps.init()) // Начала записи файла для отладки стилей в devTools
    .pipe(sass({outputStyle: 'expanded'}).on("error", notify.onError())) // Компиляция SASS, с проверкой на ошибки
    .pipe(autoprefixer({ // Добавление автопрефиксов.
      browsers: ['last 2 versions']
    }))
    .pipe(cssnano()) // минификация файла стилей
    .pipe(rename({  // переименовываем файл стилей
      basename: "main",
      suffix: ".min"
    }))
    .pipe(sourcemaps.write()) // Конец записи файла для отладки в devTools
    .pipe(gulp.dest('./_prod/css'));
});

// Перемещение Вендорных стилей в папку _prod
gulp.task('styles:vendor', function () {
  return gulp.src(mainBowerFiles({ // Находим все bower-библиотеки(полный путь до них) 
    paths: {
      bowerDirectory: './bower_components',
      bowerrc: './.bowerrc',
      bowerJson: './bower.json'
    }
  }))
    .pipe(filter(['**/*.css'])) // Отфильтруем bower-библиотеки (только css)
    .pipe(concat('vendor.css'))
    .pipe(cssnano()) // Минификация стилей
    .pipe(gulp.dest('./_prod/css'));
});

// Задача для удаление папки _prod
gulp.task('clean', function() {
  return gulp.src('./_prod/')
    .pipe(clean());
});

// Задача на очистку кэша (запускается вручную)
gulp.task('clearcache', function() {
  return cache.clearAll();
});

// Задача делает замену стилей и скриптов, которые закэшированы в браузере (запускается вручную)
gulp.task('revAll', function() {
  gulp.src('./_prod/index.html')
    .pipe(rev())
    .pipe(gulp.dest('./_prod/'));
});

// Перемещение HTML в папку _prod
gulp.task('html', function() {
  return gulp.src('./_dev/*.html')
    .pipe(gulp.dest('./_prod/'));
});

// Перемещение скриптов в папку _prod
gulp.task('scripts', function() {
  return gulp.src('./_dev/js/**/*.js')
    .pipe(plumber({ // ловля ошибок
      errorHandler: function(err) { // отображение ошибок в удобной форме
        notify.onError({
          title:   'ErrorScript',
          message: err.message
        })(err);
        this.emit('end');
      }
    }))
    .pipe(concat('main.min.js'))
    .pipe(uglify()) // Минификация скриптов
    .pipe(gulp.dest('./_prod/js'));
});

// Перемещение Вендорных скриптов в папку _prod
gulp.task('scripts:vendor', function () {
  return gulp.src(mainBowerFiles({ // Находим все bower-библиотеки(полный путь до них)
    paths: {
      bowerDirectory: './bower_components',
      bowerrc: './.bowerrc',
      bowerJson: './bower.json'
    }
  }))
    .pipe(filter(['**/*.js'])) //Отфильтруем bower-библиотеки (только js)
    .pipe(concat('vendor.js'))
    .pipe(uglify()) // Минификация скриптов
    .pipe(gulp.dest('./_prod/js'));
});

// Задача для запуска сервера
gulp.task('browser-sync', function() {
  return browserSync.init({
    reloadDelay: 2000,  
    server: {
      baseDir: './_prod/'
    }
  });
});

// Перемещение шрифтов в папку _prod
gulp.task('fonts', function() {
  return gulp.src('./_dev/fonts/**/*.*')
    .pipe(gulp.dest('./_prod/fonts'));
});

// Перемещение изображений в папку _prod
gulp.task('images', function() {
  return gulp.src('./_dev/images/**/*.*')
    .pipe(cache(imagemin({ // минификация и кэширование изображений
      interlaced: true,
      optimizationLevel: 3,
      progressive: true,
      svgoPlugins: [{
        removeViewBox: false
      }]
    })))
    .pipe(gulp.dest('./_prod/images'));
});