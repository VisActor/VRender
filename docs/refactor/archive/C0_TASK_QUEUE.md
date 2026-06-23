# C0 任务队列 - Major 前置准备（Phase 0）

> **文档类型**：任务执行队列
> **负责人**：架构设计师（Claude）制定，资深开发者执行
> **审核者**：总监与协调者
> **前置文档**：C1_TASK_QUEUE.md（Major 清理预研）
> **当前阶段**：✅ Phase 3 已完成，待审核
> **目标**：在下一个 minor 版本中完成，为 major 清理铺路

---

## 👥 角色分工

- **架构设计师**：定义任务、验收标准、审查完成质量
- **资深开发者**：执行任务、编写代码、标记完成状态
- **总监与协调者**：监控进度、决策、验收

---

## 📋 vglobal 策略决策（已确认）

**决策**：vglobal 保留为全局环境单例，不迁移到 app-scoped。

**理由**：
- vglobal 不是 DI 系统的组成部分，它是全局环境工具单例
- 提供 `env` 检测、`getRequestAnimationFrame`、`getCancelAnimationFrame` 等本质上全局的能力
- 每个 canvas 都在同一个浏览器环境里，这些能力不需要也不应该 app-scoped 化
- 13 个源码消费文件无需迁移，vglobal 保留

**vglobal 在 major 清理时的处理**：
- major 清理时**不是删除 vglobal**
- vglobal 不再作为 `modules.ts` 导出链的一部分，而是作为独立的全局环境工具保留
- 从 `container.ts` 的导出链中解耦，改为从 `application.global` 或独立的全局环境模块提供

---

## 🟡 子任务 0.1：迁移 canvas/util.ts（P1，阻塞路径）

**优先级**：🟡 P1
**预估时间**：1-2 小时
**当前状态**：✅ 已完成
**负责人**：资深开发者

**任务描述**：
将 `canvas/util.ts` 中的 `wrapCanvas()` 和 `wrapContext()` 从 `container.getNamed` 改为使用 `application.canvasFactory` / `application.context2dFactory`。

**具体任务**：
- [x] 确认 `application.canvasFactory` 和 `application.context2dFactory` 的当前状态
- [x] 如果 factory 还不完整，先补齐
- [x] 修改 `wrapCanvas()`：移除 `container.getNamed<ICanvasFactory>(CanvasFactory, application.global.env)`，改为从 `application` 获取
- [x] 修改 `wrapContext()`：同理
- [x] 确保 `canvas/util.ts` 不再 import `container`
- [x] 确保 TypeScript 编译通过
- [x] 确保 canvas 相关测试通过

**执行结果**：
- `packages/vrender-core/src/canvas/util.ts` 已改为通过 `application.canvasFactory` / `application.context2dFactory` 解析 canvas 与 context 工厂
- `packages/vrender-core/src/modules.ts` 已补齐默认 factory 注册，确保现有启动链继续工作
- 已新增 `packages/vrender-core/__tests__/unit/core/canvas-util.test.ts` 并通过回归验证

**验收标准**：
- [x] `canvas/util.ts` 不再依赖 `container`
- [x] TypeScript 编译通过
- [x] canvas 相关测试通过

---

## 🟡 子任务 0.2：补齐 vrender 根包 app-scoped 启动路径（P1，核心）

**优先级**：🟡 P1
**预估时间**：3-4 小时
**当前状态**：✅ 已完成
**负责人**：资深开发者

**任务描述**：
为 `@visactor/vrender` 根包补齐 app-scoped 替代入口，替代 `preLoadAllModule()` + `loadBrowserEnv(container)` + 无参 `register*()` 的组合语义。

**具体任务**：
- [x] 分析当前 `vrender/src/index.ts` 的启动链
- [x] 创建 vrender 包级别的 entries 入口（如 `vrender/src/entries/`），基于 `createBrowserApp()` / `createNodeApp()`
- [x] 为无参 register helper 创建 app-aware 版本（接收 app 参数）
- [x] 为 env 初始化创建 app-scoped 版本
- [x] 保持旧入口 deprecated 但可工作（为 Phase 1 切断铺垫）
- [x] 确保新入口可以独立完成全部初始化
- [x] 确保 TypeScript 编译通过
- [x] 确保 vrender 包测试通过

**执行结果**：
- 已新增 `packages/vrender/src/entries/`，提供 `createBrowserVRenderApp()`、`createNodeVRenderApp()` 和统一 bootstrap 入口
- `packages/vrender/src/index.ts` 已改为通过 `bootstrapLegacyVRenderRuntime()` 保持旧根入口行为，同时公开新的 app-scoped entries
- Phase 0 的新入口已能独立完成初始化，但内部仍复用 legacy bootstrap 逻辑，作为 major 前的兼容桥接

**验收标准**：
- [x] 新 app-scoped 入口可以独立完成全部初始化
- [x] 旧入口保留 deprecated 但可工作
- [x] TypeScript 编译通过
- [x] vrender 包测试通过

---

## 🟡 子任务 0.3：决定 vglobal 与新架构的共存关系（P1）

**优先级**：🟡 P1
**预估时间**：1 小时
**当前状态**：✅ 已完成
**负责人**：资深开发者 + 架构设计师

**任务描述**：
确定 vglobal 的定位：从 `container.ts` 导出链中解耦，改为独立的全局环境工具。

**具体任务**：
- [x] 确认 vglobal 当前从 `modules.ts` 导出的路径
- [x] 从 `container.ts` 导出链中解耦 vglobal
- [x] 决定 vglobal 的提供方式：
  - 从 `application.global` 提供（当前已是）
  - 从独立的全局环境模块提供
  - 从 `vrender-core/src/global.ts` 导出（绕过 modules.ts）
- [x] 确保 13 个源码消费文件继续正常工作
- [x] 确保 TypeScript 编译通过
- [x] 更新相关文档

**执行结果**：
- 已新增 `packages/vrender-core/src/global.ts` 作为 `vglobal` 的独立全局模块入口
- `packages/vrender-core/src/modules.ts` 现通过独立模块转出 `vglobal`，兼容旧路径但不再让其绑定在 container 导出链上
- 已补充 `packages/vrender-core/src/legacy/bootstrap.ts`，将 legacy bootstrap 逻辑与 `vglobal` 提供方式解耦

**验收标准**：
- [x] vglobal 不再从 `container.ts` 导出链中获取
- [x] 13 个消费文件继续正常工作
- [x] TypeScript 编译通过

---

## 🟢 子任务 0.4：清理公开类型泄漏（P2）

**优先级**：🟢 P2
**预估时间**：1-2 小时
**当前状态**：✅ 已完成
**负责人**：资深开发者

**任务描述**：
清理源码中对 `Container` / `ContainerModule` 类型的直接引用。

**具体任务**：
- [x] 清理 `vrender-kits/src/env/*` 中的 `type Container`
- [x] 清理 `vrender-kits/src/canvas/contributions/modules.ts` 中的 `type Container`
- [x] 清理 browser test / demo 中对 `ContainerModule` 的 import
- [x] 清理对 `common/inversify` 类型的直接引用（如有）
- [x] 确保 TypeScript 编译通过

**执行结果**：
- 已新增 `packages/vrender-kits/src/common/legacy-container.ts`，用兼容别名替代公开源码中的 `type Container`
- `vrender-kits` 运行时代码已不再直接 import 旧 DI `Container` 类型
- 本任务范围不包含 `vrender-core/src/common/inversify` 内部兼容实现，以及 `react-vrender` 中与 DI 无关的 `Container` 业务类型别名

**验收标准**：
- [x] 源码中不再出现对旧 DI 类型的直接 import
- [x] TypeScript 编译通过

---

## 🟢 子任务 0.5：处理测试和示例中的旧 DI（P2）

**优先级**：🟢 P2
**预估时间**：1-2 小时
**当前状态**：✅ 已完成
**负责人**：资深开发者

**任务描述**：
清理 browser test / demo 中的 `container.load()`、`container.bind()` 等旧 DI 使用。

**具体任务**：
- [x] 搜索 browser test / demo 中使用 `container.load()`、`ContainerModule`、`container.bind()` 的位置
- [x] 将测试改为"每测例创建独立 app + mock plugin"模式（可选，如果改动过大可降级为添加 deprecated 注释）
- [x] 或为这些位置添加明确的 deprecated 注释，标记为 major 时需要迁移
- [x] 确保测试仍能通过

**执行结果**：
- 已完成 browser fixture / demo 扫描，并定位仍依赖旧 DI 的页面与样例
- Phase 0 采取降级策略：对仍保留的 browser fixture 统一补充 deprecated 注释，明确它们是 major 迁移跟踪点
- 相关稳定测试已保持通过，避免在本阶段扩大样例改造范围

**验收标准**：
- [x] 测试可通过
- [x] 旧 DI 使用位置有明确标注或已迁移

---

## 🟡 子任务 0.6：输出正式迁移指南（P1）

**优先级**：🟡 P1
**预估时间**：1-2 小时
**当前状态**：✅ 已完成
**负责人**：资深开发者 + 架构设计师

**任务描述**：
将 `C1_TASK_QUEUE.md` 中的迁移指南草稿整理为正式文档。

**具体任务**：
- [x] 基于 C1 预研中的迁移指南草稿
- [x] 补充 vglobal 策略决策（保留为全局环境单例）
- [x] 补充 Phase 0 中新创建的 app-scoped 入口使用说明
- [x] 整理为可对外发布的格式
- [x] 保存到合适位置（如 `packages/vrender-core/MIGRATION_GUIDE.md` 或作为 `NEW_ARCH_GUIDE.md` 的一部分）

**执行结果**：
- 已将 `NEW_ARCH_GUIDE.md` 整理为正式迁移指南，覆盖旧入口到 app-scoped 入口的对照说明
- 文档已纳入 `vglobal` 保留策略、Phase 0 新入口用法、迁移步骤与测试建议
- 指南明确说明：Phase 0 新入口已可用，但仍通过兼容 bootstrap 承接旧默认初始化链

**验收标准**：
- [x] 迁移指南内容完整、可执行
- [x] 有具体的代码对照示例
- [x] 格式适合对外发布

---

## 📊 任务完成追踪

### 统计信息
- **总任务数**：6 个
- **已完成**：6 个
- **进行中**：0 个
- **待开始**：0 个

### 当前进度
```
进度：100% (6/6)
[████████████████████████████████████████████████████████████████]
```

---

## ✅ 完成标准

### Phase 0 整体完成
- [x] 子任务 0.1：canvas/util.ts 不再依赖 container
- [x] 子任务 0.2：vrender 根包 app-scoped 入口可用
- [x] 子任务 0.3：vglobal 与新架构共存关系明确
- [x] 子任务 0.4：公开类型泄漏清理完成
- [x] 子任务 0.5：测试和示例中的旧 DI 已标注或迁移
- [x] 子任务 0.6：正式迁移指南完成
- [x] TypeScript 编译通过
- [x] 所有单元测试通过
- [x] ESLint 检查通过
- [x] Phase 0 验收通过

---

## 🔵 Phase 1 执行记录 - 切断默认全局初始化

> **阶段目标**：移除 `import './modules'` 副作用，停止 `@visactor/vrender` 根包默认 legacy bootstrap，保留旧 API 文件但切断默认初始化链路。
> **阶段状态**：✅ 已完成

### 子任务 P1.1：移除 modules 副作用导入

**当前状态**：✅ 已完成

- [x] 读取 `packages/vrender-core/src/index.ts`
- [x] 移除 `import './modules'`
- [x] 评估 `package.json` 的 `sideEffects` 声明
- [x] 验证旧根入口 `createStage()` 不再依赖 `modules` 导入副作用初始化
- [x] 确认移除后显式访问路径继续正常工作

**执行结果**：
- `packages/vrender-core/src/index.ts` 已移除 `import './modules'`
- `packages/vrender-core/src/modules.ts` 已改为懒配置 legacy application 代理，不再在模块导入时触发 `preLoadAllModule()`
- `packages/vrender-core/src/global.ts` 已改为惰性 `vglobal` 代理，避免导入即解析 legacy singleton
- `packages/vrender-core/src/create.ts` 已显式调用 `configureLegacyApplication()`，确保旧 `createStage()` 深导入路径仍能工作
- `packages/vrender-core/package.json` 的 `sideEffects` 保持不变，因为 `modules.ts` 仍承担兼容 application 绑定副作用

### 子任务 P1.2：停止 vrender 根包 legacy bootstrap

**当前状态**：✅ 已完成

- [x] 读取 `packages/vrender/src/index.ts`
- [x] 移除 `bootstrapLegacyVRenderRuntime()` 默认调用
- [x] 读取并修改 `packages/vrender/src/entries/bootstrap.ts`
- [x] 移除 `bootstrapVRenderBrowserApp()` / `bootstrapVRenderNodeApp()` 中的 `preLoadAllModule()` 调用
- [x] 验证 `createBrowserVRenderApp()` / `createNodeVRenderApp()` 可独立工作

**执行结果**：
- `packages/vrender/src/index.ts` 不再在导入时执行 `bootstrapLegacyVRenderRuntime()`
- `packages/vrender/src/entries/bootstrap.ts` 中 browser/node bootstrap 已停止显式 `preLoadAllModule()` 调用
- `packages/vrender/src/legacy.ts` 新增旧根入口适配层，旧 `createStage()` 现改为懒创建默认 app 后再委托

### 子任务 P1.3：验证旧根入口最终状态

**当前状态**：✅ 已完成

- [x] 确认旧 `createStage()` 在移除默认初始化后的行为
- [x] 决策旧根入口采用“重定向”而非删除
- [x] 确保 `vrender` 包测试通过

**执行结果**：
- 旧根入口 `createStage()` 保留，但已重定向到 `createBrowserVRenderApp()` / `createNodeVRenderApp()` 创建的默认 app
- `packages/vrender-core/src/graphic/graphic.ts` 的 `attachShadow()` 已补上无注册时的本地 `shadowRoot` 兜底，修复根包不再自动 bootstrap 后的直接图形调用缺口
- 根包导入现在不再自动完成 legacy bootstrap；只有显式 app 入口或旧 `createStage()` 被调用时，才会进入对应初始化链

### Phase 1 验证结果

- [x] `packages/vrender-core` -> `rushx compile` 通过
- [x] `packages/vrender` -> `rushx compile` 通过
- [x] `packages/vrender-core` 稳定测试通过：`79/79 suites`，`435/435 tests`
- [x] `packages/vrender` 稳定测试通过：`14/14 suites`，`48/48 tests`，`2 skipped`
- [x] 新增回归测试通过：
  - `packages/vrender-core/__tests__/unit/core/index-side-effect.test.ts`
  - `packages/vrender/__tests__/unit/index.test.ts`
  - `packages/vrender/__tests__/unit/entries.test.ts`

### Phase 1 结论

- [x] 默认 `modules` 导入副作用已切断
- [x] 根包默认 legacy bootstrap 已切断
- [x] 旧 `createStage()` 已重定向并保持兼容
- [x] Phase 1 验收通过

---

## 🟣 Phase 2 执行记录 - 移除 container 公开入口

> **阶段目标**：移除 `container` 的公开导出，迁掉剩余 runtime fallback；`container.ts` 文件本身保留，仅供 `legacy/bootstrap.ts` 使用。
> **阶段状态**：✅ 已完成

### 子任务 P2.1：移除 container 公开导出

**当前状态**：✅ 已完成

- [x] 修改 `packages/vrender-core/src/index.ts`
- [x] 移除 `export * from './container'`
- [x] 保留 `packages/vrender-core/src/container.ts` 供内部 legacy 使用
- [x] 确保 `vrender-core` 编译通过

**执行结果**：
- `packages/vrender-core/src/index.ts` 已移除 `container` 公开导出
- 根入口新增窄化的 legacy binding helper 导出：
  - `getLegacyBindingContext()`
  - `ILegacyBindContext`
  - `ILegacyBindingContext`
- `packages/vrender-core/src/legacy/bootstrap.ts` 现在作为唯一公开兼容 binding 入口，外部不再拿到原始 container 实例

### 子任务 P2.2：迁掉内部剩余 container fallback

**当前状态**：✅ 已完成

- [x] 搜索 `vrender-core` 内部剩余 `container` 依赖（排除 `legacy/bootstrap.ts`）
- [x] 迁移 `core/layer-service.ts`
- [x] 迁移 `core/window.ts`
- [x] 迁移 `render/contributions/render/draw-contribution.ts`
- [x] 使用 `application / factory / registry` 替代 runtime container fallback
- [x] 确保 `vrender-core` 编译通过

**执行结果**：
- `packages/vrender-core/src/core/layer-service.ts` 已完全切到 `application.layerHandlerFactory`
- `packages/vrender-core/src/core/window.ts` 已完全切到 `application.windowHandlerFactory`
- `packages/vrender-core/src/render/contributions/render/draw-contribution.ts` 已完全切到 `application.incrementalDrawContributionFactory`
- `packages/vrender-core/src/modules.ts` 已补齐 `application.windowHandlerFactory` 的 legacy 兼容配置
- 当前 `vrender-core` 源码中对 `container.ts` 的直接 import 仅剩 `packages/vrender-core/src/legacy/bootstrap.ts`

### 子任务 P2.3：替换 vrender-kits 的 container 类型泄漏

**当前状态**：✅ 已完成

- [x] 收口 `packages/vrender-kits/src/common/legacy-container.ts`
- [x] 调整 `packages/vrender-kits/src/env/*.ts` 函数签名
- [x] 替换 `register/*`、`picker/*`、`canvas/contributions/*` 中对公开 container 的依赖
- [x] 同步处理 `vrender-components` 和 `vrender` 的兼容调用点
- [x] 确保 `vrender-kits` / `vrender-components` / `vrender` 编译通过

**执行结果**：
- `vrender-kits` 的 env 初始化函数现在统一支持：
  - `loadBrowserEnv(ctx?)`
  - `loadNodeEnv(ctx?)`
  - `loadAllEnv(ctx?)`
  - 以及其他 miniapp env 的 `ctx?` 兼容入口
- `packages/vrender-kits/src/common/legacy-container.ts` 已从 `typeof container` 切换为基于 `ILegacyBindingContext` 的窄化类型别名
- `vrender-kits` 的 register / picker / canvas helper 已统一改用 `getLegacyBindingContext()`
- `packages/vrender-components/src/scrollbar/module.ts`、`packages/vrender-components/src/poptip/module.ts`、`packages/vrender-components/setup-mock.js` 已同步迁移
- `packages/vrender/src/entries/bootstrap.ts` 已停止向 env loader 传递原始 `container`

### 子任务 P2.4：验证公开 API

**当前状态**：✅ 已完成

- [x] 搜索整个仓库 `from '@visactor/vrender-core' import container` 的位置
- [x] 确认运行态源码已无外部直接依赖 `container`
- [x] 运行相关编译与稳定测试
- [x] 补充 Phase 2 结论

**执行结果**：
- 运行态源码范围内，`@visactor/vrender-core` 的 `container` 公开依赖已清零
- 仓库级扫描剩余命中仅在：
  - `packages/vrender-core/CLAUDE.md`
  - browser fixture / demo 页面
- 这些剩余位置不属于运行态源码，也不进入当前稳定测试轨道；已作为后续文档/fixture 清理边界保留

### Phase 2 验证结果

- [x] `packages/vrender-core` -> `rushx compile` 通过
- [x] `packages/vrender-kits` -> `rushx compile` 通过
- [x] `packages/vrender-components` -> `rushx compile` 通过
- [x] `packages/vrender` -> `rushx compile` 通过
- [x] `packages/vrender-core` 稳定测试通过：`79/79 suites`，`435/435 tests`
- [x] `packages/vrender-kits` 稳定测试通过：`19/19 suites`，`49/49 tests`
- [x] `packages/vrender-components` 稳定测试通过：`29/29 suites`，`88/88 tests`
- [x] `packages/vrender` 稳定测试通过：`14/14 suites`，`48/48 tests`，`2 skipped`
- [x] Phase 2 相关文件定向 ESLint 通过：`0 error / 0 warning`
- [x] 关键回归测试通过：
  - `packages/vrender-core/__tests__/unit/core/index-side-effect.test.ts`
  - `packages/vrender-kits/__tests__/unit/env/browser-env.test.ts`
  - `packages/vrender-kits/__tests__/unit/env/node-env.test.ts`
  - `packages/vrender-kits/__tests__/unit/env/all-env.test.ts`
  - `packages/vrender-kits/__tests__/unit/register/register-gif.test.ts`
  - `packages/vrender-components/__tests__/unit/module-explicit-bindings.test.ts`
  - `packages/vrender/__tests__/unit/entries.test.ts`

### Phase 2 结论

- [x] `container` 已不再作为 `vrender-core` 公开导出
- [x] `vrender-core` 非 legacy 路径的 runtime container fallback 已移除
- [x] `vrender-kits` / `vrender-components` / `vrender` 已迁到窄化的 legacy binding helper
- [x] Phase 2 验收通过

---

## 🔴 Phase 3 执行记录 - 删除 common/inversify 与旧桥接

> **阶段目标**：删除 `container.ts` 与 `common/inversify/`，用不依赖 inversify 的轻量 binding 实现替换旧 bridge；保留 `modules.ts`、`preLoadAllModule()` 与 `vglobal` 的兼容边界。
> **阶段状态**：✅ 已完成

### 子任务 P3.1：创建不依赖 inversify 的实现

**当前状态**：✅ 已完成

- [x] 创建轻量 binding context 实现
- [x] 仅保留 `bind / rebind / isBound / getAll / getNamed`
- [x] 用 `Map + 闭包` 实现基础绑定能力
- [x] 保持 `ILegacyBindingContext` 兼容

**执行结果**：
- 已新增 `packages/vrender-core/src/legacy/binding-context.ts`
- 已新增 `packages/vrender-core/src/legacy/module-types.ts`
- 新实现支持：
  - `to`
  - `toSelf`
  - `toDynamicValue`
  - `toConstantValue`
  - `toService`
  - `inSingletonScope`
  - `whenTargetNamed`
- 已新增 `packages/vrender-core/__tests__/unit/legacy/legacy-binding-context.test.ts` 固定轻量 binding 的行为

### 子任务 P3.2：替换 legacy/bootstrap.ts 中的 container 依赖

**当前状态**：✅ 已完成

- [x] 修改 `packages/vrender-core/src/legacy/bootstrap.ts`
- [x] 移除 `container.ts` 依赖
- [x] 改为使用轻量 binding context
- [x] 保持 `getLegacyBindingContext()` / `resolveLegacySingleton()` / `resolveLegacyNamed()` 行为可用

**执行结果**：
- `packages/vrender-core/src/legacy/bootstrap.ts` 不再 import `../container`
- `preLoadAllModule()` 已切到轻量 binding context 驱动
- `getLegacyBindingContext()` / `resolveLegacySingleton()` / `resolveLegacyNamed()` 继续作为 legacy 兼容 helper 保留
- `packages/vrender-core/src/core/contributions/modules.ts` 与 `packages/vrender-core/src/render/contributions/modules.ts` 已改为依赖 `legacy/module-types.ts`

### 子任务 P3.3：删除 container.ts

**当前状态**：✅ 已完成

- [x] 删除 `packages/vrender-core/src/container.ts`
- [x] 确认源码中不再依赖该文件
- [x] 确保 TypeScript 编译通过

**执行结果**：
- `packages/vrender-core/src/container.ts` 已删除
- `vrender-core` 运行时代码和稳定测试已不再依赖 `container.ts`
- `packages/vrender-core/__tests__/unit/smoke/stage-graphic.test.ts`、`packages/vrender-core/__tests__/unit/core/factory-migration.test.ts`、`packages/vrender-core/__tests__/unit/core/canvas-util.test.ts` 等旧测试已同步迁移

### 子任务 P3.4：删除 common/inversify/ 目录

**当前状态**：✅ 已完成

- [x] 删除 `packages/vrender-core/src/common/inversify/`
- [x] 确认源码中不再依赖该目录
- [x] 确保 TypeScript 编译通过

**执行结果**：
- `packages/vrender-core/src/common/inversify/` 已整体删除
- 源码/测试范围内对 `common/inversify` 的依赖扫描已清零
- 旧 bridge 行为改由轻量 `legacy/binding-context.ts` 承接

### 子任务 P3.5：清理 browser fixture 中的 container 引用

**当前状态**：✅ 已完成

- [x] 清理 browser fixture 中的公开 `container` 导入
- [x] 优先迁移到 `getLegacyBindingContext()`
- [x] 确保 fixture 改造后仍符合当前兼容边界

**执行结果**：
- `vrender` / `vrender-core` browser fixture 中活跃的 `container` 公开导入已迁到 `getLegacyBindingContext()` 或显式 helper
- `gif-image`、`lottie`、`editor/register`、`env-canvas`、`anxu-picker`、`chart`、`line`、`symbol` 等页面已完成迁移
- browser fixture 中与 package public `container` 相关的活跃源码引用已清零
- `inversify_test` 中自建的本地 `Container` 示例与注释残留不属于公开桥接范围，保留为浏览器示例/迁移跟踪信息

### 子任务 P3.6：更新文档

**当前状态**：✅ 已完成

- [x] 更新 `NEW_ARCH_GUIDE.md`
- [x] 更新相关代码注释
- [x] 确保文档与最终状态一致

**执行结果**：
- `NEW_ARCH_GUIDE.md` 已更新为“container 与 common/inversify 已移除”的终态说明
- `packages/vrender-core/src/legacy/binding-context.ts` 已补充轻量 legacy binding 的注释说明
- 文档中已明确：
  - `container.ts` 已删除
  - `common/inversify` 已删除
  - `modules.ts` / `preLoadAllModule()` / `getLegacyBindingContext()` 仍是窄化兼容层

### Phase 3 验证结果

- [x] `packages/vrender-core` -> `rushx compile` 通过
- [x] `packages/vrender-kits` -> `rushx compile` 通过
- [x] `packages/vrender-components` -> `rushx compile` 通过
- [x] `packages/vrender` -> `rushx compile` 通过
- [x] `packages/vrender-core` 稳定测试通过：`80/80 suites`，`437/437 tests`
- [x] `packages/vrender-kits` 稳定测试通过：`19/19 suites`，`49/49 tests`
- [x] `packages/vrender-components` 稳定测试通过：`29/29 suites`，`88/88 tests`
- [x] `packages/vrender` 稳定测试通过：`14/14 suites`，`48/48 tests`，`2 skipped`
- [x] 源码/测试范围扫描通过：`common/inversify`、`container.ts` 和包级 `container` 公开导入已清零

### Phase 3 结论

- [x] `container.ts` 已从仓库代码路径中移除
- [x] `common/inversify/` 已从仓库代码路径中移除
- [x] legacy bootstrap 已切到轻量 binding context，不再依赖 inversify
- [x] browser fixture 的公开 `container` 使用已迁走
- [x] Phase 3 验收通过

---

## 🎯 执行顺序

### 推荐顺序
1. **子任务 0.1**：`canvas/util.ts` 迁移（P1，阻塞路径，其他任务可能依赖）
2. **子任务 0.3**：vglobal 共存关系（P1，依赖 0.1 完成后的 context）
3. **子任务 0.2**：vrender 根包启动路径（P1，核心，需要 0.1 + 0.3 铺垫）
4. **子任务 0.4**：公开类型泄漏清理（可与 0.2 并行）
5. **子任务 0.5**：测试示例清理（P2，可在 0.2 完成后处理）
6. **子任务 0.6**：迁移指南（依赖所有其他任务完成后）

### 并行可能性
- 0.4 可与 0.2 并行
- 0.5 独立
- 0.6 依赖所有其他任务

---

## 📝 预估值

- 子任务 0.1：1-2 小时
- 子任务 0.2：3-4 小时
- 子任务 0.3：1 小时
- 子任务 0.4：1-2 小时
- 子任务 0.5：1-2 小时
- 子任务 0.6：1-2 小时
- **合计**：约 8-14 小时

---

**文档版本**：v1.3
**创建时间**：2026-04-03
**最后更新**：2026-04-03
**状态**：✅ Phase 3 已完成，待审核
