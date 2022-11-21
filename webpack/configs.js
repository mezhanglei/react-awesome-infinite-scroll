/**
 * webpack的配置管理文件
 */
// 合并为一个对象输出
module.exports = {
  // 是否开启体积分析插件
  isAnalyz: false,
  // 是否使用eslint true表示使用
  useEslint: false,
  // 是否使用stylelint true表示使用
  useStylelint: false,
  // 是否是打包环境
  isProd: process.env.NODE_ENV === 'prod',
  // 是否是开发环境
  isDev: process.env.NODE_ENV === 'dev',
};
