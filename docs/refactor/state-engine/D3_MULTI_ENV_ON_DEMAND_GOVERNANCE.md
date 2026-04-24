# D3 Multi-Env And On-Demand Governance

> **文档类型**：治理任务文档
> **用途**：为 VRender 维护者、架构师和实现 agent 明确 “多环境一等支持” 与 “细粒度按需装配” 是否继续作为正式承诺保留，以及若保留应如何在 app-scoped 路径下完成治理
> **当前状态**：治理已完成到足以支撑 browser alpha；长期 support matrix / advanced surface 仍作为 post-alpha follow-up
> **重要说明**：本文件不是新的 D3 主架构设计；它只处理 app-scoped 接入下的 contract / API / 验证 / 文档治理，不重开 Phase 2 / 3 / 4 已关闭设计

---

## 1. Problem framing

### 1.1 Current closure update

截至当前 browser alpha close-out，这条治理线已经完成了用于解锁 browser alpha 的最小收口：

1. browser root-package default path 继续作为主推荐 contract
2. node path 继续保留，但 node runtime readiness 仍单独挂账
3. 非 browser/node 环境能力仍在，但不再默认描述成已经进入对等 app-scoped 一等契约
4. fine-grained on-demand 能力仍在，但不再描述成已由 root app creator 等价承接
5. root app creator 的 public typing 已修正为返回 `IApp`
6. external-stage consumer-side app-scoped 验证已通过；普通用户主链仍应推进 app-provider-first / VChart-created-stage

后续如果继续治理，应按 [D3_POST_ALPHA_WRAPUP_PLAN.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_POST_ALPHA_WRAPUP_PLAN.md) 中的 P1 support matrix 项推进，不再把它作为 browser alpha gate blocker。

当前已经形成的事实是：

1. `@visactor/vrender` 根包的新主路径已经明确收口为：
   - `createBrowserVRenderApp()`
   - `createNodeVRenderApp()`
   - `app.createStage()`
2. 这条路径对 browser root-package 默认接入已经足够稳定，可以作为上层继续迁移与验证的主入口。
3. 但 VRender 历史上还承载了另外两类能力：
   - 多环境支持：browser / node / miniapp / feishu / wx / tt / taro / harmony / lynx 等
   - 细粒度按需装配：按 env / graphic / picker / plugin 选择性装配
4. 在 app-scoped 路径下，这两类能力都没有被彻底删除，但它们已经不再与新的 root-package 默认路径等价。

当前治理任务要回答的不是“这些能力以前有没有存在”，而是：

- VRender 是否还要继续把它们作为 **正式 public contract** 保留？
- 如果要保留，应补齐哪些 app-scoped surface、类型面、验证面与文档面？
- 如果不保留，应如何明确缩窄 contract，避免上层继续产生错误预期？

---

## 2. Governance questions

这轮治理必须明确回答 4 个问题：

1. `多环境一等支持` 是否继续作为正式承诺保留？
2. 如果保留，保留到什么粒度：
   - 所有历史环境都一律承诺
   - 还是只承诺一个经过筛选的 support matrix
3. `细粒度按需装配` 是否继续作为正式承诺保留？
4. 如果保留，它应通过什么 public app-scoped surface 暴露：
   - env-scoped installer family
   - graphic/picker/plugin installer family
   - 还是一个更通用但明确的 advanced assembly contract

如果这 4 个问题没有被明确回答，上层仓库就会继续把“历史能力仍可碰到”误读成“新主路径已经正式承接”。

---

## 3. Conservative contract after browser alpha

在长期 support matrix 和 advanced public surface 最终拍板前，建议继续按下面口径对外说明：

1. **正式主推荐路径**
   - browser: `@visactor/vrender` + `createBrowserVRenderApp()`
   - node: `@visactor/vrender` + `createNodeVRenderApp()`，但仍需单独验证真实 node runtime
2. **多环境能力**
   - 仍然存在
   - 但除 browser/node 外，当前不要默认描述成已经进入对等 app-scoped 一等契约
3. **按需装配能力**
   - 仍然存在
   - 但当前不要默认描述成已经由 root app creator 等价承接
4. **隔离语义**
   - 当前 app-scoped 默认可理解为 app registry / lifecycle / bootstrap timing 的显式化
   - 不要默认理解成完全隔离的 per-app/per-env runtime container

这条 conservative contract 的目的不是永久缩窄能力，而是在 post-alpha 治理完成前避免上层再建立错误预期。

---

## 4. Current confirmed facts

### 4.1 Multi-env side

当前已确认：

1. `vrender-core` 仍然保留 `createMiniappApp()`。
2. `vrender-kits` 仍导出 browser / node / feishu / lynx / taro / wx / tt / harmony 等 env loader。
3. 但 app-scoped installer surface 当前只有：
   - `installBrowserEnvToApp`
   - `installNodeEnvToApp`
4. `vrender-kits` 的 root installer export 测试当前也只固定了 browser/node 两套 app installer。
5. 现有 triage 已经记录过实际混用问题：
   - 在 root app creator 路径中再显式调用 `initBrowserEnv()` / `initFeishuEnv()` / `initAllEnv()`，会打乱 app-scoped browser handler 装配链。

结论：

- 多环境能力没有消失。
- 但新 public contract 已经天然偏向 browser/node。

### 4.2 On-demand side

当前已确认：

1. 根包 `createBrowserVRenderApp()` / `createNodeVRenderApp()` 会自动执行默认 env / graphics / pickers 安装链。
2. `installDefaultGraphicsToApp()` 与 `installBrowserPickersToApp()` / `installNodePickersToApp()` 当前都是默认集合，不是细粒度 public installer family。
3. legacy / 更底层 surface 仍保留 `registerRect()` / `registerArc()` / `registerLine()` 等按图形注册入口。
4. “按需加载”样例 `anxu-picker` 仍依赖旧 kits/picker 装配出口，并未进入新的默认 baseline。
5. 默认 browser picker 安装链曾出现“安装面过宽，把 optional picker 带进默认路径”的偏差，虽然已修正，但已经证明 default path 与 optional boundary 仍需硬化。

结论：

- 细粒度按需装配仍然存在。
- 但它不再等价于新的 root-package 默认路径。

### 4.3 Isolation and runtime shape

当前实现层还需要显式承认：

1. `runtimeInstallerContext` 与 `runtimeGlobal` 当前仍是 runtime-installer 级单例。
2. `configureRuntimeApplicationForApp()` 会重写共享的 `application.*` factory。
3. 因而当前 app-scoped 更接近：
   - app-scoped registry
   - app-scoped stage ownership
   - app-scoped bootstrap timing
4. 而不是完整的：
   - per-app fully isolated runtime container
   - per-env fully isolated runtime container

这点不必自动判成 bug，但必须被治理文档与用户文档承认。

---

## 5. Governance goal and non-goals

### 5.1 Goal

本任务的目标不是“把历史能力原样搬回新主路径”，而是：

1. 明确 contract
2. 明确 support matrix
3. 明确 public surface
4. 明确验证基线
5. 明确文档口径

### 5.2 Non-goals

这轮不做：

1. 重开 D3 state/shared-state/perf 主设计
2. 为每个历史环境盲目补一个 root creator 而不先确认 support matrix
3. 把所有 legacy surface 全量包装成 app-scoped surface
4. 把治理任务扩成“大范围 API 重设计”

---

## 6. Workstream A: Multi-env first-class support

### 6.1 Decision gate

维护者必须先拍板下面两种路径之一：

1. **继续正式承诺 multi-env first-class support**
2. **缩窄正式 contract，仅保留 browser/node 为一等 app-scoped 路径**

如果选择 2，这条治理线的主要交付就应变成：

- support matrix 文档化
- public contract 缩窄说明
- 避免上层继续误解的类型与文档调整

如果选择 1，才进入下面的实施工作。

### 6.2 If we keep the promise

建议不要笼统承诺“所有历史环境都一等支持”，而应先建立 support matrix：

| Tier | 含义 | 示例 |
|------|------|------|
| Tier 1 | 一等 app-scoped public contract | `browser`, `node` |
| Tier 2 | 继续支持，但走 advanced/custom assembly | 视维护者拍板而定 |
| Tier 3 | 仅 legacy / migration sample，不再作为正式推荐 contract | 历史页或未验证环境 |

多环境 first-class 支持的最小完成标准：

1. 每个被保留为 Tier 1 的环境，都有明确 public app-scoped 入口
2. 这些入口的类型面是完整的
3. 文档明确说明该环境的参数、ownership 和 release contract
4. 有真实 smoke / integration baseline，而不是只有 source-level compile 证据
5. 明确写出是否承诺同进程混合多环境隔离

### 6.3 Required task slices

1. **Support matrix decision**
   - 不要默认把全部历史环境都升级为一等承诺
   - 先按消费者价值和验证成本做分层
2. **Public surface decision**
   - 选择是提供：
     - env-specific creator
     - env-specific `install*EnvToApp`
     - 或 generic advanced assembly contract
3. **Runtime isolation decision**
   - 明确：
     - 当前共享 `runtimeInstallerContext` / `runtimeGlobal` 是否可接受
     - 若不可接受，是否要往更隔离的 runtime container 方向治理
4. **Verification matrix**
   - 每个被保留为一等承诺的环境，至少补：
     - create -> render -> release
     - recreate
     - event/basic interaction if environment supports it
5. **Docs and typing**
   - 把 support matrix、entry contract、isolation caveat 写入正式文档

### 6.4 Exit criteria

只有同时满足下面条件，才能说 multi-env first-class support 治理完成：

1. 已拍板 support matrix
2. 已拍板 public surface
3. 已补齐对应类型面
4. 已补齐对应验证基线
5. adoption / coordination / follow-up 文档口径一致

---

## 7. Workstream B: Fine-grained on-demand assembly

### 7.1 Decision gate

维护者必须先拍板下面两种路径之一：

1. **继续正式承诺 fine-grained on-demand assembly**
2. **缩窄正式 contract，把 root app creator 明确声明为 full-default convenience path**

如果选择 2，这条治理线的主要交付就应变成：

- 文档明确化
- 上层 routing rule 明确化
- default path 与 legacy/custom path 的边界硬化

如果选择 1，才进入下面的实施工作。

### 7.2 If we keep the promise

按需装配 first-class 支持的最小完成标准：

1. 有明确 public app-scoped installer family 或同等级 public custom-assembly contract
2. 调用方可以不用退回 legacy binding context 就完成所需装配
3. default path 不会再错误吸入 optional capability
4. 文档清楚区分：
   - default full bootstrap
   - advanced on-demand assembly
5. 至少有一组真实上层或 smoke 样例证明最小装配可以工作

### 7.3 Required task slices

1. **Granularity decision**
   - 决定是否真的要支持：
     - per-env
     - per-graphic
     - per-picker
     - per-plugin
   - 不要在没有消费者需求的粒度上盲目扩 surface
2. **Public surface decision**
   - 决定是：
     - `installRectToApp()` 这一类强显式 surface
     - 还是受限的 bundle installer / manifest 式 contract
3. **Default path hardening**
   - 固定 default path 不再吸入 optional capability
   - 把“optional 不应污染 default”做成测试与文档规则
4. **Legacy escape hatch audit**
   - 列清哪些 `register*()` / `load*Env()` / `init*Env()` 仍是历史 surface
   - 明确哪些会被保留、哪些只作为迁移样本存在
5. **Verification**
   - 至少补：
     - minimal 2D custom assembly
     - optional picker / 3D / lottie 之类 capability 不污染 default path
     - release / recreate correctness

### 7.4 Exit criteria

只有同时满足下面条件，才能说 fine-grained on-demand assembly 治理完成：

1. 已拍板需要支持的 granularity
2. 已拍板 public surface
3. default vs optional 边界已有测试固定
4. adoption 文档已写清默认路径与 advanced path 的差别
5. 至少存在一条不依赖 legacy binding context 的 public advanced assembly 样例

---

## 8. Recommended execution order

建议按下面顺序推进，不要并行无边界扩张：

1. **先补文档**
   - 把当前 temporary contract 写清楚
2. **再拍板 multi-env support matrix**
   - 不要先写实现再决定承诺边界
3. **再拍板 on-demand granularity**
   - 不要在 public API 上无差别扩 surface
4. **先 harden default path**
   - 保证 browser/node default path 不继续被 optional capability 污染
5. **最后才补 selected advanced public surface**
   - 只对被正式承诺保留的能力补齐 app-scoped public contract

---

## 9. Suggested deliverables

本治理任务建议至少产出下面几类交付：

1. **一份 support matrix**
   - 列清哪些环境/能力是 Tier 1 / Tier 2 / Tier 3
2. **一份 public surface 清单**
   - 列清哪些 creator / installer / advanced contract 是正式对外承诺
3. **一组验证基线**
   - default path
   - selected multi-env path
   - selected on-demand path
4. **一组文档更新**
   - adoption guide
   - friction review / followups / README 导航
5. **必要的类型面修正**
   - 至少保证正式 public surface 在 TS 上可直接消费

---

## 10. Current verdict

当前统一口径保持为：

1. browser root-package default path 继续作为主推荐 contract
2. node path 继续保留，但仍需单独验证真实 runtime readiness
3. 非 browser/node 环境：
   - 能力仍在
   - 但不要默认描述成已经进入对等 app-scoped 一等契约
4. 细粒度按需装配：
   - 能力仍在
   - 但不要默认描述成已经由 root app creator 等价承接
5. 同进程混合多环境隔离：
   - 在没有专项验证前，不做“已经完全隔离”的承诺

这条口径是 post-alpha 前的保守 contract，不是永久裁决。长期 support matrix 与 advanced public surface 仍需单独收口。
