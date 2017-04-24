  var gulp = require('gulp');
  var less = require('gulp-less');
  var browserSync = require('browser-sync').create();
  var header = require('gulp-header');
  var cleanCSS = require('gulp-clean-css');
  var rename = require("gulp-rename");
  var uglify = require('gulp-uglify');
  var pkg = require('./package.json');
  var deploy = require('gulp-gh-pages');

  // Set the banner content
  var banner = ['/*!\n',
  ' * Hockey Performances - <%= pkg.title %> v<%= pkg.version %> (<%= pkg.homepage %>)\n',
  ' * Copyright 2017-' + (new Date()).getFullYear(), ' <%= pkg.author %>\n',
  ' * Licensed under <%= pkg.license.type %> (<%= pkg.license.url %>)\n',
  ' */\n',
  ''
  ].join('');

  // Compile LESS files from /less into /css
  gulp.task('less', function() {
    return gulp.src('less/hockeyperformances.less')
    .pipe(less())
    .pipe(header(banner, { pkg: pkg }))
    .pipe(gulp.dest('css'))
    .pipe(browserSync.reload({
      stream: true
    }))
  });

  // Minify compiled CSS
  gulp.task('minify-css', ['less'], function() {
    return gulp.src('css/hockeyperformances.css')
    .pipe(cleanCSS({ compatibility: 'ie8' }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('css'))
    .pipe(browserSync.reload({
      stream: true
    }))
  });

  // Minify JS
  gulp.task('minify-js', function() {
    return gulp.src('js/hockeyperformances.js')
    .pipe(uglify())
    .pipe(header(banner, { pkg: pkg }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('js'))
    .pipe(browserSync.reload({
      stream: true
    }))
  });

  // Copy vendor libraries from /node_modules into /vendor
  gulp.task('copy', function() {
    gulp.src(['node_modules/bootstrap/dist/**/*', '!**/npm.js', '!**/bootstrap-theme.*', '!**/*.map'])
    .pipe(gulp.dest('vendor/bootstrap'))

    gulp.src(['node_modules/jquery/dist/jquery.js', 'node_modules/jquery/dist/jquery.min.js'])
    .pipe(gulp.dest('vendor/jquery'))

    gulp.src([
      'node_modules/font-awesome/**',
      '!node_modules/font-awesome/**/*.map',
      '!node_modules/font-awesome/.npmignore',
      '!node_modules/font-awesome/*.txt',
      '!node_modules/font-awesome/*.md',
      '!node_modules/font-awesome/*.json'
    ])
    .pipe(gulp.dest('vendor/font-awesome'))
  })

  // Run everything
  gulp.task('default', ['less', 'minify-css', 'minify-js', 'copy']);

  // Configure the browserSync task
  gulp.task('browserSync', function() {
    browserSync.init({
      server: {
        baseDir: ''
      },
    })
  })

  // Dev task with browserSync
  gulp.task('dev', ['browserSync', 'less', 'minify-css', 'minify-js'], function() {
    gulp.watch('less/*.less', ['less']);
    gulp.watch('css/*.css', ['minify-css']);
    gulp.watch('js/*.js', ['minify-js']);
    // Reloads the browser whenever HTML or JS files change
    gulp.watch('*.html', browserSync.reload);
    gulp.watch('js/**/*.js', browserSync.reload);
  });

  // Copy files to be published
  gulp.task('copy-to-docs', function() {
    gulp.src(['img/**/*'])
    .pipe(gulp.dest('docs/img'))

    gulp.src(['css/*.min.css',
    'vendor/bootstrap/css/bootstrap.min.css',
    'vendor/font-awesome/css/font-awesome.min.css'
  ])
  .pipe(gulp.dest('docs/css'))

  gulp.src(['js/*.min.js',
  'vendor/jquery/jquery.min.js',
  'vendor/bootstrap/js/bootstrap.min.js'
  ])
  .pipe(gulp.dest('docs/js'))

  gulp.src(['vendor/font-awesome/fonts/**/*'])
  .pipe(gulp.dest('docs/fonts'))

  gulp.src(['index.html'])
  .pipe(gulp.dest('docs/'))
  })

  // Push build to gh-pages
  gulp.task('deploy', function () {
    return gulp.src("./dist/**/*")
    .pipe(deploy())
  });
