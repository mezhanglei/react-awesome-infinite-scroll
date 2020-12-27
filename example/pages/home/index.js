import React, { Component, useState, useEffect } from 'react';
import "./index.less";
import InfiniteScroll from '../../../src/index';

class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasMore: true,
            total: 800
        };
    }

    componentDidMount() {
        // first loading
        setTimeout(() => {
            const res = Array.from({ length: 100 })
            this.setState({
                list: res,
                hasMore: res?.length < this.state.total
            });
        }, 100);
    }

    // loading more
    fetchMoreData = () => {
        const { maxLength, list = [], total } = this.state;

        if (list.length >= maxLength) {
            this.setState({ hasMore: false });
            return;
        }

        if (list.length >= total) {
            this.setState({ hasMore: false });
            return;
        }

        // simulate request
        new Promise((resolve, reject) => {
            setTimeout(() => {
                // creat a fake 'error' ,so not Use this in real life ;
                if (list.length >= 300 && !this.state.isError) {
                    reject();
                };

                resolve(list.concat(Array.from({ length: 20 })))
            }, 500);
        }).then(res => {
            this.setState({
                list: res
            });
        }).catch(err => {
            this.setState({
                isError: true
            });
        })
    };

    reload = () => {
        new Promise((resolve, reject) => {
            setTimeout(() => {
                const { list = [] } = this.state;
                resolve(list.concat(Array.from({ length: 20 })))
            }, 500);
        }).then(res => {
            this.setState({
                list: res
            });
        }).catch(err => {
            this.setState({
                isError: true
            });
        })
    }

    render() {
        const { hasMore, isError, list = [], maxLength } = this.state;
        return (
            <>
                <div>外部容器滚动</div>
                <div className="cart-index" style={{ height: "300px", overflow: "auto" }}>
                    <InfiniteScroll
                        limit={120}
                        dataSource={list}
                        next={this.fetchMoreData}
                        scrollableParent={document.querySelector(".cart-index")}
                        hasMore={hasMore}
                        isError={isError}
                        pullDownToRefresh
                        refreshFunction={this.fetchMoreData}
                        pullDownComponent={<div style={{ height: "50px", background: "green" }}>下拉</div>}
                        releaseComponent={<div style={{ height: "50px", background: "red" }}>释放</div>}
                        refreshingComponent={<div style={{ height: "50px", background: "green" }}>加载中</div>}
                        refreshEndComponent={<div style={{ height: "50px", background: "red" }}>加载完成</div>}
                        loadingComponent={<div style={{ textAlign: 'center' }}><h4>Loading...</h4></div>}
                        errorComponent={<div style={{ textAlign: "center" }}><span>加载失败？点击<a onClick={this.reload}>重新加载</a></span></div>}
                        endComponent={
                            (list?.length && !maxLength) ?
                                <div style={{ textAlign: 'center', fontWeight: 'normal', color: '#999' }}>
                                    <span>没有更多内容了</span>
                                </div> : null
                        }
                    >
                        {list.map((_, index) => (
                            <div style={{ height: 30, border: '1px solid green', margin: 6, padding: 8 }} key={index} >
                                div - #{index}
                            </div>
                        ))}
                    </InfiniteScroll>
                </div>
                <div>内部固定高度滚动</div>
                <div>
                    <InfiniteScroll
                        next={this.fetchMoreData}
                        hasMore={hasMore}
                        isError={isError}
                        pullDownToRefresh
                        height={300}
                        refreshFunction={this.fetchMoreData}
                        pullDownComponent={<div style={{ height: "50px", background: "green" }}>下拉</div>}
                        releaseComponent={<div style={{ height: "50px", background: "red" }}>释放</div>}
                        refreshingComponent={<div style={{ height: "50px", background: "green" }}>加载中</div>}
                        refreshEndComponent={<div style={{ height: "50px", background: "red" }}>加载完成</div>}
                        loadingComponent={<div style={{ textAlign: 'center' }}><h4>Loading...</h4></div>}
                        errorComponent={<div style={{ textAlign: "center" }}><span>加载失败？点击<a onClick={this.reload}>重新加载</a></span></div>}
                        endComponent={
                            (list?.length && !maxLength) ?
                                <div style={{ textAlign: 'center', fontWeight: 'normal', color: '#999' }}>
                                    <span>没有更多内容了</span>
                                </div> : null
                        }
                    >
                        {list.map((_, index) => (
                            <div style={{ height: 30, border: '1px solid green', margin: 6, padding: 8 }} key={index} >
                                div - #{index}
                            </div>
                        ))}
                    </InfiniteScroll>
                </div>
                <div>反向上拉刷新, 下拉加载(一般用于聊天框)</div>
                <div>
                    <InfiniteScroll
                        inverse
                        next={this.fetchMoreData}
                        hasMore={hasMore}
                        isError={isError}
                        pullDownToRefresh
                        height={300}
                        refreshFunction={this.fetchMoreData}
                        pullDownComponent={<div style={{ height: "50px", background: "green" }}>下拉</div>}
                        releaseComponent={<div style={{ height: "50px", background: "red" }}>释放</div>}
                        refreshingComponent={<div style={{ height: "50px", background: "green" }}>加载中</div>}
                        refreshEndComponent={<div style={{ height: "50px", background: "red" }}>加载完成</div>}
                        loadingComponent={<div style={{ textAlign: 'center' }}><h4>Loading...</h4></div>}
                        errorComponent={<div style={{ textAlign: "center" }}><span>加载失败？点击<a onClick={this.reload}>重新加载</a></span></div>}
                        endComponent={
                            (list?.length && !maxLength) ?
                                <div style={{ textAlign: 'center', fontWeight: 'normal', color: '#999' }}>
                                    <span>没有更多内容了</span>
                                </div> : null
                        }
                    >
                        {list.map((_, index) => (
                            <div style={{ height: 30, border: '1px solid green', margin: 6, padding: 8 }} key={index} >
                                div - #{index}
                            </div>
                        ))}
                    </InfiniteScroll>
                </div>
            </>
        );
    }
};

export default Home;