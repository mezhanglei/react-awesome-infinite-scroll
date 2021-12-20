"use strict";
const path = require("path");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const FriendlyErrorsWebpackPlugin = require("friendly-errors-webpack-plugin");
const TerserWebpackPlugin = require("terser-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const nodeExternals = require('webpack-node-externals');
const configs = require('./configs.js');

//  === webpack配置内容 === //
const webpackConfig = {
    entry: path.resolve(configs.root, 'src/index'),
    context: configs.root,
    output: {
        filename: 'bundle.js',
        path: path.resolve(configs.root, 'lib'),
        libraryTarget: 'commonjs2'
    },
    externals: [nodeExternals()],
    mode: "production",
    module: {
        rules: [
            {
                test: /\.(ts|tsx|js|jsx)$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: "thread-loader",
                        options: {
                            workers: 3,
                        },
                    },
                    {
                        loader: "babel-loader",
                        options: {
                            // 不使用默认的配置路径
                            babelrc: false,
                            // 配置新的babelrc路径
                            extends: configs.babelPath,
                            // 开启babel-loader缓存的参数
                            cacheDirectory: true
                        }
                    }
                ],
            },
            {
                test: /\.css$/,
                use: [
                    "style-loader",
                    "css-loader",
                ],
            },
            {
                test: /\.less$/,
                use: [
                    "style-loader",
                    "css-loader",
                    "postcss-loader",
                    {
                        loader: 'less-loader',
                        options: {
                            javascriptEnabled: true
                        }
                    }
                ]
            },
            {
                test: /\.(png|svg|jpg|gif|jpeg|ico)$/i,
                use: [
                    {
                        loader: "url-loader",
                        options: {
                            // 图片和字体都使用hash值
                            name: "img/[name].[ext]",
                            // 小于20k全部打包成base64进入页面
                            limit: 20 * 1024,
                            // 默认超出后file-loader
                            fallback: "file-loader"
                        },
                    },
                ],
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                use: [
                    {
                        loader: "url-loader",
                        options: {
                            // 图片和字体都使用hash值
                            name: "font/[name].[ext]",
                        },
                    },
                ],
            },
        ],
    },
    plugins: [
        new CleanWebpackPlugin(),
        new FriendlyErrorsWebpackPlugin(),
        new OptimizeCSSAssetsPlugin({
            assetNameRegExp: /\.css$/g,
            cssProcessor: require("cssnano"),
            cssProcessorOptions: {
                safe: true,
            }
        }),
        new CopyWebpackPlugin([
            {
                from: configs.staticPath,
                to: configs.staticOutPath
                // 忽略文件名
                // ignore: ['.*']
            },
        ])
    ],
    resolve: configs.resolve,
    optimization: {
        minimize: true,
        minimizer: [
            new TerserWebpackPlugin({
                parallel: true,
                cache: true,
            })
        ],
    },
};
module.exports = webpackConfig;
