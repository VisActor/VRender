## 需求

你是一个精通可视化的前端工程师，现在需要制作一批演讲风格的组件，用于在 PPT 中展示观点。
通过抽象发现，虽然 PPT 中展示观点的样式各种各样，但是它们都有共同的特点，不论是普通列表形式，还是类似饼图，金字塔等形状，它们的展示形式都是由标题、内容、icon 组成的。
所以我们可以制作各种各样的组件，而对外只需要一个通用的接口（一个包含标题、内容、icon 的数组）即可。用户只需要切换组件类型，就可以将数据展示成各种样式。

### 如下

```ts
export interface ILiItemAttrs {
  title?: IRichTextGraphicAttribute; // 标题样式
  text?: IRichTextGraphicAttribute; // 内容样式
  icon?: ISymbolGraphicAttribute; // 图标样式
  themeStyle?: string; // 主题风格
}

export interface IStoryListAttrs extends IGroupGraphicAttribute {
  colors: string[]; // 颜色列表，用于配置主题色，具体的映射逻辑组件内部去管理，对外用户只需要配置一个数组即可
  list: ILiItemAttrs[]; // 列表项
  width: number; // 组件宽度
  height: number; // 组件高度
}
```

## 技术方案

这是一个基于 VRender 渲染库的组件项目，所以你将基于 VRender 渲染库进行封来装实现组件效果。

### VRender 介绍

**场景树**
VRender 渲染库基于一颗场景树进行渲染，VRender 提供了一套图元系统，可以方便的创建各种图元，并进行绘制。图元的创建方式有如下几种：

```ts
// Rect可以换成其他图元，格式是类似的
import { createRect, Rect, application } from '@visactor/vrender';

const rectAttr = { x: 0, y: 0, width: 100, height: 100, fill: 'red' };

const rect1 = createRect(rectAttr);
const rect2 = new Rect(rectAttr);
const rect3 = application.graphicService.creator.rect(rectAttr);

const group = createGroup({});

// Group图元拥有createOrUpdateChild方法，可以创建或者更新子图元
group.createOrUpdateChild('rect-1', rectAttr, 'rect');
```

当然，在组件里，最常用的还是 createOrUpdateChild 方法，因为每次更新组件时，组件需要创建或者更新子图元，而通过 createOrUpdateChild 就不需要判断子图元是否存在：

```ts
export class StoryRectList extends AbstractComponent<Required<IStoryListAttrs>> {
  // ...

  render() {
    // 创建一个icon，使用Symbol图元
    this.createOrUpdateChild(
      'icon-1',
      {
        x: corner.iconX,
        y: corner.iconY,
        size: iconSize,
        symbolType: 'circle',
        fill: colors[index] || '#4285F4',
        stroke: colors[index] || '#4285F4',
        lineWidth: 2,
        ...item.icon
      },
      'symbol'
    );
    this.createOrUpdateChild(
      'icon-2',
      {
        x: corner.iconX,
        y: corner.iconY,
        size: iconSize,
        symbolType:
          'M 30 10 Q 20 10 20 20 Q 20 30 30 30 L 70 30 Q 80 30 80 40 Q 80 50 70 50 L 30 50 Q 20 50 20 60 Q 20 70 30 70 L 50 70 L 50 80 L 40 80 L 40 70 Q 20 70 10 60 Q 0 50 10 40 Q 20 30 40 30 L 70 30 Q 80 30 80 20 Q 80 10 70 10 L 50 10 L 50 0 L 40 0 L 40 10 Z',
        fill: colors[index] || '#4285F4',
        stroke: colors[index] || '#4285F4',
        lineWidth: 2,
        ...item.icon
      },
      'symbol'
    );
  }

  // ...
}
```

**特殊 icon 展示**

内置的比如 circle、rect、star 都可以通过 symbolType 来配置，但是如果一些比较复杂的 icon，那就需要通过 symbol 图元的 background 来配置了，比如：

```ts
const svg = `<svg t="1749635137492" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4193" width="200" height="200"><path d="M946.5 505L560.1 118.8l-25.9-25.9c-12.3-12.2-32.1-12.2-44.4 0L77.5 505c-12.3 12.3-18.9 28.6-18.8 46 0.4 35.2 29.7 63.3 64.9 63.3h42.5V940h691.8V614.3h43.4c17.1 0 33.2-6.7 45.3-18.8 12.1-12.1 18.7-28.2 18.7-45.3 0-17-6.7-33.1-18.8-45.2zM568 868H456V664h112v204z m217.9-325.7V868H632V640c0-22.1-17.9-40-40-40H432c-22.1 0-40 17.9-40 40v228H238.1V542.3h-96l370-369.7 23.1 23.1L882 542.3h-96.1z" p-id="4194"></path></svg>`;

export class StoryRectList extends AbstractComponent<Required<IStoryListAttrs>> {
  // ...

  render() {
    // 创建一个icon，使用Symbol图元
    this.createOrUpdateChild(
      'icon-1',
      {
        x: corner.iconX,
        y: corner.iconY,
        size: iconSize,
        symbolType: 'circle', // 显示一个圆形的效果，会clip内部的background，也可以用square或者rect，看具体想要的效果
        background: svg, // 这里是具体的图片/icon配置
        // fill: colors[index] || '#4285F4', 配置了background之后就不能配置fill了，否则fill会盖在background上面
        stroke: colors[index] || '#4285F4',
        lineWidth: 2,
        ...item.icon
      },
      'symbol'
    );
  }

  // ...
}
```

**裁剪**

group 图元支持裁剪，可以通过配置 width 和 height 来确定 group 的大小，然后配置 clip 就能实现裁剪

```ts
const group = createGroup({
  x: 0,
  y: 0,
  width: 100,
  height: 100,
  clip: true
});

// 裁剪的图元需要配置在group的子图元中
// 下面的矩形就只会显示自身的0,0 - 100,100的区域
group.createOrUpdateChild(
  'rect-1',
  {
    x: 0,
    y: 0,
    width: 300,
    height: 300,
    fill: 'red'
  },
  'rect'
);

// 下面的矩形会显示自身的100,100 - 200,200的区域，因为它从group坐标系的-100,-100开始，所以group的0,0位置其实是rect的100,100位置
group.createOrUpdateChild(
  'rect-2',
  {
    x: -100,
    y: -100,
    width: 300,
    height: 300,
    fill: 'red'
  },
  'rect'
);
```

### VRenderComponent 介绍

而组件本身是一个 VRender 的 Group 图元。所有的组件都继承自 AbstractComponent，AbstractComponent 会提供一个 render 函数，会在设置组件属性的时候执行。

具体实现如下：

```ts
export abstract class AbstractComponent<T extends IGroupGraphicAttribute = IGroupGraphicAttribute> extends Group {
  declare attribute: Partial<T>;

  protected mode?: '2d' | '3d';

  protected skipDefault?: boolean;

  protected _skipRenderAttributes: string[] = GROUP_ATTRIBUTES;

  constructor(attributes: T, options?: ComponentOptions) {
    super(attributes);

    if (options?.mode) {
      this.mode = options.mode;

      this.setMode(options.mode);
    }

    if (options?.skipDefault) {
      this.skipDefault = true;
    }
    // 组件需要精准 bounds，所以将这个 strokeBoundsBuffer 设置为 0，否则会影响包围盒的获取
    this.setTheme({
      common: {
        strokeBoundsBuffer: 0
      }
    });
    this.attribute = attributes;
    // 这里调用渲染和事件绑定逻辑
    this.onSetStage(() => {
      this.render();
      this.bindEvents();
    });
  }

  /**
   * @override
   * 更新单个属性值
   * @param key
   * @param value
   * @param forceUpdateTag
   */
  setAttribute(key: string, value: any, forceUpdateTag?: boolean | undefined, context?: ISetAttributeContext): void {
    const params =
      this.onBeforeAttributeUpdate && this.onBeforeAttributeUpdate({ [key]: value }, this.attribute, key, context);
    if (params) {
      return this._setAttributes(params as Partial<T>, forceUpdateTag);
    }

    // overwrite when previous or next attribute is function
    if (
      isPlainObject(this.attribute[key]) &&
      isPlainObject(value) &&
      !isFunction(this.attribute[key]) &&
      !isFunction(value)
    ) {
      merge(this.attribute[key], value);
    } else {
      this.attribute[key] = value;
    }

    // HACK: 待优化
    if (!this._skipRenderAttributes.includes(key as string)) {
      this.render();
    }

    this.valid = this.isValid();
    if (!this.updateShapeAndBoundsTagSetted() && (forceUpdateTag || this.needUpdateTag(key as string))) {
      this.addUpdateShapeAndBoundsTag();
    } else {
      this.addUpdateBoundTag();
    }
    this.addUpdatePositionTag();
    this.onAttributeUpdate();
  }

  setAttributes(params: Partial<T>, forceUpdateTag?: boolean | undefined, context?: ISetAttributeContext): void {
    params =
      (this.onBeforeAttributeUpdate &&
        (this.onBeforeAttributeUpdate(params, this.attribute, null, context) as Partial<T>)) ||
      params;
    return this._setAttributes(params, forceUpdateTag);
  }

  // @ts-ignore
  _setAttributes(params: Partial<T>, forceUpdateTag?: boolean | undefined): void {
    const keys = Object.keys(params) as (keyof T)[];
    this._mergeAttributes(params, keys);

    // HACK: 待优化
    if (!keys.every(key => this._skipRenderAttributes.includes(key as string))) {
      this.render();
    }

    this.valid = this.isValid();
    // 没有设置shape&bounds的tag
    if (!this.updateShapeAndBoundsTagSetted() && (forceUpdateTag || this.needUpdateTags(keys as string[]))) {
      this.addUpdateShapeAndBoundsTag();
    } else {
      this.addUpdateBoundTag();
    }
    this.addUpdatePositionTag();
    this.onAttributeUpdate();
  }

  protected _mergeAttributes(params: Partial<T>, keys?: (keyof T)[]) {
    if (isNil(keys)) {
      keys = Object.keys(params) as (keyof T)[];
    }
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i] as keyof Partial<T>;
      // overwrite when previous or next attribute is function
      if (isPlainObject(this.attribute[key]) && !isFunction(this.attribute[key]) && !isFunction(params[key])) {
        merge(this.attribute[key], params[key]);
      } else {
        this.attribute[key] = params[key];
      }
    }
  }

  protected bindEvents() {
    // please override
  }

  // 核心方法，不同组件重载该函数实现不同的效果
  protected abstract render(): void;

  // 图形元素 id
  protected _getNodeId(id: string) {
    return `${this.id ?? this._uid}-${this.name}-${id}`;
  }

  // 用于 emit 组件自己的事件
  protected _dispatchEvent(eventName: string, details?: Dict<any>) {
    // 封装事件
    const changeEvent = new CustomEvent(eventName, details);
    // FIXME: 需要在 vrender 的事件系统支持
    // @ts-ignore
    changeEvent.manager = this.stage?.eventSystem.manager;

    this.dispatchEvent(changeEvent);
  }

  /** 事件系统坐标转换为stage坐标 */
  protected eventPosToStagePos(e: FederatedPointerEvent) {
    const result = { x: 0, y: 0 };
    // 1. 外部坐标 -> 内部坐标
    const stagePoints = this.stage?.eventPointTransform(e as any) ?? { x: 0, y: 0 }; // updateSpec过程中交互的话, stage可能为空
    // 2. 内部坐标 -> 组件坐标 (比如: 给layer设置 scale / x / y)
    this.globalTransMatrix.transformPoint(stagePoints, result);
    return result;
  }
}
```

而实现不同的组件其实核心就在于重载 render 函数，以便于解析对应的属性，然后生成自己的子节点。可以参考 radio.ts 组件的定义作为例子

```ts
loadRadioComponent();
export class Radio extends AbstractComponent<Required<RadioAttributes>> {
  static defaultAttributes: Partial<RadioAttributes> = {
    interactive: true,
    disabled: false,
    checked: false,
    cursor: 'pointer',
    disableCursor: 'not-allowed',
    spaceBetweenTextAndIcon: 8,
    text: {
      text: 'text',
      fontSize: 14,
      fill: '#000',
      disableFill: 'rgb(201,205,212)',
      textBaseline: 'top',
      pickable: false
    },
    circle: {
      outerRadius: 7,
      innerRadius: 3,
      startAngle: 0,
      endAngle: 2 * Math.PI,
      lineWidth: 1,
      fill: '#fff',
      stroke: 'rgb(229,230,235)',
      disableFill: 'rgb(242,243,245)',
      checkedFill: 'rgb(22, 93, 255)',
      checkedStroke: 'rgb(22, 93, 255)',
      disableCheckedFill: 'rgb(148, 191, 255)',
      disableCheckedStroke: 'rgb(148, 191, 255)',
      pickable: false
    }
  };
  _circle: Arc;
  _text: Text;

  name: 'radio';

  constructor(attributes: RadioAttributes, options?: ComponentOptions) {
    super(options?.skipDefault ? attributes : merge({}, Radio.defaultAttributes, attributes));
    this.renderGroup();

    this.onBeforeAttributeUpdate = (val: any, attributes: any, key: null | string | string[]) => {
      if ('interactive' in val) {
        this.setAttribute('pickable', val.interactive);
      }
      if ('disabled' in val) {
        this.setAttribute('cursor', val.disable ? this.attribute.disableCursor : this.attribute.cursor);
      }
      return undefined;
    };

    this.addEventListener('pointerup', this._handlePointerUp);
  }

  render() {
    this.removeAllChild(true);

    this.renderCircle();
    this.renderText();
    this.layout();
  }

  renderCircle() {
    this._circle = new Arc(merge({}, this.attribute.circle));
    const isChecked = this.attribute.checked;
    if (isChecked && this.attribute.disabled) {
      this._circle.setAttributes({
        fill: this.attribute.circle.disableCheckedFill,
        stroke: this.attribute.circle.disableCheckedStroke
      });
    } else if (isChecked) {
      this._circle.setAttributes({
        fill: this.attribute.circle.checkedFill,
        stroke: this.attribute.circle.checkedStroke
      });
    } else if (this.attribute.disabled) {
      this._circle.setAttributes({
        fill: this.attribute.circle.disableFill
        // stroke: this.attribute.circle.disableFill
      });
    }
    this.appendChild(this._circle);
  }

  renderText() {
    this._text = new Text(merge({}, this.attribute.text));
    if (this.attribute.disabled) {
      this._text.setAttribute('fill', this.attribute.text.disableFill);
    }
    this.appendChild(this._text);
  }

  renderGroup() {
    if (!this.attribute.interactive) {
      this.setAttribute('pickable', false);
    }
    if (this.attribute.disabled) {
      this.setAttribute('cursor', this.attribute.disableCursor);
    }
  }

  layout() {
    const circleHeight = (this.attribute.circle.outerRadius + this.attribute.circle.lineWidth) * 2;
    const textHeight = this._text.AABBBounds.height();
    const maxHeight = Math.max(circleHeight, textHeight);
    const circleY =
      maxHeight / 2 - circleHeight / 2 + this.attribute.circle.outerRadius + this.attribute.circle.lineWidth;
    const textY = maxHeight / 2 - textHeight / 2;

    const circleWidth = (this.attribute.circle.outerRadius + this.attribute.circle.lineWidth) * 2;
    const circleX = this.attribute.circle.outerRadius + this.attribute.circle.lineWidth;
    const textX = circleWidth + this.attribute.spaceBetweenTextAndIcon;

    this._circle.setAttributes({
      x: circleX,
      y: circleY
    });
    this._text.setAttributes({
      x: textX,
      y: textY
    });
  }

  private _handlePointerUp = () => {
    if (this.attribute.disabled || this.attribute.checked) {
      // checked do nothing
      return;
    }
    this.setAttribute('checked', true);

    this._dispatchEvent('radio_checked', {
      eventType: 'radio_checked',
      target: this
    });

    this.stage.renderNextFrame();
  };

  initAttributes(params: RadioAttributes, options?: ComponentOptions) {
    params = options?.skipDefault ? params : merge({}, Radio.defaultAttributes, params);
    super.initAttributes(params);
    this.renderGroup();
    this.render();
  }
}
```

### 参考组件

`StoryArrowList`是一个已经实现了的箭头效果的组件效果，它实现了：

1. 列表的形状是一个水平的箭头，将箭头切成几部分，每个部分对应一个列表项
2. icon 可以配置在箭头的身体居中位置
3. title 和 text 可以配置在箭头身体的上方和下方
4. colors 数组对应的是箭头的颜色，每个颜色对应一个列表项，如果只配置了一个颜色，则会通过 generateColors 生成基于亮度和饱和度的颜色数组
