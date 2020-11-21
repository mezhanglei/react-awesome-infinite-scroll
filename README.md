# react-awesome-infinite-scroll

English | [中文说明](./README_CN.md)

[![Version](https://img.shields.io/badge/version-1.0.1-green)](https://www.npmjs.com/package/react-awesome-infinite-scroll)

# Introduction?

Scroll load list, relying on the browser scroll to load, it's easy to loading list by scroll.

# disadvantages

- [x] No more powerful functionality is encapsulated and will be continuously updated to take into account performance and easier API handling

### install
```
npm install --react-awesome-infinite-scroll
# or
yarn add react-awesome-infinite-scroll
```

### example
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

## Attributes

| name                          | type                  | defaultValue                                                   | description                                                                                                      |
| ----------------------------- | --------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| next                          | `function`            | -                                                              | Load the request function of the list                                                                                  |
| hasMore                       | `boolean`             | `true`                                                         | Controls whether the list is loaded(`true` is required for initialization)                                                                               |
| loader                        | `ReactNode`           | -                                                              | Display components at load time                                                  |
| height                        | `number`              | -                                                              | Set the fixed load height                                                                              |
| onScroll                      | `function`            | -                                                              | Scroll trigger function              |
| pullDownToRefresh             | `boolean`             | `false`                                                        | Sets whether you can pull down to refresh                         |
| pullDownToRefreshContent      | `ReactNode`           | -                                                              | Display components when pull-down                                                                                          |
| releaseToRefreshContent       | `ReactNode`           | -                                                              | Release the pull-down refreshed display component                                                                                          |
| refreshFunction               | `function`            | -                                                              | The request function to refresh the data                                                                                          |
| endMessage                    | `ReactNode`           | -                                                              | Display components when the load list is complete                                                                                          |
| initialScrollY                | `number`              | -                                                              | Initializes the scroll distance                                                                                         |
| scrollableTarget              | `HtmlElement | string`| -                                                              | Set to scroll within the parent element                 |
| minPullDown, maxPullDown      | `number`              | -                                                              | Control the minimum and maximum drop-down distances when pulling down                                                                                  |
| inverse                       | `boolean`             | -                                                              | Set up reverse loading                                                                                  |
| thresholdValue                | `string | number`     | -                                                              | Threshold, which controls how far to scroll to trigger loading                                                                                  |

# TODO-LIST
- [ ] Controls the number of loaded lists and the cache
- [ ] List of performance optimizations,  placeholders when not loaded



