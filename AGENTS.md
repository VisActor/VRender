# AGENTS

> 文档类型：项目上下文说明
> 用途：帮助 agent 和维护者快速理解当前仓库
> 约束：本文件不是规范源，不替代正式 README、设计文档、接口定义或测试

## 1. 项目概览

VRender 是 VisActor 生态的底层可视化渲染库，采用 Rush 管理的 monorepo 结构。

仓库同时包含：

- 核心渲染引擎
- 动画系统
- 上层整合包
- React 绑定
- 组件与工具包

对 agent 来说，这个仓库更像“多包协作的渲染平台”，而不是单一 npm 包。

## 2. 主要包与职责

以下是理解仓库时最常用的几个包：

- `packages/vrender-core`
  当前仓库的核心。包含图形模型、Stage/Layer、状态系统、shared-state、性能调度等基础能力。

- `packages/vrender-animate`
  动画系统与时间轴。负责自驱动画、状态动画执行、ticker/timeline 等运行时行为。

- `packages/vrender`
  面向使用者的主整合包，覆盖更接近上层接入方式的公开入口与回归测试。

- `packages/react-vrender`
  React 绑定层，重点关注 Stage 生命周期、host config、reconciler 交互与对象引用适配。

- `packages/vrender-kits`
  图形与环境注册相关能力。

- `packages/vrender-components`
  组件层能力。

如果任务涉及渲染语义、图形属性、状态切换、shared-state、动画执行，通常应先看 `vrender-core` 和 `vrender-animate`；如果任务涉及上层接入行为，再看 `vrender` 或 `react-vrender`。

## 3. 当前核心工程约束

### 3.1 架构与组织

- 仓库使用 Rush 管理。
- 提交前的 git hook 可能触发 `rush lint-staged`。
- 影响 `src` 的改动，经常需要同时关注 compile、test 和 lint。

### 3.2 图形与状态系统

当前状态系统已经完成 D3 重构主线，核心语义包括：

- 静态真值主路径是 `baseAttributes + resolvedStatePatch -> attribute`
- 动画不是新的真值源
- `normalAttrs` 只保留兼容外观，不再承担旧 snapshot/restore 核心职责
- shared-state 采用 `Group-first` 主 ownership

如果任务碰到旧语义与新语义冲突，优先以当前正式设计文档和测试基线为准，不要凭历史实现印象回退。

### 3.3 兼容与接入

- `packages/vrender` 和 `packages/react-vrender` 是判断“上层是否还能正常接入”的重要信号。
- 某些问题并不属于 core 运行时错误，而是上层测试语义或绑定层生命周期需要跟上 core 的新模型。

### 3.4 性能与调用方契约

VRender 是底层可视化渲染库，工程基准应优先服务“正确调用方”的高性能、易用性和可用性，而不是为不标准调用方式在热路径中堆叠兜底逻辑。

- 默认假设公开 API 的调用方遵守文档化契约；不要为了防御任意外部误用而在图元属性、动画帧、状态切换、bounds/render/release 等高频路径增加额外 clone、遍历、深比较、对象创建或多层 fallback。
- 如果发现上层调用顺序或数据 ownership 不符合契约，优先明确契约并修正调用链；只有当兼容边界是正式 API 责任时，才在 VRender 内部提供低成本、可测试的便利接口。
- 修复 bug 时要区分“架构语义缺失”和“补丁式防御”。应优先通过正确的状态机、动画 ownership、静态真值提交点、生命周期边界来保证正确性，而不是让每次属性写入都承担兜底判定。
- 对高频路径的新增逻辑必须考虑对象分配、GC、分支、遍历和调用层级成本；新增安全检查应尽量移动到低频入口、初始化、编译、绑定或显式 debug/observability 路径。
- 涉及重构模块时，不应把旧结构或旧逻辑仅作为 fallback、替代实现或“保留给使用者的入口”继续留在仓库中。任何保留都必须能说明公开契约必要性、维护价值和包体积影响；否则应删除、收口到新主路径，或暴露更窄且可验证的正式入口。
- 性能、易用性、可用性同等重要：VRender 可以提供更便利的正确接口来减少上层重复判断，但这些接口本身应保持薄、明确、可预测，并避免把错误用法变成默认支持的隐形契约。
- 涉及 D3 状态/属性模型、动画、scenegraph lifecycle 的改动，除功能回归外，应尽量给出 targeted benchmark 或端到端分段数据，说明是否影响可视化常规场景。

## 4. 测试与验证入口

这个仓库的验证不能只看单包单测。常见验证入口包括：

- `rush compile -t @visactor/vrender-core`
- `packages/vrender-core` 的 `rushx test`
- `packages/vrender-animate` 的 `rushx test`
- `packages/vrender` 的 `rushx test`
- `packages/react-vrender` 的 `rushx test`
- 受影响上层包的 `rushx compile`

如果任务涉及动画运行时，除了常规单测，还应优先关注：

- ticker / timeline 是否真实推进
- 图形属性在 `t=0 / t=mid / t=end` 的行为
- 动画结束后是否污染静态真值
- remove / detach / reparent / `setStage(null)` 等树操作边界

如果任务涉及 shared-state、状态调度或 deferred，除了功能正确性，还要确认：

- 是否仍满足 strict `paint-only`
- 是否没有把解释逻辑带回 render 热路径
- 是否破坏已建立的 perf / observability 边界

## 5. 文档入口与规范源

本仓库中，项目级上下文说明和规范源要区分开。

### 5.1 规范源

遇到重构、状态引擎、shared-state、性能调度相关问题时，优先查看：

- 根指导文档与架构文档
- 各阶段的 design / execution / implementation log
- 当前测试基线

对 D3 状态引擎重构，统一入口在：

- [state-engine README](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/README.md)

### 5.2 归档与后续项

如果需要快速了解 D3 项目整体结论、归档入口和保留问题，可查看：

- [D3 最终总结](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_FINAL_SUMMARY.md)
- [D3 归档索引](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_ARCHIVE_INDEX.md)
- [D3 后续项](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_FOLLOWUPS.md)

这些文档是归档/导航材料，不是新的规范源。

## 6. 维护提示

- 优先尊重现有设计和测试基线，不要因为看到旧代码痕迹就假设旧语义仍然有效。
- 处理跨包问题时，先区分：
  - core 运行时问题
  - 上层测试语义滞后
  - React 绑定层适配问题
- 提交前注意工作区里是否混有本地辅助文件；这类文件不应默认进仓。
- 如果需要给后续 agent 留长期有效的信息，应优先更新正式文档、README、归档索引或本文件，而不是重新引入“记忆文件”。
