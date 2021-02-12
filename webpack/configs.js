
const glob = require("glob");
const globAll = require("glob-all");
const path = require("path");

const root = path.join(__dirname, '..');
const srcPath = path.join(root, 'src');
const examplePath = path.join(root, 'example');
const staticPath = path.join(root, 'static');
const devOutputPath = path.join(root, "dist");
const htmlPages = path.join(root, 'public');
const publicPath = '/';

const baseConfig = {
    assetsPath: '../',
    resolve: {
        extensions: [".ts", ".tsx", ".js", "jsx", ".json", ".less", ".less.module"],
        alias: {
            "@": `${examplePath}`,
            "example": `${examplePath}`,
            "static": `${staticPath}`
        }
    },
    providePlugin: {
        React: "react",
        ReactDOM: "react-dom",
        ReactRouterDOM: "react-router-dom",
    },
    babelPath: path.join(root, './.babelrc')
};

const globalDefine = {
    'process.env': {
        MOCK: process.env.MOCK,
        PUBLIC_PATH: JSON.stringify(publicPath || '/'),
    }
};

const devConfig = {
    useEslint: false,
    useStylelint: true,
    eslintPath: path.join(root, "./.stylelintrc.{js,ts}"),
    stylelintPath: path.join(root, "./.stylelintrc.{js,ts}"),
    checkStyleRoot: examplePath,
    checkStylePath: ["src/**/*.{css,sass,scss,less}"],
    indexHtml: 'index.html',
    openPage: /^\//.test(publicPath) ? publicPath.replace(/^\/+/, '') : publicPath
};

const prodConfig = {
    isAnalyz: false,
    treeShakingCssPath: globAll.sync([
        path.join(root, "src/**/*.{js,ts}"),
        path.join(root, "src/**/*.less")
    ]),
    staticOutPath: path.join(devOutputPath, 'static')
};

const commonJs = [
    // publicPath + 'static/dll/base_dll.js'
];

const commonCSS = [
    // publicPath + `static/fonts/iconfont.css?time=${new Date().getTime()}`
];

module.exports = {
    globalDefine,
    root,
    htmlPages,
    srcPath,
    examplePath,
    staticPath,
    devOutputPath,
    publicPath,
    commonJs,
    commonCSS,
    ...baseConfig,
    ...devConfig,
    ...prodConfig
};
