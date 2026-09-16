# Invalid Point Bounds 修复计划与收敛结果

基线：`fix/invalid-point-bounds-1.0`，HEAD `b568bb44ce006f821decf514d1187fd18bb21111`，PR #2117。

2026-09-16 按用户要求收敛。本记录替代此前范围较大的实施记录；当前修改只保留 area 缺失点所需的路径组织、缓存失效和增量入口修复。

## 目标与根因

保留 PR 排除 `defined: false` 点的 bounds 行为，让实际填充也不受这些坐标影响。原实现的两处问题已用真实 Canvas 复现：

1. `basis + connectedType: none`：插值器仍读取无效点，导致有效邻段越界。
2. 首个 styled segment 只有一个无效点：该点被当成后续 top 起点，bottom 又独立使用原始点，产生错误填充和上下边界错配。

两例的收紧 bounds 均不包含 `(95,20)`，旧实际填充却覆盖该位置，造成漏拾取和脏区风险。修复落在插值前的输入组织；不恢复无效点 bounds、不增加 padding、不关闭剔除。

复现数据（有效点下边界均为 `y1: 0`）：

- basis：`(0,0), (10,10), undefined(500,500,y1=-500), (20,10), (30,0)`。
- connect 分段：第一段为 `undefined(500,500,y1=-500)`；第二段为 `(0,0), (10,10)`。

验收同时确认有效位置仍被填充，不能靠整图不绘制消除越界。

## 收敛范围

| 保留                            | 必要性                                                            |
| ------------------------------- | ----------------------------------------------------------------- |
| area 专用有效区间编译           | none 在缺失点处分段；connect 跳过缺失点；上下边界选取同一组有效点 |
| 原始 segment 索引和有效首尾方向 | 过滤后保持样式归属，避免无效坐标影响裁剪方向                      |
| `connectedType` 的 shape 失效   | 同一图形切换 none/connect 时重建对应路径                          |
| 增量 area 同类修复              | 上下边界均忽略无效坐标，跨批次只承接有效点                        |

| 从本次移出                           | 当前处理                                             |
| ------------------------------------ | ---------------------------------------------------- |
| 共享曲线/area 裁剪的零投影、NaN 修正 | `drawSegments` 和 `render-area.ts` 恢复到 HEAD       |
| 全有效 closed/Catmull–Rom 的行为修正 | 保留既有 `startPoint` 和闭合承接语义，以基线对照验收 |
| `closePath` 缓存失效补充             | 留待独立问题处理                                     |
| incremental WeakMap 连续性状态       | 删除；有有效数据要绘制时才向前查找最近有效点         |
| 增量下边界 offset 修正               | 保持既有行为，留待独立修复                           |

最终涉及 5 个产品源码文件（含 1 个新增内部 helper）。收敛针对行为和状态管理范围，代码行数没有大幅减少；未同时保留新旧两套 area 编译器。

## 实现边界

- `common/area-cache.ts` 在缓存重建时选择有效区间，再调用现有曲线生成器。全有效区间直接复用原始 points 数组。
- 一个样式段保持一个缓存项和一次绘制流程。多个区间以 `defined: false` 曲线分隔；分隔只使用相邻有效区间端点，不产生可见连接面。
- 缓存仍兼容 `{top, bottom}` 及其数组形式，内部增加原始段索引与方向，不新增 package export。
- top 沿用曲线生成器的 `startPoint` 参数，bottom 沿用逆序及 stepBefore/stepAfter 互换；不借机修正既有全有效曲线语义。
- `area-render.ts` 消费成对缓存，保留全有效 linear 快速绘制入口。缓存后重绘不新增有效点分段遍历。
- 增量入口继续只处理既有基础能力，不扩展曲线、clipRange 或拾取。跨空段/缺失段需要连接时向前定位有效点；纯缺失批次跳过历史查询，避免连续追加缺失批次反复扫描前缀。
- 不修改调用方 points/segments，不增加持久连续性状态，不引入其他分支架构。

## 实施与验收

- [x] 两处真实 Canvas 回归：异常远点不填充、有效区间仍填充、none 缺口为空。
- [x] none/connect、有效/无效单点、空段、连续缺失、样式映射、上下边界一致性。
- [x] 11 种曲线的缺失点等价性，clipRange、横纵方向、上下边单独描边。
- [x] `connectedType` 更新刷新缓存；纯重绘和 clipRange 更新复用缓存。
- [x] 增量跨批次与普通 linear 像素对照、多图形交错、替换数据、纯缺失批次扫描计数。
- [x] Stage 拾取、平移、局部重绘与全量重绘像素对照、rough 缓存输入兼容。
- [x] 全有效路径与原始 HEAD 隔离工作区比较：**704/704 组绘制命令一致**。覆盖 11 种曲线 × 4 个 clipRange × 2 种连接模式 × 2 个方向 × 4 种布局；布局包括非分段、普通分段、首段单点及三段承接。
- [x] core 全量：**7 suites / 78 tests 通过**。
- [x] vrender 定向回归：**4 suites / 10 tests 通过**。
- [x] core 无增量类型检查、跨包 compile 通过；ESLint 0 errors，保留 12 条既有 warning；Prettier 检查通过。
- [ ] 远端 Bugserver 用例登记及本次修复的视觉 CI 验证。

全有效对照与定向性能脚本保存在本机 `/tmp/vrender-2117-narrow-verification-benchmark.test.ts`，未把依赖绝对工作区路径的临时测试留在仓库。对照结果为 `/tmp/vrender-2117-narrow-path-comparison.json`。

## 定向性能证据

原生 Canvas、1000×120 画布，1k/10k 点；cold 包含新图形及缓存生成，cached 复用缓存。预热 10 次，交替顺序运行 7 轮，记录每次 draw 的中位数和 min/max。basis 每 17 点有一个缺失点，分段 linear 每段 100 点。

首次测量波动较大，完成其他验证后单独复测一次。下面同时保留两次结果，避免只挑较快数据；数值为修复版相对基线的中位数时间变化。

| 场景            | 首次 cold / cached | 复测 cold / cached |
| --------------- | ------------------ | ------------------ |
| 1k linear       | +1.2% / -4.0%      | -4.3% / +10.0%     |
| 1k basis 缺失   | +9.6% / -8.0%      | +1.6% / +4.1%      |
| 1k 分段 linear  | -11.5% / +3.0%     | +23.5% / -6.9%     |
| 10k linear      | -2.7% / +3.7%      | +3.2% / -8.4%      |
| 10k basis 缺失  | -8.1% / +6.9%      | -4.0% / -1.9%      |
| 10k 分段 linear | +5.4% / +9.1%      | -1.7% / +1.4%      |

复测 10k 分段 linear 的 cold 为 2.156 → 2.119 ms，cached 为 1.538 → 1.560 ms。两次各场景的 min/max 均与基线重叠，部分变化方向反转，未确认稳定退化；这不是性能无回归证明，也不能代替浏览器整页测量。原始数据为 `/tmp/vrender-2117-narrow-performance-first.json` 和 `/tmp/vrender-2117-narrow-performance.json`。

## 可重复验证命令

在 `packages/vrender-core`：

```sh
./node_modules/.bin/jest -c jest.config.js --runInBand
./node_modules/.bin/tsc --noEmit --incremental false --composite false --pretty false
./node_modules/.bin/eslint src/common/area-cache.ts src/common/render-curve.ts src/graphic/area.ts src/render/contributions/render/area-render.ts src/render/contributions/render/incremental-area-render.ts
```

在仓库根目录：

```sh
node common/scripts/install-run-rush.js compile -t @visactor/vrender
```

在 `packages/vrender`：

```sh
./node_modules/.bin/jest -c jest.config.js --runInBand __tests__/graphic/area-invalid-point.test.ts __tests__/graphic/graphic-bounds.test.ts __tests__/core/graphic-bounds.test.ts __tests__/core/stage.test.ts
```

## 剩余边界

本次修复保证无效坐标不参与实际 area 几何；不解决全有效曲线自身的过冲、既有 closed/Catmull–Rom 分段问题、零投影裁剪 NaN 或增量 offset 问题。

本地没有 `BUG_SERVER_TOKEN`，未登记远端 case。此前查询到的 #2117 历史 CI 结果不包含本次工作区修改，不能用作本次通过的证据。合并前仍需完成远端视觉检查。

本记录描述本地验证完成时的结果，后续提交与推送以 Git 历史为准。未修改其他任务的 `2026-09-16-brush-initial-mask.md`。

## Develop 移植（2026-09-16）

基于远端 develop `3c80bbdf1c10b9b4c32abb4c152f9d8e676d72f5`，依次 cherry-pick `b568bb44` 和 `45fd2eb01`。上文的 1.0.x 验证记录保留为来源证据，不代表 develop 的全量测试结果。

- 解决两处导入冲突，保留 develop 已移除 DI 装饰器的 renderer 实现。
- 新增像素回归测试显式加载现有真实 Canvas 测试适配，避免 develop 的默认 mock 令像素/命中断言失去意义。
- Stage 集成测试复用 develop 的 `createBrowserStage` 工具，遵循当前 App 初始化与释放方式。
- 移植后定向验证：core 3 suites / 50 tests、vrender 1 suite / 4 tests 及跨包 compile 均通过。全包测试由推送钩子运行，最终结果记录在 PR。
