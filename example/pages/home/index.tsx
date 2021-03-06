import React, { Component, useState, useEffect, useRef } from 'react';
import "./index.less";
import InfiniteScroll from '../../../src/index';


const Home: React.FC<any> = (props) => {
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [isError, setIsError] = useState<boolean>(true);
    const isErrorRef = useRef<boolean>(true);
    const [total, setTotal] = useState<number>(800);
    const [maxLength, setMaxLength] = useState<number>(800);
    const [list, setList] = useState<any[]>([]);
    const listRef = useRef<any[]>([]);

    useEffect(() => {
        const res = Array.from({ length: 100 })
        listChange(res)
        setHasMore(res?.length < total)
    }, [])

    const listChange = (value: any[]) => {
        listRef.current = value;
        setList(value);
    }

    const isErrorChange = (value: boolean) => {
        isErrorRef.current = value;
        setIsError(value);
    }

    // loading more
    const fetchMoreData = () => {

        if (listRef.current.length >= maxLength) {
            setHasMore(false);
            return;
        }

        if (listRef.current.length >= total) {
            setHasMore(false);
            return;
        }

        // simulate request
        new Promise((resolve, reject) => {
            setTimeout(() => {
                // creat a fake 'error' ,so not Use this in real life ;
                if (listRef.current.length >= 300 && !isErrorRef.current) {
                    reject();
                };

                resolve(listRef.current.concat(Array.from({ length: 20 })))
            }, 500);
        }).then((res: any) => {
            return listChange(res);
        }).catch(err => {
            isErrorChange(true);
        })
    };

    const reload = () => {
        new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(listRef.current.concat(Array.from({ length: 20 })))
            }, 500);
        }).then((res: any) => {
            return listChange(res);
        }).catch(err => {
            isErrorChange(true);
        })
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
                    dataSource={list}
                    next={fetchMoreData}
                    renderItem={renderItem}
                    scrollableParent={document.querySelector(".cart-index")}
                    hasMore={hasMore}
                    isError={isError}
                    pullDownToRefresh
                    refreshFunction={fetchMoreData}
                    pullDownComponent={<div style={{ height: "50px", background: "green" }}>下拉</div>}
                    releaseComponent={<div style={{ height: "50px", background: "red" }}>释放</div>}
                    refreshingComponent={<div style={{ height: "50px", background: "green" }}>加载中</div>}
                    refreshEndComponent={<div style={{ height: "50px", background: "red" }}>加载完成</div>}
                    loadingComponent={<div style={{ textAlign: 'center' }}><h4>Loading...</h4></div>}
                    errorComponent={<div style={{ textAlign: "center" }}><span>加载失败？点击<a onClick={reload}>重新加载</a></span></div>}
                    endComponent={
                        (list?.length && !maxLength) ?
                            <div style={{ textAlign: 'center', fontWeight: 'normal', color: '#999' }}>
                                <span>没有更多内容了</span>
                            </div> : null
                    }
                />
            </div>
            <div>内部固定高度滚动</div>
            <div>
                <InfiniteScroll
                    dataSource={list}
                    next={fetchMoreData}
                    renderItem={renderItem}
                    hasMore={hasMore}
                    isError={isError}
                    pullDownToRefresh
                    height={300}
                    refreshFunction={fetchMoreData}
                    pullDownComponent={<div style={{ height: "50px", background: "green" }}>下拉</div>}
                    releaseComponent={<div style={{ height: "50px", background: "red" }}>释放</div>}
                    refreshingComponent={<div style={{ height: "50px", background: "green" }}>加载中</div>}
                    refreshEndComponent={<div style={{ height: "50px", background: "red" }}>加载完成</div>}
                    loadingComponent={<div style={{ textAlign: 'center' }}><h4>Loading...</h4></div>}
                    errorComponent={<div style={{ textAlign: "center" }}><span>加载失败？点击<a onClick={reload}>重新加载</a></span></div>}
                    endComponent={
                        (list?.length && !maxLength) ?
                            <div style={{ textAlign: 'center', fontWeight: 'normal', color: '#999' }}>
                                <span>没有更多内容了</span>
                            </div> : null
                    }
                />
            </div>
            <div>反向上拉刷新, 下拉加载(一般用于聊天框)</div>
            <div>
                <InfiniteScroll
                    dataSource={list}
                    inverse
                    next={fetchMoreData}
                    renderItem={renderItem}
                    hasMore={hasMore}
                    isError={isError}
                    pullDownToRefresh
                    height={300}
                    refreshFunction={fetchMoreData}
                    pullDownComponent={<div style={{ height: "50px", background: "green" }}>下拉</div>}
                    releaseComponent={<div style={{ height: "50px", background: "red" }}>释放</div>}
                    refreshingComponent={<div style={{ height: "50px", background: "green" }}>加载中</div>}
                    refreshEndComponent={<div style={{ height: "50px", background: "red" }}>加载完成</div>}
                    loadingComponent={<div style={{ textAlign: 'center' }}><h4>Loading...</h4></div>}
                    errorComponent={<div style={{ textAlign: "center" }}><span>加载失败？点击<a onClick={reload}>重新加载</a></span></div>}
                    endComponent={
                        (list?.length && !maxLength) ?
                            <div style={{ textAlign: 'center', fontWeight: 'normal', color: '#999' }}>
                                <span>没有更多内容了</span>
                            </div> : null
                    }
                />
            </div>
        </>
    );

}

export default Home;