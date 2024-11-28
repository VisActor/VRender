# Primitives

## Introduction

VRender has many primitives, but their usage is similar because they all inherit from the `Graphic` class. They all have almost the same properties and methods, just accepting different parameters. The inheritance diagram of primitives is shown in the following figure.

![](https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/vrender/vrender-graphic-rel.png)

1. Firstly, they all inherit from `Node`, so all primitives have a tree structure.
2. Then they all inherit from `Graphic`, so they all have basic properties and methods of primitives such as `x`, `y`, `fill`, etc.
3. `Graphic` differentiates basic primitive types such as `Text`, `Rect`, `Arc`, etc., and also has a special type `Group`. `Group` can contain other primitives, and `Group` can also be added as a primitive to another `Group`.
4. The `Stage` and `Layer` introduced in the [Creating Instances](./Create_Instance) chapter inherit from `Group`, and the component types in `VRender` (components are special composite primitives with logic) also inherit from `Group`. For more information on components, refer to the [Component](./Component) chapter.
5. Based on the basic component types, `VRender` implements various components such as `poptip`, `axis`, `label`, and so on.

The code for creating primitives is as follows:

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

// ...other primitives
```

## Tree Structure (Node)

Primitives inherit from `Node`, so they all have a tree structure, and primitives also provide some methods for manipulating the tree structure. The tree structure is implemented based on a linked list, but it provides methods like `forEachChildren` for traversing the tree structure, `insertBefore`, `insertAfter`, `insertInto`, `appendChild`, `removeChild`, `removeAllChild`, etc., for manipulating the tree structure.

```ts
interface INode extends Releaseable, IEventElement {
  _prev?: INode;
  _next?: INode;
  _uid: number;
  id?: number | string;
  name?: string;
  type?: string;
  // Parent element
  parent: INode | null;
  // Number of child elements (including self)
  count: number;
  // Number of child elements (excluding self)
  childrenCount: number;
  // First child element
  firstChild: INode | null;
  // Last child element
  lastChild: INode | null;
  // Get all child elements
  getChildren: () => INode[];
  // Get the child element at the idx position
  getChildAt: (idx: number) => INode | null;
  // Syntactic sugar for getChildAt
  at: (idx: number) => INode | null;
  // Insert before
  insertBefore: (newNode: INode, referenceNode: INode) => INode | null;
  // Insert after
  insertAfter: (newNode: INode, referenceNode: INode) => INode | null;
  // Insert at idx position
  insertInto: (ele: INode, idx: number) => INode | null;
  // Traverse child elements
  forEachChildren: (cb: (n: INode, i: number) => void | boolean, reverse?: boolean) => void;
  // Traverse child elements asynchronously
  forEachChildrenAsync: (cb: (n: INode, i: number) => Promise<void | boolean> | void | boolean, reverse?: boolean) => Promise<void>;
  // Append to the last child element
  appendChild: (node: INode, highPerformance?: boolean) => INode | null;
  // Syntactic sugar for appendChild
  add: (node: INode, highPerformance?: boolean) => INode | null;
  // Delete itself
  delete: () => void;
  // Delete child nodes
  removeChild: (node: INode, highPerformance?: boolean) => INode | null;
  // Delete all child nodes
  removeAllChild: (deep?: boolean) => void;
  // Check if it is a child node of node
  isChildOf: (node: INode) => boolean;
  // Check if it is a parent node of node
  isParentOf: (node: INode) => boolean;
  // Check if it is a descendant node of node
  isDescendantsOf: (node: INode) => boolean;
  // Check if it is an ancestor node of node
  isAncestorsOf: (node: INode) => boolean;
  // Trigger event
  dispatchEvent: (event: Event) => boolean;
  // Return a boolean value to indicate whether the passed node is a descendant node of this node.
  containNode: (node: INode) => boolean;
  // Set a certain property for all descendants of this node
  setAllDescendantsProps: (propsName: string, propsValue: any) => any;
  // Find elements based on custom logic, returning a single graphic element
  find: (callback: (node: INode, index: number) => boolean, deep: boolean) => INode | null;
  // Find elements based on custom logic, returning a collection of matching elements
  findAll: (callback: (node: INode, index: number) => boolean, deep: boolean) => INode[];
  // Find the graphic element corresponding to the user-set id
  getElementById: (id: string | number) => INode | null;
  // Syntactic sugar for getElementById
  findChildById: (id: string | number) => INode | null;
  // Find the graphic element corresponding to the user-set uid
  findChildByUid: (uid: number) => INode | null;
  // Find graphic elements corresponding to the user-set name
  getElementsByName: (name: string) => INode[];
  // Syntactic sugar for getElementsByName
  findChildrenByName: (name: string) => INode[];
  // Find graphic elements corresponding to the user-set type
  getElementsByType: (type: string) => INode[];
}
```

## Primitive Structure (Graphic)

Through the tree structure, we can build a scene tree, but we also need some properties to describe some attributes of primitives, such as position, size, color, etc. Therefore, the `Graphic` base class is used to describe some attributes of primitives. All primitives can use

```ts
interface IGraphic<T extends Partial<IGraphicAttribute> = Partial<IGraphicAttribute>>
  extends INode,
    IAnimateTarget {
  // Primitive type
  type?: GraphicType;
  // Primitive type (numeric type)
  numberType?: number;
  // Bound to stage
  stage?: IStage;
  // Bound to layer
  layer?: ILayer;
  // Shadow node
  shadowRoot?: IShadowRoot;

  // Whether it is valid
  valid: boolean;
  // Whether it is a container node (inherits from Group)
  isContainer?: boolean;
  // Whether it is in 3D mode (whether to apply 3D perspective)
  in3dMode?: boolean;
  // Attribute parameters
  attribute: Partial<T>;

  /** Used to implement morph animation scenes, converted to bezier curve rendering */
  pathProxy?: ICustomPath2D | ((attrs: T) => ICustomPath2D);

  // Method to get state graphic attributes
  stateProxy?: (stateName: string, targetStates?: string[]) => Partial<T>;

  /* State-related methods */
  toggleState: (stateName: string, hasAnimation?: boolean) => void;
  removeState: (stateName: string, hasAnimation?: boolean) => void;
  clearStates: (hasAnimation?: boolean) => void;
  useStates: (states: string[], hasAnimation?: boolean) => void;
  addState: (stateName: string, keepCurrentStates?: boolean, hasAnimation?: boolean) => void;
  hasState: (stateName?: string) => boolean;
  getState: (stateName: string) => Partial<T>;
  // Callback before attribute update
  onBeforeAttributeUpdate?: (
    val: any,
    attributes: Partial<T>,
    key: null | string | string[],
    context?: ISetAttributeContext
  ) => T | undefined;


  readonly AABBBounds: IAABBBounds; // Used to get the current node's AABB bounding box
  readonly OBBBounds: IOBBBounds; // Get the OBB bounding box, used for rotation to prevent overlap
  readonly globalAABBBounds: IAABBBounds; // Global AABB bounding box
  readonly transMatrix: IMatrix; // Transformation matrix, dynamically calculated
  readonly globalTransMatrix: IMatrix; // Transformation matrix, dynamically calculated

  /**
   * Whether it contains a point (the point needs to be in global coordinates)
   */
  containsPoint: (x: number, y: number, mode?: IContainPointMode, picker?: IPickerService) => boolean;
  // Set whether it is in 2D mode or 3D mode
  setMode: (mode: '3d' | '2d') => void;
  // Whether it is valid
  isValid: () => boolean;

  // Transformation based on the current transform, literally, try not to use it if you are an ordinary user~
  translate: (x: number, y: number) => this;
  translateTo: (x: number, y: number) => this;
  scale: (scaleX: number, scaleY: number, scaleCenter?: IPointLike) => this;
  scaleTo: (scaleX: number, scaleY: number) => this;
  rotate: (angle: number, rotateCenter?: IPointLike) => this;
  rotateTo: (angle: number) => this;
  skewTo: (b: number, c: number) => this;
  // Set Tag, no need to call by default
  addUpdateBoundTag: () => void;
  addUpdateShapeAndBoundsTag: () => void;
  addUpdateLayoutTag: () => void;
  addUpdatePositionTag: () => void;
  addUpdateGlobalPositionTag: () => void;
  // For render to handle shape cache tags
  shouldUpdateShape: () => boolean;
  clearUpdateShapeTag: () => void;
  shouldUpdateAABBBounds: () => boolean;
  shouldSelfChangeUpdateAABBBounds: () => boolean;
  shouldUpdateGlobalMatrix: () => boolean;

  // Set attributes
  setAttributes: (params: Partial<T>, forceUpdateTag?: boolean, context?: ISetAttributeContext) => void;

  // Set a single attribute
  setAttribute: (key: string, value: any, forceUpdateTag?: boolean, context?: ISetAttributeContext) => void;

  // Add shadow node
  attachShadow: () => IShadowRoot;
  // Detach shadow node
  detachShadow: () => void;

  // Export JSON configuration
  toJson: () => IGraphicJson;

  /** Create pathProxy */
  createPathProxy: (path?: string) => void;
  /** Convert the graphic to CustomPath2D */
  toCustomPath?: () => ICustomPath2D;

  // Clone object
  clone: () => IGraphic;
  // Stop animation
  stopAnimates: (stopChildren?: boolean) => void;
  // Get attributes that do not need to be animated
  getNoWorkAnimateAttr: () => Record<string, number>;
  // Get theme
  getGraphicTheme: () => T;
}
```

The configurations involved here are many, but the most commonly used ones are
- `attribute`: attributes of the primitive
- `setAttributes`: set attribute object
- `AABBBounds`: get the AABB bounding box
- `transMatrix`: get the transformation matrix
- `type`: primitive type

### attribute
There are many primitive attributes, which can be referred to in the [configuration document](/vrender/option/Arc). Almost all configurations of primitives are in this object. This includes position, color, style, etc. Next, we will explain in detail some of these common configurations. For specific configurations, refer to the documentation of the specific primitive type.

#### Position Transformation Configuration

Firstly, the position transformation configurations are common:

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
  angle: number; // Rotation angle
  alpha: number; // Rotation angle around the x-axis
  beta: number; // Rotation angle around the y-axis
  scaleCenter: [number | string, number | string]; // Scaling center
  anchor: [number | string, number | string]; // Anchor position based on AABB, used for simple positioning of certain paths
  anchor3d: [number | string, number | string, number] | [number | string, number | string]; // 3D anchor position
  postMatrix: IMatrix; // Post-processing matrix, will be multiplied by the previous transformation matrix
}
```
Once these transformation configurations are set, you can get the local transformation matrix through `transMatrix` and the global transformation matrix through `globalTransMatrix`.

#### Fill, Stroke, Common Configuration

Next are common primitive configurations, including fill (`IFillStyle`), stroke (`IStrokeStyle`), and common (`ICommonStyle`) configurations.

```ts
// Gradient color configuration
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
  /* Shadow */
  shadowBlur: number;
  shadowColor: string;
  shadowOffsetX: number;
  shadowOffsetY: number;
  // Fill color
  fill: IFillType;
};

export type IBorderStyle = Omit<IStrokeStyle, 'outerBorder' | 'innerBorder'> & {
  distance: number | string;
  visible?: boolean;
};

type IStrokeStyle = {
  outerBorder: Partial<IBorderStyle>; // Outer stroke
  innerBorder: Partial<IBorderStyle>; // Inner stroke
  strokeOpacity: number;
  lineDash: number[];
  lineDashOffset: number;
  lineWidth: number;
  lineCap: CanvasLineCap;
  lineJoin: CanvasLineJoin;
  miterLimit: number;
  // Stroke bounds buffer, used to control the buffer of bounds
  strokeBoundsBuffer: number;
  /**
   * stroke - true Full stroke
   * stroke - false No stroke
   * stroke is a numeric type, applicable to shapes like rect\arc, used to configure partial strokes, where
   *
   * 0b00000 - No stroke
   * 0b000001 - top
   * 0b000010 - right
   * 0b000100 - bottom
   * 0b001000 - left
   * Correspondingly:
   * 0b000011 - top + right
   * 0b000111 - top + right + bottom
   * 0b001111 - Full stroke
   *
   * stroke - boolean[] Applicable to shapes like rect\arc, used to configure partial strokes, where
   */
  stroke: IStrokeType[] | IStrokeType;
};
```

```ts
type ICommonStyle = {
  // Additional buffer added to the pick for stroke mode, used to control the pick range of the stroke area externally
  pickStrokeBuffer: number;
  // Bounds padding
  boundsPadding: number | number[];
  /**
   * Selection mode, accurate mode, rough mode (bounding box mode), custom mode
   */
  pickMode: 'accurate' | 'imprecise' | 'custom';
  // Accurate mode, rough mode for bounds
  boundsMode: 'accurate' | 'imprecise';
  /**
   * Whether event picking is supported, default is true.
   * @default true
   */
  pickable: boolean;
  /**
   * Whether fill picking is supported, default is true.
   * @experimental
   * @default true
   */
  fillPickable: boolean;
  /**
   * Whether stroke picking is supported, default is true.
   * @experimental
   * @default true
   */
  strokePickable: boolean;
  /**
   * For group nodes, whether to pick events of its child elements, default is true.
   * If group `pickable` is turned off and `childrenPickable` is turned on, then the child nodes of the group still participate in event picking
   * @default true
   */
  childrenPickable: boolean;

  /**
   * Whether the element is visible.
   * @default true
   */
  visible: boolean;
  zIndex: number;
  layout: any; // Layout configuration (only effective when the layout plugin is enabled)
  /**
   * Whether to hide the element (just not draw when rendering)
   */
  renderable: boolean;
  /**
   * Whether to control the direction in 3D
   * false: Do not control the direction
   * true: Always control the direction towards the camera
   */
  keepDirIn3d?: boolean;
  // Order of shadow nodes
  shadowRootIdx: number;
  // Shadow node picking mode
  shadowPickMode?: 'full' | 'graphic';
  // Global zIndex, will be brought to the top layer, only effective when the interaction layer is enabled
  globalZIndex: number;
  // Functionality consistent with Canvas's globalCompositeOperation
  globalCompositeOperation: CanvasRenderingContext2D['globalCompositeOperation'] | '';
  // 完全支持滚动 | 完全不支持滚动 | 支持x方向的滚动 | 支持y方向的滚动，（仅在开启滚动时生效）
  overflow: 'scroll' | 'hidden' | 'scroll-x' | 'scroll-y';
  // 绘制fill和stroke的顺序，为0表示fill先绘制，1表示stroke先绘制
  fillStrokeOrder: number;
};
```
```javascript livedemo template=vrender
// Register all required content
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
  text: 'This is a demo, feel free to modify',
  fill: 'red'
});

stage.defaultLayer.add(rect);
stage.defaultLayer.add(text);

window['stage'] = stage;
```

## Group Structure

The Group structure is similar to regular graphic elements, with just a few additional methods at the API level:

```ts
interface IGroup extends IGraphic<IGroupGraphicAttribute> {
  // Hide all child nodes
  hideAll: () => void;
  // Show all child nodes
  showAll: () => void;

  // Add child nodes during incremental rendering
  incrementalAppendChild: (node: INode, highPerformance?: boolean) => INode | null;
  // Clear child nodes during incremental rendering
  incrementalClearChild: () => void;
  // Create or update (if exists) child nodes
  createOrUpdateChild: <T extends keyof GraphicAttributeMap>(
    graphicName: string,
    attributes: GraphicAttributeMap[T],
    graphicType: T
  ) => INode;
}
```

### Attribute
The attributes of a Group are similar to those of regular graphic elements. For more details, please refer to the [configuration document](/vrender/option/Group). The Group has some additional layout and clipping related configurations, summarized as follows:

1. The Group itself has a shape and can be drawn. By default, the Group is a rectangle and can be drawn with specified width and height. However, a path array can also be passed in to define the shape of the Group.
2. The Group can clip elements that exceed its shape.
3. The visibility of the Group itself can be controlled using the `visible` attribute, and the visibility of all child nodes can be controlled using `visibleAll`.
4. The layout of child nodes can be controlled using the `display` attribute, supporting flex layout (requires enabling the flex layout plugin).
5. The opacity of child nodes can be controlled using the `baseOpacity` attribute.

```ts
type IGroupAttribute = {
  path: IGraphic[]; // Custom shape
  width: number;
  height: number;
  cornerRadius: number | number[];
  // Whether to clip
  clip: boolean;
  visibleAll: boolean;
  /* Flex layout related (requires enabling flex layout plugin) */
  display?: 'relative' | 'inner-block' | 'flex';
  flexDirection?: 'row' | 'row-reverse' | 'column' | 'column-reverse';
  flexWrap?: 'nowrap' | 'wrap';
  justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around';
  alignItems?: 'flex-start' | 'flex-end' | 'center';
  alignContent?: 'flex-start' | 'center' | 'space-between' | 'space-around';
  // Base opacity used to control the opacity of all child nodes under the group
  baseOpacity?: number;
};
```

```javascript livedemo template=vrender
// Register all required content
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
  text: 'The group controls the opacity and position of all child nodes',
  fill: 'red'
});
group.add(rect);
group.add(text);

stage.defaultLayer.add(group);

window['stage'] = stage;
```

## Components
All components are included in the `@visactor/vrender-component` package. For more details, please refer to the [component document](/vrender/component). The usage of components is similar to regular graphic elements, as components inherit from Group and support Group configurations. The only difference lies in the attributes, which are specific to each component. Please refer to the component document for more details.
