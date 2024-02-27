{{ target: graphic-area }}

# Area

面积图元

## attribute(any)

面积图元属性

###${prefix} points(IPointLike[]) = []

面积图元的点

###${prefix} segments(IAreaSegment[]) = []

面积图元的分段

###${prefix} curveType("linear" | "basis"|"step"|"stepBefore"|"stepAfter"|"monotoneX"|"monotoneY") = 0

曲面类型

###${prefix} clipRange(number) = 1

裁切比例

###${prefix} closePath(boolean) = false

是否要闭合首尾点

{{ use: common-attribute(
  prefix='##'
) }}

{{ use: common-graphic(
  prefix='#',
  gtype='area'
) }}
