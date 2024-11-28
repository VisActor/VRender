# 什么是BoundsPadding

*【注意】*通常情况下，`VRender`默认并不具备类似`DOM`的布局，比如在`DOM`中，你可以写两个`div`，那么第二个`div`会放置在第一个div的下方。但如果在`VRender`中，你写了两个矩形，那么第二个矩形会覆盖在第一个矩形之上。这是因为`VRender`中所有的定位都是相对定位的，*它依靠你配置的x、y等参数定位*，坐标系是左上角为原点，向右为`x`轴正方向，向下为`y`轴正方向。这就导致了`VRender`的布局和`DOM`的布局是不一样的。

所有图元都有自己的`AABBBounds`，如果觉得`AABBBounds`太小，需要扩大，就可以配置`BoundsPadding`。

```ts
// 包围盒的padding
// 如果是number，那么四个方向的padding都是这个值
// 如果是[number, number] ，那么分别是上下和左右的padding
// 如果是[number, number, number, number]，那么分别是上右下左的padding
boundsPadding: number | number[];
```

![](https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/vrender/vrender-faq-boundsPadding1.png)

## 特殊情况

刚才说了，BoundsPadding是影响元素的AABBBounds，正常情况下并不影响位置，因为位置是固定通过xy等配置配出来的，并不是基于元素和元素之间的位置关系来计算的布局。

但是！！，当你开启了`flex`布局插件，并在元素中设置了`display: flex`之后，该元素就会应用上flex布局。其子元素就会基于它的AABBBounds来进行布局。在这种情况下，BoundsPadding就会影响到子元素的位置。

关于Flex布局的详细介绍，请参考[Flex布局](./Flex_Layout)章节。

## 示例

接下来我们展示两个实例，一个是没有开启flex布局的情况，一个是开启flex布局的情况。

### 不使用flex布局，BoundsPadding不影响元素位置

```javascript livedemo template=vrender
const rect = VRender.createRect({ x: 100, y: 100, width: 100, height: 100, fill: 'red' });

const stage = new VRender.Stage({
  container: CONTAINER_ID,
  autoRender: true
});

const textLimit = VRender.createText({
  x: 0,
  y: 0,
  fill: 'pink',
  text: '这是没有BoundsPadding的文字包围盒',
  wordBreak: 'keep-all',
  maxLineWidth: 120,
  textAlign: 'left',
  textBaseline: 'middle',
  whiteSpace: 'normal',
  _debug_bounds: true,
  background: 'green'
});
const textLimit2 = VRender.createText({
  x: 0,
  y: 60,
  fill: 'pink',
  text: '这是有BoundsPadding的文字包围盒',
  wordBreak: 'keep-all',
  maxLineWidth: 120,
  textAlign: 'left',
  textBaseline: 'middle',
  whiteSpace: 'normal',
  boundsPadding: [20, 10],
  _debug_bounds: true,
  background: 'green'
});

const group = VRender.createGroup({x: 100, y: 100, width: 200, height: 200});
group.add(textLimit);
group.add(textLimit2);

stage.defaultLayer.add(group);
```


### 使用flex布局，BoundsPadding影响元素位置

```javascript livedemo template=vrender
const rect = VRender.createRect({ x: 100, y: 100, width: 100, height: 100, fill: 'red' });

const stage = new VRender.Stage({
  container: CONTAINER_ID,
  autoRender: true,
  enableLayout: true
});

const textLimit = VRender.createText({
  x: 0,
  y: 0,
  fill: 'pink',
  text: '这是没有BoundsPadding的文字包围盒',
  wordBreak: 'keep-all',
  maxLineWidth: 120,
  textAlign: 'left',
  textBaseline: 'middle',
  whiteSpace: 'normal',
  _debug_bounds: true,
  background: 'green'
});
const textLimit2 = VRender.createText({
  x: 0,
  y: 60,
  fill: 'pink',
  text: '这是有BoundsPadding的文字包围盒',
  wordBreak: 'keep-all',
  maxLineWidth: 120,
  textAlign: 'left',
  textBaseline: 'middle',
  whiteSpace: 'normal',
  boundsPadding: [20, 10],
  _debug_bounds: true,
  background: 'green'
});

const group = VRender.createGroup({x: 100, y: 100, width: 200, height: 200, display: 'flex'});
group.add(textLimit);
group.add(textLimit2);

stage.defaultLayer.add(group);
```
