{{ target: graphic-tag }}

# Tag

Tag 组件

## attribute(any)

Tag 组件属性

### textStyle(object)

文字样式
{{ use: common-text(
  prefix='###'
) }}

####${prefix} maxLineWidth(number) = Infinity

文字最大行宽

####${prefix} lineHeight(number)

文字行高

####${prefix} direction('horizontal' | 'vertical')

水平布局还是垂直布局

####${prefix} verticalMode(0 | 1)

垂直布局的模式，0 代表默认（横向 textAlign，纵向 textBaseline），1 代表特殊（横向 textBaseline，纵向 textAlign）

####${prefix} wordBreak('break-word' | 'break-all')

文字截断策略

####${prefix} ignoreBuf(boolean)

是否忽略文字 bounds 加的 buffer

####${prefix} heightLimit(number)

行高限制

####${prefix} lineClamp(number)

行数限制

####${prefix} whiteSpace('normal' | 'no-wrap')

是否换行

####${prefix} suffixPosition('start' | 'end' | 'middle')

省略号出现的位置

### shape(object)

文本前的形状配置

####${prefix} symbolType('circle'|'cross'|'diamond'|'square'|'arrow'|'arrowLeft'|'arrowRight'|'arrow2Left'|'arrow2Right'|'wedge'|'thinTriangle'|'triangle'|'triangleUp'|'triangleDown'|'triangleRight'|'triangleLeft'|'stroke'|'star'|'wye'|'rect'|'rectRound'|'roundLine'|string) = 'circle'

形状 的 **path** 字符串（只有 path，不包含其他 svg 标签）

####${prefix} size(number | [number, number]) = 10

形状 的 大小

### panel(object)

背板属性配置

####${prefix} width(number)

背板图元宽度

####${prefix} height(number)

背板图元高度

####${prefix} cornerRadius(number | number[])

背板圆角配置

### space(number)

shape 同文本之间的间距

### padding(number | number[] | {top: number, bottom: number, left: number, right: number})

### minWidth(number)

最小宽度，像素值

### maxWidth(number)

最大宽度，像素值

### textAlwaysCenter(boolean)

文本是否始终居中

### state(object)

状态

{{ use: common-attribute(
  prefix='##'
) }}

{{ use: common-graphic(
  prefix='#',
  gtype='tag'
) }}
