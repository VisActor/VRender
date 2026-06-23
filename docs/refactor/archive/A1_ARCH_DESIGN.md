# A1 架构设计文档 - 对象组装模型重构

> **文档类型**：架构设计文档
> **负责人**：架构设计师（Claude）
> **审核者**：总监与协调者
> **版本**：v1.3
> **创建时间**：2026-03-30
> **状态**：✅ 审核通过（v1.3）

---

## 📋 文档变更记录

| 版本 | 日期 | 作者 | 变更内容 | 审核状态 |
|------|------|------|----------|----------|
| v1.0 | 2026-03-30 | 架构设计师 | 初始草案 | ✅ 审核通过 |
| v1.1 | 2026-03-30 | 架构设计师 | 补充性能、多图表、多版本约束 | ✅ 审核通过 |
| v1.2 | 2026-04-02 | 架构设计师 | 补充架构验收结论、遗留项说明 | ✅ 审核通过 |
| v1.3 | 2026-04-02 | 资深开发者 | 补充旧架构废弃时间线 | ✅ 审核通过 |

---

## 📋 文档变更记录

| 版本 | 日期 | 作者 | 变更内容 | 审核状态 |
|------|------|------|----------|----------|
| v1.0 | 2026-03-30 | 架构设计师 | 初始草案 | ✅ 审核通过 |
| v1.1 | 2026-03-30 | 架构设计师 | 补充性能、多图表、多版本约束 | ✅ 审核通过 |
| ... | ... | ... | ... | ... |

---

## 🎯 重构目标

### A1：对象组装模型重构（DI 删除）

**目标**：移除 `inversify/inversify-lite`，建立显式工厂 + 注册表模式

**长期方向**：彻底退出容器式 DI 模式，改用显式注册 + 工厂/注册表 + 普通构造传参

**判断依据**（已确认）：
- 当前问题不只是实现重，而是依赖关系被装饰器、模块绑定、容器解析隐藏
- `render / picker / env contribution / graphic factory` 这类能力更适合显式注册和能力表
- 从长期结构稳定性看，显式组装比容器解析更容易理解、验证和演进

### 关键约束

#### 1. 性能优先
作为基础绘图库，渲染性能是核心指标。设计必须满足：
- **零运行时开销**：工厂/注册表调用不应产生额外性能损耗
- **最小化对象创建**：避免频繁的查找和分发
- **批量操作优化**：支持批量注册和查询
- **内存效率**：避免全局单例污染，支持按需创建

#### 2. 多图表场景
一个页面可能存在多个独立的 Canvas/Stage：
- **隔离性**：不同 Stage 之间无状态共享
- **独立性**：每个 Stage 可独立配置插件和渲染器
- **资源管理**：共享的渲染器实例应支持多 Stage 复用

#### 3. 多版本共存
同一仓库可能同时运行多个版本的 vrender：
- **命名空间隔离**：避免不同版本的符号冲突
- **独立实例**：每个版本有独立的工厂和注册表
- **兼容层**：提供版本对齐的桥接机制

---

## 📐 架构设计

### 四类核心角色

#### 1. Factory（工厂）

负责创建核心对象，提供统一的创建入口。

**核心职责**：
- 创建 Stage、Layer、Graphic 等核心对象
- 管理对象的生命周期
- 提供类型安全的创建接口

**设计原则**：
- 工厂函数代替容器解析
- 构造函数接收明确的依赖参数
- 不使用装饰器注入
- 支持多实例：每个 App/Stage 有独立的工厂实例
- 性能：工厂方法内联，避免不必要的间接调用

```typescript
// 现状（使用 DI）
const stage = container.get<Stage>(Stage);

// 目标（使用工厂）
const stage = createStage({ container, options });
const layer = createLayer({ stage, options });
const rect = createRect({ width: 100, height: 100 });
```

---

#### 2. Registry（注册表）

负责注册可扩展能力，提供能力查询接口。

**核心职责**：
- 注册 Renderer、Picker、Env Adapter、Plugin、Custom Contribution
- 提供按类型或名称查询的能力
- 支持动态注册和卸载

**设计原则**：
- 简单的 Map 存储，不用容器
- 注册时明确类型，不使用隐式推断
- 查询时有明确的返回类型
- 支持多实例：每个 App 有独立的注册表实例
- 性能：使用常量作为 key，避免字符串拼接开销

```typescript
// 现状（使用 ContributionProvider）
const renderers = container.get(ContributionProvider).get(GraphicRender);

// 目标（使用 Registry）
const renderers = GraphicRendererRegistry.getAll();
const picker = PickerRegistry.get(type);
```

---

#### 3. Plugin API（插件系统）

负责以显式方式安装一组注册行为。

**核心职责**：
- 定义插件的安装接口
- 提供插件的生命周期管理
- 支持插件间的依赖声明

**设计原则**：
- 插件是一个安装函数，不是容器模块
- 安装时明确插件名称和版本
- 卸载有明确的清理逻辑
- 支持多实例：插件作用域绑定到特定 App 实例
- 性能：安装时一次性初始化，避免运行时检查

```typescript
// 现状（使用 ContainerModule）
const browserModule = new ContainerModule(bind => {
  bind(VWindow).to(DefaultBrowserWindow);
});

// 目标（使用 Plugin API）
installBrowserEnv({
  windowFactory: createBrowserWindow,
  canvasFactory: createCanvas,
});
```

---

#### 4. Composition Root（组合根）

在少数入口文件集中完成系统装配。

**核心职责**：
- 定义环境入口（Browser、Node、WX 等）
- 配置默认模块
- 提供应用启动入口

**设计原则**：
- 入口文件唯一，不分散在多个模块
- 环境配置集中管理
- 清晰的应用初始化流程
- 支持多实例：每次 `createApp()` 创建隔离的 App 实例
- 性能：共享的系统级资源（如 Canvas 上下文）通过引用传递，不复制

```typescript
// 现状（分散在多个模块）
// core-modules.ts, render-modules.ts, plugin-modules.ts ...

// 目标（集中入口）
// browser-entry.ts, node-entry.ts, wx-entry.ts
import { createApp } from './entries/browser';

const app = createApp({
  renderer: 'canvas',
  width: 800,
  height: 600,
});

app.start();
```

---

## 📊 模块设计

### 核心模块关系图

```
┌─────────────────────────────────────────────────────────────┐
│                    Composition Root                          │
│              (browser-entry.ts / node-entry.ts)              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Plugin System                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ BrowserEnv  │  │ Renderer    │  │  Picker     │        │
│  │  Plugin    │  │  Plugin     │  │  Plugin     │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Registry                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ Renderer    │  │ Picker      │  │ Contribution│        │
│  │ Registry    │  │ Registry    │  │ Registry   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Factory                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ Stage       │  │ Layer       │  │ Graphic     │        │
│  │ Factory     │  │ Factory     │  │ Factory     │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────��───────────────────────────┘
```

---

### 模块详细设计

#### 1. Factory 模块

**文件位置**：`vrender-core/src/factory/`

```
factory/
├── index.ts           # 统一导出
├── stage-factory.ts   # Stage 创建
├── layer-factory.ts   # Layer 创建
├── graphic-factory.ts # Graphic 创建
└── types.ts           # 工厂类型定义
```

**核心接口**：
```typescript
// stage-factory.ts
interface IStageFactory {
  create(params: IStageParams): IStage;
}

// layer-factory.ts
interface ILayerFactory {
  create(params: ILayerParams): ILayer;
}

// graphic-factory.ts
interface IGraphicFactory {
  create<T extends IGraphic>(type: string, attrs: T): T;
  register(type: string, ctor: IGraphicConstructor): void;
}
```

---

#### 2. Registry 模块

**文件位置**：`vrender-core/src/registry/`

```
registry/
├── index.ts              # 统一导出
├── renderer-registry.ts  # Renderer 注册表
├── picker-registry.ts    # Picker 注册表
├── plugin-registry.ts    # Plugin 注册表
├── contribution-registry.ts  # Contribution 注册表
└── types.ts             # 注册表类型定义
```

**核心接口**：
```typescript
// renderer-registry.ts
interface IRendererRegistry {
  register(renderer: IGraphicRenderer): void;
  get(type: string): IGraphicRenderer | undefined;
  getAll(): IGraphicRenderer[];
}

// plugin-registry.ts
interface IPluginRegistry {
  install(plugin: IPlugin): void;
  uninstall(name: string): void;
  get(name: string): IPlugin | undefined;
  getAll(): IPlugin[];
}
```

---

#### 3. Plugin 模块

**文件位置**：`vrender-core/src/plugins/`

```
plugins/
├── index.ts              # 统一导出
├── base-plugin.ts        # 基础插件类
├── browser-env-plugin.ts # 浏览器环境插件
├── renderer-plugin.ts    # 渲染器插件
├── picker-plugin.ts      # 拾取器插件
└── types.ts             # 插件类型定义
```

**核心接口**：
```typescript
interface IPlugin {
  name: string;
  version: string;
  install(context: IPluginContext): void;
  uninstall?(): void;
}

interface IPluginContext {
  registry: {
    renderer: IRendererRegistry;
    picker: IPickerRegistry;
    contribution: IContributionRegistry;
  };
  factory: {
    stage: IStageFactory;
    layer: ILayerFactory;
    graphic: IGraphicFactory;
  };
}
```

---

#### 4. Entry 模块

**文件位置**：`vrender-core/src/entries/`

```
entries/
├── index.ts              # 统一导出
├── browser.ts           # 浏览器入口
├── node.ts              # Node.js 入口
├── miniapp.ts           # 小程序入口
└── types.ts             # 入口类型定义
```

**核心接口**：
```typescript
// browser.ts
interface IBrowserEntry {
  installPlugins(plugins: IPlugin[]): void;
  createStage(params: IStageParams): IStage;
}

// 使用示例
import { createBrowserApp } from './entries/browser';

const app = createBrowserApp({
  width: 800,
  height: 600,
  plugins: [
    installRendererPlugin(),
    installPickerPlugin(),
  ],
});

const stage = app.createStage();
```

---

## 🏗️ 多实例架构设计

### 设计目标

支持同一页面/仓库中运行多个独立的 vrender 实例，每个实例有独立的上下文。

### 核心概念

```
┌─────────────────────────────────────────────────────────────┐
│                      Global Registry                         │
│         （包级别的共享资源，非运行时状态）                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ Symbol      │  │ Type        │  │ Default     │        │
│  │ Registry    │  │ Registry    │  │ Factories   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     App Instance                             │
│                  （每次 createApp() 创建）                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ Instance    │  │ Instance    │  │ Instance    │        │
│  │ Registry    │  │ Factory     │  │ Plugin      │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│                            │                                │
│                            ▼                                │
│                    ┌─────────────┐                         │
│                    │   Stage     │                         │
│                    │  (Canvas)   │                         │
│                    └─────────────┘                         │
└─────────────────────────────────────────────────────────────┘
```

### 关键设计点

#### 1. App 实例隔离
```typescript
// 每次 createApp() 创建独立的 App 实例
const app1 = createApp({ ... });
const app2 = createApp({ ... });

// App1 和 App2 完全隔离
app1.createStage(); // 独立的状态和配置
app2.createStage(); // 独立的另一套
```

#### 2. 共享 vs 实例级资源

| 资源类型 | 共享级别 | 说明 |
|----------|----------|------|
| 图形类型注册 | 包级别 | `registerRect()` 等，全局有效 |
| 渲染器实现 | 包级别 | 渲染器类定义可复用 |
| 工具函数 | 包级别 | 不涉及运行时状态 |
| 渲染器实例 | App 级别 | 每个 Stage 创建独立的渲染器实例 |
| 状态 | Stage 级别 | 每个 Stage 独立的状态 |
| Canvas | Stage 级别 | 每个 Stage 独立的 Canvas |

#### 3. 性能优化

- **Symbol 作为 Key**：使用 `Symbol()` 代替字符串作为注册表 key，避免命名冲突且性能更好
- **惰性创建**：注册表只在首次访问时初始化
- **批量注册 API**：提供 `registerRenderers([...])` 批量注册接口

### API 设计示例

```typescript
// 共享类型注册（包级别，一次性）
import { registerRect, registerCircle } from '@visactor/vrender';
registerRect();
registerCircle();

// 创建隔离的 App 实例
const app = createApp({
  canvas: '#container',
  width: 800,
  height: 600,
  plugins: [
    installCanvasRenderer(),
    installDefaultPicker(),
  ],
});

// 从 App 实例创建 Stage
const stage = app.createStage();

// Stage 是独立的渲染上下文
const layer = stage.createLayer();
layer.add(createRect({ ... }));
```

---

## 🔄 迁移路径

### 阶段一：基础设施构建

**目标**：建立新的工厂和注册表基础设施

**任务**：
- [ ] 创建 Factory 模块骨架
- [ ] 创建 Registry 模块骨架
- [ ] 创建 Plugin 模块骨架
- [ ] 创建 Entry 模块骨架

**验收**：新模块可以独立运行

---

### 阶段二：核心模块迁移

**目标**：将核心服务迁移到新模型

**迁移顺序**：
1. `Stage` / `Layer` / `Window` → Factory
2. `GraphicService` / `GraphicCreator` → Factory
3. `RenderService` / `DrawContribution` → Registry
4. `PickerService` → Registry
5. `PluginService` → Plugin

**验收**：核心功能在新模型下正常工作

---

### 阶段三：清理阶段

**目标**：移除旧的 DI 依赖

**任务**：
- [ ] 移除 `inversify-lite` 依赖
- [ ] 移除所有 `@injectable`、`@inject` 装饰器
- [ ] 移除 `ContainerModule` 使用
- [ ] 清理 `container.get()` 调用

**验收**：`inversify-lite` 不再被引用

---

## ⚠️ 兼容性边界

### 必须保持兼容的

- 公开 API 签名（`createStage`、`createRect` 等）
- 主要入口（`vrender` 包的导出）
- 组件使用方式（components 包的使用方式）

### 可以改变的

- 内部实现细节
- 依赖组装方式
- 扩展机制（从 DI 改为 Registry）

### 需要迁移文档的

- `ContainerModule` → `Plugin.install()`
- `container.get()` → `Factory.create()`
- `ContributionProvider` → `Registry.getAll()`

---

## ⚡ 性能优化设计

### 1. 注册表性能

**问题**：每次渲染都需要从注册表查询渲染器，开销必须最小化。

**方案**：
```typescript
// 使用 Symbol 作为 key，避免字符串比较
const RENDERER_SYMBOL = Symbol('renderer');

// 渲染器实例缓存
class RendererRegistry {
  private cache = new Map<symbol, IGraphicRenderer>();
  private impls = new Map<symbol, IGraphicRendererConstructor>();

  register(symbol: symbol, ctor: IGraphicRendererConstructor) {
    this.impls.set(symbol, ctor);
    this.cache.delete(symbol); // invalidate cache
  }

  get(symbol: symbol): IGraphicRenderer {
    if (!this.cache.has(symbol)) {
      const ctor = this.impls.get(symbol);
      if (ctor) {
        this.cache.set(symbol, new ctor());
      }
    }
    return this.cache.get(symbol)!;
  }
}
```

### 2. 工厂方法内联

**问题**：通过工厂函数创建对象可能引入间接调用开销。

**方案**：
- 工厂方法尽量简单，只做参数校验和分发
- 核心构造函数保持直接可调用
- 避免多层包装

```typescript
// ✅ 好：工厂方法轻量
function createRect(attrs: IRectAttrs): Rect {
  return new Rect(attrs);
}

// ❌ 差：过度包装
function createRect(attrs: IRectAttrs): Rect {
  return factoryManager.get(Rect).create(attrs);
}
```

### 3. 多 Stage 共享渲染器

**问题**：每个 Stage 都创建新的渲染器实例可能造成资源浪费。

**方案**：
- 渲染器实例按类型缓存
- 同类型渲染器实例可被多个 Stage 共享
- Stage 销毁时不销毁共享渲染器

```typescript
class RenderService {
  private renderers = new Map<symbol, IGraphicRenderer>();

  getRenderer(type: symbol): IGraphicRenderer {
    if (!this.renderers.has(type)) {
      this.renderers.set(type, new DefaultRectRenderer());
    }
    return this.renderers.get(type)!;
  }
}
```

### 4. 批量操作

**问题**：批量创建图形时，逐个创建效率低。

**方案**：
```typescript
// 批量创建 API
const rects = createGraphics('rect', [
  { x: 0, y: 0, width: 100, height: 100 },
  { x: 100, y: 0, width: 100, height: 100 },
  // ...
]);

// 批量注册
installPlugins([
  installCanvasRenderer(),
  installSvgRenderer(),
  installDefaultPicker(),
  // ...
]);
```

---

## 📊 影响范围分析

### 高影响（必须谨慎）

| 模块 | 影响 | 风险 |
|------|------|------|
| `vrender-core/src/core/stage.ts` | Stage 依赖注入 | 高 |
| `vrender-core/src/core/layer-service.ts` | Layer 创建 | 高 |
| `vrender-core/src/render/render-service.ts` | 渲染服务 | 高 |

### 中影响（需要适配）

| 模块 | 影响 | 风险 |
|------|------|------|
| `vrender-core/src/picker/picker-service.ts` | 拾取服务 | 中 |
| `vrender-core/src/plugins/plugin-service.ts` | 插件服务 | 中 |
| `vrender-core/src/graphic/graphic-service/` | 图形服务 | 中 |

### 低影响（直接迁移）

| 模块 | 影响 | 风险 |
|------|------|------|
| `vrender-kits/src/register/` | 图形注册 | 低 |
| `vrender-core/src/render/contributions/` | 渲染贡献者 | 低 |

---

## ✅ 架构验收结论

### 验收状态：通过（v1.2）

A1 重构目标已达成：新架构（factory + registry + entries + app-context）已建立并可用，inversify-lite npm 依赖已移除。

### 当前架构状态

```
┌─────────────────────────────────────────────────────────────┐
│                    新架构（主推）                              │
│  createBrowserApp() → AppContext → Factory/Registry/Plugin   │
│  ✅ 已完成，可直接使用                                         │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ 兼容
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    旧架构（兼容层，待废弃）                       │
│  import '@visactor/vrender-core' → modules.ts → container    │
│  ⚠️ 保留向后兼容，不推荐新代码使用                              │
└─────────────────────────────────────────────────────────────┘
```

### 遗留项

| 项目 | 状态 | 说明 |
|------|------|------|
| `common/inversify` 目录 | ⚠️ 保留 | 内部兼容层，待后续清理 |
| `container.ts` / `modules.ts` | ⚠️ 保留 | 兼容旧全局装配路径，已标记 deprecated |
| `modules.ts` 自动加载 | ⚠️ 保留 | 提供默认装配，保持兼容 |
| 锁文件历史快照 | ✅ 可忽略 | 已发布包的历史记录 |

### 后续建议

1. **保持默认入口收敛**：所有新增示例和新增能力优先落在 `create*App()` 路径
2. **限制兼容层扩散**：旧路径只接受兼容性修复，不再承载新特性
3. **按时间线清理**：按下述废弃时间线推进旧架构退出

### 废弃时间线

#### 当前阶段：兼容保留期（已生效，v1.3）

目标：在不破坏现有用户代码的前提下，完成新旧架构边界切分。

当前策略：
- `createBrowserApp()` / `createNodeApp()` / `createMiniappApp()` 作为推荐入口
- `common/inversify` 保留为内部兼容层，不再作为公开 API 导出
- `container.ts` 与 `modules.ts` 保留兼容功能，但已标记为 `@deprecated`
- 新文档、新示例、新扩展点默认只介绍 App + Factory + Registry 模式

约束：
- 旧路径允许继续使用，但不再作为新增能力的设计依据
- 与旧路径相关的改动仅接受兼容性修复、阻断性 bug 修复和安全修复
- 不再新增基于 `container.get()`、`ContainerModule`、装饰器注入的公开能力

#### 下一个 minor 版本：只维护不演进

目标：给外部使用方一个完整的小版本迁移窗口。

策略：
- 继续保留 `container.ts` / `modules.ts` / `common/inversify` 兼容实现
- 保持现有公开 API 可用，避免在 minor 版本引入破坏性删除
- 所有新功能、新文档、新示例一律不再覆盖旧路径
- 发布说明中明确旧路径为“兼容保留”，要求业务迁移到 `create*App()` 入口

#### 下一个 major 版本：执行清理

目标：完成旧架构退出，只保留显式组装模型。

计划变更：
- 移除 `container.ts` 的公开导出
- 移除 `modules.ts` 的公开导出和默认全局模块初始化路径
- 删除 `common/inversify` 内部兼容实现
- 删除对旧容器式装配路径的文档、示例和迁移桥接代码

major 升级要求：
- 变更日志中提供从 `container/modules` 迁移到 `create*App()` 的升级说明
- 在 major 发布前的最后一个 minor 版本完成全部迁移文档补齐
- 以 AppContext + Factory + Registry + Plugin 作为唯一受支持的对象组装模型

---

## 🎯 下一步

1. ✅ ~~审核此草案~~：总监与协调者审核设计
2. ✅ ~~确认方案~~：审核通过后确认执行
3. ✅ ~~任务分解~~：将设计转化为具体任务
4. ✅ ~~开发者执行~~：资深开发者按任务执行
5. **归档完成**：A1 重构验收通过，文档归档

---

**文档版本**：v1.2
**最后更新**：2026-04-02
**验收状态**：✅ 通过
