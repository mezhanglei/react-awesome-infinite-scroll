# react-awesome-infinite-scroll

[English](./README.md) | 中文说明

[![Version](https://img.shields.io/badge/version-0.1.2-green)](https://www.npmjs.com/package/react-awesome-infinite-scroll)

# 适用场景

滚动加载列表, 依赖浏览器scroll来进行加载, 亮点是处理了列表复杂加载的逻辑,让你更轻松简单实现列表无限加载,配置简易

# features

- [x] 默认自动获取滚动父元素,建议手动设置`scrollableParent`
- [x] 支持外部滚动和内部滚动触发加载，外面的滚动行为可以通过设置`scrollableParent`触发，里面的滚动通过设置`height`触发内部滚动
- [x] `hashMore`控制加载行为，`isRefreshing`控制刷新行为
- [x] 支持上拉加载,下拉刷新以及反向上拉刷新,下拉加载行为(聊天框场景),自定义组件的加载动态显示和行为

# 注意事项

当页面上多个列表的滚动父元素相同时，由于不能区分当前滚动的是哪一个列表，所以需要通过`forbidTrigger`禁止非当前列表的滚动加载行为。

### 快速安装
```
npm install --save react-awesome-infinite-scroll
# or
yarn add react-awesome-infinite-scroll
```

### 示例
```javascript
import InfiniteScroll from 'react-awesome-infinite-scroll';

const total = 150;
    const [list, setList] = useState([]);
    const [hasMore, setHasMore] = useState<boolean>();
    const [isRefreshing, setIsRefreshing] = useState<boolean>();

    useEffect(() => {
        const res = Array.from({ length: 100 })
        setList(res);
        setHasMore(res?.length < total);
    }, [])

    // loading more
    const fetchMoreData = () => {
        setTimeout(() => {
            const next = list?.concat(Array.from({ length: 20 }))
            setList(next);
            if (next?.length > 160) {
                setHasMore(false)
            }
        }, 1000);
    };

    const reload = () => {
        setIsRefreshing(true)
        setTimeout(() => {
            const res = Array.from({ length: 100 })
            setList(res);
            setIsRefreshing(false)
        }, 1000);
    }

    const renderItem = (_, index: number) => {
        return (
            <div style={{ height: 30, border: '1px solid green', margin: 6, padding: 8 }} key={index} >
                div - #{index}{_}
            </div>
        );
    }
......

<div className="parent" style={{height: "500px", overflow: "auto"}}> // 目前设置的外部滚动
    <InfiniteScroll
        length={list?.length}
        next={fetchMoreData}
        scrollableParent={document.querySelector(".cart-index")}
        hasMore={hasMore}
        isRefreshing={isRefreshing}
        pullDownToRefresh
        refreshFunction={reload}
        pullDownComponent={<div style={{ height: "50px", background: "green" }}>下拉</div>}
        releaseComponent={<div style={{ height: "50px", background: "red" }}>释放</div>}
        refreshingComponent={<div style={{ height: "50px", background: "green" }}>加载中</div>}
        refreshEndComponent={<div style={{ height: "50px", background: "red" }}>加载完成</div>}
        loadingComponent={<div style={{ textAlign: 'center' }}><h4>Loading...</h4></div>}
        endComponent={
            (list?.length) ?
                <div style={{ textAlign: 'center', fontWeight: 'normal', color: '#999' }}>
                    <span>没有更多内容了</span>
                </div> : null
        }
        >
            {
                list?.map((item, index) => {
                    return renderItem(item, index);
                })
            }
    </InfiniteScroll>
</div>
```

### Methods
```
   setScroll: (x, y) => void: 设置滚动根节点的滚动距离，当设置`inverse`时初始化会滚动到底部。
```

## 组件属性说明

| 名称                          | 类型                  | 默认值                                                         | 描述                                                                                                      |
| ----------------------------- | --------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| length                          | `number`            | -                                                              | 列表的长度                                                                                  |
| next                          | `function`            | -                                                              | 加载列表的请求函数                                                                                  |
| hasMore                       | `boolean`             | -                                                         | 控制列表是否加载完成                                                                             |
| isRefreshing                       | `boolean`             | 控制刷新行为-                                                         |                                                                                |
| loadingComponent              | `ReactNode`           | -                                                              | 加载时的展示组件                                                  |
| height                        | `number`              | -                                                              | 设置固定高度滚动加载,和`scrollableParent`二选一, `scrollableParent`用来设置滚动容器                                                                              |
| onScroll                      | `function`            | -                                                              | 滚动触发函数              |
| endComponent                  | `ReactNode`           | -                                                              | 加载列表完完成时的展示组件                                                                                          |
| scrollableParent              | `HtmlElement / string` | -                                                             | 设置在该父元素内滚动,不设置默则会自动冒泡搜索滚动父元素，建议设置以提高性能                      |
| minPullDown, maxPullDown      | `number`              | -                                                              | 当下拉刷新时控制最小下拉和最大下拉距离                                                                                  |
| inverse                       | `boolean`             | -                                                              | 设置反向加载                                                                                  |
| forbidTrigger                 | `boolean`             | -                                                              | 禁止滚动加载触发，当页面上有多个滚动列表且滚动父元素相同，则可以通过此api禁止滚动触发加载                                                                                  |
| containerStyle                | `object`              | -                                                              | 组件内部的样式                                                                                  |
| pullDownToRefresh             | `boolean`             | `false`                                                        | 设置是否可以下拉刷新                                                                                  |
| refreshFunction               | `function`            | -                                                              | 刷新数据的请求函数                                                                                          |
| pullDownComponent             | `ReactNode`           | -                                                              | 下拉时的显示组件                                                                                  |
| releaseComponent              | `ReactNode`           | -                                                              | 释放下拉时的显示组件                                                                                  |
| refreshingComponent           | `ReactNode`           | -                                                              | 刷新中的显示组件                                                                                  |
| refreshEndComponent           | `ReactNode`           | -                                                              | 刷新完毕的显示组件                                                                                  |



