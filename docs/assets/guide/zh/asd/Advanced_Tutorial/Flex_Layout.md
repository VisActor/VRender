# flex布局

*【注意】*通常情况下，`VRender`默认并不具备类似`DOM`的布局，比如在`DOM`中，你可以写两个`div`，那么第二个`div`会放置在第一个div的下方。但如果在`VRender`中，你写了两个矩形，那么第二个矩形会覆盖在第一个矩形之上。这是因为`VRender`中所有的定位都是相对定位的，*它依靠你配置的x、y等参数定位*，坐标系是左上角为原点，向右为`x`轴正方向，向下为`y`轴正方向。这就导致了`VRender`的布局和`DOM`的布局是不一样的。

但是我们还提供了`flex`布局的能力，开启该功能之后，我们也可以在`VRender`中实现类似`DOM` Flex布局的能力。

## 使用

VRender中布局的能力是通过插件功能实现的，首先我们需要再stage的参数中开启该插件：

```ts
const stage = VRender.createStage({
  container: CONTAINER_ID,
  autoRender: true,
  enableLayout: true, // 开启布局能力
});
```

开启后场景树的布局依然默认是相对定位进行布局的，依靠配置的x、y以及父元素的相对位置，来确定当前元素的位置。但是我们可以通过给元素配置`flex`属性来开启`flex`布局，开启后，子元素就会按照`flex`布局的规则进行布局。

可配置的属性接口如下，规则和浏览器的Flex布局规则一致

```ts
display?: 'relative' | 'inner-block' | 'flex';
flexDirection?: 'row' | 'row-reverse' | 'column' | 'column-reverse';
flexWrap?: 'nowrap' | 'wrap';
justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around';
alignItems?: 'flex-start' | 'flex-end' | 'center';
alignContent?: 'flex-start' | 'center' | 'space-between' | 'space-around';
```

其会根据子元素的AABBBounds的大小来进行布局，你可以通过BoundsPadding来动态调整元素的AABBBounds，来达到你想要的布局效果。相关内容可以参考[BoundsPadding](../FAQ/What_Is_BoundsPadding)。

我们这里给出一个示例演示：

```javascript livedemo template=vrender
const group = VRender.createGroup({ x: 100, y: 100, width: 260, height: 80, background: '#cecece', display: 'flex' });

const g1 = VRender.createGroup({
  display: 'flex',
  background: 'green',
  width: 60,
  height: 80,
  direction: 'column',
  alignItems: 'center',
  justifyContent: 'space-around'
});

const img = VRender.createImage({
  image: 'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VTable/custom-render/flower.jpg',
  width: 50,
  height: 50
})
g1.add(img);

const g2 = VRender.createGroup({
  display: 'flex',
  background: 'red',
  width: 200,
  height: 80,
  direction: 'column'
});

const g21 = VRender.createGroup({
  display: 'flex',
  background: 'orange',
  width: 200,
  height: 40,
  direction: 'column',
  alignItems: 'center',
  justifyContent: 'center'
});

const text1 = VRender.createText({ text: '虚拟主播小花', fontSize: 13, fontFamily: 'sans-serif', fill: 'black' });
const icon = VRender.createImage({
  image: 'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VTable/location.svg',
  width: 15,
  height: 15,
  boundsPadding: [0, 0, 0, 10]
});
const text2 = VRender.createText({ text: '梦幻之都', fontSize: 11, fontFamily: 'sans-serif', fill: '#6f7070' });

g21.add(text1);
g21.add(icon);
g21.add(text2);

const g22 = VRender.createGroup({
  display: 'flex',
  background: 'pink',
  width: 200,
  height: 40,
  direction: 'column',
  alignItems: 'center'
});

['游戏', '动漫', '美食'].forEach(text => {
  const tag = new VRenderComponent.Tag({
    visible: true,
    textStyle: {
      fontSize: 10,
      fill: 'rgb(51, 101, 238)',
      textAlign: 'left',
      textBaseline: 'top',
      fontFamily: 'sans-serif'
    },
    space: 4,
    padding: 5,
    shape: {
      fill: '#000'
    },
    text,
    panel: {
      visible: true,
      fill: '#f4f4f2',
      cornerRadius: 5
    },
    marginLeft: 10,
    boundsPadding: [0, 0, 0, 10],
    x: 20,
    y: 10
  });

  g22.add(tag);
});

group.add(g1);
group.add(g2);

g2.add(g21);
g2.add(g22);

const stage = new VRender.Stage({
  container: CONTAINER_ID,
  autoRender: true,
  enableLayout: true
});

stage.defaultLayer.add(group);

window['stage'] = stage;
```
