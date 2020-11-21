# react-awesome-infinite-scroll

[English](./README.md) | 中文说明

[![Version](https://img.shields.io/badge/version-1.0.1-green)](https://www.npmjs.com/package/react-awesome-infinite-scroll)

# 适用场景

滚动加载列表, 依赖浏览器scroll来进行加载, 亮点是处理了列表复杂加载的逻辑,让你更轻松简单实现列表无限加载,配置简易
# 缺点

- [x] 没有封装更为强大的功能, 后续会持续更新考虑性能和更简易的api处理


### 快速安装
```
npm install --save react-awesome-infinite-scroll
# or
yarn add react-awesome-infinite-scroll
```

### 示例
```javascript
import InfiniteScroll from 'react-awesome-infinite-scroll';

this.state = {
  items: Array.from({ length: 10 }),
  hasMore: true
};

fetchMoreData = () => {
   if (this.state.items.length >= 500) {
       this.setState({ hasMore: false });
       return;
   }
   // a fake async api call like which sends
   // 20 more records in .5 secs
   setTimeout(() => {
       this.setState({
           items: this.state.items.concat(Array.from({ length: 20 })),
       });
   }, 500);
};
<InfiniteScroll
    next={this.fetchMoreData}
    hasMore={this.state.hasMore}
    loader={<h4>Loading...</h4>}
    height={200}
    endMessage={
        <p style={{ textAlign: 'center' }}>
            <b>Yay! You have seen it all</b>
        </p>
    }
  >
    {this.state.items.map((_, index) => (
        <div style={{ height: 30, border: '1px solid green', margin: 6, padding: 8 }} key={index} >
            div - #{index}
        </div>
    ))}
</InfiniteScroll>
```

## 属性说明

| 名称                          | 类型                  | 默认值                                                         | 描述                                                                                                      |
| ----------------------------- | --------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| next                          | `function`            | -                                                              | 加载列表的请求函数                                                                                  |
| hasMore                       | `boolean`             | `true`                                                         | 控制列表是否加载完成(初始化时需要手动赋值`true`)                                                                               |
| loader                        | `ReactNode`           | -                                                              | 加载时的展示组件                                                  |
| height                        | `number`              | -                                                              | 设置固定高度加载                                                                              |
| onScroll                      | `function`            | -                                                              | 滚动触发函数              |
| pullDownToRefresh             | `boolean`             | `false`                                                        | 设置是否可以下拉刷新                         |
| pullDownToRefreshContent      | `ReactNode`           | -                                                              | 下拉时的展示组件                                                                                          |
| releaseToRefreshContent       | `ReactNode`           | -                                                              | 释放下拉刷新的展示组件                                                                                          |
| refreshFunction               | `function`            | -                                                              | 刷新数据的请求函数                                                                                          |
| endMessage                    | `ReactNode`           | -                                                              | 加载列表完完成时的展示组件                                                                                          |
| initialScrollY                | `number`              | -                                                              | 初始化滚动距离                                                                                         |
| scrollableTarget              | `HtmlElement | string`| -                                                              | 设置在该父元素内滚动,不设置默认body                                                                            |
| minPullDown, maxPullDown      | `number`              | -                                                              | 当下拉刷新时控制最小下拉和最大下拉距离                                                                                  |
| inverse                       | `boolean`             | -                                                              | 设置反向加载                                                                                  |
| thresholdValue                | `string | number`     | -                                                              | 阈值,用来控制滚动到什么程度(距离)触发加载                                                                                  |

# TODO-LIST
- [ ] 控制加载的列表数量及记忆回溯
- [ ] 列表的性能优化, 未加载内容占位



