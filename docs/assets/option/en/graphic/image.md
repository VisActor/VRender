{{ target: graphic-image }}

# Image

Image 图元

## attribute(any)

Image 图元属性

###${prefix} width(number) = 0

宽度，用于 clip

###${prefix} height(number) = 0

高度，用于 clip

###${prefix} repeatX("repeat" | "no-repeat") = 0

是否在 X 方向重复

###${prefix} repeatY("repeat" | "no-repeat") = 0

是否在 Y 方向重复

###${prefix} image(string | HTMLImageElement | HTMLCanvasElement) = ''

图片 URL，svg 或者 image dom

###${prefix} cornerRadius(number | number[]) = 0

圆角配置

{{ use: common-attribute(
  prefix='##'
) }}

{{ use: common-graphic(
  prefix='#',
  gtype='image'
) }}
