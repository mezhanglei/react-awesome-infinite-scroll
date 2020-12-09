import React, { Component, useEffect, useState, useRef, useMemo } from 'react';
import { throttle } from './utils/common';
import { ThresholdUnits, parseThreshold } from './utils/threshold';
import Raf from "./utils/requestAnimationFrame";
import { getScroll, getClient, getPositionInPage, getScrollParent } from "./utils/dom";
import { isDom } from "./utils/type";

/**
 * 滚动加载列表组件:
 * 属性：
 * next: function 加载新数据时函数
 * hasMore: boolean 控制是否还进行加载
 * loadingComponent: ReactNode 加载时的展示组件
 * isError: boolean 是否加载出错
 * errorComponent: ReactNode 加载出错时的展示组件
 * height: number 设置固定高度滚动
 * pullDownToRefresh: boolean 是否下拉刷新
 * releaseComponent: ReactNode 释放下拉时的提示组件
 * pullDownComponent: ReactNode 下拉时的提示组件
 * refreshingComponent: ReactNode 刷新中的提示组件
 * refreshEndComponent: ReactNode 刷新结束时的提示组件
 * refreshFunction: function 刷新列表的方法
 * endComponent: ReactNode 数据加载完了展示的组件
 * initialScrollY: number 列表初始化加载时滚动到的位置
 * scrollableParent: HtmlElement 不设置则默认自动搜索滚动父元素， 设置在该父元素内滚动，建议设置以节省性能，设置forbidTrigger可以阻止滚动触发
 * forbidTrigger: boolean 禁止滚动加载触发，当页面上有多个滚动列表且滚动父元素相同，则可以通过此api禁止滚动触发加载
 * minPullDown, maxPullDown: 下拉刷新时, 设置最小下拉高度和最大下拉高度
 * onScroll: function (e) {} 滚动监听函数
 * inverse: boolean 反向滚动加载
 * thresholdValue: string | number 阈值,用来控制滚动到什么程度(距离)触发加载
 * containerStyle: object 组件内部的style样式
 * 实例方法：
 * scrollTo：function(x, y) {} 如果有滚动节点则可以设置滚动到目标位置，x，y代表横轴和竖轴的滚动距离
 */

const InfiniteScroll = React.forwardRef((props, ref) => {

    const {
        height,
        containerStyle,
        children,
        pullDownToRefresh,
        releaseComponent,
        pullDownComponent,
        refreshingComponent,
        refreshEndComponent,
        endComponent,
        loadingComponent,
        hasMore,
        errorComponent,
        className,
        onScroll,
        inverse,
        thresholdValue,
        next,
        refreshFunction,
        minPullDown,
        maxPullDown,
        initialScrollY
    } = props;

    const [pullAreaHeight, setPullAreaHeight] = useState(0);
    const [refreshType, setRefreshType] = useState("pullDown");
    const [loading, setLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [prevScrollHeight, setPrevScrollHeight] = useState(0);

    const scrollContainerRef = useRef();
    const pullAreaRef = useRef();
    const scrollableRef = useRef();
    const eventRef = useRef();
    const errorRef = useRef();
    const loadNumRef = useRef(0);
    const finishTriggerRef = useRef();
    const forbidTriggerRef = useRef();
    const preStartYRef = useRef(0);
    let mouseDown = false;
    let mouseDragging = false;

    // ref转发实例方法
    React.useImperativeHandle(ref, () => ({
        scrollTo: (x, y) => {
            getScrollableTarget().scrollTop = y || 0;
            getScrollableTarget().scrollLeft = x || 0;
        }
    }));

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
            const target = getScrollParent(scrollContainerDom);
            return target;
        }
    };

    // 当列表加载完成时, 再监听事件并重置一些状态
    useEffect(() => {
        // 绑定事件
        const target = getScrollableTarget();
        scrollableRef.current = target;
        if (target) {
            initDom(target);
            // 节点设置警告
            if (props.scrollableParent && props.height) {
                console.error(`"scrollableParent" and "height" only need one`);
            }

            // 设置警告
            if (props.height && props.containerStyle?.overflow == "hidden") {
                console.error(`the "containerStyle" can't be "hidden", because "height" is setted`);
            };
        }

        // 加载下一个列表时重置状态
        if (React.Children.count(children)) {
            if (loadNumRef.current > 0) {
                // 反向加载的时候需要重置滚动高度
                if (inverse && loading) {
                    target.scrollTop = prevScrollHeight ? target.scrollHeight - prevScrollHeight : 0;
                }
                finishTriggerRef.current = false;
                setLoading(false);
                errorRef.current = false;
                setIsError(false);
            }
            loadNumRef.current = loadNumRef.current + 1;
        }
        setPrevScrollHeight(target.scrollHeight);
        return () => {
            removeEvent();
        };
    }, [React.Children.count(children)]);

    // 实时监听状态isError
    useEffect(() => {
        // 实时监听
        errorRef.current = props.isError;
        // 更新视图
        setIsError(props.isError);
    }, [props.isError]);

    // 实时监听状态forbidTrigger
    useEffect(() => {
        forbidTriggerRef.current = props.forbidTrigger;
    }, [props.forbidTrigger]);


    // 滚动监听事件中无法获取到最新的state所以需要ref
    const onScrollListener = (event) => {
        if (typeof onScroll === 'function') {
            setTimeout(() => onScroll && onScroll(event), 0);
        }

        if (finishTriggerRef.current || forbidTriggerRef.current || errorRef.current) return;

        const target = scrollableRef.current;

        const atBottom = inverse
            ? isElementAtTop(target, thresholdValue)
            : isElementAtBottom(target, thresholdValue);

        // 加载数据
        if (atBottom && hasMore) {
            finishTriggerRef.current = true;
            setLoading(true);
            next && next();
        }
    };

    // 初始化绑定事件(滚动节点可能是异步也可能是同步)
    const initDom = (scrollableParent) => {
        if (forbidTriggerRef.current) return;
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
        evt.preventDefault();
        const condition = inverse ? !isElementAtBottom(scrollableRef.current, thresholdValue) : !isElementAtTop(scrollableRef.current, thresholdValue)
        if (condition) return;
        mouseDown = true;
        preStartYRef.current = getPositionInPage(evt).y;
        const scrollContainerDom = scrollContainerRef.current;
        if (scrollContainerDom) {
            scrollContainerDom.style.willChange = 'transform';
            scrollContainerDom.style.transition = `transform 0.2s cubic-bezier(0,0,0.31,1)`;
        }
    };

    const onMove = (evt) => {
        evt.preventDefault();
        if (!mouseDown) return;
        if (minPullDown > maxPullDown) {
            console.warn(`"minPullDown" is large than "maxPullDown", please set "maxPullDown" and "maxPullDown" should large than "minPullDown"`);
            return;
        }

        if (minPullDown >= pullAreaHeight) {
            console.warn(`"minPullDown" is large than pull area's height, please set "maxPullDown" and "maxPullDown" should large than "minPullDown"`);
            return;
        }

        const minHeight = minPullDown || (pullAreaHeight * 0.6);
        const maxHeight = maxPullDown || (pullAreaHeight);

        const startY = getPositionInPage(evt).y;
        const deltaY = startY - preStartYRef.current;
        // 最小判断边界
        if (deltaY >= minHeight) {
            setRefreshType("release");
        } else {
            setRefreshType("pullDown");
        }

        // 执行偏移
        if (inverse) {
            Raf.setRaf(() => setDrag(Math.max(deltaY, -maxHeight)));
        } else {
            Raf.setRaf(() => setDrag(Math.min(deltaY, maxHeight)));
        }
        mouseDragging = true;
    };

    const onEnd = (evt) => {
        if (typeof refreshFunction !== 'function') {
            throw new Error(`"refreshFunction" is not function or missing`);
        }

        mouseDown = false;
        setRefreshType("refreshing")
        setTimeout(() => {
            if (mouseDragging) {
                refreshFunction && refreshFunction();
                mouseDragging = false;
                setRefreshType("refreshEnd");
                Raf.setRaf(resetDrag);
                preStartYRef.current = 0;
            }
        }, 1000);
    };

    const resetDrag = () => {
        const scrollContainerDom = scrollContainerRef.current;
        if (scrollContainerDom) {
            scrollContainerDom.style.overflow = 'auto';
            scrollContainerDom.style.transform = 'none';
            scrollContainerDom.style.willChange = 'none';
        }
    };

    const setDrag = (move) => {
        const scrollContainerDom = scrollContainerRef.current;
        if (scrollContainerDom) {
            scrollContainerDom.style.overflow = 'auto';
            scrollContainerDom.style.transition = `transform 0.3s`;
            scrollContainerDom.style.transform = `translate3d(0px, ${move}px, 0px)`;
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

    const hasChildren = !!(
        children &&
        children instanceof Array &&
        children.length
    );

    // 当设置了滚动固定高度, 下拉/上拉刷新时阻止元素溢出到外面显示
    const outerDivStyle = pullDownToRefresh && height
        ? { overflow: 'hidden' }
        : {};

    // 当组件滚动的容器在外部（即设置了scrollableParent），则设置overflow: hidden, 以免组件内部出现滚动条
    const insideStyle = {
        height: height || 'auto',
        overflow: props.height ? 'auto' : "hidden",
        WebkitOverflowScrolling: 'touch',
        [inverse ? "marginBottom" : "marginTop"]: `${-1 * pullAreaHeight}px`,
        ...containerStyle,
    };

    // 加载更多相关组件
    const loadingMoreComponent = (
        <>
            {(loading || (!loading && !hasChildren)) && hasMore && !isError && loadingComponent}
            {isError && errorComponent}
            {!hasMore && !isError && endComponent}
        </>
    );

    // 下拉刷新的相关组件
    const refreshProps = {
        "pullDown": pullDownComponent,
        "release": releaseComponent,
        "refreshing": refreshingComponent,
        "refreshEnd": refreshEndComponent
    }
    const refreshComponent =
        pullDownToRefresh && (
            <div
                style={{ position: 'relative', height: `${pullAreaHeight}px` }}
                ref={pullAreaRef}
            >
                <div
                    style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        top: 0
                    }}
                >
                    {refreshProps[refreshType]}
                </div>
            </div>
        )

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
                {!inverse && refreshComponent}
                {inverse && loadingMoreComponent}
                {children}
                {!inverse && loadingMoreComponent}
                {inverse && refreshComponent}
            </div>
        </div>
    );
});

export default InfiniteScroll;
