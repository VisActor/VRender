# 新架构与 Major 清理迁移指南

> **文档类型**：正式迁移指南
> **适用阶段**：Phase 3（删除 `container` 与 `common/inversify` 之后）
> **目标**：以显式 app-scoped 启动为主路径，收敛剩余兼容桥接
> **状态**：正式版

---

## 1. 背景

VRender 已完成两轮核心重构：

- **A1**：对象组装模型重构
  - 从 `container.get()` / `ContainerModule` 迁移到 `Factory + Registry + Plugin + Composition Root`
- **B1**：图形状态系统重构
  - 将状态模型、样式解析、状态切换编排、动画执行拆成清晰分层

进入 **Phase 3** 后，Major 清理的代码部分已经完成，当前架构状态是：

- 补齐 **显式 app-scoped 启动入口**
- 切断默认全局初始化桥接
- 删除 `container.ts`
- 删除 `common/inversify`
- 保留 `modules.ts` / `preLoadAllModule()` 作为窄化兼容层

---

## 2. 当前推荐入口

### 2.1 `@visactor/vrender-core`

`@visactor/vrender-core` 提供的是**底层 App 入口**，适合框架层或需要自定义上下文的使用方：

- `createBrowserApp()`
- `createNodeApp()`
- `createMiniappApp()`
- `createApp()`（当前等同于 browser app）

这些入口返回的是 **裸 AppContext 能力**：

- `app.createStage()`
- `app.installPlugin()`
- `app.installPlugins()`
- `app.uninstallPlugin()`
- `app.registry`
- `app.factory`
- `app.release()`

它们适合做底层装配，但**不会自动执行根包默认注册链**。

### 2.2 `@visactor/vrender`

从 Phase 0 开始，`@visactor/vrender` 新增了显式启动入口：

- `createBrowserVRenderApp()`
- `createNodeVRenderApp()`
- `bootstrapVRenderBrowserApp(app)`
- `bootstrapVRenderNodeApp(app)`

推荐规则：

- 如果你使用的是 **根包 `@visactor/vrender`**，优先使用 `createBrowserVRenderApp()` / `createNodeVRenderApp()`
- 如果你使用的是 **核心包 `@visactor/vrender-core`**，优先使用 `createBrowserApp()` / `createNodeApp()` 并显式完成自己的注册

---

## 3. 当前兼容边界

当前阶段已经不再保留旧 DI 容器系统，但仍保留少量 legacy bootstrap 能力，边界如下：

这意味着：

- 新的 `createBrowserVRenderApp()` / `createNodeVRenderApp()` 已经把启动链显式化
- 根包导入时**不再自动执行**默认 bootstrap
- 旧的 `createStage()` 仍保留，但已经改为**懒创建默认 app 后再委托**
- `container.ts` 已删除
- `common/inversify` 已删除
- `modules.ts` 仍然存在，但只作为兼容导出层
- `preLoadAllModule()` 仍然存在，但底层已经切到轻量 binding context，不再依赖 inversify/container

当前根包显式入口会直接完成默认注册，不再依赖 `preLoadAllModule()`：

1. 环境初始化（browser / node）
2. 默认图形注册
3. 默认插件注册
4. 默认动画注册

也就是说，当前推荐路径已经完全脱离旧 DI；剩余兼容层只用于承接旧 `createStage()` 和少量 legacy helper。

---

## 4. vglobal 策略

`vglobal` **保留**，且**不迁移到 app-scoped**。

原因：

- `vglobal` 是全局环境工具单例，不是 DI 容器系统的一部分
- 它负责的是环境检测、RAF/CAF、canvas 创建等全局宿主能力
- 这些能力天然属于当前运行环境，而不是某个 app 实例

Phase 0 中的处理方式：

- `vglobal` 现在由独立模块提供
- `modules.ts` 只做兼容层复用
- 13 个现有源码消费文件无需迁移

结论：

- **不要迁移 `vglobal`**
- 继续直接使用 `vglobal`
- 当前这轮清理只移除旧容器路径，不会删除 `vglobal`

---

## 5. 旧路径与新路径对照

### 5.1 根包启动

旧写法：

```ts
import { createStage } from '@visactor/vrender';
```

这条路径当前仍可工作，但已不再依赖根包导入时的副作用 bootstrap。
当前行为是：

- 第一次调用时懒创建默认 `VRenderApp`
- 后续调用复用同一个默认 app
- 推荐仍然是迁移到显式 `createBrowserVRenderApp()` / `createNodeVRenderApp()`

推荐新写法：

```ts
import { createBrowserVRenderApp } from '@visactor/vrender';

const app = createBrowserVRenderApp();

const stage = app.createStage({
  width: 800,
  height: 600
});
```

Node 侧：

```ts
import { createNodeVRenderApp } from '@visactor/vrender';

const app = createNodeVRenderApp();
const stage = app.createStage({ width: 800, height: 600 });
```

### 5.2 旧容器导入

旧写法：

```ts
import { container } from '@visactor/vrender-core';
```

这条路径已经不可用，因为 `container` 已从公开 API 中完全移除。

推荐新写法：

```ts
import { createBrowserVRenderApp } from '@visactor/vrender';

const app = createBrowserVRenderApp();
```

如果你只使用 core：

```ts
import { createBrowserApp } from '@visactor/vrender-core';

const app = createBrowserApp();
```

然后再显式安装你需要的 factory / registry / plugin。

如果你仍然处在 legacy bootstrap 迁移期，且必须给旧 env/register helper 提供绑定上下文，过渡写法是：

```ts
import { getLegacyBindingContext, preLoadAllModule } from '@visactor/vrender-core';
import { loadBrowserEnv } from '@visactor/vrender-kits';

preLoadAllModule();
loadBrowserEnv(getLegacyBindingContext());
```

但这只是过渡桥接，不是新代码入口。

### 5.3 `container.get()` / `container.getNamed()` / `container.getAll()`

旧写法：

```ts
const service = container.get(ServiceToken);
```

新写法原则：

- Stage 依赖通过 `StageFactory` 和构造参数传递
- 图形构造通过 `GraphicFactory`
- 渲染器与 picker 通过 `registry`
- 扩展通过 `plugin`
- 环境能力通过显式 bootstrap 或 app-scoped env 初始化

### 5.4 `ContainerModule` / `container.load()`

旧写法：

```ts
const module = new ContainerModule(bind => {
  bind(MyPlugin).toSelf();
});

container.load(module);
```

当前推荐替代方向：

- 优先用显式 plugin
- 或者在新入口里集中 bootstrap
- browser fixture 中这类用法已经迁到 `getLegacyBindingContext()` 或显式 app 入口

---

## 6. 推荐迁移步骤

### 步骤 1：先替换启动入口并移除导入时副作用假设

优先把：

- `createStage()`
- `preLoadAllModule()`
- `loadBrowserEnv(container)`
- 无参 `register*()`

替换为：

- `createBrowserVRenderApp()`
- `createNodeVRenderApp()`

并且不要再假设：

- `import '@visactor/vrender'` 会自动完成默认注册
- `import '@visactor/vrender-core'` 会自动完成 `modules.ts` 初始化

### 步骤 2：再替换自定义扩展注册

如果你有自定义图形、渲染器、picker 或插件：

- 图形：迁到 `GraphicFactory`
- 渲染器：迁到 `RendererRegistry`
- picker：迁到 `PickerRegistry`
- 扩展安装：迁到 `plugin`

### 步骤 3：最后清理剩余 legacy bind API

在业务代码稳定跑在新入口之后，再清理：

- `ContainerModule`
- `container.load()`
- `container.bind()`
- `preLoadAllModule()` / `getLegacyBindingContext()` / `modules.ts` 相关依赖

---

## 7. 自定义扩展的迁移方向

### 自定义图形

旧写法倾向于通过全局 register helper 或全局 graphic creator 注入。

新方向：

```ts
app.factory.graphic.register('my-graphic', MyGraphicCtor);
```

### 自定义渲染器

新方向：

```ts
app.registry.renderer.register(symbolKey, renderer);
```

### 自定义 picker

新方向：

```ts
app.registry.picker.register(symbolKey, picker);
```

### 自定义插件

新方向：

```ts
app.installPlugin(myPlugin);
```

---

## 8. 测试迁移建议

旧测试常见做法：

- 直接 `container.bind()`
- 直接 `container.load()`
- 在 browser fixture 里直接 `ContainerModule`

当前建议：

- 新增测试优先使用显式 app 入口
- 每个测试创建独立 app
- mock 能力通过显式 plugin / 显式注册完成

对现有 browser demo / fixture：

- 优先迁到显式 app 入口
- 如果必须走 legacy bind，改为 `getLegacyBindingContext()`
- 本地 `inversify` 教学示例不属于运行态桥接范围，可单独保留或后续清理

---

## 9. 当前仍属于兼容层的 API

以下 API 当前仍可用，但不建议继续作为新代码入口：

- `modules.ts`
- `preLoadAllModule()`
- `getLegacyBindingContext()`
- `loadBrowserEnv(ctx?)` / `loadNodeEnv(ctx?)` 这一类 legacy bind 上下文初始化方式
- 少量 browser fixture 中的 legacy bind helper

其中：

- `container.ts` 已删除
- `common/inversify` 已删除
- `modules.ts` 仍处于 deprecated 状态
- 后续清理重点将转到 `modules.ts` 和 legacy bootstrap 的最终收缩

---

## 10. 推荐选型

如果你是：

- **业务方，直接用根包**
  - 选 `createBrowserVRenderApp()` / `createNodeVRenderApp()`
- **框架层，自己控制组装**
  - 选 `createBrowserApp()` / `createNodeApp()` / `createMiniappApp()`
- **已有大量旧代码**
  - 先迁启动入口，再逐步迁容器 API

当前最务实的结论是：

- **新代码不要再依赖任何 legacy bind helper**
- **根包优先走新的显式 app-scoped 启动函数**
- **`vglobal` 保持不动**

---

## 11. 当前状态与后续收尾

当前已经完成：

1. 移除 `container.ts`
2. 移除 `common/inversify`
3. 切断默认全局初始化路径
4. 保留 `modules.ts` / `preLoadAllModule()` / `getLegacyBindingContext()` 作为窄化兼容层

后续收尾重点：

1. 继续减少对 `preLoadAllModule()` 和 `getLegacyBindingContext()` 的依赖
2. 在合适版本清理 `modules.ts` 的兼容导出
3. 将剩余 legacy fixture/demo 统一迁到显式 app 启动
