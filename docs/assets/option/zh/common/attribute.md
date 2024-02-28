{{ target: common-attribute }}

#${prefix} x(number) = 0

图元 X 坐标位置

#${prefix} y(number) = 0

图元 Y 坐标位置

#${prefix} z(number) = 0

图元 Z 坐标位置（需要开启 3d）

#${prefix} dx(number) = 0

图元 X 方向的偏移

#${prefix} dy(number) = 0

图元 Y 方向的偏移

#${prefix} dz(number) = 0

图元 Z 方向的偏移（需要开启 3d）

#${prefix} scaleX(number) = 1

图元 X 方向的缩放

#${prefix} scaleY(number) = 1

图元 Y 方向的缩放

#${prefix} scaleZ(number) = 1

图元 Z 方向的缩放

#${prefix} angle(number) = 0

图元顺时针方向旋转弧度

#${prefix} anchor([number|string, number|string]) = []

图元旋转锚点

#${prefix} keepDirIn3d(boolean) = false

是否在 3d 中控制方向，false: 不控制方向，true: 始终控制方向朝摄像机

#${prefix} opacity(number) = 1

图元透明度，会同时影响 fill 和 stroke，计算为`opacity * fillOpacity`和`opacity * strokeOpacity`

#${prefix} fill(string|IColor|false) = false

图元填充颜色，支持纯色字符串和渐变色字符串，设置 false 则不填充

#${prefix} fillOpacity(number) = 1

图元 fill 部分的透明度，同时收到 opacity 影响，计算为`opacity * fillOpacity`

#${prefix} stroke(string|IColor|false) = false

图元描边颜色，支持纯色字符串和渐变色字符串，设置 false 则不描边

#${prefix} strokeOpacity(number) = 1

图元 stroke 部分的透明度，同时收到 opacity 影响，计算为`opacity * strokeOpacity`

#${prefix} lineWidth(number) = 1

图元描边的宽度，默认是 1

#${prefix} lineDash(number[]) = []

图元描边的虚线配置

#${prefix} lineDashOffset(number) = 0

图元描边的虚线偏移配置 https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineDashOffset

#${prefix} lineCap("butt"|"round"|"square") = 'butt'

图元描边的线帽配置 https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineCap

#${prefix} lineJoin("round"|"bevel"|"miter") = 'butt'

图元描边的连接处配置 https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineJoin

#${prefix} miterLimit(number) = 10

https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/miterLimit

#${prefix} visible(boolean) = true

元素是否可见

#${prefix} zIndex(number) = 0

元素在当前组中的排序

#${prefix} layout('flex'|'') = ''

元素的布局，flex 仅在开启 flex 布局模式下生效

#${prefix} shadowColor(string|IColor|false) = false

图元的阴影颜色

#${prefix} shadowOffsetX(number) = 0

图元的阴影在 X 方向上的偏移

#${prefix} shadowOffsetY(number) = 0

图元的阴影在 Y 方向上的偏移

#${prefix} shadowBlur(number) = 0

图元的阴影的模糊距离

#${prefix} background(string|HTMLImageElement| HTMLCanvasElement) = ''

图元的背景图片

#${prefix} backgroundMode('repeat'|'repeat-x' | 'repeat-y' | 'no-repeat') = ''

图元的背景图片填充模式

#${prefix} backgroundFit(boolean) = false

图元的背景图片是否正好填充，只在 repeat-x 或者 repeat-y 以及 no-repeat 的时候生效

#${prefix} backgroundCornerRadius(number | number[]) = 0

目前只针对文字生效，配置背景的圆角

#${prefix} texture("circle" | "rect" | "diamond" | "vertical-line" | "horizontal-line" | "bias-lr" | "bias-rl" | "grid") = 0

纹理填充的样式

#${prefix} textureColor(string | false) = false

纹理填充的颜色

#${prefix} textureSize(number) = 10

每一个纹理单元的大小

#${prefix} texturePadding(number) = 2

纹理单元的 padding

#${prefix} cursor(Cursor) = 'default'

鼠标的样式

#${prefix} renderStyle('default' | 'rough') = 'default'

渲染风格，rough 配置 在启用 rough 风格时才会生效

#${prefix} html(Object|null) = null

html 配置，在该图元位置展示配置的 html 元素

##${prefix} dom(string | HTMLElement)

html 的具体 dom 字符串或者 dom 对象

##${prefix} container(string | HTMLElement)

承载 html 内容的容器，默认是 Canvas 的容器

##${prefix} width(number)

dom 的宽度

##${prefix} height(number)

dom 的高度

##${prefix} style(string | Object)

容器的样式

##${prefix} visible(boolean)

html 是否可见

##${prefix} anchorType('position' | 'boundsLeftTop')

html 的定位模式，基于 xy 位置定位，还是基于这个图元包围盒的左上角定位

#${prefix} pickable(boolean) = true

是否支持事件拾取，默认为 true。

#${prefix} fillPickable(boolean) = true

否支持 fill 部分的拾取，默认为 true。

#${prefix} strokePickable(boolean) = true

否支持 stroke 部分的拾取，默认为 true。

#${prefix} childrenPickable(boolean) = true

否支持子节点的拾取，默认为 true。

#${prefix} shadowRootIdx(number) = 1

shadowRoot 在宿主图元的上方还是下方，>0 为下方，<0 为上方

#${prefix} globalZIndex(number) = 0

全局的 zIndex，配置后会提取到交互层，在交互层中进行按顺序绘制

#${prefix} globalCompositeOperation(CanvasRenderingContext2D['globalCompositeOperation']) = ''

对应 Canvas 的 globalCompositeOperation，用来配置滤镜
