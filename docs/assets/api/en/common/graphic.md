{{ target: common-graphic }}

#${prefix} type(string) = ${gtype}

图元类型

#${prefix} children(IGraphic[]) = []

孩子节点

#${prefix} shadowRoot(IShadowRoot) = []

影子节点

#${prefix} valid(boolean) = false

该图元是否合法

#${prefix} parent(IGroup|null) = null

该图元的父节点

#${prefix} isContainer(boolean)

该图元是否是容器图元

#${prefix} AABBBounds(IAABBBounds)

该图元的包围盒

#${prefix} globalAABBBounds(IAABBBounds)

该图元的全局包围盒

#${prefix} transMatrix(IMatrix)

该图元的变换矩阵

#${prefix} globalTransMatrix(IMatrix)

该图元的全局变换矩阵

#${prefix} initAttributes()()

初始化图元的属性，参数为：

- params: Partial<T>

#${prefix} setAttributes()()

设置图元的属性，参数为：

- params: Partial<T>
- forceUpdateTag?: boolean
- context?: ISetAttributeContext

#${prefix} setAttribute()()

设置图元的属性，参数为：

- key: string
- value: any
- forceUpdateTag?: boolean
- context?: ISetAttributeContext

#${prefix} attachShadow()()

添加影子节点

#${prefix} detachShadow()()

删除影子节点

#${prefix} toJson()()

将该图元以及子图元导出成 json

#${prefix} clone()()

克隆该图元

#${prefix} translate()()

基于当前位置偏移变换，参数为：

- x: number
- y: number

#${prefix} translateTo()()

偏移到某点的变换，参数为：

- x: number
- y: number

#${prefix} scale()()

基于当前的缩放变换，参数为：

- scaleX: number
- scaleY: number
- scaleCenter?: IPointLike

#${prefix} scaleTo()()

缩放到某个大小的变换，参数为：

- scaleX: number
- scaleY: number

#${prefix} rotate()()

旋转变换，参数为：

- angle: number
- rotateCenter?: IPointLike

#${prefix} rotateTo()()

旋转到某个角度的变换，参数为：

- angle: number

#${prefix} animate()()

添加动画

#${prefix} stateProxy()()

状态配置函数
