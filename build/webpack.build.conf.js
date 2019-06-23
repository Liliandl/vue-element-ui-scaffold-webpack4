var path = require('path')
var utils = require('./utils')
var multiPage = require('./multi-page')
var webpack = require('webpack')
var config = require('../config')
var merge = require('webpack-merge')
var baseWebpackConfig = require('./webpack.base.conf')
var CopyWebpackPlugin = require('copy-webpack-plugin')
var OptimizeCssPlugin = require('optimize-css-map-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

var isProd = /prod|demo/.test(process.env.ENV_CONFIG)

var webpackConfig = merge(baseWebpackConfig, {
    mode: 'production',
    module: {
        rules: utils.styleLoaders({
            sourceMap: config.build.productionSourceMap,
            extract: true
        })
    },
    devtool: false, // see SourceMapDevToolPlugin,
    output: {
        path: config.build.assetsRoot,
        filename: utils.assetsPath('js/[name].[contenthash:8].js'),
        chunkFilename: utils.assetsPath('js/[name].[contenthash:8].js')
    },
    plugins: [
        // extract css into its own file
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // both options are optional
            filename: 'css/[name].[contenthash:8].css',
            //chunkFilename: 'css/[id].css'
        }),
        // Compress extracted CSS. We are using this plugin so that possible
        // duplicated CSS from different components can be deduped.
        new OptimizeCssPlugin({
            cssProcessorOptions: {
                append: !isProd,
                map: config.build.productionSourceMap,
                getFileName(assetInfo) {
                    return `${config.build.sourceMapPath}/${path.basename(assetInfo.path)}.map${assetInfo.query}`
                }
            }
        }),
        ...multiPage.htmlPlugins(baseWebpackConfig),
        // copy custom static assets
        new CopyWebpackPlugin([
            {
                from: path.resolve(__dirname, '../static'),
                to: config.build.assetsSubDirectory,
                ignore: ['.*']
            }
        ])
    ],
    optimization: {
        runtimeChunk: {
            name: 'manifest'
        },
        minimize: true,
        noEmitOnErrors: true,
        splitChunks: {
            chunks: 'async', // 必须三选一： "initial" | "all" | "async"
            minSize: 30000, // 最小尺寸
            minChunks: 2, //must be greater than or equal 2. The minimum number of chunks which need to contain a module before it's moved into the commons chunk.
            maxAsyncRequests: 5, // 最大异步请求数
            maxInitialRequests: 3, // 最大初始化请求书
            name: true, // 名称，此选项可接收 function
            cacheGroups: {
                vendor: { // key 为entry中定义的 入口名称
                    name: 'vendor', // 要缓存的 分隔出来的 chunk 名称
                    chunks: 'all', //all-异步加载快，但初始下载量较大，文件共用性好； initial-初始下载量较小，但异步加载量较大，文件间有重复内容
                    priority: -10,
                    reuseExistingChunk: false, // 选项用于配置在模块完全匹配时重用已有的块，而不是创建新块
                    test: /node_modules[\\/]/
                },
                aliOss: {
                    name: 'ali-oss',
                    priority: 10,
                    test: /ali\-oss/,
                },
                // common: {
                //     name: 'common',
                //     priority: 11,
                //     test: /js/,
                // },
            }
        }
    },
})

if (config.build.productionSourceMap) {
    // https://webpack.js.org/plugins/source-map-dev-tool-plugin/
    /*filename can like these(in webpack/lib/TemplatedPathPlugin.js):
        /\[hash(?::(\d+))?\]/gi,
        /\[chunkhash(?::(\d+))?\]/gi,
        /\[modulehash(?::(\d+))?\]/gi,
        /\[contenthash(?::(\d+))?\]/gi,
        /\[name\]/gi,               =main
        /\[id\]/gi,
        /\[moduleid\]/gi,
        /\[file\]/gi,
        /\[query\]/gi,              =js/main.59856ea7.js
        /\[filebase\]/gi;           =main.59856ea7.js
    */
    webpackConfig.plugins.push(
        new webpack.SourceMapDevToolPlugin({
            filename: `${config.build.sourceMapPath}/[filebase].map`,
            append: isProd ? false : undefined, // undefined会自动加载源码映射，生产环境慎用。false时不会
        })
    )
}

if (config.build.productionGzip) {
    var CompressionWebpackPlugin = require('compression-webpack-plugin')

    webpackConfig.plugins.push(
        new CompressionWebpackPlugin({
            asset: '[path].gz[query]',
            algorithm: 'gzip',
            test: new RegExp(
                '\\.(' +
                config.build.productionGzipExtensions.join('|') +
                ')$'
            ),
            threshold: 10240,
            minRatio: 0.8
        })
    )
}

if (config.build.bundleAnalyzerReport) {
    var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
    webpackConfig.plugins.push(new BundleAnalyzerPlugin())
}

module.exports = webpackConfig
