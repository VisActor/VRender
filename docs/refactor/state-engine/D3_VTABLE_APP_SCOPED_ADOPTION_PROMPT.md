# VTable App-Scoped Adoption Prompt

> 用途：给在 `VTable` 仓库工作的 agent，处理 VRender D3 稳定版接入时的 app 使用调整与动画契约确认。
> 约束：不要重复 D3 全量背景；只处理 VTable 侧需要执行和验证的内容。

你在 `VTable` 仓库中工作。当前目标是让 VTable 接入 VRender D3 稳定版，不要在 VTable 侧绕开 VRender 标准路径。

## 背景

VRender 当前推荐的运行时入口已经从 root `createStage()` 收敛到 app-scoped creator：

- Browser: `createBrowserVRenderApp()`
- Node: `createNodeVRenderApp({ envParams })`
- Wx / Lynx / Harmony: 对应 `createWxVRenderApp` / `createLynxVRenderApp` / `createHarmonyVRenderApp`

`createStage()` 仍是兼容入口，但新代码不应继续依赖它。

VRender 的状态/动画静态真值模型是：

```text
baseAttributes + resolvedStatePatch -> attribute
```

动画不是静态真值源。普通图元 appear/fade 的推荐写法是：

1. 先把图元静态属性设为最终值，例如 `opacity: 1`
2. 再用 `graphic.animate().from({ opacity: 0 }, ...)` 表示起始态

不要依赖 `animate().to({ opacity: 1 })` 把终点写入 `baseAttributes`。

## 任务

请在 VTable 中完成下面几项检查和最小改造。

### 1. 查找 VRender stage 创建入口

先搜索：

```bash
rg "createStage\\(" packages src test
rg "createBrowserVRenderApp|createNodeVRenderApp|createWxVRenderApp|createLynxVRenderApp|createHarmonyVRenderApp" packages src test
rg "initAllEnv|initBrowserEnv|initNodeEnv|loadBrowserEnv|loadNodeEnv|preLoadAllModule" packages src test
```

判断 VTable 当前是否：

- 直接从 `@visactor/vrender` 调用 root `createStage()`
- 自己初始化 env / registry
- 由上层用户传入外部 stage
- 在同页/同实例中重复创建多个 stage

### 2. 建议接入方式

Browser 默认路径应优先改为：

```ts
import { createBrowserVRenderApp } from '@visactor/vrender';

const app = createBrowserVRenderApp();
const stage = app.createStage({
  canvas,
  width,
  height,
  autoRender: true
});
```

Node 路径应显式传入 node-canvas 兼容包：

```ts
import { createNodeVRenderApp } from '@visactor/vrender';

const app = createNodeVRenderApp({ envParams: CanvasPkg });
const stage = app.createStage({ width, height });
```

如果 VTable 已经支持外部 stage：

- 外部 stage 由调用方拥有和释放
- VTable 不应在 `release()` 中释放外部 app/stage
- VTable 自己创建的 stage 必须由 VTable 在释放路径中清理

如果同一页面可能存在多个 VTable 实例：

- 不建议每个实例永久创建一份全局 app
- 可以使用 VTable-managed shared app，但必须有明确作用域和引用计数或等价释放机制
- 最后一个使用者释放后，应释放 shared app

### 3. 动画契约检查

重点检查 VTable 图元 appear/fade 场景，尤其是默认透明度为 `0` 再 fade 到 `1` 的写法。

需要确认或改造为：

```ts
graphic.setAttribute('opacity', 1);
graphic.animate().from({ opacity: 0 }, duration, easing);
```

或等价的“先写最终静态属性，再声明 from 起始态”的标准写法。

不要使用下面方式作为静态终点来源：

```ts
graphic.setAttribute('opacity', 0);
graphic.animate().to({ opacity: 1 }, duration, easing);
```

因为 `animate().to(...)` 不会把终点写入 `baseAttributes`；动画结束后如果后续状态/更新恢复静态真值，可能回到旧静态属性。

### 4. 验证场景

请补或执行最小验证：

1. Browser 首帧渲染正常
2. release 后 recreate 正常
3. 表格单元格图元 appear/fade 结束后不消失
4. 动画结束后再次触发 render/update，opacity 仍保持最终静态值
5. 如果 VTable 支持 Node 渲染，使用 Node `20.19.6` 和匹配的 `canvas` native ABI 验证 create -> render -> export/release
6. 如果 VTable 仍支持外部 stage，确认 VTable release 不释放外部 stage/app

### 5. 不要做的事

- 不要在 VTable 侧长期维护 VRender 的 `baseAttributes` / `finalAttribute` 内部缓存
- 不要为了 appear/fade 在动画结束时手动猜测并修补 VRender 静态真值
- 不要继续新增 root `createStage()` 调用
- 不要混用 app-scoped creator 和旧 `initAllEnv()` / `preLoadAllModule()` 初始化链

## 输出要求

完成后请输出：

1. 当前 VTable stage/app 创建路径结论
2. 是否仍存在 root `createStage()` 新路径
3. appear/fade 是否已改成最终静态属性 + `from(...)`
4. VTable 自己创建 stage 与外部 stage 的 release ownership
5. 已跑的测试命令和结果
6. 如果仍有阻塞，说明阻塞 owner 是 VTable 还是 VRender
