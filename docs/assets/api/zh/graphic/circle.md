{{ target: graphic-circle }}

# Circle

圆形图元

## attribute(any)

圆形图元属性

###${prefix} radius(number) = 0

圆形半径

###${prefix} startAngle(number) = 0

起始弧度，0 表示 12 点钟方向并且顺时针方向为正。

###${prefix} endAngle(number) = 0

结束弧度，0 表示 12 点钟方向并且顺时针方向为正。

{{ use: common-attribute(
  prefix='##'
) }}

{{ use: common-graphic(
  prefix='#',
  gtype='circle'
) }}
