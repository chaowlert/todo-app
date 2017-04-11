'use strict';

//******************************************************************************
//* DEPENDENCIES
//******************************************************************************

// Enable ES6
require('harmonize')();

var gulp = require('gulp'),
    $ = require('gulp-load-plugins')(),
    combine = require('istanbul-combine'),
    gutil = require('gulp-util'),
    merge = require('merge2'),
    open = require('open'),
    path = require('path'),
    remapIstanbul = require('remap-istanbul/lib/gulpRemapIstanbul'),
    runSequence = require('run-sequence'),
    webpack = require('webpack'),
    WebpackDevServer = require('webpack-dev-server');


//******************************************************************************
//* VARIABLES
//******************************************************************************

var pkg = require('./package.json');
var pkgSection = pkg.name.split('-');
var shortName = pkg.shortName;
var moduleName = pkgSection.join('-');
var moduleVariable = moduleName.replace(/(\-\w)/g, m => m[1].toUpperCase());
var langKey = shortName;
var cssWrap = '.' + shortName;
var langs = pkg.languages || [];

//******************************************************************************
//* TASKS
//******************************************************************************

gulp.task('import-all', function () {
    var task1 = importAll('src/**/*.ts', './src', moduleVariable);
    var task2 = importAll('app/**/*.ts', './app', moduleVariable + 'App');
    return merge([task1, task2]);
    
    function importAll(src, base, modName) {
        if (typeof src === 'string') {
            src = [src];
        }
        src.push(
            '!' + path.join(base, '**/*.spec.ts'),
            '!' + path.join(base, '**/*.d.ts'),
            '!' + path.join(base, 'index.ts')
        );
        return gulp.src(src, { read: false, base: base })
            .pipe($.listfiles({
                filename: 'index.ts',
                prefix: 'import \'./',
                postfix: '\';',
                footer: `
import ${modName} from \'./module\';
let ${modName}Name = ${modName}.name;
export default ${modName}Name;`,
                replacements: [{
                    pattern: /\.[^/.]+$/,
                    replacement: ''
                }]
            }))
            .pipe(gulp.dest(base));
    }
});

gulp.task('language', function() {
    var tasks = [];

    for (var i = 0; i < langs.length; i++) {
        var lang = langs[i];
        var task1 = language(`src/**/*.${lang}.json`, './src', lang, moduleVariable, langKey);
        var task2 = language(`app/**/*.${lang}.json`, './app', lang, moduleVariable + 'App', langKey + 'App');
        tasks.push(task1, task2);
    }

    return merge(tasks);

    function language(src, base, lang, modName, langKey) {
        return gulp.src(src, { read: false, base: base })
            .pipe($.listfiles({
                filename: `translate.${lang}.ts`,
                banner: `import * as angular from 'angular';
import ${modName} from '../module';
                
let langs: any[] = [];`,
                prefix: 'langs.push(require(\'../',
                postfix: '\'));',
                footer: `
let merged = angular.merge({}, ...langs);
${modName}.config(
    // @ngInject
    function($translateProvider: ng.translate.ITranslateProvider) {
        $translateProvider.translations('${lang}', { ${langKey}: merged });
    }
);`,
            }))
            .pipe(gulp.dest(base + '/configs'));
    }
});

gulp.task('clean', function () {
    return gulp.src([ './bundle', './coverage' ], { read: false })
        .pipe($.clean());
});

//******************************************************************************
//* WEBPACK
//******************************************************************************

var webpackConfig = require('./webpack.config');
gulp.task('webpack', function (cb) {
    webpack(webpackConfig, function (err, stats) {
        if (err) {
            throw new gutil.PluginError('webpack', err);
        }    
        gutil.log('[webpack]', stats.toString('minimal'));
        cb();
    });
});

var server;
gulp.task('server', function (cb) {
    var compiler = webpack(webpackConfig);
    var devServerConfig = webpackConfig.devServer || {};
    server = new WebpackDevServer(compiler, devServerConfig).listen(8080, 'localhost', function (err) {
        if (err) {
            throw new gutil.PluginError('webpack', err);
        }    
        var url = 'http://localhost:8080/webpack-dev-server/index.html';
        gutil.log('[webpack-dev-server]', url);
        if (process.env.NODE_ENV !== 'e2e') {
            open(url);
        }
        cb();
    });
});

//******************************************************************************
//* WATCH
//******************************************************************************

gulp.task('watch', function() {
    gulp.watch(
        [
            'src/**/*.ts',
            'app/**/*.ts',
            '!src/**/*.spec.ts',
            '!app/**/*.spec.ts'
        ],
        { cwd: './' })
        .on('change', function (evt) {
            if (evt.type === 'added' || evt.type === 'deleted') {
                gulp.start('import-all');
            }
        });
    
    gulp.watch(
        [
            'src/**/*.json',
            'app/**/*.json'
        ],
        { cwd: './' })
        .on('change', function (evt) {
            if (evt.type === 'added' || evt.type === 'deleted') {
                gulp.start('language');
            }
        });
});

gulp.task('serve', ['server', 'watch']);

//******************************************************************************
//* E2E TEST
//******************************************************************************

gulp.task('robot', $.shell.task([
    'robot --variablefile robot/config.py --outputdir coverage/e2e-result "robot/*.robot"'
]));

gulp.task('remap-istanbul', function () {
    const opts = {
        dir: './coverage',
        pattern: './coverage/json/*.json',
        reporters: {
            json: {}
        }
    };

    combine.sync(opts);

    return gulp.src('coverage/coverage-final.json')
        .pipe(remapIstanbul({
            basePath: path.resolve(__dirname, './src')
        }))
        .pipe($.istanbulReport({
            dir: './coverage',
            reporters: ['lcov', 'json', 'text', 'text-summary']
        }));
});

gulp.task('e2e', function (cb) {
    runSequence(
        'server',
        'robot',
        'remap-istanbul',
        function () {
            setTimeout(() => process.exit(), 500);
            cb();
        });
});

//******************************************************************************
//* DEFAULT
//******************************************************************************

gulp.task('default', ['clean', 'import-all', 'language']);
