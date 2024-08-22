{{ target: graphic-arc }}

# Arc

弧形图元

## attribute(any)

弧形图元属性

###${prefix} innerRadius(number) = 0

内半径

###${prefix} outerRadius(number) = 0

外半径

###${prefix} startAngle(number) = 0

起始弧度，0 表示 12 点钟方向并且顺时针方向为正。

###${prefix} endAngle(number) = 0

终止弧度，0 表示 12 点钟方向并且顺时针方向为正。

###${prefix} cornerRadius(number) = 0

用于指定扇形区块的内外圆角半径

###${prefix} padAngle(number) = 0

间隙角度；间隔角度会转换为一个在两个相邻的弧之间的确定的线性距离

###${prefix} cap(boolean) = false

是否给扇区添加一个 cap

###${prefix} forceShowCap(boolean) = false

当 cap = true 并且 使用了渐变填充的时候，自动实现 conical 渐变，也就是环形的渐变

{{ use: common-attribute(
  prefix='##'
) }}

{{ use: common-graphic(
  prefix='#',
  gtype='arc'
) }}
