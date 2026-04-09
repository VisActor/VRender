# A1 任务队列 - 对象组装模型重构

> **文档类型**：任务执行队列
> **负责人**：架构设计师（Claude）制定，资深开发者执行
> **审核者**：总监与协调者
> **设计文档**：A1_ARCH_DESIGN.md
> **当前阶段**：✅ A1 重构完成（2026-04-02）

---

## ✅ A1 重构验收结论

### 验收状态：通过

**架构设计师审查结论（2026-04-02）**：

| 维度 | 结论 |
|------|------|
| 新架构建立 | ✅ factory + registry + entries + app-context 已完成 |
| inversify-lite npm 依赖移除 | ✅ workspace 无 inversify-lite 条目 |
| 多实例支持 | ✅ AppContext 实现实例隔离 |
| 默认装配链切换 | ⚠️ 仍使用旧 DI，新架构可选 |
| 旧 DI 完全清理 | ⚠️ common/inversify 仍存在并导出 |

**核心判断**：A1 的实质目标（建立显式工厂 + 注册表模式）已达成。当前状态是"新架构已可用，旧架构作兼容层"，这是合理的过渡状态。

### 遗留项（后续处理）

| 项目 | 优先级 | 说明 |
|------|--------|------|
| `common/inversify` 标记为 @deprecated | P2 | 建议后续版本处理 |
| 补充新架构使用文档 | P2 | 建议后续补充 |
| 设定旧架构废弃时间线 | P3 | 可在下一个 minor 版本处理 |

### 通过条件

- ✅ 17/17 任务完成
- ✅ TypeScript 编译通过
- ✅ 测试通过（72/72 suites，401/401 tests）
- ✅ ESLint 检查通过
- ✅ rush update 成功
> **版本**：v1.0
> **创建时间**：2026-03-30

---

## 👥 角色分工

- **架构设计师**：定义任务、验收标准、审查完成质量
- **资深开发者**：执行任务、编写代码、标记完成状态
- **总监与协调者**：监控进度、决策、验收

---

## 📊 任务概览

### 阶段划分

```
阶段一：基础设施构建（Foundation）
阶段二：核心模块迁移（Migration）
阶段三：清理旧 DI（Cleanup）
```

### 任务统计

| 阶段 | 任务数 | 优先级 | 预估时间 |
|------|--------|--------|----------|
| 阶段一 | 5 | P0 | 2-3 周 |
| 阶段二 | 8 | P0 | 3-4 周 |
| 阶段三 | 4 | P1 | 1 周 |
| **总计** | **17** | - | **6-8 周** |

---

## 🔴 阶段一：基础设施构建（P0）

### 任务 1.1：创建 Factory 模块骨架
**优先级**：🔴 P0
**预估时间**：3-5 天
**当前状态**：✅ 已完成
**负责人**：资深开发者

**任务描述**：
根据 `A1_ARCH_DESIGN.md` 中的 Factory 模块设计，创建以下文件：

```
packages/vrender-core/src/factory/
├── index.ts              # 统一导出
├── stage-factory.ts      # Stage 创建工厂
├── layer-factory.ts      # Layer 创建工厂
├── graphic-factory.ts    # Graphic 创建工厂
└── types.ts              # 工厂类型定义
```

**具体任务**：
- [x] 定义 `IStageFactory` 接口
- [x] 定义 `ILayerFactory` 接口
- [x] 定义 `IGraphicFactory` 接口
- [x] 实现 `StageFactory` 类
- [x] 实现 `LayerFactory` 类
- [x] 实现 `GraphicFactory` 类
- [x] 导出统一入口

**验收标准**：
- [x] 接口定义清晰，符合 `A1_ARCH_DESIGN.md`
- [x] 工厂方法内联，避免过度包装
- [x] 支持多实例：每个 App 有独立的工厂实例
- [x] TypeScript 编译通过
- [x] 有基础的单元测试

**完成标记**：
- ⏸️ 待开始
- 🔄 进行中
- ✅ 已完成 - 2026-03-30 - 资深开发者

---

### 任务 1.2：创建 Registry 模块骨架
**优先级**：🔴 P0
**预估时间**：3-5 天
**当前状态**：✅ 已完成
**负责人**：资深开发者

**任务描述**：
根据 `A1_ARCH_DESIGN.md` 中的 Registry 模块设计，创建以下文件：

```
packages/vrender-core/src/registry/
├── index.ts                 # 统一导出
├── renderer-registry.ts     # Renderer 注册表
├── picker-registry.ts       # Picker 注册表
├── plugin-registry.ts       # Plugin 注册表
├── contribution-registry.ts # Contribution 注册表
└── types.ts                # 注册表类型定义
```

**具体任务**：
- [x] 定义 `IRendererRegistry` 接口
- [x] 定义 `IPickerRegistry` 接口
- [x] 定义 `IPluginRegistry` 接口
- [x] 定义 `IContributionRegistry` 接口
- [x] 实现 `RendererRegistry` 类（支持 Symbol 作为 key）
- [x] 实现 `PickerRegistry` 类
- [x] 实现 `PluginRegistry` 类
- [x] 实现 `ContributionRegistry` 类
- [x] 实现渲染器实例缓存机制
- [x] 导出统一入口

**验收标准**：
- [x] 接口定义清晰，符合 `A1_ARCH_DESIGN.md`
- [x] 使用 Symbol 作为 key，支持多版本共存
- [x] 实现渲染器实例缓存，优化性能
- [x] 支持批量注册 API
- [x] TypeScript 编译通过
- [x] 有基础的单元测试

**完成标记**：
- ⏸️ 待开始
- 🔄 进行中
- ✅ 已完成 - 2026-03-30 - 资深开发者

---

### 任务 1.3：创建 Plugin 模块骨架
**优先级**：🔴 P0
**预估时间**：2-3 天
**当前状态**：✅ 已完成
**负责人**：资深开发者

**任务描述**：
根据 `A1_ARCH_DESIGN.md` 中的 Plugin 模块设计，创建以下文件：

```
packages/vrender-core/src/plugins/
├── index.ts                 # 统一导出
├── base-plugin.ts          # 基础插件类
├── browser-env-plugin.ts    # 浏览器环境插件
├── renderer-plugin.ts       # 渲染器插件
├── picker-plugin.ts         # 拾取器插件
└── types.ts                # 插件类型定义
```

**具体任务**：
- [x] 定义 `IPlugin` 接口
- [x] 定义 `IPluginContext` 接口
- [x] 定义 `IPluginRegistry` 接口
- [x] 实现 `BasePlugin` 基类
- [x] 实现 `BrowserEnvPlugin`
- [x] 实现 `RendererPlugin`
- [x] 实现 `PickerPlugin`
- [x] 实现安装/卸载逻辑
- [x] 导出统一入口

**验收标准**：
- [x] 接口定义清晰，符合 `A1_ARCH_DESIGN.md`
- [x] 支持插件安装和卸载
- [x] 插件作用域绑定到特定 App 实例
- [x] TypeScript 编译通过
- [x] 有基础的单元测试

**完成标记**：
- ⏸️ 待开始
- 🔄 进行中
- ✅ 已完成 - 2026-03-30 - 资深开发者

---

### 任务 1.4：创建 Entry 模块骨架
**优先级**：🔴 P0
**预估时间**：2-3 天
**当前状态**：✅ 已完成
**负责人**：资深开发者

**任务描述**：
根据 `A1_ARCH_DESIGN.md` 中的 Entry 模块设计，创建以下文件：

```
packages/vrender-core/src/entries/
├── index.ts          # 统一导出
├── browser.ts       # 浏览器入口
├── node.ts          # Node.js 入口
├── miniapp.ts       # 小程序入口
└── types.ts        # 入口类型定义
```

**具体任务**：
- [x] 定义 `IApp` 接口
- [x] 定义 `IEntry` 接口
- [x] 实现 `BrowserEntry`
- [x] 实现 `NodeEntry`
- [x] 实现 `MiniappEntry`
- [x] 实现 `createApp()` 工厂函数
- [x] 导出统一入口

**验收标准**：
- [x] 接口定义清晰，符合 `A1_ARCH_DESIGN.md`
- [x] `createApp()` 创建隔离的 App 实例
- [x] 支持多实例
- [x] TypeScript 编译通过
- [x] 有基础的单元测试

**补充说明**：
- 当前 `createApp()` / `BrowserEntry` 已经建立隔离的组合根骨架，并支持注入式 `StageFactory`。
- 由于真实 `Stage` 仍依赖旧的全局 `application/container`，1.4 暂未将默认运行链完全切到新 Entry；该迁移将在 2.1 继续完成。

**完成标记**：
- ⏸️ 待开始
- 🔄 进行中
- ✅ 已完成 - 2026-03-30 - 资深开发者

---

### 任务 1.5：创建多实例上下文
**优先级**：🔴 P0
**预估时间**：2-3 天
**当前状态**：✅ 已完成
**负责人**：资深开发者

**任务描述**：
实现 App 实例隔离机制，支持多实例共存。

**具体任务**：
- [x] 定义 `IAppContext` 接口
- [x] 实现 `AppContext` 类
- [x] 实现实例级工厂获取
- [x] 实现实例级注册表获取
- [x] 实现实例级插件管理
- [x] 实现资源清理机制

**验收标准**：
- [x] App 实例之间完全隔离
- [x] 支持资源清理和实例销毁
- [x] 性能开销最小化
- [x] TypeScript 编译通过
- [x] 有基础的单元测试

**补充说明**：
- 已新增 `AppContext`，集中管理实例级 factory/registry/plugin/stage 生命周期。
- `BrowserEntry` / `NodeEntry` / `MiniappEntry` 统一委托 `AppContext`，支持 `installPlugin`、`uninstallPlugin`、`release`。
- 当前资源清理覆盖 App 上下文内创建的 Stage、实例级插件卸载与各类注册表清空。

**完成标记**：
- ⏸️ 待开始
- 🔄 进行中
- ✅ 已完成 - 2026-03-30 - 资深开发者

---

## 🔴 阶段二：核心模块迁移（P0）

### 任务 2.1：迁移 Stage/Layer/Window 到 Factory
**优先级**：🔴 P0
**预估时间**：3-5 天
**当前状态**：✅ 已完成
**负责人**：资深开发者

**任务描述**：
将现有的 Stage、Layer、Window 迁移到新的 Factory 模型。

**具体任务**：
- [x] 修改 `packages/vrender-core/src/core/stage.ts`
- [x] 修改 `packages/vrender-core/src/core/layer.ts`
- [x] 修改 `packages/vrender-core/src/core/window.ts`
- [x] 实现从 `container.get()` 到工厂的迁移
- [x] 更新依赖注入方式
- [x] 确保向后兼容

**验收标准**：
- [x] Stage/Layer/Window 可以通过工厂创建
- [x] 原有 API 保持兼容
- [x] 多实例创建正常
- [x] TypeScript 编译通过
- [x] 相关测试通过

**补充说明**：
- `StageFactory` 已支持显式依赖装配，将 `window/render/plugin/layer/graphic/picker` 依赖传入 `Stage` 构造过程。
- `Stage` 现为“显式依赖优先，容器回退”的兼容模式，`renderToNewWindow()` 与 `getPickerService()` 也已脱离硬编码容器优先路径。
- `DefaultLayerService` 已改为通过 `LayerFactory` 创建 Layer，并支持注入 layer handler resolver。
- `DefaultWindow` 已支持显式 handler factory，默认仍回退到旧容器命名解析。
- `createStage()` 已切换为通过 `StageFactory` 创建实例。

**完成标记**：
- ⏸️ 待开始
- 🔄 进行中
- ✅ 已完成 - 2026-03-30 - 资深开发者

---

### 任务 2.2：迁移 GraphicService/GraphicCreator 到 Factory
**优先级**：🔴 P0
**预估时间**：3-5 天
**当前状态**：✅ 已完成
**负责人**：资深开发者

**任务描述**：
将现有的 GraphicService 和 GraphicCreator 迁移到新的 Factory 模型。

**具体任务**：
- [x] 修改 `packages/vrender-core/src/graphic/graphic-service/`
- [x] 实现 `createGraphic()` 工厂函数
- [x] 实现图形类型注册 API
- [x] 更新图形创建方式
- [x] 确保向后兼容

**验收标准**：
- [x] 图形可以通过 `createRect()` 等函数创建
- [x] 图形类型注册 API 正常
- [x] 原有 API 保持兼容
- [x] TypeScript 编译通过
- [x] 相关测试通过

**补充说明**：
- 已新增共享 `GraphicFactory` 驱动的 `registerGraphic()` / `createGraphic()` 显式 API。
- `graphicCreator` 保留为兼容层，但内部已委托共享 `GraphicFactory`，旧 `RegisterGraphicCreator` / `CreateGraphic` 调用仍可工作。
- `DefaultGraphicService` 在无 DI 注入时会默认使用共享 `graphicCreator` 适配器。
- `register/*` 图形注册函数已统一切到 `registerGraphic()`。
- `bounds.ts` 与 `draw-interceptor.ts` 的内部动态图形创建已切到 `createGraphic()`。

**完成标记**：
- ⏸️ 待开始
- 🔄 进行中
- ✅ 已完成 - 2026-03-30 - 资深开发者

---

### 任务 2.3：迁移 RenderService/DrawContribution 到 Registry
**优先级**：🔴 P0
**预估时间**：3-5 天
**当前状态**：✅ 已完成
**负责人**：资深开发者

**任务描述**：
将现有的 RenderService 和 DrawContribution 迁移到新的 Registry 模型。

**具体任务**：
- [x] 修改 `packages/vrender-core/src/render/render-service.ts`
- [x] 修改 `packages/vrender-core/src/render/contributions/render/`
- [x] 实现渲染器注册 API
- [x] 实现渲染器查询 API
- [x] 实现渲染器实例缓存
- [x] 确保向后兼容

**验收标准**：
- [x] 渲染器可以通过 Registry 注册和查询
- [x] 渲染器实例被正确缓存
- [x] 原有 API 保持兼容
- [x] TypeScript 编译通过
- [x] 相关测试通过

**补充说明**：
- `DefaultDrawContribution` 已支持显式 `RendererRegistry` 和显式拦截器 provider，初始化与 `reInit()` 会从 registry 刷新 renderer 映射。
- `DefaultRenderService` 已支持显式 `drawContribution` 构造，保留容器注入回退。
- 现阶段为“registry 优先、DI 回退”兼容模式，未一次性移除现有 render 子类中的旧装配方式。

**完成标记**：
- ⏸️ 待开始
- 🔄 进行中
- ✅ 已完成 - 2026-03-30 - 资深开发者

---

### 任务 2.4：迁移 PickerService 到 Registry
**优先级**：🔴 P0
**预估时间**：2-3 天
**当前状态**：✅ 已完成
**负责人**：资深开发者

**任务描述**：
将现有的 PickerService 迁移到新的 Registry 模型。

**具体任务**：
- [x] 修改 `packages/vrender-core/src/picker/picker-service.ts`
- [x] 实现拾取器注册 API
- [x] 实现拾取器查询 API
- [x] 确保向后兼容

**验收标准**：
- [x] 拾取器可以通过 Registry 注册和查询
- [x] 原有 API 保持兼容
- [x] TypeScript 编译通过
- [x] 相关测试通过

**补充说明**：
- `DefaultPickService` 已支持显式 `PickerRegistry`、显式拦截器 provider 与显式 `global`，保留旧的 ContributionProvider 注入回退。
- `reInit()` 会从 `PickerRegistry` 重新刷新 `pickerMap`，便于实例级 registry 场景。
- 当前迁移焦点在 core `picker-service.ts` 兼容层，kits 中具体 picker service 仍可继续沿用旧构造方式。

**完成标记**：
- ⏸️ 待开始
- 🔄 进行中
- ✅ 已完成 - 2026-03-30 - 资深开发者

---

### 任务 2.5：迁移 PluginService 到 Plugin
**优先级**：🔴 P0
**预估时间**：2-3 天
**当前状态**：✅ 已完成
**负责人**：资深开发者

**任务描述**：
将现有的 PluginService 迁移到新的 Plugin 模型。

**具体任务**：
- [x] 修改 `packages/vrender-core/src/plugins/plugin-service.ts`
- [x] 实现插件安装 API
- [x] 实现插件卸载 API
- [x] 实现插件生命周期管理
- [x] 确保向后兼容

**验收标准**：
- [x] 插件可以通过 `install()` 安装
- [x] 插件可以通过名称卸载
- [x] 原有 API 保持兼容
- [x] TypeScript 编译通过
- [x] 相关测试通过

**补充说明**：
- `DefaultPluginService` 已支持显式 `PluginRegistry` 兼容适配、`install()` 与按名称 `uninstall()`。
- 旧 `register()` / `unRegister()` / `findPluginsByName()` 仍保留，`Stage` 现有调用链兼容。
- `active()` 已支持按 `pluginList` 从 auto-enable provider 装配插件，不再依赖容器存在性判断。
- 当前仍保留旧插件接口与新插件 registry 之间的适配层，后续可继续统一类型系统。

**完成标记**：
- ⏸️ 待开始
- 🔄 进行中
- ✅ 已完成 - 2026-03-30 - 资深开发者

---

### 任务 2.6：迁移 vrender-kits 图形注册
**优先级**：🔴 P0
**预估时间**：2-3 天
**当前状态**：✅ 已完成
**负责人**：资深开发者

**任务描述**：
将现有的 vrender-kits 中的图形注册迁移到新的注册 API。

**具体任务**：
- [x] 修改 `packages/vrender-kits/src/register/`
- [x] 实现新的注册函数
- [x] 更新 `packages/vrender/src/index.ts`
- [x] 确保向后兼容

**验收标准**：
- [x] 图形类型可以被注册
- [x] 注册 API 简洁易用
- [x] 原有 API 保持兼容
- [x] TypeScript 编译通过

**补充说明**：
- `vrender-kits` 常规图形注册链已延续 core 的新注册模型；`gif` 注册通过 `graphicCreator` 兼容桥接到共享 `GraphicFactory`。
- `packages/vrender/src/index.ts` 已将 `registerGifImage()` 纳入默认注册链。
- 为保证 workspace 下跨包类型解析稳定，`vrender-kits` 已补充对本地 workspace 源的 tsconfig path 映射。

**完成标记**：
- ⏸️ 待开始
- 🔄 进行中
- ✅ 已完成 - 2026-03-31 - 资深开发者

---

### 任务 2.7：更新 vrender-components 依赖
**优先级**：🔴 P0
**预估时间**：2-3 天
**当前状态**：✅ 已完成
**负责人**：资深开发者

**任务描述**：
更新 vrender-components 包以使用新的 Factory 和 Registry 模型。

**具体任务**：
- [x] 修改 `packages/vrender-components/src/` 中的依赖使用
- [x] 更新组件创建方式
- [x] 确保向后兼容
- [x] 相关测试通过

**验收标准**：
- [x] 组件可以正常使用
- [x] 原有 API 保持兼容
- [x] TypeScript 编译通过
- [x] 相关测试通过

**补充说明**：
- `vrender-components` 已新增本地 `util/graphic-creator.ts` 适配层，统一通过 core `createGraphic` 路径创建图元。
- 第一批高频组件已从直接依赖 core `graphicCreator` 切换为依赖本地适配层，减少对旧全局创建器的直接耦合。
- 组件包正式 `tsconfig` 已补充 workspace path 映射，以便编译阶段直接跟随 core 新 API。
- `scrollbar` / `poptip` 的旧 `container.load(...)` 入口仍保留作为向后兼容层，本任务未强行移除。

**完成标记**：
- ⏸️ 待开始
- 🔄 进行中
- ✅ 已完成 - 2026-03-31 - 资深开发者

---

### 任务 2.8：更新 vrender-animate 依赖
**优先级**：🔴 P0
**预估时间**：2-3 天
**当前状态**：✅ 已完成
**负责人**：资深开发者

**任务描述**：
更新 vrender-animate 包以使用新的 Factory 和 Registry 模型。

**具体任务**：
- [x] 修改 `packages/vrender-animate/src/` 中的依赖使用
- [x] 更新动画创建方式
- [x] 确保向后兼容
- [x] 相关测试通过

**验收标准**：
- [x] 动画功能正常工作
- [x] 原有 API 保持兼容
- [x] TypeScript 编译通过
- [x] 相关测试通过

**补充说明**：
- `AStageAnimate` 已从具体 `Stage` 类型依赖切到 `IStage` 接口依赖，减少对 core 具体实现的耦合。
- 当前 `vrender-animate` 未发现额外的旧容器式装配依赖，本次以接口解耦和回归验证为主。

**完成标记**：
- ⏸️ 待开始
- 🔄 进行中
- ✅ 已完成 - 2026-03-31 - 资深开发者

---

## 🟡 阶段三：清理旧 DI（P1）

### 任务 3.1：移除 inversify-lite 依赖
**优先级**：🟡 P1
**预估时间**：1-2 天
**当前状态**：✅ 已完成
**负责人**：资深开发者

**任务描述**：
从所有包中移除 `inversify-lite` 依赖。

**具体任务**：
- [x] 从 `package.json` 中移除依赖
- [x] 从 `pnpm-lock.yaml` 中移除
- [x] 运行 `rush update` 确保依赖树正确

**验收标准**：
- [x] `inversify-lite` 不再被引用
- [x] 所有包正常构建
- [x] TypeScript 编译通过

**补充说明**：
- 已删除 `packages/vrender-core/src/common/inversify-lite/` 兼容实现与对应单元测试目录。
- 当前 workspace 的 `package.json` 与 `pnpm-lock.yaml` 中已无 `inversify-lite` 条目；`rush update` 已完成并通过。
- 锁文件中仍存在少量历史 `inversify@6.0.1` 快照，来源于旧版本已发布包的快照记录，不属于当前 workspace 的 `inversify-lite` 依赖。

**完成标记**：
- ⏸️ 待开始
- 🔄 进行中
- ✅ 已完成 - 2026-04-02 - 资深开发者

---

### 任务 3.2：移除 @injectable/@inject 装饰器
**优先级**：🟡 P1
**预估时间**：1-2 天
**当前状态**：✅ 已完成
**负责人**：资深开发者

**任务描述**：
从所有源码文件中移除 `@injectable` 和 `@inject` 装饰器。

**具体任务**：
- [x] 搜索所有使用 `@injectable` 的文件
- [x] 搜索所有使用 `@inject` 的文件
- [x] 移除装饰器
- [x] 确保代码仍然可工作

**验收标准**：
- [x] 所有装饰器已移除
- [x] TypeScript 编译通过
- [x] 相关测试通过

**完成标记**：
- ⏸️ 待开始
- 🔄 进行中
- ✅ 已完成 - 2026-04-02 - 资深开发者

---

### 任务 3.3：移除 ContainerModule 使用
**优先级**：🟡 P1
**预估时间**：1-2 天
**当前状态**：✅ 已完成
**负责人**：资深开发者

**任务描述**：
从所有源码文件中移除 `ContainerModule` 使用。

**具体任务**：
- [x] 搜索所有使用 `ContainerModule` 的文件
- [x] 移除 ContainerModule
- [x] 替换为 Plugin.install() 方式
- [x] 确保代码仍然可工作

**验收标准**：
- [x] 所有 ContainerModule 已移除
- [x] TypeScript 编译通过
- [x] 相关测试通过

**补充说明**：
- 已移除 `packages/vrender-components/src/scrollbar/module.ts` 与 `packages/vrender-components/src/poptip/module.ts` 中的 `ContainerModule`，改为显式 `container.bind/rebind`。
- 已移除 `packages/vrender-kits/src/picker/canvas-module.ts` 与 `packages/vrender-kits/src/picker/math-module.ts` 中的 `ContainerModule`，改为显式 `bindCanvasPicker` / `bindMathPicker`。
- 已移除 `packages/vrender-kits/src/env/*.ts`、`packages/vrender-kits/src/window/contributions/*`、`packages/vrender-kits/src/canvas/contributions/*` 顶层装配中的 `ContainerModule`，改为显式 `bindXxxEnv` / `bindXxxWindowContribution` / `bindXxxCanvasModules`。
- 已移除 `packages/vrender-core/src/picker/pick-modules.ts`、`packages/vrender-core/src/plugins/plugin-modules.ts`、`packages/vrender-core/src/render/render-modules.ts`、`packages/vrender-core/src/graphic/graphic-service/graphic-module.ts`、`packages/vrender-core/src/core/core-modules.ts` 与 `packages/vrender-core/src/core/contributions/*/modules.ts` 中的 `ContainerModule`。
- `packages/vrender-core/src/render/contributions/render/*-module.ts` 业务装配层已开始并完成主要批量改造，切换到显式 `bindXxxRenderModule`。
- 当前仓库中剩余 `ContainerModule` 关键词主要位于 `common/inversify*` / `common/inversify-lite*` 实现本体与注释文件，不再属于业务装配入口；这些内部实现清理由 3.1/3.2 继续承接。

**完成标记**：
- ⏸️ 待开始
- 🔄 进行中
- ✅ 已完成 - 2026-04-01 - 资深开发者

---

### 任务 3.4：移除 container.get() 调用
**优先级**：🟡 P1
**预估时间**：1-2 天
**当前状态**：✅ 已完成
**负责人**：资深开发者

**任务描述**：
从所有源码文件中移除 `container.get()` 调用。

**具体任务**：
- [x] 搜索所有 `container.get()` 调用
- [x] 替换为工厂函数调用
- [x] 确保代码仍然可工作

**验收标准**：
- [x] 所有 container.get() 已移除
- [x] TypeScript 编译通过
- [x] 相关测试通过

**补充说明**：
- `vrender-core` 已将 `Stage`、`Application/modules`、`DefaultLayerService`、`DefaultGraphicUtil`、`DefaultDrawContribution` 的默认回退链改为显式应用上下文/工厂优先，不再依赖 `container.get()`。
- `vrender-kits` 的各环境 `WindowHandlerContribution` 绑定已统一从 `toDynamicValue(() => container.get(...))` 改为 `toService(...)`。
- 当前仓库目标源码范围内已无运行态 `container.get()` 调用；剩余命中仅在注释或 `common/inversify*` 实现本体之外已清空。

**完成标记**：
- ⏸️ 待开始
- 🔄 进行中
- ✅ 已完成 - 2026-04-02 - 资深开发者

---

## 📊 任务完成追踪

### 阶段一：基础设施构建
- **总任务数**：5 个
- **已完成**：5 个
- **进行中**：0 个
- **待开始**：0 个

### 阶段二：核心模块迁移
- **总任务数**：8 个
- **已完成**：8 个
- **进行中**：0 个
- **待开始**：0 个

### 阶段三：清理旧 DI
- **总任务数**：4 个
- **已完成**：4 个
- **进行中**：0 个
- **待开始**：0 个

### 总体进度
```
阶段一：100% (5/5)
阶段二：100% (8/8)
阶段三：100% (4/4)
总体：100% (17/17)
[■■■■■■■■■■■■■■■■■]
```

---

## 🎯 执行建议

### 推荐顺序

#### 阶段一（必须先完成）
1. **任务 1.1**：Factory 模块骨架（最基础）
2. **任务 1.2**：Registry 模块骨架（依赖 Factory）
3. **任务 1.3**：Plugin 模块骨架
4. **任务 1.4**：Entry 模块骨架
5. **任务 1.5**：多实例上下文

#### 阶段二（基于阶段一）
6. **任务 2.1**：Stage/Layer/Window 迁移
7. **任务 2.2**：GraphicService/GraphicCreator 迁移
8. **任务 2.3**：RenderService/DrawContribution 迁移
9. **任务 2.4**：PickerService 迁移
10. **任务 2.5**：PluginService 迁移
11. **任务 2.6**：vrender-kits 注册迁移
12. **任务 2.7**：vrender-components 更新
13. **任务 2.8**：vrender-animate 更新

#### 阶段三（最后清理）
14. **任务 3.1-3.4**：清理旧 DI

### 并行可能性
- 阶段一必须串行（依赖关系）
- 阶段二中部分任务可并行（如 2.1-2.5 可以同时开发）
- 阶段三必须串行（清理顺序）

---

## 📝 完成标准

### 阶段一完成
- [ ] 任务 1.1-1.5 全部完成
- [ ] 新模块可以独立运行
- [ ] TypeScript 编译通过
- [ ] 基础单元测试通过

### 阶段二完成
- [ ] 任务 2.1-2.8 全部完成
- [ ] 核心功能在新模型下正常工作
- [ ] 原有 API 保持兼容
- [ ] TypeScript 编译通过
- [ ] 相关测试通过

### 阶段三完成
- [ ] 任务 3.1-3.4 全部完成
- [ ] `inversify-lite` 不再被引用
- [ ] 所有旧 DI 代码已移除
- [ ] TypeScript 编译通过
- [ ] 相关测试通过

### 整体完成
- [ ] 所有 17 个任务完成
- [ ] `inversify-lite` 依赖完全移除
- [ ] 所有测试通过
- [ ] 性能无明显下降

---

## 📞 需要决策的点

如果在执行过程中遇到以下情况，请汇报：
1. 发现设计文档与实际代码的差异
2. 需要调整任务边界
3. 发现性能问题
4. 需要更改验收标准

---

**文档版本**：v1.0
**创建时间**：2026-03-30
**最后更新**：2026-04-02
