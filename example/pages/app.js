import React from "react";
import "./app.less";
import RouteComponent from "@/routes/index.js";

function MyRoutes() {
    return (
        <React.Suspense fallback={null}>
            <RouteComponent />
        </React.Suspense>
    );
}

class App extends React.Component {
    constructor(props) {
        super(props);
    }
    state = {
        isError: false,
    };
    componentDidMount() {
        this.setState({
            scrollDom: ReactDOM.findDOMNode(this)
        });
    }
    componentWillUnmount() { }

    render() {
        return (
            <div className="app">
                <MyRoutes />
            </div>
        );
    }
}

export default App;
