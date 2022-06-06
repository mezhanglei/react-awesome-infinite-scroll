import React, { ReactNode, CSSProperties } from 'react';
declare type fn = () => any;
declare type EventType = MouseEvent | TouchEvent;
export declare type COMPONENT_TYPE = "pullDown" | "release" | "refreshing" | "refreshEnd";
export interface ListProps {
    height?: number;
    containerStyle?: CSSProperties;
    pullDownToRefresh?: boolean;
    releaseComponent?: ReactNode;
    pullDownComponent?: ReactNode;
    refreshingComponent?: ReactNode;
    refreshEndComponent?: ReactNode;
    endComponent?: ReactNode;
    loadingComponent?: ReactNode;
    hasMore?: boolean;
    isRefreshing?: boolean;
    className?: string;
    onScroll?: (e: EventType) => any;
    inverse?: boolean;
    thresholdValue?: number | string;
    next: fn;
    refreshFunction?: fn;
    minPullDown: number;
    maxPullDown: number;
    scrollableParent?: HTMLElement | Element | null;
    forbidTrigger?: boolean;
    children: any;
    length: number;
}
export interface ListState {
    refreshType: COMPONENT_TYPE;
    loading: boolean;
    scrollHeight: number;
    pullDistance: number;
    prevLength?: number;
}
export interface ScrollRef {
    scrollTo: (x: number, y: number) => void;
    getScrollRef: () => any;
}
export default class InfiniteScroll extends React.Component<ListProps, ListState> {
    scrollWrap: HTMLDivElement | null;
    childrenWrap: HTMLDivElement | null;
    event: any;
    scrollRoot?: HTMLElement;
    dragging: boolean;
    startY: number;
    constructor(props: ListProps);
    static defaultProps: {
        minPullDown: number;
        maxPullDown: number;
    };
    componentWillUnmount(): void;
    setScroll: (x: number, y: number) => void;
    addEvents: () => void;
    removeEvents: () => void;
    getScrollableTarget: () => any;
    initDom: (scrollableParent: HTMLElement) => void;
    componentDidUpdate(prevProps: ListProps, prevState: ListState): void;
    static getDerivedStateFromProps(nextProps: ListProps, prevState: ListState): {
        prevLength: number;
        refreshType: COMPONENT_TYPE;
        loading: boolean;
        scrollHeight: number;
        pullDistance: number;
    } | null;
    updateList: () => void;
    onScrollListener: (event: EventType) => void;
    isElementAtTop: (target: HTMLElement, thresholdValue?: number | string) => boolean;
    isElementAtBottom: (target: HTMLElement, thresholdValue?: number | string) => boolean;
    onStart: (evt: EventType) => void;
    onMove: (evt: EventType) => void;
    onEnd: (evt: EventType) => void;
    resetDrag: () => void;
    setDrag: (move: number) => void;
    render(): JSX.Element;
}
export {};
