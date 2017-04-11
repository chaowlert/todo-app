process.env.NODE_ENV = 'test';

module.exports = function(config) {  
    let configuration = {
        basePath: '',
        frameworks: ['mocha', 'chai'],
        exclude: [],
        files: [{ pattern: './spec-bundle.js', watched: false }],
        preprocessors: {'./spec-bundle.js': ['webpack']},
        browsers: ['PhantomJS'],
        webpack: require('./webpack.config.js'),
        coverageReporter: {
            dir: 'coverage',
            reporters: [
                { type: 'json', subdir: 'json' }
            ]
        },
        webpackMiddleware: {stats: 'errors-only', noInfo: true},
        reporters: ['mocha', 'coverage'],
        port: 9876,
        color: true,
        logLevel: config.LOG_INFO,
        autoWatch: false,
        singleRun: true
    };

    config.set(configuration);
}