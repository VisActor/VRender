# Graphic 开发细节

1. 所有样式和位置等信息存放在 attribute 属性中，用户传入的属性直接赋值到 attribute
2. 获取属性的时候找不到就从默认主题中查找
3. 渲染的时候是 attribute -> group attribute -> theme attribute
4. 查找的时候 ?? 比 || 性能高
5. setAttribute 时不要遍历属性，Object.keys 和 for in 性能很差
