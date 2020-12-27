import { isObjectEqual } from "./utils/object";
export interface CacheProps {
    limit: number | undefined
}

export enum ScrollDirection {
    UP = "up",
    DOWN = "down"
}

export default class CacheManager {
    limit: number;
    dataSource: any[];
    startIndex: number;
    endIndex: number;

    constructor(props: CacheProps) {
        const {
            limit
        } = props;
        this.limit = limit || 0;
        this.startIndex = 0;
        this.endIndex = this.limit;
        this.dataSource = [];
    }

    // 更新截取的列表索引
    updateIndex = (newDataSource: any[] = []) => {
        const direction = isObjectEqual(newDataSource[0], this.dataSource[0]) ? ScrollDirection.DOWN : ScrollDirection.UP;
        const diffLength = newDataSource?.length - this.limit;
        if (direction === ScrollDirection.DOWN) {
            console.log(newDataSource?.length, this.limit, '下')
            this.startIndex = Math.max(diffLength, 0);
            this.endIndex = newDataSource?.length;
        } else {
            this.startIndex = 0;
            console.log(newDataSource?.length, this.limit, '上')
            this.endIndex = this.limit ? Math.min(newDataSource?.length, this.limit) : newDataSource?.length;
        }
        this.dataSource = newDataSource;
    }

    getIndex = () => {
        return {
            startIndex: this.startIndex,
            endIndex: this.endIndex
        }
    }
}
