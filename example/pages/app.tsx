import React from "react";
import "./app.less";
import RouteComponent from "@/routes/index";

// 路由组件
function MyRoutes() {
    return (
        <React.Suspense fallback={null}>
            <RouteComponent />
        </React.Suspense>
    );
}

// 根组件
const App: React.FC<any> = (props) => {
    return (
        <div className="app">
            <MyRoutes />
        </div>
    );
};

export default App;
