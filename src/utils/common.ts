/**
 * 节流, 一段时间只能执行一次
 * @param {*} fn 目标函数
 * 使用: 1. 实例化一个对象: const fn = throttle(函数)
 *       2. 执行fn()
 */
export function throttle(fn: any, time: number = 160) {
    let timer: any= null;
    return function () {
        if (!timer) {
            timer = setTimeout(function () {
                fn.apply(this, arguments);
                timer = null;
            }, time);
        }
    };
};