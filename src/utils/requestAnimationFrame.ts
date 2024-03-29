
/**
 * requestAnimationFrame兼容写法，用于执行动画操作，类似于setTimeout，但是只在显示频率刷新时候执行，递归调用模仿setInterval
 */
let lastTime = 0;

let setRaf = (callback: (arg0: number) => void) => {
  const currTime = new Date().getTime();
  const timeInterval = Math.max(0, 16.7 - (currTime - lastTime));
  const id: any = window.setTimeout(() => {
    callback(currTime + timeInterval);
  }, timeInterval);
  lastTime = currTime + timeInterval;
  return id;
};

let cancelRaf = (id: any) => {
  return clearTimeout(id);
};

if (typeof window !== 'undefined' && 'requestAnimationFrame' in window) {
  setRaf = (callback) => {
    return window.requestAnimationFrame(callback);
  };

  cancelRaf = (id: any) => {
    return window.cancelAnimationFrame(id);
  };
}

export default { setRaf, cancelRaf };
