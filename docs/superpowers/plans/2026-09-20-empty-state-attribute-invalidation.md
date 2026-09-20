# 空状态后的单属性更新失效 Implementation Plan

> **For agentic workers:** 按任务顺序在当前会话执行，每步更新复选框。设计与实施已由用户确认，无需再次申请执行许可。

**Goal:** 修复空状态下共享属性的单属性写入失效，恢复图例文字截断。

**Architecture:** 在 `Graphic.setAttribute` 的已有慢路径复用 `detachAttributeFromBaseAttributes()`，确保写入前保留可比较的旧生效值。保持普通单属性快速路径与空状态提前返回逻辑。

**Tech Stack:** TypeScript、Rush、Jest、Electron Canvas、GitHub CLI。

## Global Constraints

- 静态真值主路径是 `baseAttributes + resolvedStatePatch -> attribute`。
- 普通图元继续共享属性存储；空状态继续跳过不必要的提交。
- 不修改图例布局算法、公开类型或依赖版本。
- 文档优先使用中文。

## Task 1：公共更新入口与回归验证

**Files:**
- Modify: `packages/vrender-core/src/graphic/graphic.ts`
- Test: `packages/vrender-core/__tests__/unit/graphic/attribute-layer-core.test.ts`
- Test: `packages/vrender-components/__tests__/electron/legend/discrete.test.ts`

**Interfaces:** 使用现有 `setAttribute(key, value)`、`addState('selected', false, false)`、`clearStates(false)`；不增加公开接口。

- [ ] 在属性分层测试中覆盖空 `selected` 状态后的宽度和填充更新。使用以下调用顺序，分别断言几何失效和纯绘制失效，并检查重复写入及清除状态后的基础值：

```ts
const graphic = createGraphic();
graphic.states = { selected: {} };
graphic.addState('selected', false, false);
(graphic as any)._updateTag = UpdateTag.NONE;
graphic.setAttribute('width', 30);
expect(graphic.attribute.width).toBe(30);
expect(graphic.shouldUpdateShape()).toBe(true);
graphic.clearStates(false);
expect(graphic.attribute.width).toBe(30);
```

- [ ] 在 Electron 图例测试创建带 value 的固定宽度图例，确保 label 经首次测量后被截断：

```ts
const legend = new DiscreteLegend({
  item: { width: 62, value: { alignRight: true } },
  items: [{ label: 'test1', value: 'average:16', shape: { fill: 'blue' } }]
});
stage.defaultLayer.add(legend as unknown as IGraphic);
stage.render();
const label = legend.find(node => node.name === 'legendItemLabel', true) as IText;
expect(label.clipedText).not.toBe('test1');
expect(label.AABBBounds.width()).toBeLessThanOrEqual(label.attribute.maxLineWidth);
```

- [ ] 运行上述两个测试文件，确认新增用例在修复前失败，保存失败结果。
- [ ] 在 `setAttribute` 慢路径写入前补齐：

```ts
this.detachAttributeFromBaseAttributes();
const nextAttrs = { [key]: value } as Partial<T>;
this.applyBaseAttributes(nextAttrs);
this.commitBaseAttributeMutation(!!forceUpdateTag, context);
```

- [ ] 重跑新增用例及 core 源码测试；运行相关动画测试和 Electron 图例测试。

```sh
cd packages/vrender-core && node_modules/.bin/jest -c jest.config.js --runInBand
```

包内实际执行可使用已有 `node_modules/.bin/jest -c jest.config.js --runInBand`；组件图例使用 `-c jest.electron.config.js --runTestsByPath __tests__/electron/legend/discrete.test.ts`。

- [ ] 编译 core 与组件依赖链，检查改动文件 ESLint、Prettier 和 `git diff --check`。
- [ ] 临时基准比较修复前后：10k 图元普通单属性写入、空状态后首次写入、已分离后的持续写入；交替顺序运行多轮，报告中位数。基准脚本和原始数据放入临时目录，不作为公共测试接口。

## Task 2：提交与 PR

**Files:** 更新本计划的执行记录；PR 正文沿用仓库中文模板。

- [ ] 自查运行时代码仅修改公共写入边界，测试锁定有效 API 行为；确认未夹带其他工作区修改。
- [ ] 提交修复和测试，推送 `codex/fix-empty-state-attribute-invalidation`。
- [ ] 创建指向 `main` 的 PR，说明触发用例、原始提交、修复机制、测试和性能验证结果。原用例属于 chartspace4，使用完整链接明确产品，避免误当作 VRender Bug Server 用例。
- [ ] 核对 PR 的 base/head、文件列表和远端提交，返回 PR 链接。

## 执行记录

设计和方案已在此前讨论中确认；本计划在修改运行时代码前完成自查，后续记录实际结果。
