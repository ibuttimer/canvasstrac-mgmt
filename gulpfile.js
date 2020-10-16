/*jslint node: true */ /*eslint-env node*/
'use strict';
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

 const gulp = require('gulp'),
  print = require('gulp-print').default,
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
  argv = require('yargs')
    .usage('Usage: gulp <command> [options]')
    .command('default', 'Run default tasks')
    .command('watch', 'Start server and watch application files')
    .command('jshint', 'Run JsHint on application files')
    .option('p', {
      alias: 'production',
      default: false,
      describe: 'Enable production mode',
      type: 'boolean'
    })
    .option('e', {
      alias: 'env',
      default: 'localdev',
      describe: 'Specify name of configuration file to use',
      type: 'string'
    })
    .option('f', {
      alias: 'force',
      default: false,
      describe: 'Allow deleting the current working directory and outside',
      type: 'boolean'
    })
    .option('d', {
      alias: 'dryrun',
      default: false,
      describe: 'See what would be deleted',
      type: 'boolean'
    })
    .help('h')
    .alias('h', 'help')
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
    node_modules: 'node_modules/'
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
      src: basePaths.node_modules,
      dest: basePaths.dest
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
  scripts: paths.scripts.src + '**/*.js'  // all js files in paths.scripts.src or subdirectories
};
var fontExt = '{ttf,woff,eof,eot,svg,otf}*';
var vendorFiles = {
  fonts: [[paths.vendor.src, 'font-awesome/fonts', '/**/*.' + fontExt],
          [paths.vendor.src, 'bootstrap/dist/fonts', '/**/*.' + fontExt]],
  dev_fonts: [paths.vendor.src + '**/*.*.' + fontExt],
  styles: '',
  scriptscss: [[paths.vendor.src, 'bootstrap/dist/css', '/**/*.*'],
                // [paths.vendor.src, 'bootstrap/dist/fonts', '/**/*.*'],
                [paths.vendor.src, 'font-awesome/css', '/**/*.*'],
                [paths.vendor.src, 'ng-dialog/css', '/**/*.*'],
                [paths.vendor.src, 'bootstrap-social', '/**/*.css'],
                [paths.vendor.src, 'nya-bootstrap-select/dist/css', '/**/*.*'],
                [paths.vendor.src, 'angular', '/**/angular*.*'],
                [paths.vendor.src, 'angular-animate', '/**/angular-animate.min*.*'],
                [paths.vendor.src, 'angular-ui-bootstrap/dist', '/**/ui-bootstrap-tpls*.*'],
                [paths.vendor.src, 'angular-ui-router/release', '/**/angular-ui-router.min*.*'],
                [paths.vendor.src, 'angular-sanitize', '/**/angular-sanitize*.*'],
                [paths.vendor.src, 'angular-resource', '/**/angular-resource.min*.*'],
                [paths.vendor.src, 'angular-cookies', '/**/angular-cookies.min*.*'],
                [paths.vendor.src, 'ng-idle', '/**/angular-idle*.*'],
                [paths.vendor.src, 'chart.js/dist', '/**/*.*'],
                [paths.vendor.src, 'angular-chart.js/dist', '/**/*.*'],
                [paths.vendor.src, 'ng-dialog/js', '/**/*.*'],
                [paths.vendor.src, 'angular-timer/dist', '/**/angular-timer*.js'],
                [paths.vendor.src, 'humanize-duration', '/**/*.js'],
                [paths.vendor.src, 'moment/min', '/**/*.*'],
                [paths.vendor.src, 'js-polyfills', '/**/*.js'],
              ]
};
var envfilename = 'env.js';
var httpPort;

gulp.task('jshint', function () {
  return gulp.src(appFiles.scripts)
    .pipe(jshint())
    .pipe(jshint.reporter(stylish/*, { verbose: true }*/))
    .pipe(jshint.reporter('fail', {
      // only fail task on errors
      ignoreWarning: true,
      ignoreInfo: true
    }));
});

// Clean all output files
gulp.task('cleanall', async function () {

  const toDeletePaths = [basePaths.dest];
  console.log('Glob pattern:\n', toDeletePaths.join('\n'));

  const deletedPaths = await del(toDeletePaths, {
      force: argv.force,  // Allow deleting the current working directory and outside
      dryRun: argv.dryrun // See what would be deleted
    });

  if (argv.dryrun) {
    console.log('Files and directories that would be deleted:\n', deletedPaths.join('\n'));
  }
});

function noTrailingSlash(path) {
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
gulp.task('clean', async function () {

  const toDeletePaths = [path.posix.join(basePaths.dest, '**'),  // NOTE this deletes both parent & content!
    '!' + noTrailingSlash(basePaths.dest),          // exclude parent
    '!' + path.posix.join(paths.vendor.dest, '**'), // exclude vendor files
  ];
  console.log('Glob pattern:\n', toDeletePaths.join('\n'));

  const deletedPaths = await del(toDeletePaths, {
      force: argv.force,  // Allow deleting the current working directory and outside
      dryRun: argv.dryrun // See what would be deleted
    });

  if (argv.dryrun) {
    console.log('Files and directories that would be deleted:\n', deletedPaths.join('\n'));
  }
});


gulp.task('replace', function (cb) {
  // based on http://geekindulgence.com/environment-variables-in-angularjs-and-ionic/

  // Get the environment from the command line
  var env = argv.env || 'localdev',
    // Read the settings from the right file
    filename = env + '.json',
    settings = JSON.parse(fs.readFileSync(basePaths.config + filename, 'utf8')),
    flags = fs.readFileSync(basePaths.config + 'dbgFlags.txt', 'utf8'),
    patterns = [],
    keyVal,
    dfltVal,
    setDflt,
    err;

  [ // server/management app common settings
    { prop: 'baseURL', type: 'str' },
    { prop: 'forceHttps', type: 'bool', dflt: true },
    { prop: 'httpPort', type: 'num' },
    { prop: 'httpsPortOffset', type: 'num' },
    { prop: 'socketTimeout', type: 'num' },
    { prop: 'disableAuth', type: 'bool', dflt: false },
    // management app settings
    { prop: 'mapsApiKey', type: 'str' },
    { prop: 'autoLogout', type: 'num|str' },
    { prop: 'autoLogoutCount', type: 'num|str' },
    { prop: 'tokenRefresh', type: 'num|str' },
    { prop: 'reloadMargin', type: 'num|str' },
    { prop: 'DEV_MODE', type: 'bool', dflt: false },
    { prop: 'DEV_USER1', type: 'str' },
    { prop: 'DEV_PASSWORD1', type: 'str' },
    { prop: 'DEV_USER2', type: 'str' },
    { prop: 'DEV_PASSWORD2', type: 'str' },
    { prop: 'DEV_USER3', type: 'str' },
    { prop: 'DEV_PASSWORD3', type: 'str' }
  ].forEach(function (key) {
    keyVal = settings[key.prop];
    setDflt = (keyVal === undefined);
    if (!setDflt && (typeof keyVal === 'string')) {
      setDflt = (keyVal.indexOf('@@') === 0); // no replacement in settings file
    }
    if (setDflt) {
      dfltVal = undefined;

      if (key.dflt) {
        dfltVal = key.dflt;
      } else if (key.type.indexOf('num') >= 0) {
        dfltVal = '0';
      } else if (key.type.indexOf('str') >= 0) {
        dfltVal = '';
      } else if (key.type.indexOf('bool') >= 0) {
        dfltVal = false;
      }
      keyVal = dfltVal;
    }
    patterns.push({ match: key.prop, replacement: keyVal });
  });

  // TODO better method of setting debug options

  // add dbg settings to patterns
  flags.split('\n').forEach(function (key) {
    if (key) {
      var keyText = key.trim();
      if (keyText.length && (keyText.indexOf('#') < 0)) {
        keyVal = settings[keyText] || false;
        patterns.push({ match: keyText, replacement: keyVal });
      }
    }
  });

  // Replace each placeholder with the correct value for the variable.
  gulp.src(basePaths.config + envfilename)
    .pipe(notify({ message: 'Creating ' + envfilename + ' from ' + filename }))
    .pipe(replace({ patterns: patterns }))
    .pipe(gulp.dest(basePaths.src));

  cb(err);
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

gulp.task('usemin', gulp.series('jshint', 'less', function () {
  var cmt,
    msg;

  if (!production) {
    // copy individual script & css files
    cmt = 'non-usemin: ';
    msg = 'Built dev to ' + basePaths.dest;

    gulp.src(appFiles.scripts)
      .pipe(changed(basePaths.dest))
      .pipe(gulp.dest(basePaths.dest));

      gulp.src(appFiles.styles)
      .pipe(changed(paths.styles.dest))
      .pipe(gulp.dest(paths.styles.dest));
  } else {
    cmt = 'usemin: ';
    msg = 'Built production to ' + basePaths.dest;
  }

  // copy html files & in production minified script & css files
  return gulp.src(appFiles.views)
    .pipe(gulpif(production,
      usemin({
        css: cssProcessChain(),
        appcss: cssProcessChain(),
        js: jsProcessChain(),
        appjs: jsProcessChain()
      })))
    .pipe(gulp.dest(basePaths.dest))
    .pipe(print(function (filepath) {
      return cmt + filepath;
    }))
    .pipe(notify({ message: msg, onLast: true }));
}));

// Images
gulp.task('imagemin', function () {
  del(paths.images.dest);
  return gulp.src(appFiles.images)
    .pipe(cache(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
    .pipe(gulp.dest(paths.images.dest))
    .pipe(notify({ message: 'Images task complete', onLast: true }));
});

gulp.task('copyfonts', function (cb) {
  var source = vendorFiles.fonts,
    destination = paths.vendor.dest,
    err;
  vendorFiles.fonts.forEach(element => {
    gulp.src(path.join(element[0], element[1], element[2]))
      .pipe(changed(destination))
      .pipe(print())
      .pipe(gulp.dest(destination))
      .pipe(print(function (filepath) {
        return "Copied font: " + filepath;
    }))
    .pipe(notify({ message: 'Fonts task complete', onLast: true }));
  });
  cb(err); // if err is not null and not undefined, the run will stop, and note that it failed
});

gulp.task('copyvendor', function (cb) {
  var err,
    destination = paths.vendor.dest;
  if (!production) {
  
  // TODO need the prints otherwise some files are not copied

    vendorFiles.scriptscss.forEach(element => {
      gulp.src(path.join(element[0], element[1], element[2]))
        .pipe(changed(destination))
        .pipe(print())
        .pipe(gulp.dest(destination))
        .pipe(print(function (filepath) {
          return "Vendor script/css: " + filepath;
        }));
    });
//    .pipe(notify({ message: 'Vendor script/css task complete', onLast: true }));
  } // else nothing to do in production mode
  cb(err); // if err is not null and not undefined, the run will stop, and note that it failed
});

// copy task task
gulp.task('copy', gulp.parallel('copyfonts', 'usemin', 'imagemin',
            'copyvendor'));

// initial task
gulp.task('initial', gulp.series('clean', function (cb) {
  var err;
  cb(err); // if err is not null and not undefined, the run will stop, and note that it failed
}));

// postinitial task
gulp.task('postinitial', gulp.series('initial', function (cb) {
  var err;
  cb(err); // if err is not null and not undefined, the run will stop, and note that it failed
}));

// Default task
gulp.task('default', gulp.series('postinitial', 'copy', 'replace', function (cb) {
  var err;
  cb(err);
}));


gulp.task('browser_sync', gulp.series('default', function () {
  // files to watch  
  var files = [
//      appFiles.views,
//      appFiles.styles,
//      appFiles.images,
//      appFiles.scripts//,
      basePaths.dest + '**/*'
    ],
    options = {
      files: files,
      server: {
        baseDir: basePaths.dest,
        index: 'index.html'
      }
    };

  if (httpPort) {
    options.port = httpPort;
  }

  browserSync.init(options);

  // Watch any files in destination, reload on change
  gulp.watch([basePaths.dest + '**/*']).on('change', browserSync.reload);
}));


// Watch
gulp.task('watch', gulp.series('browser_sync', function () {
  // Watch less files
  gulp.watch([appFiles.less], gulp.series('less'));
  // Watch js, css & html files
  gulp.watch([appFiles.scripts, appFiles.styles, appFiles.views], gulp.series('usemin'));
  // Watch image files
  gulp.watch(appFiles.images, gulp.series('imagemin'));

}));


gulp.task('port', function () {
  var env = fs.readFileSync(basePaths.src + envfilename, 'utf8');

  env.split('\n').forEach(function (key) {
    if (key) {
      var keyText = key.trim();
      if (keyText.length && (keyText.indexOf('httpPort') > 0)) {
        // e.g. window.__env.httpPort = 4000;
        var splits = keyText.split('=');
        if (splits.length > 0) {
          var split = splits[splits.length - 1].trim(),
            eol = split.indexOf(';');
          if (eol > 0) {
            var port = split.substring(0, eol);
            if (port) {
              httpPort = port;
            }
          }
        }
      }
    }
  });
});

// additional added tasks
gulp.task('clearCache', function () {
  // Still pass the files to clear cache for
  gulp.src(appFiles.images)
    .pipe(cache.clear());

  // Or, just call this for everything
//  cache.clearAll();
});

// Default task with a cache clean
gulp.task('postmove', gulp.series('clean', 'clearCache', function () {
  gulp.start('usemin', 'imagemin', 'copyfonts');
}));
