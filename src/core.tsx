import React, { ReactNode, CSSProperties } from 'react';
import { ThresholdUnits, parseThreshold } from './utils/threshold';
import Raf from "./utils/requestAnimationFrame";
import { setScroll, getScroll, getOffsetWH, getEventPosition, getScrollParent, addEvent, removeEvent } from "./utils/dom";
import { isDom } from "./utils/type";
import { isMobile } from './utils/verify';

type fn = () => any;
type EventType = MouseEvent | TouchEvent;

export type COMPONENT_TYPE = "pullDown" | "release" | "refreshing" | "refreshEnd";

export interface ListProps {
  height?: number; // 设置固定高度滚动
  containerStyle?: CSSProperties; // 组件内部的style样式
  pullDownToRefresh?: boolean; // 是否下拉刷新
  releaseComponent?: ReactNode; // 释放下拉时的提示组件
  pullDownComponent?: ReactNode; // 下拉时的提示组件
  refreshingComponent?: ReactNode; // 刷新中的提示组件
  refreshEndComponent?: ReactNode; // 刷新结束时的提示组件
  endComponent?: ReactNode; // 数据加载完了展示的组件
  loadingComponent?: ReactNode; // 加载时的展示组件
  hasMore?: boolean; // 控制是否还进行加载
  isRefreshing?: boolean; // 控制是否是刷新状态
  className?: string; // 
  onScroll?: (e: EventType) => any; // 滚动监听函数
  inverse?: boolean; // 反向滚动加载
  thresholdValue?: number | string; // 阈值,用来控制滚动到什么程度(距离)触发加载
  next: fn; // 加载新数据时函数
  refreshFunction?: fn; // 刷新列表的方法
  minPullDown: number; // 下拉刷新时, 最小下拉高度
  maxPullDown: number; // 下拉刷新时, 最大下拉高度
  scrollableParent?: HTMLElement | Element | null; // 不设置则默认自动搜索滚动父元素， 设置在该父元素内滚动，建议设置以节省性能，设置forbidTrigger可以阻止滚动触发
  forbidTrigger?: boolean; // 禁止滚动加载触发，当页面上有多个滚动列表且滚动父元素相同，则可以通过此api禁止滚动触发加载
  children: any;
  length: number;
};

export interface ListState {
  refreshType: COMPONENT_TYPE, // 刷新类型
  loading: boolean, // 是否正在加载中
  scrollHeight: number, // 滚动内容的高度
  pullDistance: number, // 下拉距离
  prevLength?: number // 上一个列表的长度
}
export interface ScrollRef {
  scrollTo: (x: number, y: number) => void;
  getScrollRef: () => any;
}
// Simple abstraction for dragging events names.
const eventsFor = {
  touch: {
    start: 'touchstart',
    move: 'touchmove',
    stop: 'touchend'
  },
  mouse: {
    start: 'mousedown',
    move: 'mousemove',
    stop: 'mouseup'
  }
};
// 根据当前设备看是否触发
let dragEventFor = isMobile() ? eventsFor.touch : eventsFor.mouse;
export default class InfiniteScroll extends React.Component<ListProps, ListState> {
  scrollWrap: HTMLDivElement | null;
  childrenWrap: HTMLDivElement | null;
  event: any;
  scrollRoot?: HTMLElement;
  dragging: boolean;
  startY: number;
  constructor(props: ListProps) {
    super(props);
    this.dragging = false;
    this.startY = 0;
    this.scrollWrap = null;
    this.childrenWrap = null;
    this.state = {
      refreshType: "pullDown",
      loading: false,
      scrollHeight: 0,
      pullDistance: 0
    };
  }
  static defaultProps = {
    minPullDown: 10,
    maxPullDown: 50
  }

  componentWillUnmount() {
    this.removeEvents()
  }

  public setScroll = (x: number, y: number) => {
    if (!this.scrollRoot) return;
    setScroll(this.scrollRoot, x, y);
  }

  addEvents = () => {
    const target = this.getScrollableTarget();
    // 绑定事件
    const {
      scrollableParent,
      height,
      inverse
    } = this.props;
    this.scrollRoot = target;
    const scrollHeight = target?.scrollHeight;
    if (target) {
      this.initDom(target);
      // 节点设置警告
      if (scrollableParent && height) {
        console.error(`"scrollableParent" and "height" only need one`);
      }
    }
    // 如果设置反向加载则初始化时滚到底部
    if (inverse && scrollHeight) {
      this.setScroll(0, scrollHeight);
    }
  }

  removeEvents = () => {
    const {
      pullDownToRefresh
    } = this.props;
    const event = this.event;
    if (event) {
      removeEvent(event, 'scroll', this.onScrollListener);
      if (pullDownToRefresh) {
        removeEvent(event, dragEventFor.start, this.onStart);
        removeEvent(event, dragEventFor.move, this.onMove);
        removeEvent(document, dragEventFor.stop, this.onEnd);
        // 取消raf
        Raf.cancelRaf(this.resetDrag);
      }
    }
  };
  // 获取滚动的父节点
  getScrollableTarget = (): any => {
    const scrollContainerDom = this.scrollWrap;
    const scrollableParent = this.props.scrollableParent;
    if (isDom(scrollableParent)) {
      return scrollableParent;
    } else if (typeof scrollableParent === 'string') {
      return document.querySelector(scrollableParent);
    } else if (this.props.height) {
      return scrollContainerDom;
    } else {
      const target = getScrollParent(scrollContainerDom);
      return target;
    }
  };
  // 初始化绑定事件(滚动节点可能是异步也可能是同步)
  initDom = (scrollableParent: HTMLElement) => {
    const {
      pullDownToRefresh,
      forbidTrigger
    } = this.props;
    if (forbidTrigger) return;
    // 滚动父节点绑定事件(文档根节点不能绑定事件)
    const el: any = [document.documentElement, document.body].includes(scrollableParent) ? (document || window) : scrollableParent;
    this.event = el;
    if (el) {
      addEvent(el, 'scroll', this.onScrollListener);
    }
    if (pullDownToRefresh && el) {
      addEvent(document, dragEventFor.start, this.onStart);
      addEvent(document, dragEventFor.move, this.onMove);
      addEvent(document, dragEventFor.stop, this.onEnd);
    }
  };
  componentDidUpdate(prevProps: ListProps, prevState: ListState) {
    // 长度没有变化
    const lengthNoChange = this.props.length === prevProps.length;
    // 刷新状态是否变化
    const refreshingChange = this.props?.isRefreshing !== prevProps?.isRefreshing;
    if (refreshingChange) {
      if (!this.props?.isRefreshing) {
        this.setState({
          refreshType: "refreshEnd"
        })
      }
    }
    if (lengthNoChange) return;
    // 滚动节点出现后再重新监听事件
    const newScrollRoot = this.getScrollableTarget();
    if (newScrollRoot !== this.scrollRoot) {
      removeEvent(this.event, 'scroll', this.onScrollListener);
      this.addEvents();
    }
    this.updateList();
  }

  static getDerivedStateFromProps(nextProps: ListProps, prevState: ListState) {
    const dataLengthChanged = nextProps.length !== prevState.prevLength;
    if (dataLengthChanged) {
      return {
        ...prevState,
        prevLength: nextProps.length,
      };
    }
    return null;
  }

  // 更新列表
  updateList = () => {
    // 加载下一个列表时重置状态
    const target = this.scrollRoot;
    if (!target) return;
    const {
      inverse,
      thresholdValue
    } = this.props;
    const {
      loading,
      scrollHeight,
    } = this.state;
    // 反向加载的时候需要重置滚动高度
    if (inverse && loading && this.isElementAtTop(target, thresholdValue)) {
      setScroll(target, 0, (scrollHeight && target.scrollHeight - scrollHeight) ? target.scrollHeight - scrollHeight : 50);
    }
    this.setState({
      loading: false,
      scrollHeight: target.scrollHeight
    });
  };
  // 监听滚动事件
  onScrollListener = (event: EventType) => {
    const { onScroll, inverse, thresholdValue, hasMore, next, forbidTrigger } = this.props;
    const {
      loading
    } = this.state;
    if (typeof onScroll === 'function') {
      setTimeout(() => onScroll && onScroll(event), 0);
    }
    if (loading || forbidTrigger) return;
    const target = this.scrollRoot;
    if (!target) return;
    const atBottom = inverse
      ? this.isElementAtTop(target, thresholdValue)
      : this.isElementAtBottom(target, thresholdValue);
    // 加载数据
    if (atBottom && hasMore) {
      this.setState({
        loading: true
      })
      next && next();
    }
  };
  // 是否在顶部
  isElementAtTop = (target: HTMLElement, thresholdValue: number | string = 0.8) => {
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
  isElementAtBottom = (target: HTMLElement, thresholdValue: number | string = 0.8) => {
    const clientHeight = getOffsetWH(target)?.height || 0;
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
  onStart = (evt: EventType) => {
    const {
      inverse,
      thresholdValue
    } = this.props;
    if (!this.scrollRoot) return;
    const condition = inverse ? !this.isElementAtBottom(this.scrollRoot, thresholdValue) : !this.isElementAtTop(this.scrollRoot, thresholdValue);
    if (condition) return;
    this.dragging = true;
    this.startY = getEventPosition(evt)?.y || 0;
    const scrollContainerDom = this.scrollWrap;
    if (scrollContainerDom) {
      scrollContainerDom.style.willChange = 'transform';
      scrollContainerDom.style.transition = `transform 0.2s cubic-bezier(0,0,0.31,1)`;
    }
  };
  onMove = (evt: EventType) => {
    if (!this.dragging) return;
    const {
      minPullDown,
      maxPullDown,
      inverse
    } = this.props;
    if (minPullDown > maxPullDown) {
      console.warn(`"minPullDown" is large than "maxPullDown", please set "maxPullDown" and "maxPullDown" should large than "minPullDown"`);
      return;
    }
    const minHeight = minPullDown;
    const maxHeight = maxPullDown;
    const eventY = getEventPosition(evt)?.y || 0;
    const deltaY = eventY - this.startY;
    if (inverse) {
      if (deltaY < 0) {
        const num = Math.max(deltaY, -maxHeight);
        this.setState({
          pullDistance: num
        })
        Raf.setRaf(() => this.setDrag(num));
      }
    } else {
      if (deltaY > 0) {
        const num = Math.min(deltaY, maxHeight)
        this.setState({
          pullDistance: num
        })
        Raf.setRaf(() => this.setDrag(num));
      }
    }
    // 最小判断边界
    if (Math.abs(deltaY) >= minHeight) {
      this.setState({
        refreshType: "release"
      })
    } else {
      this.setState({
        refreshType: "pullDown"
      })
    }
  };
  onEnd = (evt: EventType) => {
    const {
      refreshFunction,
    } = this.props;
    const {
      pullDistance
    } = this.state;
    if (typeof refreshFunction !== 'function') {
      throw new Error(`"refreshFunction" is not function or missing`);
    }
    this.dragging = false;
    if (Math.abs(pullDistance) > 0) {
      this.setState({
        refreshType: "refreshing"
      })
      refreshFunction && refreshFunction();
      Raf.setRaf(this.resetDrag);
      this.startY = 0;
      this.setState({
        pullDistance: 0
      })
    }
  };
  resetDrag = () => {
    const childrenContainer = this.childrenWrap;
    if (childrenContainer) {
      childrenContainer.style.transform = 'none';
      childrenContainer.style.willChange = 'none';
    }
  };
  setDrag = (move: number) => {
    const childrenContainer = this.childrenWrap;
    if (childrenContainer) {
      childrenContainer.style.transition = `transform 0.2s cubic-bezier(0,0,0.31,1)`;
      childrenContainer.style.transform = `translate3d(0px, ${move}px, 0px)`;
    }
  };
  render() {
    const {
      children,
      pullDownToRefresh,
      height,
      containerStyle,
      hasMore,
      loadingComponent,
      endComponent,
      pullDownComponent,
      releaseComponent,
      refreshingComponent,
      refreshEndComponent,
      inverse,
      className
    } = this.props;
    const {
      loading,
      pullDistance,
      refreshType
    } = this.state;
    // 当设置了滚动固定高度, 下拉/上拉刷新时阻止元素溢出到外面显示
    const outerDivStyle: CSSProperties = pullDownToRefresh && height
      ? { overflow: 'hidden' }
      : {};
    // 当组件滚动的容器在外部（即设置了scrollableParent），则设置overflow: hidden, 以免组件内部出现滚动条
    const insideStyle: CSSProperties = {
      height: height || 'auto',
      overflow: height ? 'auto' : "hidden",
      WebkitOverflowScrolling: 'touch',
      ...containerStyle,
    };
    // 加载更多相关组件
    const loadingMoreComponent = (
      <>
        {loading && hasMore && loadingComponent}
        {!hasMore && endComponent}
      </>
    );
    // 下拉刷新的相关组件
    const refreshProps: any = {
      "pullDown": pullDownComponent,
      "release": releaseComponent,
      "refreshing": refreshingComponent,
      "refreshEnd": refreshEndComponent
    };
    const refreshComponent =
      pullDownToRefresh && (
        <div
          style={{ display: (pullDistance || refreshType === "refreshing") ? 'block' : 'none' }}
        >
          <span>
            {refreshProps[refreshType]}
          </span>
        </div>
      );
    return (
      <div
        style={outerDivStyle}
        className="infinite-scroll-component__outerdiv"
      >
        <div
          className={`infinite-scroll-component ${className || ''}`}
          ref={node => this.scrollWrap = node}
          style={insideStyle}
        >
          <div ref={node => this.childrenWrap = node}>
            {!inverse && refreshComponent}
            {inverse && loadingMoreComponent}
            {
              React.Children.map(children, (child, index) => {
                return React.cloneElement(React.Children.only(child), {
                  style: { ...child.props.style }
                });
              })
            }
            {!inverse && loadingMoreComponent}
            {inverse && refreshComponent}
          </div>
        </div>
      </div>
    );
  }
}