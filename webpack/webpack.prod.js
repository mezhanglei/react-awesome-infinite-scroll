"use strict";

const { merge } = require('webpack-merge');
const base = require('./webpack.base.js');
// (构建过程优化)多进程/多实例压缩
const TerserWebpackPlugin = require("terser-webpack-plugin");
// (构建过程优化)webpack速度分析插件,在package.json中配置命令webpack --progress --config webpack.prod.js --json > stats.json,执行可以输出分析时间结果
const SpeedMeasureWebpackPlugin = require("speed-measure-webpack-plugin");
// 对打包后的css进行压缩
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
// --profile
const isEnvProductionProfile = process.argv.includes('--profile');
// 引入配置
const configs = require('./configs.js');
const isProd = configs.isProd;
const webpackConfig = merge(base, {
  mode: "production",
  devtool: isProd ? false : "cheap-module-source-map",
  optimization: {
    // 默认true，表示启用压缩代码
    minimize: true,
    // 找出模块提供了哪些导出并告诉webpack
    providedExports: true,
    // 告诉 webpack 确定每个模块使用的导出
    usedExports: true,
    // 默认false，为true时在tree shaking的时候，跳过package.json里的sideEffects选项中的模块
    sideEffects: true,
    // (构建过程)多进程多实例并行压缩,(以前使用uglifyjs-webpack-plugin)
    minimizer: [
      new TerserWebpackPlugin({
        // 默认true开启多进程，也可以设置数字表示进程数
        parallel: true,
        // 是否将注释提取到单独的文件
        extractComments: false,
        terserOptions: {
          parse: {
            // 解析
            ecma: 2016
          },
          compress: {
            ecma: 5,
            warnings: false,
            comparisons: false,
            inline: 2,
            keep_classnames: isEnvProductionProfile,
            keep_fnames: isEnvProductionProfile
            // 去掉console.log
            // pure_funcs: ['console.log'] 
          },
          output: {
            ecma: 5,
            comments: false,
            // 转义字符串和正则表达式中的 Unicode 字符
            ascii_only: true
          },
          mangle: {
            // 解决Safari 10 循环迭代器错误 “不能两次声明 let 变量”
            safari10: true
          }
        },
      }),
      new CssMinimizerPlugin()
    ],
  }
});
// (构建过程优化)实例化一个速度分析对象(它的wrap方法用来包裹webpack配置)
const smp = new SpeedMeasureWebpackPlugin();
module.exports = smp.wrap(webpackConfig);