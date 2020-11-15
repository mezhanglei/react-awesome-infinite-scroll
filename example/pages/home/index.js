import React, { Component, useState, useEffect } from 'react';
import "./index.less";
import InfiniteScroll from '../../../src/index';

class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            items: Array.from({ length: 10 }),
            hasMore: true
        };
    }
    static defaultProps = {
        type: '首页'
    }

    componentDidMount() {
    }

    fetchMoreData = () => {
        if (this.state.items.length >= 500) {
            this.setState({ hasMore: false });
            return;
        }
        // a fake async api call like which sends
        // 20 more records in .5 secs
        setTimeout(() => {
            this.setState({
                items: this.state.items.concat(Array.from({ length: 20 })),
            });
        }, 500);
    };

    render() {
        return (
            <div>
                <div className="home">首页</div>
                <div style={{ width: '500px' }}>
                    <InfiniteScroll
                        next={this.fetchMoreData}
                        hasMore={this.state.hasMore}
                        loader={<h4>Loading...</h4>}
                        height={200}
                        endMessage={
                            <p style={{ textAlign: 'center' }}>
                                <b>Yay! You have seen it all</b>
                            </p>
                        }
                    >
                        {this.state.items.map((_, index) => (
                            <div style={{ height: 30, border: '1px solid green', margin: 6, padding: 8 }} key={index} >
                                div - #{index}
                            </div>
                        ))}
                    </InfiniteScroll>
                </div>
            </div>
        );
    }
};

export default Home;
