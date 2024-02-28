{{ target: graphic-group }}

# Group

Group 图元

## attribute(any)

Group 图元属性

###${prefix} width(number) = 0

宽度，用于 clip

###${prefix} height(number) = 0

高度，用于 clip

###${prefix} cornerRadius(number | number[]) = 0

圆角配置。

###${prefix} clip(boolean) = 0

是否裁切

###${prefix} visibleAll(boolean) = true

是否自身以及所有子图元都可见

###${prefix} display('relative' | 'flex') = 'relative'

布局方式，相对布局还是 flex 布局（参考 css）

###${prefix} flexDirection('row' | 'row-reverse' | 'column' | 'column-reverse') = 'row'

参考 css flexDirection

###${prefix} flexWrap('nowrap' | 'wrap') = 'wrap'

参考 css flexWrap

###${prefix} justifyContent('flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around') = 'flex-start'

参考 css justifyContent

###${prefix} alignItems('flex-start' | 'flex-end' | 'center') = 'flex-start'

参考 css alignItems

###${prefix} alignContent('flex-start' | 'center' | 'space-between' | 'space-around') = 'flex-start'

参考 css alignContent

{{ use: common-attribute(
  prefix='##'
) }}

{{ use: common-graphic(
  prefix='#',
  gtype='group'
) }}
