"use strict";

// 引入webpack
const webpack = require("webpack");
// const path = require("path");
// css文件指纹插件提取css，作用是缓存css并解决样式闪动问题 因为只在编译阶段作用 所以不适用于热更新 但在生产环境无需配置热更新也没多大问题
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
// 对webpack打包的信息进行警告,错误的明显标识提示 可以选择使用或不使用
const FriendlyErrorsWebpackPlugin = require("friendly-errors-webpack-plugin");
// 通过CopyWebpackPlugin将目标文件夹里的静态资源拷贝到目标文件夹
// const CopyWebpackPlugin = require("copy-webpack-plugin");
// (构建过程优化)webpack体积分析插件(会单独打开一个端口8888的页面显示体积构造图)
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
// stylelint的样式检查
const StyleLintPlugin = require("stylelint-webpack-plugin");
// eslint格式检查
const ESLintPlugin = require('eslint-webpack-plugin');

// 引入配置
const configs = require('./configs.js');
// 引入路径
const paths = require('./paths.js');
const isDev = configs.isDev;
// less/less module 正则表达式
const lessRegex = /\.less$/;
const lessModuleRegex = /\.module\.less$/;
// css/css module 正则表达式
const cssRegex = /\.css$/;
const cssModuleRegex = /\.module\.css$/;
// node_modules正则表达式
const nodeModulesRegex = /node_modules/;

const cssLoader = isDev ? 'style-loader' : {
  loader: MiniCssExtractPlugin.loader,
  options: {
    // 修改打包后目录中css文件中静态资源的引用的基础路径
    publicPath: "../",
  },
};

const outputPath = isDev ? paths.devOutputPath : paths.outputPath;
const entry = isDev ? `${paths.examplePath}/index` : `${paths.srcPath}/index`;

//  === webpack配置内容 === //
module.exports = {
  entry: entry,
  context: paths.appRoot,
  target: ["web", "es5"],
  output: {
    clean: !isDev ? true : false, // 在生成文件之前清空 output 目录
    path: outputPath,
    filename: "index.js",
    publicPath: paths.publicPath,
    library: isDev ? undefined : {
      type: 'umd', // 这将在所有模块定义下暴露你的库, 允许它与 CommonJS、AMD 和作为全局变量工作
    }
  },
  externals: isDev ? undefined : {
    'react': {
      'commonjs': 'react',
      'commonjs2': 'react',
      'amd': 'react',
      'root': 'React'
    },
    'react-dom': {
      'commonjs': 'react-dom',
      'commonjs2': 'react-dom',
      'amd': 'react-dom',
      'root': 'ReactDOM'
    },
    'react-router-dom': {
      'commonjs': 'react-router-dom',
      'commonjs2': 'react-router-dom',
      'amd': 'react-router-dom',
      'root': 'ReactRouterDOM'
    }
  },
  resolve: {
    // 后缀，引入时可以默认不写
    extensions: [".ts", ".tsx", ".js", "jsx", ".json", ".less"],
    alias: {
      "@": `${paths.srcPath}`,
      "src": `${paths.srcPath}`,
      "example": `${paths.examplePath}`
    }
  },
  // 用来指定loaders的匹配规则和指定使用的loaders名称
  module: {
    rules: [
      {
        test: /\.(ts|tsx|js|jsx)$/,
        // 忽略第三方
        // 忽略第三方(看第三方包是否需要转译,不需要的话去掉)
        exclude: [nodeModulesRegex, /lib/],
        use: [
          {
            // 多进程打包,必须放在处理js的loader之前
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
              extends: paths.babelrcPath,
              // 开启缓存
              cacheDirectory: true
            }
          },
        ],
      },
      {
        test: cssRegex,
        exclude: cssModuleRegex,
        use: [
          cssLoader,
          "css-loader"
        ],
      },
      {
        test: lessRegex,
        exclude: lessModuleRegex,
        use: [
          cssLoader,
          "css-loader",
          "postcss-loader",
          {
            loader: "less-loader",
            options: {
              lessOptions: {
                javascriptEnabled: true
              }
            },
          },
        ]
      },
      // 解析css module
      {
        test: lessModuleRegex,
        exclude: nodeModulesRegex,
        use: [
          cssLoader,
          {
            loader: 'css-loader',
            options: {
              modules: {
                mode: 'local',
                localIdentName: '[path][name]__[local]--[hash:base64:5]',
                localIdentContext: paths.srcPath
              },
              importLoaders: 3,
            } //css modules
          },
          "postcss-loader",
          "less-loader"
        ],
      },
      {
        test: /\.(png|svg|jpg|gif|jpeg|ico)$/i,
        exclude: nodeModulesRegex,
        type: "asset",
        parser: {
          dataUrlCondition: {
            // 小于20kb后导出内联类型资源, 超出后输出到指定目录
            maxSize: 20 * 1024
          }
        },
        generator: {
          filename: "img/[name].[ext]"
        }
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        exclude: nodeModulesRegex,
        type: 'asset',
        generator: {
          filename: "font/[name].[ext]"
        }
      },
    ],
  },
  // 插件
  plugins: [
    // 设置项目的全局变量,String类型, 如果值是个字符串会被当成一个代码片段来使用, 如果不是,它会被转化为字符串(包括函数)
    new webpack.DefinePlugin({
      'process.env.MOCK': process.env.MOCK,
      'process.env.PUBLIC_PATH': JSON.stringify(paths.publicPath || '/')
    }),
    // 统计信息提示插件(比如错误或者警告会用带颜色的字体来显示,更加友好)
    new FriendlyErrorsWebpackPlugin(),
    // 热更新
    ...(isDev ? [
      new ESLintPlugin({ eslintPath: paths.eslintrcPath }),
      new StyleLintPlugin({
        // 要检查scss的根目录
        context: paths.appRoot,
        // 1.扫描要检查的文件, 字符串或者数组, 将被glob接收所以支持style/**/*.scss这类语法
        // 2.我们也可以通过在package.json中配置命令的方式(--ext表示扩展名)
        files: paths.checkStylePath,
        // 配置文件的路径
        configFile: paths.stylelintrcPath,
        // 如果为true，则在全局构建过程中发生任何stylelint错误时结束构建过程 所以一般为false
        failOnError: false,
      }),
      new HtmlWebpackPlugin({
        filename: `index.html`,
        template: paths.appHtml,
        inject: true,
        minify: {
          html5: true,
          caseSensitive: false,
          removeAttributeQuotes: !isDev ? true : false,
          collapseWhitespace: !isDev ? true : false,
          preserveLineBreaks: false,
          minifyCSS: false,
          minifyJS: true,
          removeComments: true
        },
        commonJs: [
        ],
        commonCSS: [
        ]
      })
    ] : [
      new MiniCssExtractPlugin({
        filename: 'css/main.css'
      }),
      ...(configs.isAnalyz ? [new BundleAnalyzerPlugin()] : [])
    ])
  ]
};
