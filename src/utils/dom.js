export function isDom(ele) {
    if (typeof HTMLElement === 'object') {
        return ele instanceof HTMLElement;
    } else {
        return ele && typeof ele === 'object' && ele.nodeType === 1 && typeof ele.nodeName === 'string';
    }
}

// 获取元素或事件对象的相对于页面的真实位置 = 滚动高度 + 可视位置
export function getPositionInPage(el) {

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

// 获取页面或元素的卷曲滚动(兼容写法)
export function getScroll(el = (document.body || document.documentElement)) {
    if (!isDom(el)) {
        return;
    }
    if (el === document.body || el === document.documentElement) {
        const doc = el.ownerDocument; // 节点所在document对象
        const win = doc.defaultView; // 包含document的window对象
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
export function getClient(el = (document.body || document.documentElement)) {
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