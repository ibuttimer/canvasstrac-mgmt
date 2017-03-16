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
 * Run 'gulp --production' to enable production mode
 */

var gulp = require('gulp'),
  print = require('gulp-print'),
  cleancss = require('gulp-clean-css'),
  less = require('gulp-less'),
  jshint = require('gulp-jshint'),
  stylish = require('jshint-stylish'),
  uglify = require('gulp-uglify'),
  usemin = require('gulp-usemin'),      // Replaces references to non-optimized scripts or stylesheets into a set of HTML files
  sourcemaps = require('gulp-sourcemaps'),
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
    production = argv.production,
  gulpif = require('gulp-if'),
  gulpIgnore = require('gulp-ignore'),
  ngannotate = require('gulp-ng-annotate'),
  replace = require('gulp-replace-task'),
  path = require('path'),
  fs = require('fs');

var basePaths = {
    src: 'app/',
    dest: 'dist/',
    config: 'config/',
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
paths.less = {
  src: basePaths.src + 'less/',
  dest: paths.styles.src
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
  less: paths.less.src + '**/*.less',
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
  scriptscss: [paths.vendor.src + '**/*.+(js|css)', // vendor js & css files
                // vendor js folders to exclude
                '!' + paths.vendor.src + 'angular-ui-router/src/*.js',
                '!' + paths.vendor.src + 'bootstrap/grunt/*.js',
                '!' + paths.vendor.src + 'bootstrap/js/*.js',
                '!' + paths.vendor.src + 'chart.js/samples/*.js',
                '!' + paths.vendor.src + 'chart.js/src/*.js',
                '!' + paths.vendor.src + 'chart.js/test/*.js',
                '!' + paths.vendor.src + 'jquery/src/*.js',
                '!' + paths.vendor.src + 'nya-bootstrap-select/e2e-test/*.js',
                '!' + paths.vendor.src + 'nya-bootstrap-select/tasks/*.js'
  ]
};

gulp.task('jshint', function () {
  return gulp.src(appFiles.scripts)
    .pipe(jshint())
    .pipe(jshint.reporter(stylish));
});

// Clean all output files
gulp.task('cleanall', function () {
  return del([basePaths.dest], {
//          force: true,  // Allow deleting the current working directory and outside
//          dryRun: true  // See what would be deleted
        }
       );
});

function noTrailingSlash (path) {
  var slashless,
    idx = path.length - 1;
  if (path.lastIndexOf('/') === idx) {
    slashless = path.substring(0, idx);
  } else {
    slashless = path;
  }
  return slashless;
}

// Clean just the app files
gulp.task('clean', function () {
  return del([basePaths.dest + '**',  // NOTE this deletes both parent & comtent!
              '!' + noTrailingSlash(basePaths.dest),  // exclude parent
              '!' + paths.vendor.dest + '**'          // exclude vendor files
        ], {
//          force: true,  // Allow deleting the current working directory and outside
//          dryRun: true  // See what would be deleted
        }
//        ).then(paths => {
//          console.log('Deleted files and folders:\n', paths.join('\n'));
//        }
       );
});

gulp.task('replace', function () {
  // based on http://geekindulgence.com/environment-variables-in-angularjs-and-ionic/

  // Get the environment from the command line
  var env = argv.env || 'localdev',

  // Read the settings from the right file
    filename = env + '.json',
    settings = JSON.parse(fs.readFileSync(basePaths.config + filename, 'utf8')),
    // basic patterns
    patterns = [
    // server/management app common settings
      { match: 'baseURL', replacement: settings.baseURL },
      { match: 'forceHttps', replacement: settings.forceHttps },
      { match: 'httpPort', replacement: settings.httpPort },
      { match: 'httpsPortOffset',  replacement: settings.httpsPortOffset },
      // management app settings
      { match: 'mapsApiKey', replacement: settings.mapsApiKey },
      { match: 'DEV_MODE', replacement: settings.DEV_MODE },
      { match: 'DEV_USER', replacement: settings.DEV_USER },
      { match: 'DEV_PASSWORD', replacement: settings.DEV_PASSWORD }
    ];

  // add dbg settins to patterns
  [ 'storeFactory',
    'localStorage',
    'surveyFactory',
    'canvassFactory',
    'electionFactory',
    'CanvassController',
    'CanvassActionController',
    'SurveyController',
    'navService'
  ].forEach(function (key) {
    var keyVal = settings[key] || false;
    patterns.push({ match: key, replacement: keyVal });
  });

  // Replace each placeholder with the correct value for the variable.
  gulp.src(basePaths.config + 'env.js')
  .pipe(replace({ patterns: patterns }))
    .pipe(gulp.dest(basePaths.src));
});

// Less css preprocessor
gulp.task('less', function () {

  return gulp.src(appFiles.less)
    .pipe(less())
    .pipe(gulp.dest(paths.less.dest));
});

function jsProcessChain() {
  // TODO get unknown provider error with uglify so skip for now
//  return [sourcemaps.init(), ngannotate(), uglify(), /*rev(),*/ sourcemaps.write()];
  return [ngannotate()];
}

function cssProcessChain() {
  return [cleancss()  /*, rev()*/];
}

gulp.task('usemin', ['jshint'], function () {
  var cmt;

  if (!production) {
    cmt = 'non-usemin: '
    gulp.src(appFiles.scripts)
      .pipe(changed(basePaths.dest))
      .pipe(gulp.dest(basePaths.dest));

    gulp.src(appFiles.styles)
      .pipe(changed(paths.styles.dest))
      .pipe(gulp.dest(paths.styles.dest));
  } else {
    cmt = 'usemin: '
  }

  return gulp.src(appFiles.views)
    .pipe(gulpif(production,
      usemin({
        css: cssProcessChain(),
        appcss: cssProcessChain(),
        js: jsProcessChain(),
        appjs: jsProcessChain()
      })))
    .pipe(gulp.dest(basePaths.dest))
    .pipe(print(function(filepath) {
      return cmt + filepath;
    }));
//    .pipe(notify(production ?
//                 { message: 'Usemin task complete' } :
//                 { message: 'Usemin task skipped in dev mode' }));
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
  var src = (production ? vendorFiles.fonts : vendorFiles.dev_fonts),
    dest = (production ? paths.fonts.dest : paths.vendor.dest);
  gulp.src(src)
    .pipe(changed(dest))
    .pipe(print())
    .pipe(gulp.dest(dest))
    .pipe(print(function(filepath) {
      return "copied: " + filepath;
    }))
    .pipe(notify({ message: 'Fonts task complete' }));
});

gulp.task('copyvendorscripts', function () {
  var src = vendorFiles.scripts,
    dest = paths.vendor.dest;
  gulp.src(src)
    .pipe(changed(dest))
    .pipe(print())
    .pipe(gulp.dest(dest))
    .pipe(notify({ message: 'Vendor scripts task complete' }));
});

gulp.task('copyvendorcss', function () {
  var src = vendorFiles.css,
    dest = paths.vendor.dest;
  gulp.src(src)
    .pipe(changed(dest))
    .pipe(print())
    .pipe(gulp.dest(dest))
    .pipe(notify({ message: 'Vendor css task complete' }));
});

//gulp.task('copyvendor', [/*'copyvendorcss',*/ 'copyvendorscripts'], function () {
gulp.task('copyvendor', function () {
  
  // TODO need the prints otherwise some files are not copied
  
  var src = vendorFiles.scriptscss,
    dest = paths.vendor.dest;
  gulp.src(src)
    .pipe(changed(dest))
    .pipe(print())
    .pipe(gulp.dest(dest))
    .pipe(print(function(filepath) {
      return "Vendor script/css: " + filepath;
    }));

//    .pipe(notify({ message: 'Vendor script/css task complete' }));
  
  
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
gulp.task('default', ['clean', 'replace', 'less'], function () {
  // TODO needs update, default shouldn't finish until these tasks are finished

  if (!production) {
    gulp.start('copyfonts',
             'usemin', 
             'imagemin',
//        'copyvendorcss',
//        'copyvendorscripts',
            'copyvendor');
  } else {
    gulp.start('copyfonts',
             'usemin',
             'imagemin');
  }
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
