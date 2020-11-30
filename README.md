# react-awesome-infinite-scroll

English | [中文说明](./README_CN.md)

[![Version](https://img.shields.io/badge/version-2.0.0-green)](https://www.npmjs.com/package/react-awesome-infinite-scroll)

# Introduction?

Scroll load list, relying on the browser scroll to load, it's easy to loading list by scroll.

# featrues

- [x] Support for manually setting the scrollableParent 'scrollableParent' and asynchronous parent, and automatically get the scrollparent by default
- [x] Both internal and external scrolling of the component can be triggered，The scrolling behavior on the outside can be triggered by setting 'scrollableParent', and the scrolling on the inside can be triggered by setting 'height'
- [x] Controls the boundary only by `hashMore`, so easy
- [x] Custom component

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
| scrollableParent              | `HtmlElement / string`| -                                                              | Set to scroll within the parent element，Auto bubble search if not set，Settings are recommended to improve performance                 |
| minPullDown, maxPullDown      | `number`              | -                                                              | Control the minimum and maximum drop-down distances when pulling down                                                                                  |
| inverse                       | `boolean`             | -                                                              | Set up reverse loading                                                                                  |
| thresholdValue                | `string / number`     | -                                                              | Threshold, which controls how far to scroll to trigger loading                                                                                  |
| forbidTrigger                 | `boolean`             | -                                                              | Disable scrolltrigger. When there are multiple scrolllists on the page with the same scrollparent, you can forbid scrolltrigger loading through this API                                                                                  |
| containerStyle                | `object`     | -                                                                       | style of the container                                                                                  |

# TODO-LIST
- [ ] Controls the number of loaded lists and the cache
- [ ] List of performance optimizations,  placeholders when not loaded



