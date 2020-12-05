import React, { Component, useEffect, useState, useRef } from 'react';
import { throttle } from './utils/common';
import { ThresholdUnits, parseThreshold } from './utils/threshold';
import Raf from "./utils/requestAnimationFrame";
import { getScroll, getClient, getPositionInPage, getScrollParent } from "./utils/dom";
import { isDom } from "./utils/type";

/**
 * 滚动加载列表组件:
 * next: function 加载新数据时函数
 * hasMore: boolean 控制是否还进行加载
 * loader: ReactNode 加载时的展示组件
 * isError: boolean 是否加载出错
 * errorMsg: ReactNode 加载出错时的展示组件
 * height: number 设置固定高度滚动
 * pullDownToRefresh: boolean 是否下拉刷新
 * pullDownToRefreshContent: ReactNode 下拉时的展示组件
 * releaseToRefreshContent: ReactNode 释放下拉时展示组件
 * refreshFunction: function 刷新列表的方法
 * endMessage: ReactNode 数据加载完了展示的组件
 * initialScrollY: number 列表初始化加载时滚动到的位置
 * scrollableParent: HtmlElement 不设置则默认自动搜索滚动父元素， 设置在该父元素内滚动，建议设置以节省性能，设置forbidTrigger可以阻止滚动触发
 * forbidTrigger: boolean 禁止滚动加载触发，当页面上有多个滚动列表且滚动父元素相同，则可以通过此api禁止滚动触发加载
 * minPullDown, maxPullDown: 下拉刷新时, 设置最小下拉高度和最大下拉高度
 * onScroll: function (e) {} 滚动监听函数
 * inverse: boolean 反向滚动加载
 * thresholdValue: string | number 阈值,用来控制滚动到什么程度(距离)触发加载
 * containerStyle: object 组件内部的style样式
 */

const InfiniteScroll = (props) => {

    const {
        height,
        containerStyle,
        children,
        pullDownToRefresh,
        releaseToRefreshContent,
        pullDownToRefreshContent,
        endMessage,
        loader,
        hasMore,
        errorMsg,
        className,
        onScroll,
        inverse,
        thresholdValue,
        forbidTrigger,
        next,
        refreshFunction,
        minPullDown,
        maxPullDown,
        initialScrollY
    } = props;

    const [pullAreaHeight, setPullAreaHeight] = useState(0);
    const [showRelease, setShowRelease] = useState(false);
    const [loading, setLoading] = useState(false);
    const [finishTrigger, setFinishTrigger] = useState(false);
    const [isError, setIsError] = useState(false);
    const [startY, setStartY] = useState(0);
    const [preStartY, setPreStartY] = useState(0);

    const scrollContainerRef = useRef();
    const pullAreaRef = useRef();
    const scrollableRef = useRef();
    const eventRef = useRef();
    let dragging = false;
    let lastScrollTop = 0;

    // 获取滚动的父节点
    const getScrollableTarget = () => {
        const scrollContainerDom = scrollContainerRef.current;
        const scrollableParent = props.scrollableParent;
        if (isDom(scrollableParent)) {
            return scrollableParent;
        } else if (typeof scrollableParent === 'string') {
            return document.querySelector(scrollableParent);
        } else if (height) {
            return scrollContainerDom;
        } else {
            const target = getScrollParent(scrollContainerDom)
            return target;
        }
    };

    useEffect(() => {
        setFinishTrigger(false);
        setIsError(false);
        setLoading(false);
    }, [React.Children.count(children)]);

    useEffect(() => {
        setIsError(props.isError);
    }, [props.isError]);

    useEffect(() => {
        const target = getScrollableTarget();
        scrollableRef.current = target;
        if (target) {
            initDom(target);
        }

        return () => {
            removeEvent();
        };
    }, [props.scrollableParent]);


    // 初始化绑定事件(滚动节点可能是异步也可能是同步)
    const initDom = (scrollableParent) => {
        if (forbidTrigger) return;
        // 滚动父节点绑定事件(文档根节点不能绑定事件)
        const el = scrollableParent === (document.body || document.documentElement) ? (document || window) : scrollableParent;
        eventRef.current = el;

        if (el) {
            const throttledOnScrollListener = throttle(onScrollListener);
            el.addEventListener('scroll', throttledOnScrollListener);
        }

        if (
            typeof initialScrollY === 'number' &&
            el &&
            isDom(el) &&
            el.scrollHeight > initialScrollY
        ) {
            el.scrollTo(0, initialScrollY);
        }

        if (pullDownToRefresh && el) {
            el.addEventListener('touchstart', onStart);
            el.addEventListener('touchmove', onMove);
            el.addEventListener('touchend', onEnd);

            el.addEventListener('mousedown', onStart);
            el.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onEnd);
            // 下拉区域的原始高度
            const pullAreaDom = pullAreaRef.current;
            setPullAreaHeight(pullAreaDom?.firstChild?.getBoundingClientRect()?.height || 0);
        }
    };

    const removeEvent = () => {
        const el = eventRef.current;
        if (el) {
            const throttledOnScrollListener = throttle(onScrollListener);
            el.removeEventListener('scroll', throttledOnScrollListener);

            if (pullDownToRefresh) {
                el.removeEventListener('touchstart', onStart);
                el.removeEventListener('touchmove', onMove);
                el.removeEventListener('touchend', onEnd);

                el.removeEventListener('mousedown', onStart);
                el.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onEnd);
                // 取消raf
                Raf.cancelRaf(resetDrag);
            }
        }
    };

    const onStart = (evt) => {
        if (lastScrollTop > 10) return;
        dragging = true;
        setPreStartY(getPositionInPage(evt).y);
        const scrollContainerDom = scrollContainerRef.current;
        if (scrollContainerDom) {
            scrollContainerDom.style.willChange = 'transform';
            scrollContainerDom.style.transition = `transform 0.2s cubic-bezier(0,0,0.31,1)`;
        }
    };

    const onMove = (evt) => {
        evt.preventDefault();
        if (!dragging) return;

        const startY = getPositionInPage(evt).y;
        if (startY < preStartY) return;
        if (minPullDown > maxPullDown) {
            console.warn(`"minPullDown" is large than "maxPullDown", please set "maxPullDown" and "maxPullDown" should large than "minPullDown"`);
            return;
        }

        if (minPullDown >= pullAreaHeight) {
            console.warn(`"minPullDown" is large than pull area's height, please set "maxPullDown" and "maxPullDown" should large than "minPullDown"`);
            return;
        }

        const minHeight = minPullDown || (pullAreaHeight * 0.8);
        const maxHeight = maxPullDown || (pullAreaHeight);
        if (startY - preStartY > (maxHeight)) return;
        if (startY - preStartY >= minHeight) {
            setShowRelease(true);
        }
        setDrag(startY, preStartY);
    };

    const onEnd = () => {
        if (typeof refreshFunction !== 'function') {
            throw new Error(`"refreshFunction" is not function or missing`);
        }

        if (showRelease) {
            refreshFunction && refreshFunction();
            setShowRelease(false);
        }

        Raf.setRaf(resetDrag);
        setStartY(0);
        setPreStartY(0);
        dragging = false;
    };

    const resetDrag = () => {
        const scrollContainerDom = scrollContainerRef.current;
        if (scrollContainerDom) {
            scrollContainerDom.style.overflow = 'auto';
            scrollContainerDom.style.transform = 'none';
            scrollContainerDom.style.willChange = 'none';
            scrollContainerDom.style.paddingBottom = '0px';
        }
    };

    const setDrag = (startY, preStartY) => {
        const scrollContainerDom = scrollContainerRef.current;
        if (scrollContainerDom) {
            scrollContainerDom.style.overflow = 'visible';
            scrollContainerDom.style.transform = `translate3d(0px, ${startY - preStartY}px, 0px)`;
            scrollContainerDom.style.paddingBottom = `${startY - preStartY}px`;
        }
    };

    // 是否在顶部
    const isElementAtTop = (target, thresholdValue = 0.8) => {
        const clientHeight = getClient(target).y;
        const scrollTop = getScroll(target).y;
        const threshold = parseThreshold(thresholdValue);

        if (threshold.unit === ThresholdUnits.Pixel) {
            return (
                scrollTop <=
                threshold.value + clientHeight - target.scrollHeight + 1 ||
                scrollTop === 0
            );
        }

        return (
            scrollTop <=
            threshold.value / 100 + clientHeight - target.scrollHeight + 1 ||
            scrollTop === 0
        );
    };

    // 是否在底部
    const isElementAtBottom = (target, thresholdValue = 0.8) => {
        const clientHeight = getClient(target).y;
        const scrollTop = getScroll(target).y;
        const threshold = parseThreshold(thresholdValue);

        if (threshold.unit === ThresholdUnits.Pixel) {
            return (
                scrollTop + clientHeight >= target.scrollHeight - threshold.value
            );
        }

        return (
            scrollTop + clientHeight >=
            (threshold.value / 100) * target.scrollHeight
        );
    };

    const onScrollListener = (event) => {

        if (typeof onScroll === 'function') {
            setTimeout(() => onScroll && onScroll(event), 0);
        }
        
        if (finishTrigger || forbidTrigger) return;

        const target = scrollableRef.current;

        const atBottom = inverse
            ? isElementAtTop(target, thresholdValue)
            : isElementAtBottom(target, thresholdValue);

        // 加载数据
        if (atBottom && hasMore) {
            setFinishTrigger(true);
            setLoading(true);
            next && next();
        }

        lastScrollTop = target.scrollTop;
    };

    const hasChildren = !!(
        children &&
        children instanceof Array &&
        children.length
    );

    // 当设置了滚动固定高度, 下拉刷新时阻止元素溢出到外面显示
    const outerDivStyle = pullDownToRefresh && height
        ? { overflow: 'hidden' }
        : {};

    // 当组件滚动的容器在外部（即设置了scrollableParent），则设置overflow: visible, 以免组件内部出现滚动条
    const insideStyle = {
        height: height || 'auto',
        overflow: scrollableRef.current ? 'visible' : "auto",
        WebkitOverflowScrolling: 'touch',
        paddingBottom: "16px",
        ...containerStyle,
    };

    return (
        <div
            style={outerDivStyle}
            className="infinite-scroll-component__outerdiv"
        >
            <div
                className={`infinite-scroll-component ${className || ''}`}
                ref={scrollContainerRef}
                style={insideStyle}
            >
                {pullDownToRefresh && (
                    <div
                        style={{ position: 'relative' }}
                        ref={pullAreaRef}
                    >
                        <div
                            style={{
                                position: 'absolute',
                                left: 0,
                                right: 0,
                                top: `${-1 * pullAreaHeight}px`,
                            }}
                        >
                            {showRelease ? releaseToRefreshContent : pullDownToRefreshContent}
                        </div>
                    </div>
                )}
                {children}
                {(loading || (!loading && !hasChildren)) && hasMore && !isError && loader}
                {isError && errorMsg}
                {!hasMore && !isError && endMessage}
            </div>
        </div>
    );
};

export default InfiniteScroll;
