# 自定义图元

VRender提供了很多图元，但是有时候我们需要自定义图元，比如需要有一个能够播放[Lottie](https://lottiefiles.com/)动画的图元等，这时候就需要自定义图元了。VRender自定义图元需要以下几个步骤：

1. 定义一个图元类，该类为`Graphic`的子类，当然你也可以直接继承一个现有的图元类，比如`Rect`、`Circle`等。
2. 实现图元的绘制逻辑，该方法用于对图元的绘制操作。该类为`BaseRender`的子类，同样，你也可以直接继承一个现有的图元绘制类，比如`DefaultCanvasRectRender`、`DefaultCanvasCircleRender`等。
3. 实现图元的拾取逻辑，该方法用于对图元的拾取操作。该类实现了`IGraphicPicker`接口同样，如果你的图元就是矩形的形状，那么可以直接继承`RectPickerBase`。注意的是，在某些场景中（小程序），并不支持基于Canvas的拾取，所以你需要实现一套`MathPicker`逻辑。当然，所有的pick逻辑都并不复杂，我们在下面章节中具体介绍。

接下来，我们将以注册一个`Lottie`图元为例，介绍如何自定义图元。所有的代码均在`@visactor/vrender-kits`包中，效果演示如下。

![](https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/vrender/vrender-custom-graphic-lottie.gif)

注意：在阅读此章节前，建议先阅读[图元](./Graphic)章节。

## 依赖注入

基于依赖注入机制，我们可以很方便的将各种扩展功能注入到VRender中，我们这里的自定义图元的所有功能都需要依赖注入才能实现。我们的依赖注入能力是基于`inversifyJS`改造的，所以API和`inversifyJS`对齐。如果想深入了解的话，建议去看[`inversifyJS`的文档](https://inversify.io/)。

## 准备工作

在开始写代码之前，我们思考一下具体的实现方案：

1. 不难判断，`Lottie`图元是一个矩形区域的图元，而`Lottie`动画在这个图元里进行播放，所以我们可以直接继承`Rect`图元，给其加上播放`Lottie`动画的能力。

2. 我们又发现，Lottie官方提供了一个播放器[lottie-web](https://github.com/airbnb/lottie-web)，能够进行Lottie动画的解析和播放，我们可以直接使用，所以在渲染逻辑中，只需要借助官方的播放器，将画面绘制到我们的图元上即可。

3. 拾取就很简单了，我们并不需要去具体的拾取到Lottie动画中的某个元素，只需要拾取整个Lottie动画播放的区域 -- 也就是我们的图元即可，所以拾取逻辑可直接复用Rect的逻辑

在具体实现之前，我们先看一下Lottie官方提供的播放器是如何播放的[demo](https://codepen.io/collection/nVYWZR/)发现代码很简单，我们只需要将Lottie文件的JSON或者URL传入，然后在我们的图元中进行封装代理一下即可。

## 定义图元类

首先我们需要定义`Lottie`这个图元类，该类继承自`Graphic`，并且拥有`ILottieGraphicAttribute`接口的attribute。
我们首先定义`ILottieGraphicAttribute`接口，它是传给图元的配置接口，用于定义图元的宽高位置属性等。在`Lottie`图元中该接口除了Rect的属性外，还需要增加`data`属性，用于保存Lottie动画的json数据。

```ts
type ILottieAttribute = {
  data: string;
};
type ILottieGraphicAttribute = Partial<IRectGraphicAttribute> & Partial<ILottieAttribute>;

interface ILottie extends IGraphic<ILottieGraphicAttribute> {
  lottieInstance?: AnimationItem; // 保存Lottie播放器的实例
  canvas?: any; // 保存Lottie播放器的canvas实例
}
```

接下来我们通过继承一个Rect图元，实现一个`Lottie`图元。我们只需要给Lottie图元中添加对外部的Lottie播放器的管理逻辑即可，在适当的时候初始化，在图元销毁的时候销毁这个播放器。
```ts
export class Lottie extends Rect implements ILottie {
  type: any = 'lottie';
  declare attribute: ILottieGraphicAttribute;
  declare lottieInstance?: AnimationItem;
  declare canvas?: any;

  static NOWORK_ANIMATE_ATTR = NOWORK_ANIMATE_ATTR;

  constructor(params: ILottieGraphicAttribute) {
    super(params);
    this.numberType = LOTTIE_NUMBER_TYPE;
    this.initLottieWeb(this.attribute.data);
  }

  /* 设置属性的时候，尝试重新初始化Lottie的播放器 */
  setAttributes(params: Partial<ILottieGraphicAttribute>, forceUpdateTag?: boolean, context?: any): void {
    if (params.data) {
      this.initLottieWeb(params.data);
    }
    return super.setAttributes(params, forceUpdateTag, context);
  }

  setAttribute(key: string, value: any, forceUpdateTag?: boolean, context?: any): void {
    if (key === 'data') {
      this.initLottieWeb(value);
    }
    return super.setAttribute(key, value, forceUpdateTag, context);
  }

  getGraphicTheme(): Required<IRectGraphicAttribute> {
    return getTheme(this).rect;
  }

  /* 初始化Lottie的播放器 */
  initLottieWeb(data: string) {
    // 必须是浏览器环境才行
    if (vglobal.env !== 'browser') {
      return;
    }
    if (this.lottieInstance) {
      this.releaseLottieInstance();
    }
    const theme = this.getGraphicTheme();
    const { width = theme.width, height = theme.height } = this.attribute;
    const canvas = vglobal.createCanvas({ width, height, dpr: vglobal.devicePixelRatio });
    const params: any = {
      // wrapper: svgContainer,
      rendererSettings: {
        context: canvas.getContext('2d')
      },
      animType: 'canvas',
      loop: true
    };
    if (typeof data === 'string') {
      params.path = data;
    } else {
      params.animationData = data;
    }
    this.lottieInstance = bodymovin.loadAnimation(params);
    this.canvas = canvas;
    // 在每次Lottie渲染一帧的时候，我们都需要重新渲染一次图元
    this.lottieInstance.addEventListener('drawnFrame', this.renderNextFrame);
  }

  renderNextFrame = () => {
    this.stage.renderNextFrame();
  };

  /* 添加销毁逻辑 */
  release(): void {
    super.release();
    this.releaseLottieInstance();
  }

  releaseLottieInstance() {
    this.lottieInstance.removeEventListener('drawnFrame', this.renderNextFrame);
    this.lottieInstance.destroy();
    this.lottieInstance = null;
  }
}

export function createLottie(attributes: ILottieGraphicAttribute): ILottie {
  return new Lottie(attributes);
}
```

## 定义渲染逻辑

我们的图元已经定义好了，接下来我们需要定义图元的渲染逻辑。我们需要定义一个`DefaultCanvasLottieRender`类，该类继承自`DefaultCanvasRectRender`，并且实现`IGraphicRender`接口。
在这里我们只需要实现一下drawShape接口，Rect渲染的时候接fillCb和strokeCb两个回调函数，在fillCb中，我们需要将Lottie的canvas生成一份pattern绘制到图元上。

```ts
@injectable()
export class DefaultCanvasLottieRender extends DefaultCanvasRectRender implements IGraphicRender {
  type: 'glyph';
  numberType: number = LOTTIE_NUMBER_TYPE;

  drawShape(
    lottie: ILottie,
    context: IContext2d,
    x: number,
    y: number,
    drawContext: IDrawContext,
    params?: IGraphicRenderDrawParams,
    fillCb?: (
      ctx: IContext2d,
      markAttribute: Partial<IMarkAttribute & IGraphicAttribute>,
      themeAttribute: IThemeAttribute
    ) => boolean,
    strokeCb?: (
      ctx: IContext2d,
      markAttribute: Partial<IMarkAttribute & IGraphicAttribute>,
      themeAttribute: IThemeAttribute
    ) => boolean
  ): void {
    const _fillCb = fillCb || (() => this._drawShape.call(this, lottie, context, x, y, drawContext, params));
    super.drawShape(lottie, context, x, y, drawContext, params, _fillCb, strokeCb);
  }

  _drawShape(
    lottie: ILottie,
    context: IContext2d,
    x: number,
    y: number,
    drawContext: IDrawContext,
    params?: IGraphicRenderDrawParams
  ): void {
    const lottieAttribute = this.tempTheme ?? getTheme(lottie, params?.theme).rect;
    const { x: originX = lottieAttribute.x, y: originY = lottieAttribute.y } = lottie.attribute;
    context.setCommonStyle(lottie, lottie.attribute, originX - x, originY - y, lottieAttribute);
    // 设置pattern，绘制lottie
    const canvas = lottie.canvas;
    if (canvas) {
      // const _ctx = canvas.getContext('2d');
      const pattern = context.createPattern(canvas, 'no-repeat');
      const dpr = context.dpr;
      pattern.setTransform && pattern.setTransform(new DOMMatrix([1 / dpr, 0, 0, 1 / dpr, x, y]));
      context.fillStyle = pattern;
    }
    context.fill();
  }
}
```

## 自定义拾取逻辑

我们的Lottie图元已经实现了，接下来我们需要实现一下拾取逻辑。我们需要定义一个`DefaultCanvasLottiePicker`类，该类继承自`RectPickerBase`，并且实现`IGraphicPicker`接口。这里的逻辑就非常简单了，因为我们的拾取就是按照矩形来拾取的，所以继承了矩形的拾取类之后什么都不用做

```ts
@injectable()
export class DefaultCanvasLottiePicker extends RectPickerBase implements IGraphicPicker {
  constructor(@inject(RectRender) public readonly canvasRenderer: IGraphicRender) {
    super();
  }
}
```

## 注册

最后我们需要实现图元注册、渲染注册、拾取注册的逻辑。

1. 图元注册

图元是无需注册的，我们需要注意的一点就是图元的`numberType`字段要和对应的渲染类和拾取类的`numberType`字段一致。

2. 渲染注册

渲染逻辑是需要通过依赖注入的方式注册的

```ts
let loadLottieModule = false;
export const lottieModule = new ContainerModule(bind => {
  if (loadLottieModule) {
    return;
  }
  loadLottieModule = true;
  // lottie渲染器
  bind(DefaultCanvasLottieRender).toSelf().inSingletonScope();
  bind(GraphicRender).toService(DefaultCanvasLottieRender);
});
```

3. 拾取注册

和渲染注册一样，拾取类也是通过依赖注入的方式注册的

```ts
let loadLottiePick = false;
export const lottieCanvasPickModule = new ContainerModule((bind, unbind, isBound, rebind) => {
  if (loadLottiePick) {
    return;
  }
  loadLottiePick = true;
  bind(CanvasLottiePicker).to(DefaultCanvasLottiePicker).inSingletonScope();
  bind(CanvasPickerContribution).toService(CanvasLottiePicker);
});
```

## 使用

接下来，我们在代码中就可以加载`Lottie`图元相关代码，然后使用了。

```ts
container.load(lottieModule);
container.load(lottieCanvasPickModule);

const lottie = createLottie({
  data: 'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/vrender/custom-graphic-lottie-animate.json',
  width: 300,
  height: 300,
  x: 100,
  y: 100,
  cornerRadius: 20,
  background: 'pink'
});

const stage = createStage({
  canvas: 'main',
  autoRender: true
});

stage.defaultLayer.add(lottie);
window['stage'] = stage;
```
