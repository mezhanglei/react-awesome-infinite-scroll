"use strict";
const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const FriendlyErrorsWebpackPlugin = require("friendly-errors-webpack-plugin");
const StyleLintPlugin = require("stylelint-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const configs = require('./configs.js');

const useEslintLoader = {
    loader: "eslint-loader",
    options: {
        eslintPath: configs.eslintPath
    }
};


const useStylelintPlugin = new StyleLintPlugin({
    context: configs.checkStyleRoot,
    files: configs.checkStylePath,
    configFile: configs.stylelintPath,
    failOnError: false,
});


const os = require("os");
function getNetworkIp() {
    let needHost = "";
    try {
        // 获得网络接口对象
        let network = os.networkInterfaces();
        Object.keys(network).map((item) => {
            network[item].map((sub) => {
                if (
                    sub.family === "IPv4" &&
                    sub.address !== "127.0.0.1" &&
                    !sub.internal
                ) {
                    needHost = sub.address;
                }
            });
        });
    } catch (e) {
        needHost = "localhost";
    }
    return needHost;
}

module.exports = {
    entry: {
        index: path.join(configs.examplePath, 'pages/index')
    },
    context: configs.root,
    output: {
        path: configs.devOutputPath,
        filename: '[name].js',
        publicPath: configs.publicPath
    },
    mode: "development",
    module: {
        rules: [
            {
                test: /\.(ts|tsx|js|jsx)$/,
                use: [
                    {
                        loader: "babel-loader",
                        options: {
                            babelrc: false,
                            extends: configs.babelPath,
                            cacheDirectory: true
                        }
                    },
                    // eslint
                    ...(configs.useEslint ? [useEslintLoader] : [])
                ],
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: [
                    "style-loader",
                    "css-loader"
                ],
            },
            {
                test: /\.less$/,
                use: [
                    "style-loader",
                    "css-loader",
                    "less-loader"
                ]
            },
            {
                test: /(\.less\.module)$/,
                use: [
                    "style-loader",
                    {
                        loader: 'css-loader',
                        options: {
                            modules: {
                                mode: 'local',
                                localIdentName: '[path][name]__[local]--[hash:base64:5]',
                                context: configs.examplePath
                            },
                            importLoaders: 2,
                            localsConvention: 'camelCase'
                        } //css modules
                    },
                    "less-loader"
                ],
            },
            {
                test: /\.(png|svg|jpg|gif|jpeg|ico)$/,
                use: [
                    {
                        loader: "url-loader",
                        options: {
                            limit: 20 * 1024,
                        },
                    },
                ],
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                use: "url-loader",
            },
        ],
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.ProvidePlugin(configs.providePlugin),
        new FriendlyErrorsWebpackPlugin(),
        new webpack.DefinePlugin(configs.globalDefine),
        new CopyWebpackPlugin([
            {
                from: configs.staticPath,
                to: configs.staticOutPath
                // 忽略文件名
                // ignore: ['.*']
            },
        ]),
        useStylelintPlugin,
        new HtmlWebpackPlugin({
            filename: `index.html`,
            template: path.join(configs.htmlPages, 'index.html'),
            chunks: ["vendors", "common", `runtime~index`, 'index'],
            inject: true,
            minify: {
                html5: true,
                caseSensitive: false,
                removeAttributeQuotes: process.env.NODE_ENV === "development" ? false : true,
                collapseWhitespace: process.env.NODE_ENV === "development" ? false : true,
                preserveLineBreaks: false,
                minifyCSS: false,
                minifyJS: true,
                removeComments: true
            },
            commonJs: configs.commonJs,
            commonCSS: configs.commonCSS
        })
    ],
    resolve: configs.resolve,
    devServer: {
        contentBase: configs.root,
        index: configs.indexHtml,
        openPage: configs.openPage,
        port: 8089,
        host: getNetworkIp(),
        hot: true,
        inline: true,
        compress: true,
        historyApiFallback: {
            rewrites: {
                from: new RegExp(".*"),
                to: (configs.publicPath + '/').replace(/\/+/g, '/') + 'index.html'
            }
        },
        watchOptions: {
            aggregateTimeout: 300,
            poll: 1000,
            ignored: /node_modules/,
        },
        https: false,
        stats: "errors-only",
        proxy: [
            {
                context: ["/xx"],
                target: "http://xxx.xxx.xxx.com",
                ws: true,
                secure: false,
                changeOrigin: true
            },
        ],
    },
    devtool: "source-map",
};
