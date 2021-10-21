import React, { Component, useState, useEffect, useRef } from 'react';
import "./index.less";
import InfiniteScroll from '../../../src/index';


const Home: React.FC<any> = (props) => {

    const total = 150;
    const [list, setList] = useState([]);
    const [hasMore, setHasMore] = useState<boolean>();
    const [isRefreshing, setIsRefreshing] = useState<boolean>();

    useEffect(() => {
        const res = Array.from({ length: 100 })
        setList(res);
        setHasMore(res?.length < total);
    }, [])

    // loading more
    const fetchMoreData = () => {
        setTimeout(() => {
            const next = list?.concat(Array.from({ length: 20 }))
            setList(next);
            if (next?.length > 160) {
                setHasMore(false)
            }
        }, 1000);
    };

    const reload = () => {
        setIsRefreshing(true)
        setTimeout(() => {
            const res = Array.from({ length: 100 })
            setList(res);
            setIsRefreshing(false)
        }, 1000);
    }

    const renderItem = (_, index: number) => {
        return (
            <div style={{ height: 30, border: '1px solid green', margin: 6, padding: 8 }} key={index} >
                div - #{index}{_}
            </div>
        );
    }

    return (
        <>
            <div>外部容器滚动</div>
            <div className="cart-index" style={{ height: "300px", overflow: "auto" }}>
                <InfiniteScroll
                    length={list?.length}
                    next={fetchMoreData}
                    scrollableParent={document.querySelector(".cart-index")}
                    hasMore={hasMore}
                    isRefreshing={isRefreshing}
                    pullDownToRefresh
                    refreshFunction={reload}
                    pullDownComponent={<div style={{ height: "50px", background: "green" }}>下拉</div>}
                    releaseComponent={<div style={{ height: "50px", background: "red" }}>释放</div>}
                    refreshingComponent={<div style={{ height: "50px", background: "green" }}>加载中</div>}
                    refreshEndComponent={<div style={{ height: "50px", background: "red" }}>加载完成</div>}
                    loadingComponent={<div style={{ textAlign: 'center' }}><h4>Loading...</h4></div>}
                    endComponent={
                        (list?.length) ?
                            <div style={{ textAlign: 'center', fontWeight: 'normal', color: '#999' }}>
                                <span>没有更多内容了</span>
                            </div> : null
                    }
                >
                    {
                        list?.map((item, index) => {
                            return renderItem(item, index);
                        })
                    }
                </InfiniteScroll>
            </div>
            <div>内部固定高度滚动</div>
            <div>
                <InfiniteScroll
                    length={list?.length}
                    next={fetchMoreData}
                    hasMore={hasMore}
                    isRefreshing={isRefreshing}
                    pullDownToRefresh
                    height={300}
                    refreshFunction={reload}
                    pullDownComponent={<div style={{ height: "50px", background: "green" }}>下拉</div>}
                    releaseComponent={<div style={{ height: "50px", background: "red" }}>释放</div>}
                    refreshingComponent={<div style={{ height: "50px", background: "green" }}>加载中</div>}
                    refreshEndComponent={<div style={{ height: "50px", background: "red" }}>加载完成</div>}
                    loadingComponent={<div style={{ textAlign: 'center' }}><h4>Loading...</h4></div>}
                    endComponent={
                        (list?.length) ?
                            <div style={{ textAlign: 'center', fontWeight: 'normal', color: '#999' }}>
                                <span>没有更多内容了</span>
                            </div> : null
                    }
                >
                    {
                        list?.map((item, index) => {
                            return renderItem(item, index);
                        })
                    }
                </InfiniteScroll>
            </div>
            <div>反向上拉刷新, 下拉加载(一般用于聊天框)</div>
            <div>
                <InfiniteScroll
                    length={list?.length}
                    inverse
                    next={fetchMoreData}
                    hasMore={hasMore}
                    isRefreshing={isRefreshing}
                    pullDownToRefresh
                    height={300}
                    refreshFunction={reload}
                    pullDownComponent={<div style={{ height: "50px", background: "green" }}>下拉</div>}
                    releaseComponent={<div style={{ height: "50px", background: "red" }}>释放</div>}
                    refreshingComponent={<div style={{ height: "50px", background: "green" }}>加载中</div>}
                    refreshEndComponent={<div style={{ height: "50px", background: "red" }}>加载完成</div>}
                    loadingComponent={<div style={{ textAlign: 'center' }}><h4>Loading...</h4></div>}
                    endComponent={
                        (list?.length) ?
                            <div style={{ textAlign: 'center', fontWeight: 'normal', color: '#999' }}>
                                <span>没有更多内容了</span>
                            </div> : null
                    }
                >
                    {
                        list?.map((item, index) => {
                            return renderItem(item, index);
                        })
                    }
                </InfiniteScroll>
            </div>
        </>
    );

}

export default Home;