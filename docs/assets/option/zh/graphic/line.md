{{ target: graphic-line }}

# Line

line 图元

## attribute(any)

line 图元属性

###${prefix} points(IPointLike[]) = []

线段图元的点

###${prefix} segments(IAreaSegment[]) = []

线段图元的分段

###${prefix} curveType("linear" | "basis"|"step"|"stepBefore"|"stepAfter"|"monotoneX"|"monotoneY") = 0

线段类型

###${prefix} clipRange(number) = 1

裁切比例

###${prefix} clipRangeByDimension("auto" | "default" | "x" | "y") = 'default'

按照长度裁切还是按照 X 和 Y 方向的投影裁切

###${prefix} closePath(boolean) = false

是否要闭合首尾点

{{ use: common-attribute(
  prefix='##'
) }}

{{ use: common-graphic(
  prefix='#',
  gtype='line'
) }}
