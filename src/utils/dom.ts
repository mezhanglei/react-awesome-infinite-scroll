import { isDom } from "./type";

/**
 * 返回元素的视窗内的位置
 * @param el 
 * @returns 
 */
 export function getRect(el: HTMLElement) {
    return el.getBoundingClientRect()
}

// 返回元素或事件对象的视口位置
export function getClientXY(el: MouseEvent | TouchEvent | HTMLElement): null | {
    x: number;
    y: number;
} {
    let pos = null;
    if ("clientX" in el) {
        pos = {
            x: el.clientX,
            y: el.clientY
        };
    } else if ("touches" in el) {
        if (el?.touches[0]) {
            pos = {
                x: el.touches[0]?.clientX,
                y: el.touches[0]?.clientY
            };
        }
    } else if (isDom(el)) {
        if ([document.documentElement, document.body].includes(el)) {
            pos = {
                x: 0,
                y: 0
            }
        } else {
            pos = {
                x: getRect(el)?.left,
                y: getRect(el).top
            };
        }
    }
    return pos;
}

/**
 * 获取页面或元素的卷曲滚动(兼容写法)
 * @param el 目标元素
 */
 export function getScroll(el: HTMLElement = (document.body || document.documentElement)): undefined | {
    x: number;
    y: number;
} {
    if (!isDom(el)) {
        return;
    }
    if ([document.documentElement, document.body].includes(el)) {
        const doc = el.ownerDocument; // 节点所在document对象
        const win: any = doc.defaultView; // 包含document的window对象
        const x = doc.documentElement.scrollLeft || win.pageXOffset || doc.body.scrollLeft;
        const y = doc.documentElement.scrollTop || win.pageYOffset || doc.body.scrollTop;
        return { x, y };
    } else {
        const x = el.scrollLeft;
        const y = el.scrollTop;
        return { x, y };
    }
};

/**
 * 返回事件对象相对于父元素的真实位置
 * @param el 事件对象
 * @param parent 父元素
 */
 export function getEventPosition(el: MouseEvent | TouchEvent, parent: HTMLElement = document.body || document.documentElement): null | {
    x: number;
    y: number;
} {
    let pos = null;
    if ("clientX" in el) {
        pos = {
            x: el?.clientX - getRect(parent).left,
            y: el?.clientY - getRect(parent).top,
        };
    } else if ("touches" in el) {
        if (el?.touches[0]) {
            pos = {
                x: el?.touches[0]?.clientX - getRect(parent).left,
                y: el?.touches[0]?.clientY - getRect(parent).top
            };
        }
    }

    return pos;
}

/**
 * 设置滚动距离（兼容写法）
 * @param ele 目标元素
 * @param x 横轴坐标
 * @param y 纵轴坐标
 */
 export function setScroll(ele: HTMLElement, x: number, y: number): void {
    if ([document.documentElement, document.body].includes(ele)) {
        document.documentElement.scrollTop = y || 0;
        document.documentElement.scrollLeft = x || 0;
    } else {
        if (ele) {
            ele.scrollTop = y || 0;
            ele.scrollLeft = x || 0;
        } else if (window) {
            window.scrollTo(x || 0, y || 0);
        }
    }
};

// 获取页面或元素的宽高 = 可视宽高 + 滚动条 + 边框
export function getOffsetWH(el: HTMLElement): undefined | {
    width: number;
    height: number;
} {
    if (!isDom(el)) {
        return;
    }
    if ([document.documentElement, document.body].includes(el)) {
        const width = window.innerWidth;
        const height = window.innerHeight;
        return { width, height };
    } else {
        const width = el.offsetWidth;
        const height = el.offsetHeight;
        return { width, height };
    }
};

/**
 * 判断目标元素内部是否可以滚动
 * @param {*} ele 内容可以scroll的元素
 */
 export function eleCanScroll(ele: HTMLElement): boolean {
    if (!isDom(ele)) {
        return false;
    }
    if (ele.scrollTop > 0) {
        return true;
    } else {
        ele.scrollTop++;
        const top = ele.scrollTop;
        return top > 0;
    }
}

/**
 * 获取目标元素的可滚动父元素
 * @param {*} target 目标元素
 * @param {*} step 遍历层数，设置可以限制向上冒泡查找的层数
 */
 export function getScrollParent(target: any, step?: number): HTMLElement {
    const root = [document.documentElement, document.body];
    if (root.indexOf(target) > -1) {
        return document.body || document.documentElement;
    };

    let scrollParent = target?.parentNode;

    if (step) {
        while (root.indexOf(scrollParent) == -1 && step > 0) {
            if (eleCanScroll(scrollParent)) {
                return scrollParent;
            }
            scrollParent = scrollParent.parentNode;
            step--;
        }
    } else {
        while (root.indexOf(scrollParent) == -1) {
            if (eleCanScroll(scrollParent)) {
                return scrollParent;
            }
            scrollParent = scrollParent.parentNode;
        }
    }
    return document.body || document.documentElement;
};

/**
 * 添加事件监听
 * @param el 目标元素
 * @param event 事件名称
 * @param handler 事件函数
 * @param inputOptions 配置
 */
 export function addEvent(el: any, event: string, handler: (...rest: any[]) => any, inputOptions?: {
    captrue?: boolean,
    once?: boolean,
    passive?: boolean
}): void {
    if (!el) return;
    // captrue: true事件捕获 once: true只调用一次,然后销毁 passive: true不调用preventDefault
    const options = { capture: false, once: false, passive: false, ...inputOptions };
    if (el.addEventListener) {
        el.addEventListener(event, handler, options);
    } else if (el.attachEvent) {
        el.attachEvent('on' + event, handler);
    } else {
        // $FlowIgnore: Doesn't think elements are indexable
        el['on' + event] = handler;
    }
}

/**
 * 移除事件监听
 * @param el 目标元素
 * @param event 事件名称
 * @param handler 事件函数
 * @param inputOptions 配置
 */
export function removeEvent(el: any, event: string, handler: (...rest: any[]) => any, inputOptions?: {
    captrue?: boolean,
    once?: boolean,
    passive?: boolean
}): void {
    if (!el) return;
    const options = { capture: false, once: false, passive: false, ...inputOptions };
    if (el.removeEventListener) {
        el.removeEventListener(event, handler, options);
    } else if (el.detachEvent) {
        el.detachEvent('on' + event, handler);
    } else {
        // $FlowIgnore: Doesn't think elements are indexable
        el['on' + event] = null;
    }
}