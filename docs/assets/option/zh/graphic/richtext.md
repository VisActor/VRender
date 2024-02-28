{{ target: graphic-richtext }}

# RichText

RichText 图元

## attribute(any)

RichText 图元属性

###${prefix} width(number) = 0

宽度

###${prefix} height(number) = 0

高度

###${prefix} ellipsis(boolean | string) = true

裁切时是否展示...

###${prefix} wordBreak("break-word" | "break-all") = break-all

富文本裁切的格式

###${prefix} verticalDirection("top" | "middle" | "bottom") = break-all

富文本垂直方向的位置

###${prefix} maxHeight(number) = INfinity

最大高度

###${prefix} maxWidth(number) = INfinity

最大宽度

###${prefix} textAlign("center" | "left" | "right") = left

水平对齐

###${prefix} textBaseline("top" | "middle" | "bottom") = top

垂直对齐

###${prefix} layoutDirection("horizontal" | "vertical") = horizontal

布局方向

###${prefix} singleLine(boolean) = false

是否是单行

###${prefix} textConfig(Object)

具体配置

####${prefix} image(string | HTMLImageElement | HTMLCanvasElement)

图片 icon

####${prefix} width(number)

图片宽度

####${prefix} height(number)

图片高度

{{ use: common-text(
  prefix='###'
) }}

{{ use: common-attribute(
  prefix='##'
) }}

{{ use: common-graphic(
  prefix='#',
  gtype='richtext'
) }}
