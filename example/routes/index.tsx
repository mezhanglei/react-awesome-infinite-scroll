import React from "react";
import { HashRouter as Router, Route, Switch, Redirect, RouteProps } from "react-router-dom";
// import { BrowserRouter as Router, Route, Switch, Redirect } from "react-router-dom";
import { DemoRoutes } from "./demo";

export interface MyRouteProps extends RouteProps {
  auth?: boolean; // 是否需要权限验证
  component: any; // 组件
  animationConfig?: { // 组件切换的动画类
    enter: string;
    exit: string;
  };
}

// 路由配置
const routes = [
  ...DemoRoutes,
];

// 路由组件
export default function RouteComponent() {

  return (
    <Router>
      <Switch>
        {routes.map((item: MyRouteProps, index) => {
          return <Route
            key={index}
            exact={item.exact}
            path={item.path}
            render={(props) => {
              return <item.component key={item.path} {...props}></item.component>
            }}
          />;
        })}
      </Switch>
    </Router>
  );
}
