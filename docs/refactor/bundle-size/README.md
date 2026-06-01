# VRender 全局包体积优化专项

> 文档类型：专项上下文 / backlog 入口
> 当前状态：只读审计与优化候选沉淀，不代表包体积优化已经完成
> 约束：本目录只记录当前代码事实、风险和后续验证入口；不要把候选项写成已实现优化

## 背景

VRender 1.1.0 / D3 状态动画重构发布前，状态语义已经收敛，release 前 fallback / alpha API 也已清理。本专项接下来关注 VRender 全局包体积，而不是继续证明 D3 新增代码合理。

当前 VChart line 基础场景中，VRender 相关包占比已经较高，可作为历史外部参照：

| group | rendered | gzip |
| --- | ---: | ---: |
| VChart app | 1097.7k | 225.2k |
| `@visactor/vrender-core` | 934.4k | 231.5k |
| `@visactor/vrender-components` | 293.0k | 72.1k |
| `@visactor/vrender-animate` | 159.9k | 36.0k |
| `@visactor/vutils` | 129.9k | 41.1k |
| `@visactor/vrender-kits` | 113.1k | 37.8k |

这些数据说明后续不能只排查 import / barrel / exports。入口和环境解析问题已经完成主要梳理，下一轮主线应转向 VRender 自身内容大小：core / graphic / render / picker / animate / components / kits 中真实代码量、可选能力、图元内部工具链、parser、text / richtext、path / svg / xml、3D、image / gif / texture，以及 `@visactor/vutils` 的引入方式。VChart bundler stats 只作为外部 smoke 和回归辅助，不再作为 owner 判断的主依据。

## 与 `docs/agent/` 的关系

先读 `docs/agent/`，再读本目录。

- `docs/agent/` 负责当前代码结构、owner、运行时装配和验证入口。
- 本目录在 `docs/agent/` 基础上补包体积视角：VRender 自身代码内容、入口、注册链、图元功能层、组件能力层、可选依赖和外部消费路径。
- 本目录不替代 package exports、README、用户文档或类型定义。

推荐基础文档入口：

- [Agent 文档入口](../../agent/README.md)
- [Package Map](../../agent/VRENDER_PACKAGE_MAP.md)
- [Runtime And Entries](../../agent/VRENDER_RUNTIME_AND_ENTRIES.md)
- [Render / Picker Registry](../../agent/VRENDER_RENDER_PICKER_REGISTRY.md)
- [Graphic Pipeline](../../agent/VRENDER_GRAPHIC_PIPELINE.md)

## 与 D3 状态重构文档的关系

D3 语义不重开。本专项只记录包体积优化上下文。

涉及状态、shared-state、动画静态真值时，仍以 `docs/refactor/state-engine/` 的正式文档和当前测试为准。当前已知 release 口径：

- shared scope 下 `graphic.states` missing fallback 已删除，不是 warning 策略。
- animate 删除的是旧 runtime fallback 读取/写入 `target.animates` 的路径。
- `AnimationStateManager` 仍会把 tracked animates map 暴露到 `graphic.animates` 作为兼容表象。

## 推荐阅读顺序

1. [VRENDER_BUNDLE_BASELINE.md](./VRENDER_BUNDLE_BASELINE.md)：先确认数据口径和已知 baseline。
2. [VRENDER_IMPORT_AND_ENTRY_AUDIT.md](./VRENDER_IMPORT_AND_ENTRY_AUDIT.md)：确认 exports、barrel、sideEffects 和 root / subpath 风险。
3. [VRENDER_OPTIONAL_CAPABILITY_CONTRACT.md](./VRENDER_OPTIONAL_CAPABILITY_CONTRACT.md)：确认 optional 能力拆分必须交付的 VRender / 上层 / 用户三层契约。
4. [VRENDER_ON_DEMAND_CAPABILITY_USAGE.md](./VRENDER_ON_DEMAND_CAPABILITY_USAGE.md)：查看上层如何使用 public narrow entry，以及如何给用户暴露按需加载选择。
5. [VRENDER_RUNTIME_BOOTSTRAP_SIZE_AUDIT.md](./VRENDER_RUNTIME_BOOTSTRAP_SIZE_AUDIT.md)：按 bootstrap -> installer -> register 看默认装配。
6. [VRENDER_GRAPHIC_BUNDLE_COST_INVENTORY.md](./VRENDER_GRAPHIC_BUNDLE_COST_INVENTORY.md)：按图元内部功能层看成本。
7. [VRENDER_CORE_SIZE_RISK_MAP.md](./VRENDER_CORE_SIZE_RISK_MAP.md)：看 core 非图元模块风险。
8. 按 owner 阅读 animate / components / kits / vutils 专项文档；VChart 文档仅作外部消费参考。
9. [VRENDER_BUNDLE_OPTIMIZATION_BACKLOG.md](./VRENDER_BUNDLE_OPTIMIZATION_BACKLOG.md)：领取后续优化候选。
10. [VRENDER_BUNDLE_AGENT_HANDOFF_TEMPLATE.md](./VRENDER_BUNDLE_AGENT_HANDOFF_TEMPLATE.md)：编码 agent 接手模板。

## 后续 Agent 分工建议

| agent | 关注范围 |
| --- | --- |
| package-content agent | 各包 build/es/cjs 内容大小、重复代码、可删除内部代码、可选能力实际代码量 |
| entry/bootstrap agent | `packages/vrender/src/entries/*`、root barrel、shared / shared-browser / shared-browser-lite、legacy sync |
| core/graphic agent | `packages/vrender-core/src/graphic/*`、creator、bounds、path parser、symbol / text / richtext / 3D 图元 |
| render/picker agent | core render modules、kits canvas/math picker、renderer / picker 成组注册 |
| animate agent | `registerAnimate`、custom register、timeline / ticker / executor、state / component animation |
| components agent | components root/subpath exports、组件 register、label/axis/legend/tooltip/crosshair 等默认带入 |
| kits/env/register agent | env、多端 canvas/window contribution、installers、gif/lottie/rough/dynamicTexture |
| vutils/import agent | `@visactor/vutils` root import symbols、版本重复、可收窄入口可行性 |
| VChart integration agent | 外部 smoke、VRender import 路径回归观察；不作为下一轮全包内容优化主线 |

## 当前边界

本目录是优化上下文和 backlog，不代表优化已经完成。所有“建议”“候选”“P0”都需要后续编码 agent 用 VRender 自身 size ledger、bundle analyzer 或 build 产物数据、targeted tests 证明；VChart stats 仅作为外部回归补充。
