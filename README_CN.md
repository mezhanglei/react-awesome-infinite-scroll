# react-awesome-infinite-scroll

[English](./README.md) | 中文说明

[![Version](https://img.shields.io/badge/version-3.1.0-green)](https://www.npmjs.com/package/react-awesome-infinite-scroll)

# 适用场景

滚动加载列表, 依赖浏览器scroll来进行加载, 亮点是处理了列表复杂加载的逻辑,让你更轻松简单实现列表无限加载,配置简易

# features

- [x] 默认自动获取滚动父元素,建议手动设置`scrollableParent`
- [x] 支持外部滚动和内部滚动触发加载，外面的滚动行为可以通过设置`scrollableParent`触发，里面的滚动通过设置`height`触发内部滚动
- [x] 只需要`hashMore`控制边界行为，简洁
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

componentDidMount() {
    // first loading
    setTimeout(() => {
        const res = Array.from({ length: 100 })
        this.setState({
            list: res,
            hasMore: res?.length < this.state.total
        });
    }, 100);
}

// loading more
fetchMoreData = () => {
    const { maxLength, list = [], total } = this.state;
    if (list.length >= maxLength) {
        this.setState({ hasMore: false });
        return;
    }
    if (list.length >= total) {
        this.setState({ hasMore: false });
        return;
    }
    // simulate request
    new Promise((resolve, reject) => {
        setTimeout(() => {
            // creat a fake 'error' ,so not Use this in real life ;
            // if (list.length >= 300 && !this.state.isError) {
            //     reject();
            // };
            resolve(list.concat(Array.from({ length: 20 })))
        }, 500);
    }).then(res => {
        this.setState({
            list: res
        });
    }).catch(err => {
        this.setState({
            isError: true
        });
    })
};

// reload
reload = () => {
    new Promise((resolve, reject) => {
        setTimeout(() => {
            const { list = [] } = this.state;
            resolve(list.concat(Array.from({ length: 20 })))
        }, 500);
    }).then(res => {
        this.setState({
            list: res
        });
    }).catch(err => {
        this.setState({
            isError: true
        });
    });
}

......

<div className="parent" style={{height: "500px", overflow: "auto"}}> // 目前设置的外部滚动
    <InfiniteScroll
        next={this.fetchMoreData}
        scrollableParent={document.querySelector(".parent")} // 和height二选一，选一种方式滚动
        // height={500} // height
        hasMore={hasMore}
        isError={isError}
        loadingComponent={<div style={{ textAlign: 'center' }}><h4>Loading...</h4></div>}
        errorComponent={<div style={{ textAlign: "center" }}><span>加载失败？点击<a onClick={this.reload}>重新加载</a></span></div>}
        endComponent={
            (list?.length && !maxLength) ?
                <div style={{ textAlign: 'center', fontWeight: 'normal', color: '#999' }}>
                    <span>NO MORE</span>
                </div> : null
        }
      >
          {list.map((_, index) => (
              <div style={{ height: 30, border: '1px solid green', margin: 6, padding: 8 }} key={index} >
                  div - #{index}
              </div>
          ))}
    </InfiniteScroll>
</div>
```

### 组件实例方法

_scrollTo: function(x, y) {}_
  - 通过`scrollTo`可以操作组件滚动到目标位置, x为横轴滚动距离,y为竖轴滚动距离
```javascript
import InfiniteScroll from 'react-awesome-infinite-scroll';

componentDidMount() {
    // first loading
    setTimeout(() => {
        const res = Array.from({ length: 100 })
        this.setState({
            list: res,
            hasMore: res?.length < this.state.total
        }, () => {
            // scrollTo
            this.node.scrollTo(0, 100)
        });
    }, 100);
}

......

<div className="parent" style={{height: "300px", overflow: "auto"}}>
    <InfiniteScroll
        ref={node => this.node => node}
        ...
      >
          ...
    </InfiniteScroll>
</div>

```
_getScrollRef: function() {}_
  - 获取滚动节点
```

## 组件属性说明

| 名称                          | 类型                  | 默认值                                                         | 描述                                                                                                      |
| ----------------------------- | --------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| next                          | `function`            | -                                                              | 加载列表的请求函数                                                                                  |
| hasMore                       | `boolean`             | `true`                                                         | 控制列表是否加载完成(初始化时需要手动赋值`true`)                                                                               |
| loadingComponent              | `ReactNode`           | -                                                              | 加载时的展示组件                                                  |
| height                        | `number`              | -                                                              | 设置固定高度滚动加载,和`scrollableParent`二选一, `scrollableParent`用来设置滚动容器                                                                              |
| onScroll                      | `function`            | -                                                              | 滚动触发函数              |
| endComponent                  | `ReactNode`           | -                                                            | 加载列表完完成时的展示组件                                                                                          |
| isError                       | `boolean`             | -                                                              | 是否加载错误                                                                                          |
| errorComponent                | `ReactNode`           | -                                                              | 加载列表错误时的展示组件                                                                                          |
| initialScrollY                | `number`              | -                                                              | 初始化滚动距离                                                                                         |
| scrollableParent              | `HtmlElement / string` | -                                                             | 设置在该父元素内滚动,不设置默则会自动冒泡搜索滚动父元素，建议设置以提高性能                                                                            |
| minPullDown, maxPullDown      | `number`              | -                                                              | 当下拉刷新时控制最小下拉和最大下拉距离                                                                                  |
| inverse                       | `boolean`             | -                                                              | 设置反向加载                                                                                  |
| forbidTrigger                 | `boolean`             | -                                                              | 禁止滚动加载触发，当页面上有多个滚动列表且滚动父元素相同，则可以通过此api禁止滚动触发加载                                                                                  |
| containerStyle                | `object`     | -                                                                       | 组件内部的样式                                                                                  |
| pullDownToRefresh             | `boolean`             | `false`                                                        | 设置是否可以下拉刷新                         |
| refreshFunction               | `function`            | -                                                              | 刷新数据的请求函数                                                                                          |
| pullDownComponent             | `ReactNode`     | -                                                                    | 下拉时的显示组件                                                                                  |
| releaseComponent              | `ReactNode`     | -                                                                    | 释放下拉时的显示组件                                                                                  |
| refreshingComponent           | `ReactNode`     | -                                                                    | 刷新中的显示组件                                                                                  |
| refreshEndComponent           | `ReactNode`     | -                                                                    | 刷新完毕的显示组件                                                                                  |

# TODO-LIST
- [ ] 控制加载的列表数量及记忆回溯
- [ ] 列表的性能优化, 未加载内容占位



