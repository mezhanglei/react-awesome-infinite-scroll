import React from "react";
import { HashRouter as Router, Route, Switch, Prompt, RouteProps } from "react-router-dom";
// import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { HomeRoutes, Home } from "./home";

/**
 * 页面路由配置
 * 必填参数说明：
 *  1.path: 路由
 *  2.component: 组件
 * 非必填参数说明：
 *  exact: 默认false， 为true时表示严格匹配，只有访问的路由和目标完全相等时才会被渲染
 */
const routes = [
    {
        path: "/",
        component: Home,
        // 路由为/时必须设置exact为true
        exact: true
    },
    ...HomeRoutes
];

export interface MyRouteProps extends RouteProps {
    auth?: boolean; // 是否需要权限验证
    component: any; // 组件
}

// 进入路由页面之前触发的方法
function beforeRouter(props, item: MyRouteProps) {
    // 微信授权
    // initWX();
}

// 路由组件
export default function RouteComponent() {
    // BrowserRouter时需要设置basename
    const basename = Router.name == "BrowserRouter" ? process.env.PUBLIC_PATH : "";

    return (
        <Router basename={basename}>
            <Switch>
                {routes.map((item: MyRouteProps, index) => {
                    return <Route
                        key={index}
                        exact={item.exact}
                        path={item.path}
                        render={(props) => {
                            beforeRouter(props, item);
                            return (
                                <React.Fragment>
                                    <item.component key={item.path} {...props}></item.component>
                                </React.Fragment>
                            );
                        }}
                    />;
                })}
            </Switch>
        </Router>
    );
}
