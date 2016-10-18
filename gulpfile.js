/**************************************************************************
 * Copyleft Ian Buttimer
 *
 * @file        gulpfile.js
 * @author      Ian Buttimer
 * @date        26/05/16
 *
 * @type        javascript
 *
 * Based on:
 * @see https://www.mikestreety.co.uk/blog/advanced-gulp-file
 * @see http://stackoverflow.com/questions/23023650/is-it-possible-to-pass-a-flag-to-gulp-to-have-it-run-tasks-in-different-ways     
 * 
 * Run 'gulp production' to enable production mode
 */

var gulp = require('gulp'),
  print = require('gulp-print'),
  minifycss = require('gulp-minify-css'),
  jshint = require('gulp-jshint'),
  stylish = require('jshint-stylish'),
  uglify = require('gulp-uglify'),
  usemin = require('gulp-usemin'),      // Replaces references to non-optimized scripts or stylesheets into a set of HTML files
  imagemin = require('gulp-imagemin'),
  rename = require('gulp-rename'),
  concat = require('gulp-concat'),
  notify = require('gulp-notify'),
  cache = require('gulp-cache'),
  changed = require('gulp-changed'),
  rev = require('gulp-rev'),            // Static asset revisioning by appending content hash to filenames
  browserSync = require('browser-sync'),
  del = require('del'),
  gutil = require('gulp-util'),
  argv = require('yargs')
    .usage('Usage: $0 -production')
    .argv,
  gulpif = require('gulp-if'),
  gulpIgnore = require('gulp-ignore'),
  ngannotate = require('gulp-ng-annotate');

var basePaths = {
    src: 'app/',
    dest: 'dist/',
    bower: 'bower_components/'
  };
var paths = {
    images: {
      src: basePaths.src + 'images/',
      dest: basePaths.dest + 'images/'
    },
    scripts: {
      src: basePaths.src,
      dest: basePaths.dest
    },
    styles: {
      src: basePaths.src + 'styles/',
      dest: basePaths.dest + 'styles/'
    },
    fonts: {
      src: basePaths.src + 'fonts/',
      dest: basePaths.dest + 'fonts/'
    },
    views: {
      src: basePaths.src,
      dest: basePaths.dest
    },
    vendor: {
      src: basePaths.bower,
      dest: basePaths.dest + 'bower_components/'
    }
  };

//canvasses
//election
//layout
//login
//people
//surveys
//users

/* for glob functionality see https://github.com/isaacs/node-glob */

var appFiles = {
  styles: paths.styles.src + '**/*.css',
  views: paths.views.src + '**/*.html',
  images: paths.images.src + '**/*',
  scripts: [paths.scripts.src + '**/*.js']  // all js files in paths.scripts.src or subdirectories
};
var vendorFiles = {
  fonts: [paths.vendor.src + 'font-awesome/fonts/**/*.{ttf,woff,eof,svg}*',
          paths.vendor.src + 'bootstrap/dist/fonts/**/*.{ttf,woff,eof,svg}*'],
  dev_fonts: [paths.vendor.src + '**/*.{ttf,woff,eof,svg}*'],
  styles: '',
//  scripts: [paths.vendor.src + '**/*.js'],
//  css: [paths.vendor.src + '**/*.css']
  scriptscss: [paths.vendor.src + '**/*.+(js|css)']
};


gulp.task('jshint', function () {
  return gulp.src(appFiles.scripts)
    .pipe(jshint())
    .pipe(jshint.reporter(stylish));
});

// Clean
gulp.task('clean', function () {
  return del([basePaths.dest]
       /*, {force: true}  force option only required if deleting outside current directory */  
       );
});


gulp.task('usemin', ['jshint'], function () {
  
  gulp.src(appFiles.scripts)
    .pipe(gulpif(!argv.production,
      gulp.dest(basePaths.dest))
      );

  gulp.src(appFiles.styles)
    .pipe(gulpif(!argv.production,
      gulp.dest(paths.styles.dest))
      );

  return gulp.src(appFiles.views)
    .pipe(gulpif(argv.production,
      usemin({
        css: [minifycss(), rev()],
        js: [ngannotate(), uglify(), rev()]
      })))
    .pipe(gulp.dest(basePaths.dest))
    .pipe(notify(argv.production ?
                 { message: 'Usemin task complete' } :
                 { message: 'Usemin task skipped in dev mode' }));
//    .pipe(usemin({
//        css: [minifycss(), rev()],
//        js: [ngannotate(), uglify(), rev()]
//      }))
//    .pipe(gulp.dest(basePaths.dest))
//    .pipe(notify({ message: 'Usemin task complete' }));

});

// Images
gulp.task('imagemin', function () {
  del(paths.images.dest);
  return gulp.src(appFiles.images)
    .pipe(cache(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
    .pipe(gulp.dest(paths.images.dest))
    .pipe(notify({ message: 'Images task complete' }));
});

gulp.task('copyfonts', /*['clean'],*/ function () {
  gulp.src(argv.production ? vendorFiles.fonts : vendorFiles.dev_fonts)
    .pipe(print())
    .pipe(gulp.dest(argv.production ? paths.fonts.dest : paths.vendor.dest))
    .pipe(print(function(filepath) {
      return "copied: " + filepath;
    }))
    .pipe(notify({ message: 'Fonts task complete' }));
});

gulp.task('copyvendorscripts', function () {
  gulp.src(vendorFiles.scripts)
    .pipe(print())
    .pipe(gulp.dest(paths.vendor.dest))
    .pipe(notify({ message: 'Vendor scripts task complete' }));
});

gulp.task('copyvendorcss', function () {
  gulp.src(vendorFiles.css)
    .pipe(print())
    .pipe(gulp.dest(paths.vendor.dest))
    .pipe(notify({ message: 'Vendor css task complete' }));
});

//gulp.task('copyvendor', [/*'copyvendorcss',*/ 'copyvendorscripts'], function () {
gulp.task('copyvendor', function () {
  
  // TODO need the prints otherwise some files are not copied
  
  gulp.src(vendorFiles.scriptscss)
    .pipe(print())
    .pipe(gulp.dest(paths.vendor.dest))
    .pipe(print(function(filepath) {
      return "built: " + filepath;
    }))

    .pipe(notify({ message: 'Vendor script/css task complete' }));
  
  
});


// Watch
gulp.task('watch', ['browser-sync'], function() {
  // Watch js, css & html files
  gulp.watch([appFiles.scripts, appFiles.styles, appFiles.views], ['usemin']);
  // Watch image files
  gulp.watch(appFiles.images, ['imagemin']);

});

gulp.task('browser-sync', ['default'], function () {
  // files to watch  
  var files = [
//      appFiles.views,
//      appFiles.styles,
//      appFiles.images,
//      appFiles.scripts//,
      basePaths.dest + '**/*'
    ];

    browserSync.init(/*files,*/ {
      files: files, 
      server: {
        baseDir: basePaths.dest,
        index: 'index.html'
      }
    });
    
    // Watch any files in destination, reload on change
    gulp.watch([basePaths.dest + '**/*']).on('change', browserSync.reload);
});

// Default task
gulp.task('default', ['clean'], function () {
  gulp.start('copyfonts', 
             'usemin', 
             'imagemin',
//        (!argv.production ? 'copyvendorcss' : null),
//        (!argv.production ? 'copyvendorscripts' : null));
        (!argv.production ? 'copyvendor' : null));
});

// additional added tasks
gulp.task('clearCache', function () {
  // Still pass the files to clear cache for
  gulp.src(appFiles.images)
    .pipe(cache.clear());

  // Or, just call this for everything
//  cache.clearAll();
});

// Default task with acache clean
gulp.task('postmove', ['clean', 'clearCache'], function () {
    gulp.start('usemin', 'imagemin', 'copyfonts');
});
