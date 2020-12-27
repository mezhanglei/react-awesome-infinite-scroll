// 判断两个对象(包括数组)是否相等
export function isObjectEqual(a: any, b: any) {
    if(!(typeof a == 'object' && typeof b === 'object')) {
        return a === b;
    };
    let aProps = Object.getOwnPropertyNames(a);
    let bProps = Object.getOwnPropertyNames(b);
    if (aProps.length != bProps.length) {
        return false;
    }
    for (let i = 0; i < aProps.length; i++) {
        let propName = aProps[i];
        let propA = a[propName];
        let propB = b[propName];
        if ((typeof (propA) === 'object')) {
            if (!isObjectEqual(propA, propB)) {
                return false;
            }
        } else if (propA !== propB) {
            return false;
        }
    }
    return true;
}