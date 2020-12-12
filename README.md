# react-awesome-infinite-scroll

English | [中文说明](./README_CN.md)

[![Version](https://img.shields.io/badge/version-3.1.0-green)](https://www.npmjs.com/package/react-awesome-infinite-scroll)

# Introduction?

Scroll load list, relying on the browser scroll to load, it's easy to loading list by scroll.

# featrues

- [x] Automatically gets the scroll parent by default,It is recommended to set `scrollableParent` manually
- [x] Both internal and external scrolling of the component can be triggered，The scrolling behavior on the outside can be triggered by setting 'scrollableParent', and the scrolling on the inside can be triggered by setting 'height'
- [x] Controls the boundary only by `hashMore`, so easy
- [x] Support pull - up load, pull - down refresh and reverse pull - up refresh, pull - down load behavior(Chat box scene), custom component load dynamic display and behavior

# Matters

When the scrolling parent element of multiple lists on the page is the same, it is impossible to distinguish which list is currently scrolling, so 'forbidTrigger' is needed to prohibit the scrolling loading behavior of non-current lists.

### install
```
npm install --react-awesome-infinite-scroll
# or
yarn add react-awesome-infinite-scroll
```

### example
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

<div className="parent" style={{height: "500px", overflow: "auto"}}> // Currently set the outside scroll
    <InfiniteScroll
        next={this.fetchMoreData}
        scrollableParent={document.querySelector(".parent")} // or set "height", only one is need
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

### Instance methods

_scrollTo: function(x, y) {}_
  - `ScrollTo` allows you to operate the component to scrollTo the target position, with x as the horizontal scroll distance and y as the vertical scroll distance
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
  - get scroll Node
```

## Attributes

| name                          | type                  | defaultValue                                                   | description                                                                                                      |
| ----------------------------- | --------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| next                          | `function`            | -                                                              | Load the request function of the list                                                                                  |
| hasMore                       | `boolean`             | `true`                                                         | Controls whether the list is loaded(`true` is required for initialization)                                                                               |
| loadingComponent              | `ReactNode`           | -                                                              | Display components at load time                                                  |
| height                        | `number`              | -                                                              | Set the fixed load height, or set scrollParent to scroll by `scrollableParent`                                                                              |
| onScroll                      | `function`            | -                                                              | Scroll trigger function              |
| endComponent                  | `ReactNode`           | -                                                              | Display components when the load list is complete                                                                                          |
| isError                       | `boolean`             | -                                                              | loading error status                                                                                          |
| errorComponent                | `ReactNode`           | -                                                              | Display components when the load list is loading error                                                                                          |
| initialScrollY                | `number`              | -                                                              | Initializes the scroll distance                                                                                         |
| scrollableParent              | `HtmlElement / string`| -                                                              | Set to scroll within the parent element，Auto bubble search if not set，Settings are recommended to improve performance                 |
| minPullDown, maxPullDown      | `number`              | -                                                              | Control the minimum and maximum drop-down distances when pulling down                                                                                  |
| inverse                       | `boolean`             | -                                                              | Set up reverse loading                                                                                  |
| thresholdValue                | `string / number`     | -                                                              | Threshold, which controls how far to scroll to trigger loading                                                                                  |
| forbidTrigger                 | `boolean`             | -                                                              | Disable scrolltrigger. When there are multiple scrolllists on the page with the same scrollparent, you can forbid scrolltrigger loading through this API                                                                                  |
| containerStyle                | `object`     | -                                                                       | style of the container                                                                                  |
| pullDownToRefresh             | `boolean`             | `false`                                                        | Sets whether you can pull down to refresh                         |
| refreshFunction               | `function`            | -                                                              | The request function to refresh the data                                                                                          |
| pullDownComponent             | `ReactNode`     | -                                                                    | Display components when pull down                                                                                 |
| releaseComponent              | `ReactNode`     | -                                                                    | Display components when relase                                                                                  |
| refreshingComponent           | `ReactNode`     | -                                                                    | Display components when refreshing                                                                                 |
| refreshEndComponent           | `ReactNode`     | -                                                                    | Display components when refresh to complete                                                                                |

# TODO-LIST
- [ ] Controls the number of loaded lists and the cache
- [ ] List of performance optimizations,  placeholders when not loaded



