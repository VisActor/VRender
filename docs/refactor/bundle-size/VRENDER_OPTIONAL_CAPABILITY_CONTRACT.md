# VRender Optional Capability Contract

> 文档类型：optional 能力拆分契约
> 适用对象：VRender 编码 agent、VChart / VTable 集成 owner、后续 bundle-size 优化 reviewer
> 当前状态：约束与检查清单；不代表所有 optional 能力已经完成拆分

## 目标

包体积优化如果只在 VRender 内部新增一个更窄 subpath，但没有告诉上层如何使用，也没有给最终用户选择是否加载能力的方式，收益很容易停留在理论上。

因此，后续所有“需要上层按场景迁移才能获得收益”的拆分，都必须同时交付三层契约：

| 层级 | 必须交付 | 目的 |
| --- | --- | --- |
| VRender 能力层 | 稳定 public subpath / installer / register；类型出口；full/default 兼容路径 | 让上层不需要 deep import 或 workaround |
| 上层接入层 | VChart / VTable 可复用的 capability map 与 bootstrap 方式 | 让上层能按场景选择能力组合 |
| 用户选择层 | 建议的用户配置形态、默认策略和迁移风险说明 | 让用户能决定是否加载 optional 内容 |

只有 VRender 能力层完成，不代表该项优化闭环完成；它只能算 “VRender 层能力可用”。如果收益依赖上层迁移，文档和 backlog 必须明确写出迁移入口与用户选择方式。

## VRender 能力层要求

新增 optional 能力入口时，优先使用这些形态：

| 能力类型 | 推荐入口形态 | 说明 |
| --- | --- | --- |
| animation custom group | `@visactor/vrender-animate/custom/register-xxx` | 只注册一组 built-in custom animate type |
| graphic / renderer / picker | `@visactor/vrender-kits/register-xxx` 或更窄 installer | 图元、renderer、picker 成组注册，避免只注册一半 |
| media / env / plugin | `@visactor/vrender-kits/installers/xxx` | gif / lottie / rough / dynamicTexture / env plugin 等低频能力 |
| components | `@visactor/vrender-components/<component>` 或 `<family>/<part>` | 保持 root components 兼容，同时提供组件级入口 |

每个入口必须满足：

- 是 package exports 中的 public subpath，不要求上层从 `src`、`es`、`cjs` 或内部文件 deep import。
- import 本身不应产生注册副作用；副作用应收口在 `registerXxx()` / `installXxx()` 调用里。
- full/default register 继续包含原有能力，或者明确由 full bootstrap 调用所有必要子 register。
- 新入口需要有 package export / typesVersions / public-subpath 测试。
- 文档必须列出：注册了哪些能力 key，没注册哪些能力 key，替代 full 入口的风险。
- size ledger 必须记录 full closure 与 narrow closure，不能只记录源码行数。

## 上层接入层要求

VChart / VTable 迁移时，不应该把 VRender optional 能力散落在业务调用点。推荐在上层维护一层 capability bootstrap：

```ts
type VRenderCapability =
  | 'animate-basic'
  | 'animate-richtext'
  | 'animate-disappear'
  | 'animate-full'
  | 'graphic-richtext'
  | 'graphic-image'
  | 'graphic-3d';

export function registerVRenderCapabilities(capabilities: readonly VRenderCapability[]) {
  // 上层统一管理 VRender register / installer 调用。
  // 具体 import 必须来自 VRender public subpath。
}
```

这层 bootstrap 的职责：

- 把上层 chart / component 场景映射到 VRender public capability。
- 保证 register / installer 在创建 Stage、解析动画 type、渲染对应图元之前执行。
- 保留现有默认行为，除非用户显式选择 lite / 按需模式。
- 为动态加载提供单一入口，避免多个业务模块各自 `import()` 同一个 optional 能力。
- 记录 before/after bundle stats，但 owner 判断仍以 VRender 自身 size ledger 和上层场景映射为准。

不推荐：

- 在 mark、component、animation spec 的热路径里临时判断并 import optional 能力。
- 依赖 `@visactor/vrender-animate` root 或 `@visactor/vrender-kits` root 期待 tree-shaking 自动删除未用能力。
- 上层直接 import VRender 内部文件绕过 public subpath。
- 为单个 VChart 场景写 hard-coded VRender workaround，导致 VTable 或外部用户无法复用。

## 用户选择层要求

如果某个收益需要上层按需加载，上层需要给用户一个可理解的选择面，而不是只在内部自动猜测。推荐配置语义：

| 模式 | 建议语义 | 默认风险 |
| --- | --- | --- |
| `full` | 加载当前默认完整能力 | 最兼容，体积最大 |
| `auto` | 上层根据 spec / component 使用情况选择能力 | 体积更小，但需要上层场景识别准确 |
| explicit list | 用户显式声明需要哪些 optional 能力 | 最可控，但需要用户理解能力边界 |
| `lite` / `false` | 只加载基础能力，不加载 optional 内容 | 体积最小，能力缺失需要清晰报错或文档说明 |

用户选择必须能映射回 VRender public capability。若当前 VRender 没有对应 public 入口，应先补 VRender 入口，再推进上层配置，不要让上层长期依赖内部路径。

## 文档更新清单

每个 optional 能力 slice 完成时，至少更新：

- [VRENDER_ON_DEMAND_CAPABILITY_USAGE.md](./VRENDER_ON_DEMAND_CAPABILITY_USAGE.md)：加入当前可用 public capability、上层使用方式、用户选择建议。
- [VRENDER_BUNDLE_BASELINE.md](./VRENDER_BUNDLE_BASELINE.md)：记录 before/after size ledger，包括 full closure 与 narrow closure。
- [VRENDER_BUNDLE_OPTIMIZATION_BACKLOG.md](./VRENDER_BUNDLE_OPTIMIZATION_BACKLOG.md)：更新状态，并标明是否需要 VChart / VTable 迁移。
- 对应 package audit，例如 [VRENDER_ANIMATE_SIZE_AUDIT.md](./VRENDER_ANIMATE_SIZE_AUDIT.md)、components / kits / graphic audit。
- 如果新增 public subpath，更新 package README 或 public-subpath 测试。

## Review Gate

review optional 拆分时，逐项确认：

- VRender root/default/full 行为未变。
- 新能力入口是 public subpath。
- 上层有明确使用方式，不需要猜内部路径。
- 用户有可选模式或未来配置位置。
- 文档说明了漏注册后的行为风险。
- size ledger 同时覆盖源码、entry closure、必要时覆盖 es/cjs 产物。
- 验证覆盖 full register 和 narrow register 两条路径。
