# VRender 包体积优化 Agent Handoff Template

> 文档类型：后续分模块编码 agent 接手模板
> 用途：保证每次包体积优化都有 owner 判断、before/after 数据、兼容说明和验证证据

## 接手前必读

基础文档：

1. `AGENTS.md`
2. `docs/agent/README.md`
3. `docs/agent/VRENDER_PACKAGE_MAP.md`
4. `docs/agent/VRENDER_RUNTIME_AND_ENTRIES.md`
5. `docs/agent/VRENDER_RENDER_PICKER_REGISTRY.md`
6. `docs/agent/VRENDER_GRAPHIC_PIPELINE.md`
7. `docs/agent/VRENDER_TEST_AND_VERIFICATION.md`

专项文档：

1. [README.md](./README.md)
2. [VRENDER_BUNDLE_BASELINE.md](./VRENDER_BUNDLE_BASELINE.md)
3. [VRENDER_IMPORT_AND_ENTRY_AUDIT.md](./VRENDER_IMPORT_AND_ENTRY_AUDIT.md)
4. [VRENDER_RUNTIME_BOOTSTRAP_SIZE_AUDIT.md](./VRENDER_RUNTIME_BOOTSTRAP_SIZE_AUDIT.md)
5. 阅读自己负责模块对应文档：
   - core/graphic：`VRENDER_GRAPHIC_BUNDLE_COST_INVENTORY.md`、`VRENDER_CORE_SIZE_RISK_MAP.md`
   - animate：`VRENDER_ANIMATE_SIZE_AUDIT.md`
   - components：`VRENDER_COMPONENTS_SIZE_AUDIT.md`
   - kits：`VRENDER_KITS_SIZE_AUDIT.md`
   - vutils：`VRENDER_VUTILS_IMPORT_AUDIT.md`
   - VChart：`VRENDER_VCHART_INTEGRATION_AUDIT.md`
6. [VRENDER_BUNDLE_OPTIMIZATION_BACKLOG.md](./VRENDER_BUNDLE_OPTIMIZATION_BACKLOG.md)

D3 release 口径：

- `docs/refactor/state-engine/D3_REMOVED_API_AND_CALL_CHAIN_LOG.md`
- `docs/assets/guide/zh/asd/Upgrade_Guide/Upgrade_to_1_1_0.md`
- `docs/refactor/state-engine/D3_STABLE_RELEASE_NOTES_DRAFT.md`

## 确认工作区

```bash
git status --short --branch
git branch --show-current
git log --oneline --decorate -8
```

要求：

- 主工作分支应为 `remerge-d3`，如果不是，先记录并确认风险。
- 不修改 package version。
- 不误改 VChart / VTable，除非任务明确要求并在对应仓库单独记录。
- 如果工作区已有他人修改，不能 revert，必须在最终说明中区分。

## 选择负责模块

从 backlog 领取一个 ID，并填写：

```md
Owner module: `<package/module>`
Backlog ID: `<BS-...>`
Target scope: `<package content / full root / line smoke / simple smoke / shared-browser / ...>`
Expected affected group: `<vrender-core/components/animate/kits/vutils>`
Default/root behavior changed: `<no/yes, explain>`
Needs VChart verification: `<yes/no>`
```

如果任务会改变 root/default 行为，默认不是 P0，必须先降级为 P1/P2 并补设计说明。

## Owner 判断模板

```md
### Owner 判断

- 现象：
- 证据文件：
- 疑似带入链路：
- 是 VRender 默认入口问题 / VRender 子入口过宽 / 可选能力默认注册 / VChart 主动 import / bundler 条件 / 第三方依赖：
- 为什么应由当前模块解决：
- 为什么不应要求上层 workaround：
- 不确定点：
```

## Before / After Size 数据

每次代码优化必须先在 [VRENDER_BUNDLE_BASELINE.md](./VRENDER_BUNDLE_BASELINE.md) 追加 VRender 自身 size ledger。VChart / VTable stats 只作为外部 smoke 或回归补充，不再作为下一轮全包内容优化的主依据。

VRender 自身主记录格式：

```md
### YYYY-MM-DD / <backlog-id> / <short-title>

- Commit / branch: `<sha or branch>`
- Package: `<@visactor/vrender-core|...>`
- Build/source scope: `<src|es|cjs|bundle/metafile>`
- Command: `<exact command>`
- Data source: `<file size script / analyzer / build artifact>`

| group/file | before raw | after raw | before gzip | after gzip | delta gzip |
| --- | ---: | ---: | ---: | ---: | ---: |
| `<module>` | | | | | |

Verification:
- `<test/build command>`

Not-tested:
- `<known gap>`
```

外部场景补充格式：

```md
### YYYY-MM-DD / <backlog-id> / <short-title>

- Commit / branch: `<sha or branch>`
- Entry: `<line/simple/full/...>`
- Command: `<exact command>`
- Analyzer source: `<stats html/raw-data/metafile path>`
- Final bundle source: `<build file path>`

| metric | before | after | delta |
| --- | ---: | ---: | ---: |
| analyzer rendered: `<group>` | | | |
| analyzer gzip: `<group>` | | | |
| final min gzip | | | |

Verification:
- `<test/build command>`

Not-tested:
- `<known gap>`
```

注意：

- analyzer gzip 不等于 final bundle gzip。
- 不同 lockfile / branch / build config 的数据不能直接比较。
- 如果只能拿到 rendered，没有 gzip，必须写 “待验证”。
- VChart bundler resolve 已不是下一轮主矛盾；除非任务明确涉及上层 import，否则不要把 VChart stats 当成 owner 判断的唯一证据。

## 删除或收紧接口留档

如果涉及删除、收紧或新增 optional 入口，必须记录：

```md
### API / Entry 留档

- Public API affected:
- Root/default behavior:
- New subpath / installer:
- Deprecated path:
- Migration path:
- Compatibility risk:
- Rejected alternatives:
```

原则：

- root/default 行为不因体积优化变窄。
- 删除 public API 必须有单独 release 说明；本专项默认不删除 public API。
- 新增 subpath 必须更新 package exports、类型产物和测试。
- 不把未公开 deep import 当作正式迁移路径。

## 验证

基础验证按影响包选择：

```bash
rush compile -t @visactor/vrender-core
rush compile -t @visactor/vrender
rush compile -t @visactor/vrender-components
rush compile -t @visactor/vrender-animate
rush compile -t @visactor/vrender-kits
```

常见单测：

```bash
cd packages/vrender-core && rushx test --runInBand
cd packages/vrender && rushx test --runInBand
cd packages/vrender-kits && rushx test --runInBand __tests__/register/register.test.ts
cd packages/vrender-components && rushx test --runInBand
cd packages/vrender-animate && rushx test --runInBand
```

VChart 只读或单独分支验证：

```bash
git -C /Users/bytedance/Documents/GitHub/VChart status --short --branch
wc -c /Users/bytedance/Documents/GitHub/VChart/packages/vchart/build/index-{empty,line,simple,pie}.min.js.gz
```

根据 VChart 实际脚本补充 stats 构建命令。最终必须报告没有跑的验证。

## 提交

提交前：

```bash
git diff --check
git diff --stat
git status --short
```

commit message 遵循 AGENTS.md Lore Commit Protocol。示例：

```text
Clarify the bundle-size owner before changing runtime entries

The audit separates entry resolution, optional installers, and VChart
root imports so later optimization patches can change one boundary at a
time with before/after stats.

Constraint: Do not change VRender package versions or runtime behavior in the audit patch
Rejected: Delete root barrels immediately | public API compatibility risk without stats
Confidence: medium
Scope-risk: narrow
Tested: git diff --check
Not-tested: VChart analyzer regeneration
```

## 分类判断速查

| 类型 | 判断标准 | 推荐动作 |
| --- | --- | --- |
| VRender 默认入口问题 | full/default/lite entry 自身静态带入不该出现的能力 | 优先新增 lite/optional entry；不要削弱 full/default |
| VRender 子入口 re-export 过宽 | 已有 subpath 但内部 `export *` 到全族 | 新增更窄 subpath，保留旧 subpath |
| VRender 可选能力默认注册 | optional 能力在基础 runtime 自动 register | 拆 optional installer；full 入口保持 |
| VChart 主动 import heavyweight entry | VChart 基础入口从 root 或 full 入口拿能力 | VRender 先提供标准窄入口，再由 VChart 替换 |
| bundler tree-shaking / condition 问题 | 源码已有窄入口，但 stats 显示 resolve 到宽入口 | 修 resolver/package exports/condition，附 resolve 证据 |
| 第三方依赖不可避免 | 基础功能真实依赖第三方，且无轻量替代 | 记录不可避免原因，避免反复排查 |

## 完成报告模板

```md
完成：
- Backlog ID:
- 改动文件：
- 行为变化：
- before/after:
- 验证命令：
- 未验证：
- 后续风险：
```
