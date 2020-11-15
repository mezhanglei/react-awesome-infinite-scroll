import React, { Component } from 'react';
import { ThresholdUnits, parseThreshold } from './utils/threshold';
import Raf from "./utils/requestAnimationFrame";
import { isDom, getScroll, getClient, getPositionInPage } from "./utils/dom";

/**
 * 滚动加载列表组件:
 * next: function 加载新数据时函数
 * hasMore: boolean 控制是否还进行加载
 * loader: ReactNode 加载时的展示组件
 * height: number 设置固定高度滚动
 * pullDownToRefresh: boolean 是否下拉刷新
 * pullDownToRefreshContent: ReactNode 下拉时的展示组件
 * releaseToRefreshContent: ReactNode 释放下拉时展示组件
 * refreshFunction: function 刷新列表的方法
 * endMessage: ReactNode 数据加载完了展示的组件
 * initialScrollY: number 列表初始化加载时滚动到的位置
 * scrollableTarget: HtmlElement 在该父元素内滚动
 * minPullDown, maxPullDown: 下拉刷新时, 设置最小下拉高度和最大下拉高度
 * onScroll: function (e) {} 滚动监听函数
 * inverse: boolean 反向滚动加载
 * thresholdValue: string | number 阈值,用来控制滚动到什么程度(距离)触发加载
 */
export default class InfiniteScroll extends Component {
    static defaultProps = {
    }
    constructor(props) {
        super(props);

        this.state = {
            loadingEnd: false,
            showRelease: false,
            _self: this
        };
        this.pullAreaHeight = 0;
        this.throttledOnScrollListener = this.onScrollListener;
        this.onStart = this.onStart.bind(this);
        this.onMove = this.onMove.bind(this);
        this.onEnd = this.onEnd.bind(this);
    }

    lastScrollTop = 0;
    finishTrigger = false;
    dragging = false;

    componentDidMount() {
        const {
            initialScrollY,
            pullDownToRefresh
        } = this.props;
        // 滚动根节点(文档根节点不能绑定事件)
        this.el = this.getScrollableTarget() === (document.body || document.documentElement) ? (document || window) : this.getScrollableTarget();

        if (this.el) {
            this.el.addEventListener('scroll', this
                .throttledOnScrollListener);
        }

        if (
            typeof initialScrollY === 'number' &&
            this.el &&
            isDom(this.el) &&
            this.el.scrollHeight > initialScrollY
        ) {
            this.el.scrollTo(0, initialScrollY);
        }

        if (pullDownToRefresh && this.el) {
            this.el.addEventListener('touchstart', this.onStart, { passive: false });
            this.el.addEventListener('touchmove', this.onMove, { passive: false });
            this.el.addEventListener('touchend', this.onEnd, { passive: false });

            this.el.addEventListener('mousedown', this.onStart, { passive: false });
            this.el.addEventListener('mousemove', this.onMove, { passive: false });
            this.el.addEventListener('mouseup', this.onEnd, { passive: false });
            // 下拉区域的原始高度
            this.pullAreaHeight = this.pullArea?.firstChild?.getBoundingClientRect()?.height || 0;
        }
    }

    componentWillUnmount() {
        const { pullDownToRefresh } = this.props;
        if (this.el) {
            this.el.removeEventListener('scroll', this
                .throttledOnScrollListener, { passive: false });

            if (pullDownToRefresh) {
                this.el.removeEventListener('touchstart', this.onStart, { passive: false });
                this.el.removeEventListener('touchmove', this.onMove, { passive: false });
                this.el.removeEventListener('touchend', this.onEnd, { passive: false });

                this.el.removeEventListener('mousedown', this.onStart, { passive: false });
                this.el.removeEventListener('mousemove', this.onMove, { passive: false });
                this.el.removeEventListener('mouseup', this.onEnd, { passive: false });
                // 取消raf
                Raf.cancelRaf(this.resetDrag);
            }
        }
    }

    static getDerivedStateFromProps(nextProps, preState) {
        const { preProps, _self } = preState;

        if (preProps) {
            if (React.Children.count(preProps.children) != React.Children.count(nextProps.children)) {
                _self.finishTrigger = false;
                return {
                    loadingEnd: false,
                    preProps: nextProps
                };
            }
        }
        return { loadingEnd: false, preProps: nextProps };
    }

    // 获取滚动的根节点
    getScrollableTarget = () => {
        const { height, scrollableTarget } = this.props;
        if (isDom(scrollableTarget) && height) {
            return scrollableTarget;
        } else if (typeof scrollableTarget === 'string') {
            return document.querySelector(scrollableTarget);
        } else if (height) {
            return this.scrollContainer;
        }
        return document.body || document.documentElement;
    };

    onStart = (evt) => {
        if (this.lastScrollTop) return;

        this.dragging = true;

        this.setState({
            preStartY: getPositionInPage(evt).y
        });

        if (this.scrollContainer) {
            this.scrollContainer.style.willChange = 'transform';
            this.scrollContainer.style.transition = `transform 0.2s cubic-bezier(0,0,0.31,1)`;
        }
    };

    onMove = (evt) => {
        if (!this.dragging) return;

        const startY = getPositionInPage(evt).y;
        const { preStartY } = this.state;
        let { minPullDown, maxPullDown } = this.props;

        if (startY < preStartY) return;
        if (minPullDown >= maxPullDown || minPullDown >= this.pullAreaHeight) {
            console.warn(`"minPullDown" is large than pull-down area's height or "maxPullDown", please set "maxPullDown" and "maxPullDown" should large than "minPullDown"`);
            if (minPullDown >= maxPullDown) minPullDown = 0;
        }

        if (startY - preStartY >= (minPullDown ?? this.pullAreaHeight)) {
            this.setState({
                showRelease: true
            });
        }

        if (startY - preStartY > (maxPullDown ?? this.pullAreaHeight)) return;
        this.setDrag(startY, preStartY);
    };

    onEnd = () => {
        const {
            refreshFunction
        } = this.props;
        if (typeof refreshFunction !== 'function') {
            throw new Error(`"refreshFunction" is not function or missing`);
        }

        if (this.state.showRelease) {
            refreshFunction && refreshFunction();
            this.setState({
                showRelease: false,
            });
        }

        Raf.setRaf(this.resetDrag);
        this.setState({
            startY: 0,
            preStartY: 0
        });
        this.dragging = false;
    };

    // 重置样式
    resetDrag = () => {
        if (this.scrollContainer) {
            this.scrollContainer.style.overflow = 'auto';
            this.scrollContainer.style.transform = 'none';
            this.scrollContainer.style.willChange = 'none';
            this.scrollContainer.style.paddingBottom = '0px';
        }
    }

    setDrag = (startY, preStartY) => {
        if (this.scrollContainer) {
            this.scrollContainer.style.overflow = 'visible';
            this.scrollContainer.style.transform = `translate3d(0px, ${startY - preStartY}px, 0px)`;
            this.scrollContainer.style.paddingBottom = `${startY - preStartY}px`;
        }
    }

    isElementAtTop(target, thresholdValue = 0.8) {
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
    }

    isElementAtBottom(target, thresholdValue = 0.6) {
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
    }

    onScrollListener = (event) => {
        const {
            onScroll,
            inverse,
            thresholdValue,
            hasMore,
            next
        } = this.props;

        if (typeof onScroll === 'function') {
            setTimeout(() => onScroll && onScroll(event), 0);
        }

        if (this.finishTrigger) return;

        const target = this.getScrollableTarget();

        const atBottom = inverse
            ? this.isElementAtTop(target, thresholdValue)
            : this.isElementAtBottom(target, thresholdValue);

        // 加载数据
        if (atBottom && hasMore) {
            this.finishTrigger = true;
            this.setState({ loadingEnd: true });
            next && next();
        }

        this.lastScrollTop = target.scrollTop;
    };



    render() {
        const {
            height,
            style,
            children,
            pullDownToRefresh,
            releaseToRefreshContent,
            pullDownToRefreshContent,
            endMessage,
            loader,
            hasMore,
            className
        } = this.props;
        const containerStyle = {
            height: height || 'auto',
            overflow: 'auto',
            WebkitOverflowScrolling: 'touch',
            ...style,
        };

        const hasChildren = !!(
            children &&
            children instanceof Array &&
            children.length
        );

        // 当设置了固定高度, 下拉刷新时阻止元素溢出到外面显示
        const outerDivStyle = pullDownToRefresh && height
            ? { overflow: 'hidden' }
            : {};

        return (
            <div
                style={outerDivStyle}
                className="infinite-scroll-component__outerdiv"
            >
                <div
                    className={`infinite-scroll-component ${className || ''}`}
                    ref={(node) => (this.scrollContainer = node)}
                    style={containerStyle}
                >
                    {pullDownToRefresh && (
                        <div
                            style={{ position: 'relative' }}
                            ref={(node) => (this.pullArea = node)}
                        >
                            <div
                                style={{
                                    position: 'absolute',
                                    left: 0,
                                    right: 0,
                                    top: -1 * this.pullAreaHeight
                                }}
                            >
                                {this.state.showRelease
                                    ? releaseToRefreshContent
                                    : pullDownToRefreshContent}
                            </div>
                        </div>
                    )}
                    {children}
                    {(this.state.loadingEnd || (!this.state.loadingEnd && !hasChildren)) && hasMore && loader}
                    {!hasMore && endMessage}
                </div>
            </div>
        );
    }
}
