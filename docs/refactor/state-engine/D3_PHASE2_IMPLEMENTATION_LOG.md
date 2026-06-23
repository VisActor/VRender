# D3 Phase 2 实现留档

> **用途**：记录 Phase 2 实现过程中的关键发现、实现取舍、blocker、验证结果
> **维护者**：Phase 2 实现 agent
> **状态**：待执行

---

## 使用要求

本文件不是可选附件，而是 Phase 2 执行过程的一部分。

以下内容必须留档：

1. 与设计文档不一致的代码现实
2. 影响实现路径的关键判断
3. 与两个硬性验收条件相关的发现
4. 重要 blocker / 风险
5. 关键验证结果

禁止只记录低信息量状态，例如：

- “开始开发”
- “继续处理”
- “差不多完成”

每条记录都必须让后续阅读者能回答：

- 发生了什么
- 为什么重要
- 如何影响实现或验收

---

## 两个硬性验收条件

1. 成品中不得残留任何 `setAttributes(finalAttribute)` / `onStop(props)` base commit 路径。
2. paint-only 不得静默降级回 `addUpdateBoundTag()`。

所有关键记录都应明确说明是否影响上述任一条件。

---

## 推荐记录格式

```md
### YYYY-MM-DD HH:mm

- 背景：
- 发现/问题：
- 结论：
- 影响文件：
- 是否影响硬性验收条件：
- 验证：
- 后续动作：
```

---

## 实现记录

### 2026-04-07 启动前架构澄清

- 背景：
  开发者在实现前提出 4 个边界问题，涉及动画结束提交、paint-only 冷启动、`normalAttrs` 兼容壳和执行依据优先级。
- 发现/问题：
  这些问题如果不提前写死，实现过程中会重新出现“局部可行但违背 Phase 2 成品门槛”的回退。
- 结论：
  1. 普通动画与状态动画一并取消隐式 end-commit-to-base 语义。
  2. paint-only 冷启动采用显式本地 bounds 缓存预热路径，不允许静默 `addUpdateBoundTag()` 回退。
  3. `normalAttrs` 保留为可读的 deprecated alias/view，不保留旧 snapshot/restore 语义。
  4. 本轮执行以 `D3_PHASE2_EXECUTION_PROMPT.md` 为最高优先级执行依据。
- 影响文件：
  `D3_PHASE2_EXECUTION_PROMPT.md`
  `D3_PHASE2_IMPLEMENTATION_GUIDE.md`
  `D3_PHASE2_DEVELOPER_PROMPT.md`
  `D3_PHASE2_IMPLEMENTATION_LOG.md`
- 是否影响硬性验收条件：
  是。前两项直接关联两个硬性验收条件。
- 验证：
  已同步写入执行文档与实现指南，后续应由实现与测试继续验证。
- 后续动作：
  开发实现必须按上述澄清执行，并在后续日志中记录实际落地情况。

### 2026-04-07 第一批红灯测试

- 背景：
  按 Phase 2 两个硬性验收条件和属性分层目标，先新增最小红灯测试，覆盖 `baseAttributes` 真值、`onStop(props)` 恢复语义和 `UPDATE_PAINT` 提交语义。
- 发现/问题：
  1. `Graphic` 尚未暴露或维护 `baseAttributes`，新增测试中 `(graphic as any).baseAttributes` 为 `undefined`。
  2. `Graphic.onStop(props)` 仍然通过 `setAttributes(props)` 写入正式静态路径，未切到 `_restoreAttributeFromStaticTruth()`。
  3. `UpdateTag.UPDATE_PAINT` 尚不存在，说明 paint-only 提交语义仍未落地。
- 结论：
  Phase 2 必须优先收口 `Graphic` 的正式真值模型，再改动画恢复与 paint-only 提交；否则后续测试基线无法稳定建立。
- 影响文件：
  `packages/vrender-core/src/graphic/graphic.ts`
  `packages/vrender-core/src/interface/graphic.ts`
  `packages/vrender-core/src/common/enums.ts`
  `packages/vrender-core/__tests__/unit/graphic/attribute-layer-core.test.ts`
  `packages/vrender-core/__tests__/unit/graphic/state-update-category.test.ts`
- 是否影响硬性验收条件：
  是。第 2 点直接命中“不得残留 `onStop(props)` base commit 路径”，第 3 点直接命中“paint-only 不得静默回退”。
- 验证：
  `./node_modules/.bin/jest --config jest.config.js --runInBand __tests__/unit/graphic/attribute-layer-core.test.ts __tests__/unit/graphic/state-update-category.test.ts --verbose`
  结果：
  - `attribute-layer-core.test.ts` 因 `baseAttributes` 缺失而失败
  - `state-update-category.test.ts` 因 `UpdateTag.UPDATE_PAINT` 缺失而失败
- 后续动作：
  先在 `Graphic` 上建立 `baseAttributes + resolvedStatePatch -> attribute`，再切动画恢复与更新分类。

### 2026-04-07 18:03

- 背景：
  已按 Phase 2 执行文档完成属性分层、动画结束恢复、paint-only 更新分类与 dirty bounds 承接，需要确认实现是否达到可交付状态。
- 发现/问题：
  1. 旧 `normalAttrs` / `applyStateAttrs` 测试基线仍绑定 B1 的 snapshot/restore 语义。
  2. `StateEngine` 中 `stateProxy` 对 compiled states 的行为一度变成“静态 patch + proxy patch 叠加”，与旧兼容语义不一致。
  3. `state-module-parity` 仍有一条把 `graphic.normalAttrs` 当作 legacy backup 的断言，需要收口到 Phase 2 新语义。
- 结论：
  1. `baseAttributes` 已成为正式静态真值，`normalAttrs` 仅保留为可读 deprecated alias/view。
  2. `Graphic.onStop(props)` 与 animate custom helpers 已切到 `_restoreAttributeFromStaticTruth()` / `applyFinalAttributeToAttribute()`，不再隐式 end-commit 到 base。
  3. `UpdateTag.UPDATE_PAINT`、属性更新分类器和 `DirtyBoundsPlugin` 的 paint-only 本地缓存预热路径已落地。
  4. `StateEngine` 已修回 `stateProxy` 兼容语义：只要存在 `stateProxy`，每个 state 的样式贡献都由 proxy 决定，静态 patch 不再对该 state 叠加。
- 影响文件：
  `packages/vrender-core/src/graphic/graphic.ts`
  `packages/vrender-core/src/graphic/state/state-engine.ts`
  `packages/vrender-core/src/graphic/state/attribute-update-classifier.ts`
  `packages/vrender-core/src/common/enums.ts`
  `packages/vrender-core/src/plugins/builtin-plugin/dirty-bounds-plugin.ts`
  `packages/vrender-core/src/interface/graphic.ts`
  `packages/vrender-animate/src/animate-extension.ts`
  `packages/vrender-animate/src/step.ts`
  `packages/vrender-animate/src/custom/*.ts`
  `packages/vrender-core/__tests__/unit/graphic/*.test.ts`
- 是否影响硬性验收条件：
  是。第 2 点直接验证“不得残留 `setAttributes(finalAttribute)` / `onStop(props)` base commit 路径”，第 3 点直接验证“paint-only 不得静默回退到 `addUpdateBoundTag()`”。
- 验证：
  `packages/vrender-core`:
  - `./node_modules/.bin/jest --config jest.config.js --runInBand __tests__/unit/graphic/attribute-layer-core.test.ts __tests__/unit/graphic/state-update-category.test.ts --verbose`
  - `./node_modules/.bin/jest --config jest.config.js --runInBand __tests__/unit/graphic/graphic-state.test.ts __tests__/unit/graphic/normal-attrs.test.ts __tests__/unit/graphic/state-resolution.test.ts __tests__/unit/graphic/state-performance.test.ts __tests__/unit/graphic/state-edge-cases.test.ts __tests__/unit/graphic/glyph-state.test.ts __tests__/unit/graphic/state-animation.test.ts __tests__/unit/graphic/attribute-layer-core.test.ts __tests__/unit/graphic/state-update-category.test.ts --verbose`
  - `rushx test` -> `84/84 suites`, `455/455 tests`
  - `rushx compile` 通过
  - `node_modules/.bin/eslint ...` 定向文件 `0 error / 0 warning`
  `packages/vrender-animate`:
  - `rushx test` -> `6/6 suites`, `18/18 tests`
  - `rushx compile` 通过
  跨包编译：
  - `packages/vrender-components` `rushx compile` 通过
  - `packages/vrender-kits` `rushx compile` 通过
  - `packages/vrender` `rushx compile` 通过
  代码扫描：
  - `rg -n "setAttributes\\(finalAttribute\\)|onStop\\(props\\)|end-commit|commit.*finalAttribute|setAttributes\\(this\\.target\\.attribute\\)" packages/vrender-core packages/vrender-animate -g '*.ts'`
    无命中
- 后续动作：
  Phase 2 代码实现已完成，可进入架构复核或下一阶段任务拆分。

### 2026-04-07 架构复核 close-out gate

- 背景：
  架构复核对照 Phase 2 执行文档、实现代码和已补回的测试结果做了二次检查。结论是主体实现已完成，但 Phase 2 还不能直接标记为正式 `closed`。
- 发现/问题：
  1. `stateProxy` 当前落地语义已经变成“只要存在 proxy，该 state 的贡献就由 proxy 完全决定”，与已发布执行文档中的 `definition.patch -> definition.resolver -> stateProxy` 表述不一致。
  2. `packages/vrender-animate/src/animate-extension.ts` 仍残留一条 `finalAttribute -> setAttributes` fallback。即使当前未见活跃调用，库里仍保留了违禁恢复路径。
  3. `attribute-update-classifier.ts` 已产出 `PICK` 分类，但 `Graphic.submitUpdateByDelta()` 还没有单独的 `PICK` 提交通路，语义尚未完全闭合。
  4. `Glyph` 结果层面已能回到 base truth，但实现形态仍保留旧的 `updateNormalAttrs/applyStateAttrs` 壳，需作为 Phase 3 输入继续收口。
- 结论：
  1. Phase 2 当前应视为“主体实现完成，待 close-out 关闭”，而不是“已正式 closed”。
  2. `stateProxy fully decides per-state contribution` 可以被 Phase 2 接受，但必须在文档中明确标注为 legacy `stateProxy` 兼容语义，不代表未来 shared-state 模型的推荐语义。
  3. `animate-extension` 中残留的 fallback 必须二选一处理：删除，或硬化为只允许 transient path 且在缺少 `_restoreAttributeFromStaticTruth()` 时显式报错/告警。
  4. `PICK` 路径必须二选一：补正式提交通路，或在文档中明确 Phase 2 暂时 piggyback 于 `BOUNDS/SHAPE` 并列为紧邻 follow-up。
  5. `Glyph` 升级为 Phase 3 的正式任务输入，在决策前不再继续扩展 glyph 专属状态语义。
- 影响文件：
  `docs/refactor/state-engine/D3_PHASE2_REVIEW_NOTES.md`
  `docs/refactor/state-engine/D3_ARCH_DESIGN.md`
  `docs/refactor/state-engine/D3_PHASE2_EXECUTION_PROMPT.md`
  `docs/refactor/state-engine/D3_PHASE2_IMPLEMENTATION_GUIDE.md`
  `docs/refactor/state-engine/D3_PHASE2_IMPLEMENTATION_LOG.md`
  `packages/vrender-core/src/graphic/state/state-engine.ts`
  `packages/vrender-animate/src/animate-extension.ts`
  `packages/vrender-core/src/graphic/graphic.ts`
- 是否影响硬性验收条件：
  是。第 2 点直接影响“成品不得残留 `setAttributes(finalAttribute)` / `onStop(props)` base commit 路径”；第 3 点影响 Phase 2 对更新分类闭环的正式表达。
- 验证：
  独立复跑：
  - `./node_modules/.bin/jest --config jest.config.js --runInBand __tests__/unit/graphic/state-engine.test.ts __tests__/unit/graphic/glyph-state.test.ts __tests__/unit/graphic/state-animation.test.ts --verbose`
  结果：
  - `3/3 suites`
  - `24/24 tests`
  关键观察：
  - `state-engine.test.ts` 已固化 `stateProxy fully decides` 语义
  - `glyph-state.test.ts` 当前结果正确，但尚未证明 glyph 形态已完全并回统一主路径
- 后续动作：
  1. 先完成 close-out 文档与代码收尾，再将 Phase 2 标为 `closed`。
  2. close-out 清单：
     - 文档同步接纳 `stateProxy fully decides`，并标为 Phase 2 兼容语义
     - `animate-extension` fallback 已删除或硬化
     - `PICK` 路径已修复或文档说明
     - 本日志已回填 close-out 记录

### 2026-04-07 18:03 Phase 2 close-out completed

- 背景：
  按 close-out prompt 对 Phase 2 做最后一轮收口，目标是不再扩展范围，只关闭剩余 gate，使 Phase 2 可以正式标记为 `closed`。
- 发现/问题：
  1. `AnimateExtension.applyFinalAttributeToAttribute()` 仍保留 `finalAttribute -> setAttributes` 正式写入 fallback。
  2. `submitUpdateByDelta()` 对 `PICK` 只有分类，没有显式提交语义；`visible` 这类 `PAINT | PICK` 变更会留下隐式状态。
  3. 执行文档与架构文档仍保留旧的 `definition.patch -> definition.resolver -> stateProxy` 表述，未明确当前代码已经采用 `stateProxy fully decides per-state contribution` 语义。
- 结论：
  1. `animate-extension` 中残留的正式写入 fallback 已删除；缺少 transient path 时改为显式 `console.warn(...)`，不再调用 `setAttributes(finalAttribute)`。
  2. `PICK` 在 Phase 2 中已明确 piggyback 到 `BOUNDS`：提交阶段显式将 `PICK` 升级为 `BOUNDS`，不引入独立 pick tag。
  3. 文档已同步接受 `stateProxy fully decides per-state contribution`，并明确标注为 **Phase 2 为兼容 legacy `stateProxy` 而接受的语义**，不是未来 shared-state 模型的推荐语义。
  4. `Glyph` 已在文档中写明：Phase 2 不继续扩展 glyph 专属状态语义，Phase 3 再决定是否并回统一状态主路径。
  5. Phase 2 close-out gate 已全部满足，可标记为正式 `closed`。
- 影响文件：
  `packages/vrender-animate/src/animate-extension.ts`
  `packages/vrender-core/src/graphic/graphic.ts`
  `packages/vrender-animate/__tests__/unit/animate-extension-closeout.test.ts`
  `packages/vrender-core/__tests__/unit/graphic/state-update-category.test.ts`
  `docs/refactor/state-engine/D3_ARCH_DESIGN.md`
  `docs/refactor/state-engine/D3_PHASE2_EXECUTION_PROMPT.md`
  `docs/refactor/state-engine/D3_PHASE2_IMPLEMENTATION_GUIDE.md`
  `docs/refactor/state-engine/D3_PHASE2_REVIEW_NOTES.md`
  `docs/refactor/state-engine/D3_PHASE2_IMPLEMENTATION_LOG.md`
- 是否影响硬性验收条件：
  是。第 1 点直接关闭“成品不得残留 `setAttributes(finalAttribute)` / `onStop(props)` base commit 路径”；第 2 点关闭 `PICK` 分类的隐式悬空状态。
- 验证：
  代码扫描：
  - `rg -n "setAttributes\\(finalAttribute\\)|finalAttribute -> setAttributes|target\\.setAttributes\\?\\(finalAttribute\\)" packages/vrender-core packages/vrender-animate -g '*.ts'`
    结果：无命中
  定向测试：
  - `packages/vrender-animate`：
    - `./node_modules/.bin/jest --config jest.config.js --runInBand __tests__/unit/animate-extension-closeout.test.ts __tests__/unit/graphic-state-extension.test.ts __tests__/unit/animate-tracking.test.ts --verbose`
  - `packages/vrender-core`：
    - `./node_modules/.bin/jest --config jest.config.js --runInBand __tests__/unit/graphic/state-update-category.test.ts __tests__/unit/graphic/state-engine.test.ts __tests__/unit/graphic/state-resolution.test.ts --verbose`
  全量回归：
  - `packages/vrender-core` `rushx test` 通过：`84/84 suites`, `455/455 tests`
  - `packages/vrender-animate` `rushx test` 通过：`7/7 suites`, `22/22 tests`
  编译：
  - `packages/vrender-core` / `packages/vrender-animate` / `packages/vrender-components` / `packages/vrender-kits` / `packages/vrender` 的 `rushx compile` 均通过
  定向 ESLint：
  - `packages/vrender-core` / `packages/vrender-animate` close-out 相关文件 `0 error / 0 warning`
- 后续动作：
  1. Phase 2 正式标记为 `closed`。
  2. Phase 3 进入输入准备，优先处理 shared-state 定义与 `Glyph` ownership。
