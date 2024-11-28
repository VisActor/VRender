# 图元

## 介绍

VRender有很多图元，但是它们的使用方法都差不多，因为他们都继承自`Graphic`类，它们都有几乎相同的属性和方法，只是接受的参数不同。下图所示为图元的继承关系图。

![](https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/vrender/vrender-graphic-rel.png)

1. 首先他们都继承自`Node`，所以所有图元都有树的结构。
2. 然后他们都继承自`Graphic`，所以他们都有图元的基础属性和方法比如`x`、`y`、`fill`等。
3. `Graphic`分化出了基本的图元类型比如`Text`、`Rect`、`Arc`等，也有一个特殊的类型`Group`，`Group`可以包含其他的图元，`Group`也可以作为一个图元添加到另一个`Group`图元中。
4. [创建实例](./Create_Instance)章节中介绍的`Stage`和`Layer`就继承自`Group`，同时`VRender`中的组件类型（组件是带有逻辑的特殊组合图元）也继承自`Group`，组件内容可以参考[组件](./Component)章节。
5. VRender中基于基础的组件类型实现了各种各样的组件，比如`poptip`、`axis`、`label`等等。

图元的创建代码如下：

```ts
import { Rect, createRect, Text, createText } from '@visactor/vrender';

const rectAttribute = {
  x: 100,
  y: 100,
  width: 100,
  height: 100,
  fill: 'red'
}
const rect1 = new Rect(rectAttribute);
const rect2 = createRect(rectAttribute);

const textAttribute = {
  x: 100,
  y: 100,
  text: 'hello world',
  fill:'red'
}
const text1 = new Text(textAttribute);
const text2 = createText(textAttribute);

// ...其他图元
```
## 树结构(Node)

图元都继承自Node，所以都有树的结构，图元也提供了一些方法用于操作树结构。树结构是基于链表实现的，但提供了`forEachChildren`方法用于遍历树结构，`insertBefore`，`insertAfter`，`insertInto`，`appendChild`，`removeChild`，`removeAllChild`等方法用于操作树结构。

```ts
interface INode extends Releaseable, IEventElement {
  _prev?: INode;
  _next?: INode;
  _uid: number;
  id?: number | string;
  name?: string;
  type?: string;
  // 父元素
  parent: INode | null;
  // 子元素数量（包含自己）
  count: number;
  // 子元素数量（不包含自己）
  childrenCount: number;
  // 第一个子元素
  firstChild: INode | null;
  // 最后一个子元素
  lastChild: INode | null;
  // 获取所有子元素
  getChildren: () => INode[];
  // 获取在idx位置的子元素
  getChildAt: (idx: number) => INode | null;
  // getChildAt语法糖
  at: (idx: number) => INode | null;
  // 向前插入
  insertBefore: (newNode: INode, referenceNode: INode) => INode | null;
  // 向后插入
  insertAfter: (newNode: INode, referenceNode: INode) => INode | null;
  // 插入到idx位置
  insertInto: (ele: INode, idx: number) => INode | null;
  // 遍历子元素
  forEachChildren: (cb: (n: INode, i: number) => void | boolean, reverse?: boolean) => void;
  // 遍历子元素，异步
  forEachChildrenAsync: (cb: (n: INode, i: number) => Promise<void | boolean> | void | boolean, reverse?: boolean) => Promise<void>;
  // 添加到最后一个子元素
  appendChild: (node: INode, highPerformance?: boolean) => INode | null;
  // appendChild语法糖
  add: (node: INode, highPerformance?: boolean) => INode | null;
  // 删除自己
  delete: () => void;
  // 删除子节点
  removeChild: (node: INode, highPerformance?: boolean) => INode | null;
  // 删除所有子节点
  removeAllChild: (deep?: boolean) => void;
  // 判断是否是node的子节点
  isChildOf: (node: INode) => boolean;
  // 判断是否是node的父节点
  isParentOf: (node: INode) => boolean;
  // 判断是否是node的后代节点
  isDescendantsOf: (node: INode) => boolean;
  // 判断是否是node的祖先节点
  isAncestorsOf: (node: INode) => boolean;
  // 触发事件
  dispatchEvent: (event: Event) => boolean;
  // 返回的是一个布尔值，来表示传入的节点是否为该节点的后代节点。
  containNode: (node: INode) => boolean;
  // 设置该节点的所有后代节点某个属性
  setAllDescendantsProps: (propsName: string, propsValue: any) => any;
  // 根据自定义逻辑查找元素，返回单一图形元素
  find: (callback: (node: INode, index: number) => boolean, deep: boolean) => INode | null;
  // 根据自定义逻辑查找元素，返回匹配的元素集合
  findAll: (callback: (node: INode, index: number) => boolean, deep: boolean) => INode[];
  // 通过用户设置的 id 查找对应的图形元素
  getElementById: (id: string | number) => INode | null;
  // getElementById语法糖
  findChildById: (id: string | number) => INode | null;
  // 通过用户设置的 uid 查找对应的图形元素
  findChildByUid: (uid: number) => INode | null;
  // 通过用户设置的 name 查找对应的图形元素
  getElementsByName: (name: string) => INode[];
  // getElementsByName语法糖
  findChildrenByName: (name: string) => INode[];
  // 通过用户设置的 type 查找对应的图形元素
  getElementsByType: (type: string) => INode[];
}
```

## 图元结构(Graphic)

通过树结构，我们可以构建一个场景树了，但是我们还需要一些属性来描述图元的一些属性，比如位置、大小、颜色等等，所以`Graphic`基类来描述图元的一些属性。所有图元同样可以使用

```ts
interface IGraphic<T extends Partial<IGraphicAttribute> = Partial<IGraphicAttribute>>
  extends INode,
    IAnimateTarget {
  // 图元类型
  type?: GraphicType;
  // 图元类型（数字类型）
  numberType?: number;
  // 绑定到的stage
  stage?: IStage;
  // 绑定到的layer
  layer?: ILayer;
  // 影子节点
  shadowRoot?: IShadowRoot;

  // 是否合法
  valid: boolean;
  // 是否是容器节点（继承自Group）
  isContainer?: boolean;
  // 是否是3d模式（是否应用3d视角）
  in3dMode?: boolean;
  // 属性参数
  attribute: Partial<T>;

  /** 用于实现morph动画场景，转换成bezier曲线渲染 */
  pathProxy?: ICustomPath2D | ((attrs: T) => ICustomPath2D);

  // 获取state图形属性的方法
  stateProxy?: (stateName: string, targetStates?: string[]) => Partial<T>;

  /* 状态相关方法 */
  toggleState: (stateName: string, hasAnimation?: boolean) => void;
  removeState: (stateName: string, hasAnimation?: boolean) => void;
  clearStates: (hasAnimation?: boolean) => void;
  useStates: (states: string[], hasAnimation?: boolean) => void;
  addState: (stateName: string, keepCurrentStates?: boolean, hasAnimation?: boolean) => void;
  hasState: (stateName?: string) => boolean;
  getState: (stateName: string) => Partial<T>;
  // 属性更新前回调
  onBeforeAttributeUpdate?: (
    val: any,
    attributes: Partial<T>,
    key: null | string | string[],
    context?: ISetAttributeContext
  ) => T | undefined;


  readonly AABBBounds: IAABBBounds; // 用于获取当前节点的AABB包围盒
  readonly OBBBounds: IOBBBounds; // 获取OBB包围盒，旋转防重叠需要用
  readonly globalAABBBounds: IAABBBounds; // 全局AABB包围盒
  readonly transMatrix: IMatrix; // 变换矩阵，动态计算
  readonly globalTransMatrix: IMatrix; // 变换矩阵，动态计算

  /**
   * 是否包含某个点（点需要是全局坐标系）
   */
  containsPoint: (x: number, y: number, mode?: IContainPointMode, picker?: IPickerService) => boolean;
  // 设置是2d模式还是3d模式
  setMode: (mode: '3d' | '2d') => void;
  // 是否合法
  isValid: () => boolean;

  // 基于当前transform的变换，字面意思，普通用户尽量别用，拿捏不住的~
  translate: (x: number, y: number) => this;
  translateTo: (x: number, y: number) => this;
  scale: (scaleX: number, scaleY: number, scaleCenter?: IPointLike) => this;
  scaleTo: (scaleX: number, scaleY: number) => this;
  rotate: (angle: number, rotateCenter?: IPointLike) => this;
  rotateTo: (angle: number) => this;
  skewTo: (b: number, c: number) => this;
  // 设置Tag，默认不用调用
  addUpdateBoundTag: () => void;
  addUpdateShapeAndBoundsTag: () => void;
  addUpdateLayoutTag: () => void;
  addUpdatePositionTag: () => void;
  addUpdateGlobalPositionTag: () => void;
  // 供render处理shape缓存tag
  shouldUpdateShape: () => boolean;
  clearUpdateShapeTag: () => void;
  shouldUpdateAABBBounds: () => boolean;
  shouldSelfChangeUpdateAABBBounds: () => boolean;
  shouldUpdateGlobalMatrix: () => boolean;

  // 设置属性
  setAttributes: (params: Partial<T>, forceUpdateTag?: boolean, context?: ISetAttributeContext) => void;

  // 设置单个属性
  setAttribute: (key: string, value: any, forceUpdateTag?: boolean, context?: ISetAttributeContext) => void;

  // 添加影子节点
  attachShadow: () => IShadowRoot;
  // 卸载影子节点
  detachShadow: () => void;

  // 导出JSON配置
  toJson: () => IGraphicJson;

  /** 创建pathProxy */
  createPathProxy: (path?: string) => void;
  /** 将图形转换成CustomPath2D */
  toCustomPath?: () => ICustomPath2D;

  // 克隆对象
  clone: () => IGraphic;
  // 停止动画
  stopAnimates: (stopChildren?: boolean) => void;
  // 获取不用走动画的属性
  getNoWorkAnimateAttr: () => Record<string, number>;
  // 获取主题
  getGraphicTheme: () => T;
}
```

这里涉及到的配置很多，但我们最常用的主要是
- `attribute`：图元的属性
- `setAttributes`：设置属性对象
- `AABBBounds`：获取AABB包围盒
- `transMatrix`：获取变换矩阵
- `type`：图元类型

### attribute
图元属性有很多，具体可以参考[配置文档](/vrender/option/Arc)，几乎图元的所有配置都在这个对象中。包括位置、颜色、样式等等。接下来我们来详细讲解一下这些通用的配置。其中特殊的配置还需要参考[配置文档](/vrender/option/Arc)中具体的图元类型

#### 位置变换配置

首先位置变换配置都是通用的：

```ts
type ITransform = {
  x: number;
  y: number;
  z: number;
  dx: number;
  dy: number;
  dz: number;
  scrollX: number;
  scrollY: number;
  scaleX: number;
  scaleY: number;
  scaleZ: number;
  angle: number; // 旋转角度
  alpha: number; // x轴的转角
  beta: number; // y轴的转角
  scaleCenter: [number | string, number | string]; // 缩放中心
  anchor: [number | string, number | string]; // 基于AABB的锚点位置，用于简单的定位某些path
  anchor3d: [number | string, number | string, number] | [number | string, number | string]; // 3d的锚点位置
  postMatrix: IMatrix; // 后处理矩阵，会在最后乘以之前的变换矩阵
}
```
这些变换配置配置好之后，可以通过`transMatrix`获取到局部变换矩阵，通过`globalTransMatrix`获取到全局变换矩阵。

#### 填充、描边、通用配置

接下来是通用的图元配置，包括填充(`IFillStyle`)、描边(`IStrokeStyle`)、通用(`ICommonStyle`)配置。

```ts
// 渐变色配置
interface IGradientStop {
  offset: number;
  color: string;
}

interface ILinearGradient {
  gradient: 'linear';
  x0?: number;
  y0?: number;
  x1?: number;
  y1?: number;
  stops: IGradientStop[];
}

interface IRadialGradient {
  gradient: 'radial';
  x0?: number;
  y0?: number;
  x1?: number;
  y1?: number;
  r0?: number;
  r1?: number;
  stops: IGradientStop[];
}

interface IConicalGradient {
  gradient: 'conical';
  startAngle?: number;
  endAngle?: number;
  x?: number;
  y?: number;
  stops: IGradientStop[];
}
```

```ts
type IColor = string | ILinearGradient | IRadialGradient | IConicalGradient;
export type IFillType = boolean | string | IColor;

type IFillStyle = {
  fillOpacity: number;
  /* 阴影 */
  shadowBlur: number;
  shadowColor: string;
  shadowOffsetX: number;
  shadowOffsetY: number;
  // 填充色
  fill: IFillType;
};

export type IBorderStyle = Omit<IStrokeStyle, 'outerBorder' | 'innerBorder'> & {
  distance: number | string;
  visible?: boolean;
};

type IStrokeStyle = {
  outerBorder: Partial<IBorderStyle>; // 外描边
  innerBorder: Partial<IBorderStyle>; // 内描边
  strokeOpacity: number;
  lineDash: number[];
  lineDashOffset: number;
  lineWidth: number;
  lineCap: CanvasLineCap;
  lineJoin: CanvasLineJoin;
  miterLimit: number;
  // 描边的boundsBuffer，用于控制bounds的buffer
  strokeBoundsBuffer: number;
  /**
   * stroke - true 全描边
   * stroke - false 不描边
   * stroke 为数值类型，适用于rect\arc等图形，用于配置部分描边的场景，其中
   *
   * 0b00000 - 不描边
   * 0b000001 - top
   * 0b000010 - right
   * 0b000100 - bottom
   * 0b001000 - left
   * 相应的：
   * 0b000011 - top + right
   * 0b000111 - top + right + bottom
   * 0b001111 - 全描边
   *
   * stroke - boolean[]，适用于rect\arc等图形，用于配置部分描边的场景
   */
  stroke: IStrokeType[] | IStrokeType;
};
```

```ts
type ICommonStyle = {
  // 给stroke模式的pick额外加的buffer，用于外界控制stroke区域的pick范围
  pickStrokeBuffer: number;
  // 包围盒的padding
  boundsPadding: number | number[];
  /**
   * 选择模式，精确模式，粗糙模式（包围盒模式），自定义模式
   */
  pickMode: 'accurate' | 'imprecise' | 'custom';
  // 包围盒模式，精确模式，粗糙模式
  boundsMode: 'accurate' | 'imprecise';
  /**
   * 是否支持事件拾取，默认为 true。
   * @default true
   */
  pickable: boolean;
  /**
   * 是否支持fill拾取，默认为 true。
   * @experimental
   * @default true
   */
  fillPickable: boolean;
  /**
   * 是否支持stroke拾取，默认为 true。
   * @experimental
   * @default true
   */
  strokePickable: boolean;
  /**
   * 对于 group 节点，是否支持其子元素的事件拾取，默认为 true。
   * 如果 group `pickable` 关闭，`childrenPickable` 开启，那么 group 的子节点仍参与事件拾取
   * @default true
   */
  childrenPickable: boolean;

  /**
   * 元素是否可见。
   * @default true
   */
  visible: boolean;
  zIndex: number;
  layout: any; // 布局配置（仅在启用布局插件时生效）
  /**
   * 是否隐藏元素（只是绘制的时候不绘制）
   */
  renderable: boolean;
  /**
   * 是否在3d中控制方向
   * false: 不控制方向
   * true: 始终控制方向朝摄像机
   */
  keepDirIn3d?: boolean;
  // 影子节点的顺序
  shadowRootIdx: number;
  // 影子节点的拾取模式
  shadowPickMode?: 'full' | 'graphic';
  // 全局zIndex，会提到最上层，仅在开启交互层生效
  globalZIndex: number;
  // 功能和Canvas的globalCompositeOperation一致
  globalCompositeOperation: CanvasRenderingContext2D['globalCompositeOperation'] | '';
  // 完全支持滚动 | 完全不支持滚动 | 支持x方向的滚动 | 支持y方向的滚动，（仅在开启滚动时生效）
  overflow: 'scroll' | 'hidden' | 'scroll-x' | 'scroll-y';
  // 绘制fill和stroke的顺序，为0表示fill先绘制，1表示stroke先绘制
  fillStrokeOrder: number;
};
```

```javascript livedemo template=vrender
// 注册所有需要的内容
const stage = new VRender.Stage({
  container: CONTAINER_ID,
  autoRender: true
});

const rect = VRender.createRect({
  x: 100,
  y: 100,
  width: 100,
  height: 100,
  fill:'red'
});

const text = VRender.createText({
  x: 100,
  y: 300,
  text: '这是一个demo，随意修改',
  fill: 'red'
});

stage.defaultLayer.add(rect);
stage.defaultLayer.add(text);

window['stage'] = stage;
```

## Group结构(Group)

Group和普通的图元结构类似，在API层面仅仅多了几个方法：

```ts
interface IGroup extends IGraphic<IGroupGraphicAttribute> {
  // 隐藏所有子节点
  hideAll: () => void;
  // 显示所有子节点
  showAll: () => void;

  // 增量渲染时添加子节点
  incrementalAppendChild: (node: INode, highPerformance?: boolean) => INode | null;
  // 增量渲染时清除子节点
  incrementalClearChild: () => void;
  // 创建或更新（如果存在）子节点
  createOrUpdateChild: <T extends keyof GraphicAttributeMap>(
    graphicName: string,
    attributes: GraphicAttributeMap[T],
    graphicType: T
  ) => INode;
}
```

### attribute
Group的属性和普通图元的属性类似，具体可以参考[配置文档](/vrender/option/Group)。Group会多一些布局、裁剪相关的配置，大致特点如下。

1. Group自身是具有形状且能够绘制的，Group默认是矩形，可以传入宽高来绘制。但是也可以传入path数组，传入的path数组就是Group的形状
2. Group可以基于自身的形状进行裁剪，所有超过Group的形状的图元都会被裁剪。
3. Group可以通过visible控制自身是否显示，通过visibleAll控制所有子节点是否显示。
4. Group可以通过display控制子节点的布局方式，支持flex布局（但需要开启flex布局插件）。
5. Group可以通过baseOpacity控制子节点的透明度。

```ts
type IGroupAttribute = {
  path: IGraphic[]; // 自定义形状
  width: number;
  height: number;
  cornerRadius: number | number[];
  // 是否裁剪
  clip: boolean;
  visibleAll: boolean;
  /* flex布局相关（需要开启flex布局插件） */
  display?: 'relative' | 'inner-block' | 'flex';
  flexDirection?: 'row' | 'row-reverse' | 'column' | 'column-reverse';
  flexWrap?: 'nowrap' | 'wrap';
  justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around';
  alignItems?: 'flex-start' | 'flex-end' | 'center';
  alignContent?: 'flex-start' | 'center' | 'space-between' | 'space-around';
  // 基准的透明度，用于控制group下面整体图元的透明度
  baseOpacity?: number;
};
```

```javascript livedemo template=vrender
// 注册所有需要的内容
const stage = new VRender.Stage({
  container: CONTAINER_ID,
  autoRender: true
});

const rect = VRender.createRect({
  x: 100,
  y: 100,
  width: 100,
  height: 100,
  fill:'red'
});

const group = VRender.createGroup({
  x: 100,
  y: 100,
  baseOpacity: 0.5
});
const text = VRender.createText({
  x: 0,
  y: 0,
  text: 'group控制了所有子节点的透明度和位置',
  fill: 'red'
});
group.add(rect);
group.add(text);

stage.defaultLayer.add(group);

window['stage'] = stage;
```

## 组件
所有组件都在`@visactor/vrender-component`包中，具体可以参考[组件文档](/vrender/component)。组件的使用和普通图元类似，且组件都继承自Group，可支持Group的配置，组件差异就只在于attribute中，具体参考组件文档。
