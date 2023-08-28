# react-awesome-infinite-scroll

English | [中文说明](./README_CN.md)

[![Version](https://img.shields.io/badge/version-0.1.10-green)](https://www.npmjs.com/package/react-awesome-infinite-scroll)

# Introduction?

Scroll load list, relying on the browser scroll to load, it's easy to loading list by scroll.

# featrues

- [x] Automatically gets the scroll parent by default, or set `scrollableParent` manually
- [x] Both internal and external scrolling of the component can be triggered，The scrolling behavior on the outside can be triggered by setting 'scrollableParent', and the scrolling on the inside can be triggered by setting 'height'
- [x] Controls the loading by `hashMore`, Controls the refreshing by `isRefreshing`,
- [x] Support pull - up load, pull - down refresh and reverse pull - up refresh, pull - down load behavior(Chat box scene), custom component load dynamic display and behavior

# Matters

When the scrolling parent element of multiple lists on the page is the same, it is impossible to distinguish which list is currently scrolling, so `forbidTrigger` is needed to prohibit the scrolling loading behavior of non-current lists.

### install
```
npm install --react-awesome-infinite-scroll
# or
yarn add react-awesome-infinite-scroll
```

### example
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
   setScroll: (x, y) => void: Set the scroll distance of the scroll root node, when set `inverse` the initialization will scroll to the bottom.
```

## Attributes

| name                          | type                  | defaultValue                                                   | description                                                                                                      |
| ----------------------------- | --------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| length                          | `number`            | -                                                              | the list's length                                                                                  |
| next                          | `function`            | -                                                              | Load the request function of the list                                                                                  |
| hasMore                       | `boolean`             | -                                                         | Controls whether the list is loaded                                                                               |
| isRefreshing                       | `boolean`             | -                                                         | Controls whether the list is refreshing                                                                               |
| loadingComponent              | `ReactNode`           | -                                                              | Display components at load time                                                  |
| height                        | `number`              | -                                                              | Set the fixed load height, or set scrollParent to scroll by `scrollableParent`                                                                              |
| onScroll                      | `function`            | -                                                              | Scroll trigger function              |
| endComponent                  | `ReactNode`           | -                                                              | Display components when the load list is complete                                                                                          |
| scrollableParent              | `HtmlElement / string`| -                                                              | Set to scroll within the parent element，Auto bubble search if not set，Settings are recommended to improve performance                 |
| minPullDown, maxPullDown      | `number`              | -                                                              | Control the minimum and maximum drop-down distances when pulling down                                                                                  |
| inverse                       | `boolean`             | -                                                              | Set up reverse loading                                                                                  |
| thresholdValue                | `string / number`     | -                                                              | Threshold, which controls how far to scroll to trigger loading                                                                                  |
| forbidTrigger                 | `boolean`             | -                                                              | Disable scrolltrigger. When there are multiple scrolllists on the page with the same scrollparent, you can forbid scrolltrigger loading through this API                                                                                  |
| containerStyle                | `object`              | -                                                              | style of the container                                                                                  |
| pullDownToRefresh             | `boolean`             | `false`                                                        | Sets whether you can pull down to refresh                         |
| refreshFunction               | `function`            | -                                                              | The request function to refresh the data                                                                                          |
| pullDownComponent             | `ReactNode`           | -                                                              | Display components when pull down                                                                                 |
| releaseComponent              | `ReactNode`           | -                                                              | Display components when relase                                                                                  |



