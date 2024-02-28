{{ target: graphic-rect }}

# Rect

矩形图元

## attribute(any)

矩形图元属性

###${prefix} width(number) = 0

图元宽度

###${prefix} height(number) = 0

图元高度

###${prefix} cornerRadius(number | number[]) = 0

圆角配置

{{ use: common-attribute(
  prefix='##'
) }}

{{ use: common-graphic(
  prefix='#',
  gtype='rect'
) }}
