import React, { useEffect, useState, useRef, ReactNode, CSSProperties } from 'react';
import { throttle } from './utils/common';
import { ThresholdUnits, parseThreshold } from './utils/threshold';
import Raf from "./utils/requestAnimationFrame";
import { setScroll, getScroll, getClientWH, getPositionInPage, getScrollParent } from "./utils/dom";
import { isDom } from "./utils/type";

interface Ilength {
    length: number
}

type fn = () => any;
type EventType = MouseEvent | TouchEvent;

export enum COMPONENT_TYPE {
    PULL = "pullDown",
    RELEASE = "release",
    REFRESHING = "refreshing",
    END = "refreshEnd"
}

export interface Props {
    height?: number; // 设置固定高度滚动
    containerStyle?: CSSProperties; // 组件内部的style样式
    renderItem: (item: any, index: number) => any; // 渲染item
    pullDownToRefresh?: boolean; // 是否下拉刷新
    releaseComponent?: ReactNode; // 释放下拉时的提示组件
    pullDownComponent?: ReactNode; // 下拉时的提示组件
    refreshingComponent?: ReactNode; // 刷新中的提示组件
    refreshEndComponent?: ReactNode; // 刷新结束时的提示组件
    endComponent?: ReactNode; // 数据加载完了展示的组件
    loadingComponent?: ReactNode; // 加载时的展示组件
    hasMore?: boolean; // 控制是否还进行加载
    errorComponent?: ReactNode; // 加载出错时的展示组件
    className?: string; // 
    onScroll?: (e: EventType) => any; // 滚动监听函数
    inverse?: boolean; // 反向滚动加载
    thresholdValue?: number | string; // 阈值,用来控制滚动到什么程度(距离)触发加载
    next: fn; // 加载新数据时函数
    refreshFunction?: fn; // 刷新列表的方法
    minPullDown?: number | undefined; // 下拉刷新时, 最小下拉高度
    maxPullDown?: number | undefined; // 下拉刷新时, 最大下拉高度
    scrollableParent: HTMLElement | Element | null; // 不设置则默认自动搜索滚动父元素， 设置在该父元素内滚动，建议设置以节省性能，设置forbidTrigger可以阻止滚动触发
    isError?: boolean; // 是否加载出错
    forbidTrigger?: boolean; // 禁止滚动加载触发，当页面上有多个滚动列表且滚动父元素相同，则可以通过此api禁止滚动触发加载
    dataSource: any[]; // 数据源
}

export interface ScrollRef {
    scrollTo: (x: number, y: number) => void;
    getScrollRef: () => any;
}

export enum ScrollDirection {
    UP = "up",
    DOWN = "down"
}

// 滚动加载列表组件
const InfiniteScroll = React.forwardRef<ScrollRef, Props>((props, ref) => {

    const {
        height,
        containerStyle,
        renderItem,
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
        minPullDown = 0,
        maxPullDown = 0,
        dataSource = []
    } = props;

    const [pullAreaHeight, setPullAreaHeight] = useState<number>(0);
    const [refreshType, setRefreshType] = useState<string>(COMPONENT_TYPE.PULL);
    const [loading, setLoading] = useState<boolean>(false);
    const [isError, setIsError] = useState<boolean | undefined>(false);
    const [prevScrollHeight, setPrevScrollHeight] = useState<number>(0);
    const [pullDistance, setPullDistance] = useState<number>(0);

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const pullAreaRef = useRef<HTMLDivElement>(null);
    const scrollableRef = useRef<any>();
    const eventRef = useRef<any>();
    const errorRef = useRef<boolean>();
    const loadNumRef = useRef<number>(0);
    const finishTriggerRef = useRef<boolean>();
    const forbidTriggerRef = useRef<boolean>();
    const preStartYRef = useRef<number>(0);

    let mouseDown: boolean = false;
    let mouseDragging: boolean = false;

    // ref转发实例方法
    React.useImperativeHandle(ref, () => ({
        scrollTo: (x: number, y: number) => {
            setScroll(scrollableRef.current, x || 0, y || 0);
        },
        getScrollRef: () => (scrollableRef)
    }));

    // 获取滚动的父节点
    const getScrollableTarget = (): any => {
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
        }

        // 加载下一个列表时重置状态
        if (dataSource?.length) {
            if (loadNumRef.current > 0) {
                resetStatus(target);
            }

            loadNumRef.current = loadNumRef.current + 1;
        }

        // 更新高度
        setPrevScrollHeight(target.scrollHeight);
        return () => {
            removeEvent();
        };
    }, [dataSource]);

    // 加载到新数据后重置状态
    const resetStatus = (target: any) => {
        // 反向加载的时候需要重置滚动高度
        if (inverse && loading && isElementAtTop(target, thresholdValue)) {
            setScroll(target, 0, (prevScrollHeight && target.scrollHeight - prevScrollHeight) ? target.scrollHeight - prevScrollHeight : 50);
        }
        // 结束触发
        finishTriggerRef.current = false;
        // 结束loading
        setLoading(false);
        // 结束error状态
        errorChange(false);
    };

    // error状态change
    const errorChange = (value: boolean = false) => {
        errorRef.current = value;
        setIsError(value);
    };

    // 实时监听状态isError
    useEffect(() => {
        errorChange(props.isError);
    }, [props.isError]);

    // 实时监听状态forbidTrigger
    useEffect(() => {
        forbidTriggerRef.current = props.forbidTrigger;
    }, [props.forbidTrigger]);

    // 滚动监听事件中无法获取到最新的state所以需要ref
    const onScrollListener = (event: EventType) => {
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
    const initDom = (scrollableParent: HTMLElement) => {
        if (forbidTriggerRef.current) return;
        // 滚动父节点绑定事件(文档根节点不能绑定事件)
        const el: any = scrollableParent === (document.body || document.documentElement) ? (document || window) : scrollableParent;
        eventRef.current = el;

        if (el) {
            const throttledOnScrollListener = throttle(onScrollListener);
            el.addEventListener('scroll', throttledOnScrollListener);
        }

        if (pullDownToRefresh && el) {
            el.addEventListener('touchstart', onStart);
            el.addEventListener('touchmove', onMove);
            el.addEventListener('touchend', onEnd);

            el.addEventListener('mousedown', onStart);
            el.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onEnd);
            // 下拉区域的原始高度
            const pullAreaDom: any = pullAreaRef.current;
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

    const onStart = (evt: EventType) => {
        evt.preventDefault();
        setPullDistance(0);
        const condition = inverse ? !isElementAtBottom(scrollableRef.current, thresholdValue) : !isElementAtTop(scrollableRef.current, thresholdValue);
        if (condition) return;
        mouseDown = true;
        preStartYRef.current = getPositionInPage(evt)?.y || 0;
        const scrollContainerDom = scrollContainerRef.current;
        if (scrollContainerDom) {
            scrollContainerDom.style.willChange = 'transform';
            scrollContainerDom.style.transition = `transform 0.2s cubic-bezier(0,0,0.31,1)`;
        }
    };

    const onMove = (evt: EventType) => {
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

        const startY = getPositionInPage(evt)?.y || 0;
        const deltaY = startY - preStartYRef.current;
        setPullDistance(Math.min(Math.abs(deltaY), maxHeight));

        // 最小判断边界
        if (Math.abs(deltaY) >= minHeight) {
            setRefreshType(COMPONENT_TYPE.RELEASE);
        } else {
            setRefreshType(COMPONENT_TYPE.PULL);
        }

        // 执行偏移
        if (inverse) {
            Raf.setRaf(() => setDrag(Math.max(deltaY, -maxHeight)));
            // 当设置了height，此时上拉刷新需要将加载显示组件显示出来
            const scrollY = getScroll(scrollableRef.current)?.y || 0;
            height && setScroll(scrollableRef.current, 0, scrollY - Math.max(deltaY, -maxHeight));
        } else {
            Raf.setRaf(() => setDrag(Math.min(deltaY, maxHeight)));
        }
        mouseDragging = true;
    };

    const onEnd = (evt: EventType) => {
        if (typeof refreshFunction !== 'function') {
            throw new Error(`"refreshFunction" is not function or missing`);
        }

        mouseDown = false;
        setRefreshType(COMPONENT_TYPE.REFRESHING);
        setTimeout(() => {
            if (mouseDragging) {
                refreshFunction && refreshFunction();
                mouseDragging = false;
                setRefreshType(COMPONENT_TYPE.END);
                Raf.setRaf(resetDrag);
                preStartYRef.current = 0;
                setPullDistance(0);
            }
        }, 1000);
    };

    const resetDrag = () => {
        const scrollContainerDom = scrollContainerRef.current;
        if (scrollContainerDom) {
            scrollContainerDom.style.transform = 'none';
            scrollContainerDom.style.willChange = 'none';
        }
    };

    const setDrag = (move: number) => {
        const scrollContainerDom = scrollContainerRef.current;
        if (scrollContainerDom) {
            scrollContainerDom.style.transition = `transform 0.3s`;
            scrollContainerDom.style.transform = `translate3d(0px, ${move}px, 0px)`;
        }
    };

    // 是否在顶部
    const isElementAtTop = (target: HTMLElement, thresholdValue: number | string = 0.8) => {
        const scrollTop = getScroll(target)?.y || 0;
        const threshold = parseThreshold(thresholdValue);

        if (threshold.unit === ThresholdUnits.Pixel) {
            return (
                scrollTop <= threshold.value
            );
        }

        return scrollTop <= 20;
    };

    // 是否在底部
    const isElementAtBottom = (target: HTMLElement, thresholdValue: number | string = 0.8) => {
        const clientHeight = getClientWH(target)?.height || 0;
        const scrollTop = getScroll(target)?.y || 0;
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
        dataSource &&
        dataSource instanceof Array &&
        dataSource.length
    );

    // 当设置了滚动固定高度, 下拉/上拉刷新时阻止元素溢出到外面显示
    const outerDivStyle: CSSProperties = pullDownToRefresh && height
        ? { overflow: 'hidden' }
        : {};

    // 当组件滚动的容器在外部（即设置了scrollableParent），则设置overflow: hidden, 以免组件内部出现滚动条
    const insideStyle: CSSProperties = {
        height: height || 'auto',
        overflow: props.height ? 'auto' : "hidden",
        WebkitOverflowScrolling: 'touch',
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
    const refreshProps: any = {
        [COMPONENT_TYPE.PULL]: pullDownComponent,
        [COMPONENT_TYPE.RELEASE]: releaseComponent,
        [COMPONENT_TYPE.REFRESHING]: refreshingComponent,
        [COMPONENT_TYPE.END]: refreshEndComponent
    };
    const refreshComponent =
        pullDownToRefresh && (
            <div
                style={{ height: `${pullDistance}px`, overflow: "hidden" }}
                ref={pullAreaRef}
            >
                <span>
                    {refreshProps[refreshType]}
                </span>
            </div>
        );

    const renderChildren = (dataSource: any[] = []): any[] => {
        return dataSource?.map((item: any, index: number) => (renderItem(item, index)));
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
                {!inverse && refreshComponent}
                {inverse && loadingMoreComponent}
                {renderChildren(dataSource)}
                {!inverse && loadingMoreComponent}
                {inverse && refreshComponent}
            </div>
        </div>
    );
});

export default InfiniteScroll;

