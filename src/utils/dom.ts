import { isDom } from "./type";

// 返回元素或事件对象的可视位置
export interface SizeInterface {
    x: number;
    y: number;
}
export function getClientXY(el: MouseEvent | TouchEvent | HTMLElement): null | SizeInterface {
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
        pos = {
            x: el.getBoundingClientRect().left,
            y: el.getBoundingClientRect().top
        };
    }
    return pos;
}

/**
 * 获取元素或事件对象的相对于页面的真实位置 = 滚动高度 + 可视位置
 * @param el 元素或事件对象
 */
export function getPositionInPage(el: MouseEvent | TouchEvent | HTMLElement): null | SizeInterface {
    const clientXY = getClientXY(el);
    const scroll = getScroll();
    let pos = null;
    if (clientXY) {
        pos = {
            x: clientXY.x + (scroll?.x || 0),
            y: clientXY.y + (scroll?.y || 0)
        }
    }
    return pos;
};

// 滚动的兼容
export function setScroll(ele: HTMLElement, x: number, y: number) {
    if (ele === document.body) {
        if (document.documentElement) {
            document.documentElement.scrollTop = y || 0;
            document.documentElement.scrollLeft = y || 0;
        } else if (window) {
            window.scrollTo(x || 0, y || 0);
        }
    } else {
        ele.scrollTop = y || 0;
        ele.scrollLeft = x || 0;
    }
};

// 获取页面或元素的卷曲滚动(兼容写法)
export function getScroll(el: HTMLElement = (document.body || document.documentElement)): any {
    if (!isDom(el)) {
        return;
    }
    if (el === document.body || el === document.documentElement) {
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

// 获取页面或元素的宽高 = 可视宽高 + 滚动条 + 边框
export interface OffsetInterface {
    width: number;
    height: number;
}
export function getOffsetWH(el: HTMLElement = (document.body || document.documentElement)): undefined | OffsetInterface {
    if (!isDom(el)) {
        return;
    }
    if (el === document.body || el === document.documentElement) {
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
export function eleCanScroll(ele: HTMLElement) {
    if (!isDom(ele)) {
        return;
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
export function getScrollParent(target: any, step?: number) {
    const root = [document.body, document.documentElement];
    if (root.indexOf(target) > -1) {
        return document.body || document.documentElement;
    };

    let scrollParent = target.parentNode as HTMLElement;

    if (step) {
        while (root.indexOf(scrollParent) == -1 && step > 0) {
            if (eleCanScroll(scrollParent)) {
                return scrollParent;
            }
            scrollParent = scrollParent.parentNode as HTMLElement;
            step--;
        }
    } else {
        while (root.indexOf(scrollParent) == -1) {
            if (eleCanScroll(scrollParent)) {
                return scrollParent;
            }
            scrollParent = scrollParent.parentNode as HTMLElement;
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
 interface InputOptionsType {
    captrue?: boolean,
    once?: boolean,
    passive?: boolean
}
export function addEvent(el: any, event: string, handler: (...rest: any[]) => any, inputOptions?: InputOptionsType): void {
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
export function removeEvent(el: any, event: string, handler: (...rest: any[]) => any, inputOptions?: InputOptionsType): void {
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