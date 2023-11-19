const path = require("path");
const fs = require('fs');
// 返回运行当前脚本的工作目录的路径。
const appRoot = fs.realpathSync(process.cwd());
// 加载根目录下面的其他目录
const resolveApp = relativePath => path.resolve(appRoot, relativePath);
// 打包入口
const srcPath = resolveApp('src');
// 开发环境入口
const examplePath = resolveApp('example');
// 打包输出目录
const outputPath = resolveApp('lib');
// 开发环境下的输出目录
const devOutputPath = resolveApp('dist');
// node_modules的目录
const nodeModulesPath = resolveApp('node_modules');
// 页面模板
const appHtml = path.join(appRoot, 'public/index.html');
// 引入配置
const configs = require('./configs.js');
const isDev = configs.isDev;
// 合并为一个对象输出
module.exports = {
  appRoot,
  srcPath,
  examplePath,
  outputPath,
  devOutputPath,
  nodeModulesPath,
  appHtml,
  // 资源访问的公共绝对路径, 并且访问路由会加上对应的路径字符串， 默认为/不能为空(格式如: /publicPath/)
  publicPath: isDev ? '/' : './',
  babelrcPath: path.join(appRoot, './.babelrc'),
  mockPath: path.join(srcPath, 'mock')
};
