import { isDom } from "./type";

// 获取元素或事件对象的相对于页面的真实位置 = 滚动高度 + 可视位置
export function getPositionInPage(el: MouseEvent | TouchEvent | HTMLElement): any {

    let pos = {};
    if (el instanceof MouseEvent) {
        pos = {
            x: el.clientX + getScroll().x,
            y: el.clientY + getScroll().y
        };
    } else if (el instanceof TouchEvent) {
        pos = {
            x: el.touches[0].clientX + getScroll().x,
            y: el.touches[0].clientY + getScroll().y
        };
    } else if (isDom(el)) {
        pos = {
            x: el.getBoundingClientRect().left + getScroll().x,
            y: el.getBoundingClientRect().top + getScroll().y
        };
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

// 获取页面或元素的可视宽高(兼容写法, 不包括工具栏和滚动条)
export function getClient(el: HTMLElement = (document.body || document.documentElement)): any {
    if (!isDom(el)) {
        return;
    }
    if (el === document.body || el === document.documentElement) {
        const x = el.clientWidth || window.screen.availWidth;
        const y = el.clientHeight || window.screen.availHeight;
        return { x, y };
    } else {
        const x = el.clientWidth;
        const y = el.clientHeight;
        return { x, y };
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