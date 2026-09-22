# 空状态后的单属性更新失效修复设计

## 目标与证据

修复 `Graphic.setAttribute` 在空状态下首次修改共享属性时丢失增量失效通知的问题，恢复图例文本截断，并保留无状态共享存储和空状态提交优化。

原始用例：<https://bugserver.cn.goofy.app/case?product=chartspace4&fileid=6742e0cd069a5900b45d143b>。
VRender 提交 `0f5ead77a` 为 `useStates` 增加空状态提前返回，使 `selected: {}` 下 `attribute` 和 `baseAttributes` 保持共享。图例先测量 `test1`，再写入 `maxLineWidth`；单属性慢路径直接写共享对象，后续差异检测无法发现变化，沿用未截断缓存。此前用同一构建分别回退提前返回、补齐写入前分离，均恢复 `t…`。

## 已确认方案

用户已确认从公共属性更新契约修复，并授权制定计划、创建分支、实现和提交 PR。

在 `Graphic.setAttribute` 已有慢路径中，写入前调用 `detachAttributeFromBaseAttributes()`，与 `_setAttributes` 和 `commitInternalBaseAttributes` 保持一致。分离只在两者实际共享时发生；普通单属性快速路径保持原状。

图例初始化强制分离会将底层缺陷留给其他调用方，并增加组件分配成本；回退空状态优化会恢复不必要的状态提交。因此本次保留这两处现有行为，在公共写入边界修复。

## 验收条件

- 空 `selected` 状态后的 `setAttribute` 能正确触发几何或纯绘制失效，更新基础值和生效值，清除状态后保留新基础值。
- 重复写入相同值不产生多余失效；已有无状态共享存储和空状态无提交测试仍通过。
- 真实 Canvas 图例中，固定宽度的 label/value 布局能截断超宽 label，并在交互状态切换后保持正确。
- core 源码测试、相关动画测试和组件 Electron 图例测试通过；core 与组件依赖链编译、改动文件 lint 通过。
- 对 10k 图元的普通更新、空状态后首次更新和持续更新提供针对性性能数据，区分必要的首次分离成本与常规路径成本。

## 范围

修改 core 公共属性更新入口并补充 core/组件回归测试；不修改图例布局算法、状态优化、公开类型或依赖版本。基于 `origin/main` 创建 `codex/fix-empty-state-attribute-invalidation`，PR 目标为 `main`。
