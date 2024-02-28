{{ target: graphic-text }}

# Text

Text 图元

## attribute(any)

Text 图元属性

{{ use: common-text(
  prefix='##'
) }}

###${prefix} maxLineWidth(number) = Infinity

文字最大行宽

###${prefix} lineHeight(number)

文字行高

###${prefix} direction('horizontal' | 'vertical')

水平布局还是垂直布局

###${prefix} verticalMode(0 | 1)

垂直布局的模式，0 代表默认（横向 textAlign，纵向 textBaseline），1 代表特殊（横向 textBaseline，纵向 textAlign）

###${prefix} wordBreak('break-word' | 'break-all')

文字截断策略

###${prefix} ignoreBuf(boolean)

是否忽略文字 bounds 加的 buffer

###${prefix} heightLimit(number)

行高限制

###${prefix} lineClamp(number)

行数限制

###${prefix} whiteSpace('normal' | 'no-wrap')

是否换行

###${prefix} suffixPosition('start' | 'end' | 'middle')

省略号出现的位置

{{ use: common-attribute(
  prefix='##'
) }}

{{ use: common-graphic(
  prefix='#',
  gtype='text'
) }}
