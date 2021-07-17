//是否是移动设备
export const isMobile = function (): boolean {
    let userAgent = navigator.userAgent, Agents = ["Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod"];
    return Agents.some((i) => {
        return userAgent.includes(i);
    });
};