{{ target: graphic-symbol }}

# Symbol

Symbol 图元

## attribute(any)

Symbol 图元属性

###${prefix} symbolType('circle'|'cross'|'diamond'|'square'|'arrow'|'arrowLeft'|'arrowRight'|'arrow2Left'|'arrow2Right'|'wedge'|'thinTriangle'|'triangle'|'triangleUp'|'triangleDown'|'triangleRight'|'triangleLeft'|'stroke'|'star'|'wye'|'rect'|'rectRound'|'roundLine'|string) = 'circle'

SVG 的 path 字符串

###${prefix} size(number | [number, number]) = 10

SVG 的 大小

{{ use: common-attribute(
  prefix='##'
) }}

{{ use: common-graphic(
  prefix='#',
  gtype='symbol'
) }}
