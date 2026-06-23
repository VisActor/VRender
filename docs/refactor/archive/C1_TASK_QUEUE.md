# C1 任务队列 - Major 版本清理预研

> **文档类型**：预研任务队列
> **负责人**：架构设计师（Claude）制定，资深开发者执行
> **审核者**：总监与协调者
> **设计文档**：A1_ARCH_DESIGN.md（废弃时间线章节）
> **当前阶段**：✅ 预研完成，待审核
> **目标版本**：下一个 major 版本

---

## 👥 角色分工

- **架构设计师**：定义任务、验收标准、审查完成质量
- **资深开发者**：执行任务、编写代码、标记完成状态
- **总监与协调者**：监控进度、决策、验收

---

## 🎯 预研目标

根据 `A1_ARCH_DESIGN.md` 的废弃时间线，major 版本需要执行以下清理：

1. 移除 `container.ts` 的公开导出
2. 移除 `modules.ts` 的公开导出和默认全局模块初始化路径
3. 删除 `common/inversify` 内部兼容实现
4. 删除对旧容器式装配路径的文档、示例和迁移桥接代码

**预研的目的是**：在真正执行清理之前，评估影响范围、确定迁移路径、制定详细计划，而不是立即动手修改代码。

---

## 🟡 任务 1：评估 container.ts 移除影响

**优先级**：🟡 P1
**预估时间**：2-3 小时
**当前状态**：✅ 已完成
**负责人**：资深开发者

**任务描述**：
评估移除 `container.ts` 公开导出对代码库的影响。

**具体任务**：
- [x] 搜索 `packages/` 下所有 import `container` 的位置
- [x] 分类：
  - 框架内部使用（可改）
  - 公开 API 导出（需保留或迁移期）
  - 测试文件使用
- [x] 评估每个使用位置是否可以迁移到 `createBrowserApp()` / `createNodeApp()` 路径
- [x] 识别无法迁移的极端场景（如直接使用 `container.bind()` 注入测试依赖）
- [x] 整理成影响评估报告

**影响评估报告**：

- 源码级共识别 `41` 个 `container` 相关影响点。
- 其中 `40` 个是 `src/` 下的直接 import，另 `1` 个是 `packages/vrender-core/src/index.ts` 的公开导出。
- 额外识别到 `5` 个直接从 `@visactor/vrender-core` 导入 `container` 的测试/浏览器页；`@visactor/vrender` 侧还有一批通过根包公开导出间接使用的 browser demo，不纳入源码级统计，但 major 清理时要同步迁移。

**分类结果**：

- `可迁移（9）`
  - `packages/vrender-core/src/core/layer-service.ts`
  - `packages/vrender-core/src/core/window.ts`
  - `packages/vrender-core/src/render/contributions/render/draw-contribution.ts`
  - `packages/vrender-kits/src/canvas/contributions/create-canvas-module.ts`
  - `packages/vrender-kits/src/picker/canvas-module.ts`
  - `packages/vrender-kits/src/picker/math-module.ts`
  - `packages/vrender-kits/src/picker/contributions/canvas-picker/module.ts`
  - `packages/vrender-kits/src/picker/contributions/math-picker/module.ts`
  - `packages/vrender-components/src/poptip/register.ts`
- `需保留（1）`
  - `packages/vrender-core/src/index.ts`
  - 这是 `container.ts` 的唯一公开导出，major 之前只能保持 deprecated，不适合在 minor 里提前删掉。
- `需特殊处理（31）`
  - `packages/vrender/src/index.ts`
  - `packages/vrender-core/src/modules.ts`
  - `packages/vrender-core/src/canvas/util.ts`
  - `packages/vrender-kits/src/env/{all,browser,feishu,harmony,lynx,node,taro,tt,wx}.ts`
  - `packages/vrender-kits/src/register/register-{arc,arc3d,area,circle,gif,glyph,image,line,path,polygon,pyramid3d,rect,rect3d,richtext,star,symbol,text}.ts`
  - `packages/vrender-components/src/poptip/module.ts`
  - `packages/vrender-components/src/scrollbar/module.ts`

**迁移判断**：

- 框架内部 fallback 位点大多已具备 `application` / factory / registry 替代路径，迁移成本低。
- `packages/vrender-core/src/canvas/util.ts` 仍直接依赖 `container.getNamed(...)`，且当前 `application.canvasFactory/context2dFactory` 没有被完整接管，属于单独收口点。
- `packages/vrender/src/index.ts`、`vrender-kits/src/env/*`、`vrender-kits/src/register/*`、`vrender-components` 的 module/register helper 仍是旧全局容器生态的一部分，不能简单删 `container` 导出，必须先补 app-scoped 对等入口。
- 直接通过 `container.bind()` 注入测试依赖的极端场景主要出现在 browser demo / old fixture，major 清理时需要改成“每个测试创建独立 app + 安装测试 plugin”的模式。

**工作量预估**：

- 框架内部可迁移位点：约 `0.5-1` 人天。
- 公共 helper 与根包入口迁移：约 `2-3` 人天。
- 文档/示例/测试迁移：约 `1-2` 人天。
- 合计：`3.5-6` 人天，且需要至少一个 minor 版本先铺迁移路径。

**验收标准**：
- [x] 影响评估报告完成
- [x] 每个使用位置有明确的"可迁移 / 需保留 / 需特殊处理"标注
- [x] 预估迁移工作量

---

## 🟡 任务 2：评估 modules.ts 移除影响

**优先级**：🟡 P1
**预估时间**：2-3 小时
**当前状态**：✅ 已完成
**负责人**：资深开发者

**任务描述**：
评估移除 `modules.ts` 的公开导出和默认全局模块初始化路径的影响。

**具体任务**：
- [x] 分析 `modules.ts` 当前导出了哪些内容
- [x] 搜索 `packages/` 下所有 import 从 `modules` 的位置
- [x] 确认 `index.ts` 中 `import './modules'` 的依赖方
  - 这是默认装配的唯一入口，需要确认所有消费方都已切到 App 模式
- [x] 分析 `preLoadAllModule()` 的调用链
- [x] 评估：移除 `import './modules'` 是否会导致 vrender 包失效
- [x] 确认 vrender 包是否已完全依赖新架构而非 modules.ts

**评估结论**：

- `modules.ts` 当前对外导出 `6` 个运行时符号：
  - `preLoadAllModule`
  - `vglobal`
  - `graphicUtil`
  - `transformUtil`
  - `graphicService`
  - `layerService`
- `packages/vrender-core/src/index.ts` 当前同时做两件事：
  - `import './modules'`，提供默认全局初始化副作用
  - `export * from './modules'`，把旧单例导出暴露给包根入口
- `preLoadAllModule()` 的真实调用链只剩一条：
  - `packages/vrender/src/index.ts -> preLoadAllModule()`
- 但 `import './modules'` 的影响不是显式 import，而是“根包默认初始化”语义：
  - 根级 `createStage()` 仍走 `new StageFactory().create(...)`
  - `Stage` 仍会 fallback 到 `application.global / application.layerService / application.graphicService`
  - 这意味着即便没有人显式 import `modules.ts`，删掉 `index.ts` 里的副作用初始化也会让旧根入口失效
- `vrender` 包当前并未完全切到新架构：
  - 仍在 `packages/vrender/src/index.ts` 里调用 `preLoadAllModule()`
  - 仍依赖全局 `container`
  - 仍调用 `loadBrowserEnv(container)` / `loadNodeEnv(container)`
  - 仍调用一组无参 `register*()` helper
- `vglobal` 是 `modules.ts` 最难直接移除的公开导出，当前在源码包里有 `13` 个实际消费文件：
  - `vrender-animate` 4 处
  - `vrender-components` 7 处
  - `vrender-kits` 2 处
- `graphicUtil / transformUtil / graphicService / layerService` 在源码包内已基本转为 `application.*` 访问，外部直接依赖很少，但仍属于 public API，major 时要一并定策略。

**判断**：

- 直接移除 `modules.ts` 的公开导出和副作用初始化会导致 `@visactor/vrender` 根包行为失效。
- 在 major 前必须先完成两件事：
  - 给根包和 helper 生态补齐 app-scoped 启动路径
  - 决定 `vglobal` 是迁移到新公开入口、改成 app/stage 访问，还是在 major 中一并废弃

**验收标准**：
- [x] modules.ts 当前所有导出被分类
- [x] 默认全局初始化路径的使用方已确认
- [x] vrender 包依赖关系已梳理清楚

---

## 🟡 任务 3：评估 common/inversify 清理可行性

**优先级**：🟡 P1
**预估时间**：2-3 小时
**当前状态**：✅ 已完成
**负责人**：资深开发者

**任务描述**：
评估删除 `common/inversify` 整个目录的可行性。

**具体任务**：
- [x] 列出 `common/inversify` 下所有文件
- [x] 搜索每个文件被 import 的位置（排除 index.ts 直接 re-export）
- [x] 确认 `container.ts` 是唯一使用 `common/inversify` 的业务入口
  - 如果 `container.ts` 也要移除，则 `common/inversify` 可一并清理
- [x] 确认 `vrender-animate` 或其他包是否有直接依赖 `common/inversify`
- [x] 评估：如果同时移除 container.ts 和 inversify，packages 内部是否还有其他路径引用

**评估结论**：

- `packages/vrender-core/src/common/inversify/` 当前共有 `18` 个文件。
- 直接 import `common/inversify` 业务实现的源码入口只有 `1` 个：
  - `packages/vrender-core/src/container.ts`
- `vrender-animate`、`vrender-components`、`react-vrender` 没有直接 import `common/inversify/*`。
- 但是旧 DI 的类型面仍然泄漏在源码 API 上：
  - `vrender-kits/src/env/*` 仍从 `@visactor/vrender-core` 引用 `type Container`
  - `vrender-kits/src/canvas/contributions/modules.ts` 仍用 `type Container`
  - browser test / demo 里仍有 `ContainerModule`、`container.load(...)`、甚至直接从 `inversify` 导入的旧例子
- 因此 `common/inversify` 的清理可行性结论是：
  - `可清理`
  - 但必须与 `container.ts` 同步移除
  - 并且要先处理所有对 `Container` / `ContainerModule` 的公开类型和示例依赖

**同步移除判断**：

- 若 major 仅删除 `common/inversify`，而保留 `container.ts`，则不可行。
- 若 major 同步删除 `container.ts` 的公开导出、内部 fallback 和相关测试/示例，则 `common/inversify` 可整目录删除，无需进一步拆分。

**验收标准**：
- [x] `common/inversify` 的所有引用方已确认
- [x] 清理可行性有明确结论（可清理 / 部分可清理 / 需进一步拆分）

---

## 🟡 任务 4：制定 major 版本迁移指南

**优先级**：🟡 P1
**预估时间**：2-3 小时
**当前状态**：✅ 已完成
**负责人**：资深开发者 + 架构设计师

**任务描述**：
制定 major 版本迁移指南，供外部使用方参考。

**具体任务**：
- [x] 起草从 `container` + `modules` 迁移到 `create*App()` 的对照说明
- [x] 明确迁移步骤：
  1. 将 `import { container, ... } from '@visactor/vrender-core'` 改为 `import { createBrowserApp }`
  2. 替换 `container.get()` 为 `app.createStage()` 或通过 factory 创建对象
  3. 替换 `ContainerModule` 为 `app.installPlugin()`
  4. 移除 `import '@visactor/vrender-core'` 的副作用调用（模块初始化）
- [x] 补充：旧 API 完全移除后，原有测试如何迁移
- [x] 补充：自定义图形 / 渲染器 / picker 的注册方式变更
- [x] 整理成文档草稿

**迁移指南草稿**：

**场景 1：根包启动**

- 旧：
  - `import { container, preLoadAllModule, createStage } from '@visactor/vrender'`
  - `preLoadAllModule()`
  - `loadBrowserEnv(container)`
  - `registerRect()`
  - `const stage = createStage(...)`
- 新：
  - `import { createBrowserApp } from '@visactor/vrender-core'`
  - `const app = createBrowserApp()`
  - 显式安装环境 plugin / 图元注册 / picker / renderer 注册
  - `const stage = app.createStage(...)`

**场景 2：container.get / getNamed / getAll**

- 旧：
  - `container.get(Symbol)`
  - `container.getNamed(Symbol, env)`
  - `container.getAll(Symbol)`
- 新：
  - Stage/Graphic 运行时依赖改为从 `app`、`stage` 或显式 factory 参数获取
  - 环境对象使用 app-scoped env plugin 或 `app.context`
  - renderer / picker / contribution 查询走对应 registry

**场景 3：ContainerModule / container.load**

- 旧：
  - `const module = new ContainerModule(...)`
  - `container.load(module)`
- 新：
  - 将模块化装配改成显式 plugin
  - `app.installPlugin(new XxxPlugin())`
  - 或在 app 初始化阶段显式调用 register/bind helper

**场景 4：无参 registerXxx() helper**

- 旧：
  - `registerRect()`
  - `registerImage()`
  - `registerRichText()`
- 新：
  - 优先改成接收 app/context 的 helper
  - 或下沉为 `app.factory.graphic.register(...)`、`app.registry.renderer.register(...)`、`app.registry.picker.register(...)`
  - 不再向全局 `container` 绑定实现

**场景 5：环境初始化**

- 旧：
  - `loadBrowserEnv(container)`
  - `initBrowserEnv()`
- 新：
  - 环境能力作为 app-scoped plugin 安装
  - 每个 app 保持独立 env/context，避免跨实例共享全局状态

**场景 6：测试迁移**

- 旧：
  - 在测试里直接 `container.bind()` / `container.load()` 注入替身
- 新：
  - 每个测试创建独立 app
  - 在 app 上安装测试 plugin / mock contribution
  - 不再共享全局单例，避免用例互相污染

**场景 7：自定义图形 / 渲染器 / picker**

- 旧：
  - 通过全局 register helper 把实现塞进全局容器
- 新：
  - 图形构造走 `GraphicFactory`
  - renderer / picker / contribution 走对应 registry
  - 对外暴露 app-aware helper，而不是无参全局 helper

**推荐迁移顺序**：

1. 先把入口代码从 `createStage()` 迁到 `app.createStage()`
2. 再替换环境加载和 register helper
3. 最后删除 `container` / `modules` / `ContainerModule` 相关导入

**验收标准**：
- [x] 迁移对照说明完整
- [x] 迁移步骤清晰可执行
- [x] 文档草稿可供审核

---

## 🟡 任务 5：确定 major 版本执行计划

**优先级**：🟡 P1
**预估时间**：1-2 小时
**当前状态**：✅ 已完成
**负责人**：架构设计师

**任务描述**：
根据前四个任务的结果，制定 major 版本的详细执行计划。

**具体任务**：
- [x] 汇总三个评估任务的影响范围结论
- [x] 制定分步骤执行计划：
  1. 第一步：移除 `container.ts` 公开导出（框架内部迁移）
  2. 第二步：移除 `modules.ts` 默认初始化（需 vrender 包配合）
  3. 第三步：删除 `common/inversify`
  4. 第四步：清理文档和迁移桥接代码
- [x] 确认每一步的回滚边界
- [x] 明确每个步骤的验收标准

**建议执行计划**：

**阶段 0：major 前置准备（建议放在一个 minor 完成）**

- 目标：
  - 为 `@visactor/vrender`、`vrender-kits/env`、`vrender-kits/register`、`vrender-components/module` 补齐 app-scoped 替代入口
  - 决定 `vglobal` 的长期归宿
  - 输出正式迁移指南
- 验收：
  - 新入口齐备且文档可用
  - 旧入口保留 deprecated，但新增能力不再继续挂在旧容器路径上
- 回滚边界：
  - 仅新增入口，不删旧 API，随时可回退到旧启动链

**阶段 1：切断默认全局初始化**

- 操作：
  - 移除 `packages/vrender-core/src/index.ts` 的 `import './modules'`
  - 停止 `@visactor/vrender` 根包调用 `preLoadAllModule()` 与默认全局 env 装配
  - 调整 `package.json sideEffects` 中对 `modules.ts` 的声明
- 验收：
  - 根包和上层包都改为显式 app 启动
  - `createStage()` 的旧根路径要么删除，要么重定向到明确的新初始化逻辑
- 回滚边界：
  - 恢复 `index.ts` 副作用导入
  - 恢复 `vrender/src/index.ts` 的旧 bootstrap

**阶段 2：移除 container 公共入口**

- 操作：
  - 移除 `packages/vrender-core/src/index.ts` 的 `export * from './container'`
  - 迁掉 `src/` 内剩余 `container` fallback
  - 替换或删除无参 register/env/component helper
- 验收：
  - 源码包中不再有业务代码依赖全局 `container`
  - 公共 API 文档不再出现 `container`
- 回滚边界：
  - 恢复 `container` 导出
  - 暂时恢复 helper 对旧容器路径的桥接

**阶段 3：删除 common/inversify 与旧桥接**

- 操作：
  - 删除 `packages/vrender-core/src/container.ts`
  - 删除 `packages/vrender-core/src/common/inversify/`
  - 删除 `Container` / `ContainerModule` 相关示例、fixture、browser demo
- 验收：
  - 仓库源码、文档、测试中不再依赖 `common/inversify`
  - public API 中不再暴露旧 DI 类型
- 回滚边界：
  - 恢复 `container.ts` 与 `common/inversify`

**阶段 4：清理文档与兼容说明**

- 操作：
  - 清理旧教程、示例、注释和迁移桥接代码
  - 将 major 迁移说明收敛到正式升级文档
- 验收：
  - 对外文档只保留新架构路径
  - 示例工程全部使用 app 模式
- 回滚边界：
  - 文档类回滚独立进行，不影响运行时代码

**协调建议**：

- 这是“先铺路、再删桥”的典型 major 清理，不建议一步到位直接删 `container/modules`。
- 真正的关键阻塞不在 `common/inversify` 本身，而在 `@visactor/vrender` 根包、旧 env/register helper、以及 `vglobal` 这条公开单例链。

**验收标准**：
- [x] 执行计划分步骤清晰
- [x] 每步有回滚边界
- [x] 计划可供总监与协调者决策

---

## 📊 任务完成追踪

### 统计信息
- **总任务数**：5 个
- **已完成**：5 个
- **进行中**：0 个
- **待开始**：0 个

### 当前进度
```
进度：100% (5/5)
[████████████████████████████████████████████████████████████████]
```

---

## ✅ 完成标准

- [x] 任务 1：`container.ts` 移除影响评估完成
- [x] 任务 2：`modules.ts` 移除影响评估完成
- [x] 任务 3：`common/inversify` 清理可行性结论明确
- [x] 任务 4：major 版本迁移指南草稿完成
- [x] 任务 5：major 版本执行计划制定完成
- [ ] 总监与协调者审核通过

---

## 📝 预研结论模板

```
## 预研结论

### container.ts 移除影响
- 影响位置数量：41
- 可迁移：9
- 需保留：1
- 需特殊处理：31
- 测试/示例补充：另有 5 个直接从 `@visactor/vrender-core` 导入 `container` 的测试/浏览器页，major 时要一并迁移

### modules.ts 移除影响
- 导出数量：6
- 真实显式调用方：`preLoadAllModule()` 只剩 `packages/vrender/src/index.ts`
- 高风险公开导出：`vglobal`
- `vglobal` 源码消费文件：13
- vrender 包依赖：部分依赖，尚未完全迁移到新架构

### common/inversify 清理可行性
- 目录文件数：18
- 直接业务入口：1（`packages/vrender-core/src/container.ts`）
- 清理可行性：可清理，但必须与 `container.ts` 同步移除

### 迁移指南
- 迁移步骤：7 个场景，3 步推荐顺序
- 预估迁移工作量：3.5-6 人天
- 核心迁移方向：`container/modules` -> `create*App()` + app-scoped plugin/factory/registry

### 执行计划
- 阶段数：5（含 1 个 minor 前置准备阶段）
- 预计执行顺序：前置铺路 -> 切断默认初始化 -> 移除 container 公开入口 -> 删除 common/inversify -> 清理文档/桥接
```

---

**文档版本**：v1.0
**创建时间**：2026-04-03
**最后更新**：2026-04-03
**状态**：✅ 预研完成，待审核
