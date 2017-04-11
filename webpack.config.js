//node modules
var path = require('path');
var webpack = require('webpack');
var express = require('express');

//webpack plugins
var HtmlWebpackPlugin = require('html-webpack-plugin');
var FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');

//environment variables
var isProd = process.env.NODE_ENV === 'production';
var isSpecTest = process.env.NODE_ENV === 'test';
var isE2eTest = process.env.NODE_ENV === 'e2e';
var isTest = isSpecTest || isE2eTest;

//load all vendors from package.json
var pkg = require('./package.json');
var vendors = Object.keys(pkg.dependencies).reduce((obj, dep) => (obj[dep] = dep, obj), {});

//compilation variables
var define = {
    'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development')
    }
};

//loader settings
var tsLoader = 'ts-loader?' + JSON.stringify({
    configFileName: isProd ? 'tsconfig.prod.json' : 'tsconfig.json',
    compilerOptions: {
        sourceMap: isTest,
        declaration: isProd,
    }
});

//webpack config
var config = {
    entry: {
        index: './src/index.ts'
    },
    output: {
        path: path.resolve(__dirname, 'bundle'),
        filename: '[name].js'
    },
    resolve: {
        extensions: ['.ts', '.js', '.json'],
        modules: ['node_modules', './src'],
    },
    module: {
        rules: [
            { enforce: 'pre', test: /\.ts$/, loader: 'tslint-loader', exclude: /node_modules/ },
            { test: /\.ts$/, loader: tsLoader, exclude: isSpecTest ? [] : [/\.spec\.ts/] },
            { test: /\.html$/, loader: 'html-loader?root=~', exclude: path.resolve(__dirname, 'app/index.html') },
            { test: /\.s[ac]ss$/, loader: 'style-loader!css-loader?root=~!sass-loader' },
            { test: /\.(je?pg|png|gif|woff2?|ttf|eot|otf|svg)$/, loader: `url-loader?limit=10000&name=lib/${pkg.name}/[name]-[hash].[ext]`, include: path.resolve(__dirname, 'src') },
            { test: /\.(je?pg|png|gif|woff2?|ttf|eot|otf|svg)$/, loader: `url-loader?limit=10000&name=lib/${pkg.name}/[name]-[hash].[ext]`, exclude: path.resolve(__dirname, 'src') },
        ],
    },
    plugins: [
        new webpack.DefinePlugin(define),
        new FriendlyErrorsWebpackPlugin(),
        new webpack.ProvidePlugin({
            jQuery: 'jquery',
            $: 'jquery',
            jquery: 'jquery'
        }),
        new webpack.LoaderOptionsPlugin({
            options: {
                tslint: {
                    emitErrors: true
                }
            }
        })
    ],
    stats: {
        hash: false,
        version: false,
        timings: false,
        children: false,
        errors: false
    }
};

//dev env
if (!isProd && !isSpecTest) {

    //debug info
    config.devtool = 'inline-source-map';
    config.output.pathinfo = true;
    config.plugins.push(
        new webpack.LoaderOptionsPlugin({
            debug: true
        })
    );

    if (!isE2eTest) {
        config.plugins.push(
            new webpack.HotModuleReplacementPlugin()
        );
    }    

    //dev server
    config.plugins.push(
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: './app/index.html',
            chunksSortMode: 'dependency',
            inject: 'body'
        })
    );
    config.devServer = {
        historyApiFallback: true,
        noInfo: true,
        compress: true,
        setup: function (app) {
            for (let dep of Object.keys(pkg.dependencies)) {
                if (!dep.startsWith('ad-')) {
                    continue;
                }    
                app.use(`/lib/${dep}`, express.static(`node_modules/${dep}/bundle/lib/${dep}`));
            }
        }
    };
    
    //add app and vendors entry points    
    config.entry.app = './app/app.ts';
    config.entry.vendors = Object.keys(vendors);
    config.plugins.push(
        new webpack.optimize.CommonsChunkPlugin({
            name: 'index',
            minChunks: Infinity,
            chunks: ['app', 'index'],
        })
    );
    config.plugins.push(
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendors',
            minChunks: Infinity,
        })
    );
}

//test env
if (isTest) {
    config.devtool = 'inline-source-map';
    config.resolve.alias.sinon = 'sinon/pkg/sinon';
    config.module.noParse = [/sinon/];
    config.module.rules.push({
        enforce: 'post',
        test: /\.ts$/,
        loader: 'istanbul-instrumenter-loader?preserveComments=true&compact=false',
        include: path.resolve(__dirname, 'src'),
        exclude: [ /\.spec\.ts$/, /node_modules/ ]
    });
}

//prod env
if (isProd) {
    tsLoader = 'ng-annotate-loader!' + tsLoader;
    config.externals = vendors;
    config.resolve.modules = ['./src'];
    config.plugins.push(
        new webpack.optimize.UglifyJsPlugin({
            sourceMap: true,
            compress: {
                warnings: false
            }
        })
    );
    config.output.library = pkg.name;
    config.output.libraryTarget = 'umd';
}

module.exports = config;