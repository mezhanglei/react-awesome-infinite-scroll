/**
 * 返回元素的视窗内的位置
 * @param el
 * @returns
 */
export declare function getRect(el: HTMLElement): DOMRect;
export declare const getWindow: (el?: any) => any;
export declare function getClientXY(el: MouseEvent | TouchEvent | HTMLElement): null | {
    x: number;
    y: number;
};
/**
 * 获取页面或元素的卷曲滚动(兼容写法)
 * @param el 目标元素
 */
export declare function getScroll(el: HTMLElement): undefined | {
    x: number;
    y: number;
};
/**
 * 返回事件对象相对于父元素的真实位置
 * @param el 事件对象
 * @param parent 父元素
 */
export declare function getEventPosition(el: MouseEvent | TouchEvent, parent?: HTMLElement): null | {
    x: number;
    y: number;
};
/**
 * 设置滚动距离（兼容写法）
 * @param ele 目标元素
 * @param x 横轴坐标
 * @param y 纵轴坐标
 */
export declare function setScroll(ele: HTMLElement, x: number, y: number): void;
export declare function getOffsetWH(el: HTMLElement): undefined | {
    width: number;
    height: number;
};
/**
 * 判断目标元素内部是否可以滚动
 * @param {*} ele 内容可以scroll的元素
 */
export declare function eleCanScroll(ele: HTMLElement): boolean;
/**
 * 获取目标元素的可滚动父元素
 * @param {*} target 目标元素
 * @param {*} step 遍历层数，设置可以限制向上冒泡查找的层数
 */
export declare function getScrollParent(target: any, step?: number): HTMLElement;
/**
 * 添加事件监听
 * @param el 目标元素
 * @param event 事件名称
 * @param handler 事件函数
 * @param inputOptions 配置
 */
export declare function addEvent(el: any, event: string, handler: (...rest: any[]) => any, inputOptions?: {
    captrue?: boolean;
    once?: boolean;
    passive?: boolean;
}): void;
/**
 * 移除事件监听
 * @param el 目标元素
 * @param event 事件名称
 * @param handler 事件函数
 * @param inputOptions 配置
 */
export declare function removeEvent(el: any, event: string, handler: (...rest: any[]) => any, inputOptions?: {
    captrue?: boolean;
    once?: boolean;
    passive?: boolean;
}): void;
