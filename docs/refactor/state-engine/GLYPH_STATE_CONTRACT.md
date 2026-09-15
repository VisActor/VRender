# Glyph 状态与派生属性契约

Glyph 与普通 Graphic 共用 `baseAttributes + resolvedStatePatch -> attribute`、同状态刷新、状态动画及清空路径。

## 定义来源

- 配置 `glyphStateProxy` 时，由 proxy 决定完整状态贡献；返回空值不回退 `glyphStates` 或 Group。
- 无 proxy、配置非空 `glyphStates` 时，读取其 `.attributes`；`subAttributes` 不自动传播。
- 旧输入按目标状态列表顺序合并，配置 `stateSort` 时先排序，后面的状态覆盖前面的状态；不修改调用方数组。
- 没有旧输入时，完全使用标准状态定义与 Group-first、priority/rank 规则。旧输入与 Group 不隐式逐状态混合。
- 动态值变化但状态名不变时，用 `setStates(names, { animate: false })` 刷新；需要动画时同时设置 `animate` 和 `animateSameStatePatchChange`。

## 派生图形

子图形和编码上下文准备好后调用 `setSubGraphicEncoder(encoder)`。注册时立即同步一次，后续回调读取已提交的 `glyph.attribute`，包括基础更新、状态恢复及动画中间帧。编码器仅修改子图形，不修改宿主属性或宿主状态。

`commitSubGraphicAttributes(child, patch, removedKeys, context)` 在一次提交中更新值并删除已经撤销的 own keys，同时维护子图形基础属性、状态、更新标记及继承关系。上层负责输出键归属；删除后可重新读取当前宿主继承值。不要直接删除 `child.attribute` 的键，也不要用写入 `undefined` 代替属性删除。

更新顺序为：宿主提交、继承绑定、派生同步、外部通知。`skipUpdateCallback` 跳过观察回调和服务通知，但不跳过派生同步；编码器应将 context 传给子图形提交。`onUpdate` 属于观察回调。

clone 保留已编码外观，不复制宿主编码器；独立使用的 clone 应自行注册。release 解除编码器、子图形继承关系并释放子图形。

## 动画中断

内部切换/取消状态停止旧动画后，由状态系统恢复静态真值，不将旧动画终值提交为基础属性。公开 `animate.stop('start' | 'end' | attrs)` 仍是显式静态提交 API。
