{{ target: graphic-polygon }}

# Polygon

Polygon 图元

## attribute(any)

Polygon 图元属性

###${prefix} points(IPointLike[]) = ''

polygon 的顶点属性

###${prefix} cornerRadius(number | number[]) = 0

圆角属性

###${prefix} closePath(boolean) = false

是否首尾顶点闭合

{{ use: common-attribute(
  prefix='##'
) }}

{{ use: common-graphic(
  prefix='#',
  gtype='polygon'
) }}
