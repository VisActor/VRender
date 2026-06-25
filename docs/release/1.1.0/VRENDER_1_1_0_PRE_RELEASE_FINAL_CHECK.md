# VRender 1.1.0 发版前最终检查报告

> 文档类型：release readiness / final check
> 生成日期：2026-06-12
> 分支：`remerge-d3`
> 当前 HEAD：`a56d18b38 perf: expose optional component subpaths`
> 对比线上包：npm/bnpm 当前可见 `@visactor/vrender*` `1.0.46`

## 结论

当前分支的主要发版差异可以拆成三类：

1. 状态/动画语义稳定化：这是 1.1.0 的核心功能升级，不应回退。
2. app-scoped runtime 与多端入口：这是默认易用性和多端隔离能力的主要新增成本。
3. 包体积专项：最近几轮在不破坏 root/default 的前提下，完成了 dead source 删除、XML parser 低频化、animate custom register 分层、components public subpath 补齐和收益 gate 文档化。

对比线上 `1.0.46`，`@visactor/vrender-core` npm pack 体积已经小幅下降；增长主要集中在 `@visactor/vrender-kits`、`@visactor/vrender`、`@visactor/vrender-animate` 和 `@visactor/vrender-components`。这些增长不是单一原因导致：

- `kits` / `vrender` 增长主要来自 app-scoped runtime、多端 installers、entries 与 dist 产物。
- `animate` 增长主要来自 animation runtime/update target 能力和 custom register 分层后的 public surface。
- `components` 增长主要来自 label/axis/marker 等稳定语义适配与 public subpath exports。
- `core` 中 graphic/entries 有新增，但 common/reflect/dead source 删除抵消后整体下降。

本轮报告只更新文档，不修改 package version、不新增依赖、不改业务代码。

## 报告索引

- [升级功能报告](./VRENDER_1_1_0_UPGRADE_FUNCTION_REPORT.md)
- [业务使用报告](./VRENDER_1_1_0_BUSINESS_USAGE_REPORT.md)
- [代码增加说明与包体积报告](./VRENDER_1_1_0_CODE_AND_BUNDLE_SIZE_REPORT.md)

## 数据来源

本次检查使用以下本地和线上数据：

| 数据 | 来源 | 用途 |
| --- | --- | --- |
| 分支和提交 | `git status --short --branch`、`git log --oneline --decorate -8` | 确认当前发版检查对象 |
| 本地发布包 | `npm pack --json --dry-run ./packages/<pkg>` | 本地 npm pack 文件集、tgz、unpacked、file count |
| 线上发布包 | `npm pack --json @visactor/<pkg>@1.0.46` | 线上 `1.0.46` tarball 对照 |
| 线上元信息 | `npm view @visactor/<pkg>@1.0.46 version dist.* --json` | 确认线上版本和 tarball |
| gzip 口径 | pack 文件清单逐文件 `zlib.gzipSync(level=9)` 后求和 | 估算 package/module/file 级 gzip 变化 |
| 场景样本 | `docs/refactor/bundle-size/VRENDER_SCENARIO_SIZE_VALUE_ASSESSMENT.md` | VChart line/pie/simple/full 代理场景 |

注意：`packageSize` 是 npm tarball 压缩后大小；`unpackedSize` 是 npm pack 展开后的 raw bytes；本报告的 `file gzip sum` 是逐文件 gzip 求和，不等同于最终业务 bundle gzip。

## 当前状态快照

| 项 | 当前值 |
| --- | --- |
| 分支 | `remerge-d3` |
| 跟踪状态 | `origin/remerge-d3` ahead 21 |
| 工作区 | 发版检查开始时 clean |
| 本地 package version | 仍为 `1.0.46` |
| 目标发版文档版本 | `1.1.0` |
| 线上对比版本 | npm/bnpm `1.0.46` |

版本号尚未在本分支修改，这符合“不修改 package version”的专项约束。真正发版前如要发布 `1.1.0`，版本更新应由 release 流程统一处理。

## Release Gate

当前可以进入 release review，但正式发布前还需要 release-day rerun：

| Gate | 当前判断 | 说明 |
| --- | --- | --- |
| root/default 兼容 | 通过文档和测试基线约束 | full/default 能力未删除；新增的是窄 public subpath/register |
| public API 删除 | 无稳定 public API 删除 | pre-release alpha / internal / dead source 删除已在删除项文档留档 |
| package version | 未修改 | 符合本阶段约束 |
| 线上包对比 | 已完成 pack 对比 | 见代码与包体积报告 |
| VChart/VTable 迁移 | VRender 能力已提供，迁移尚未在本仓库落地 | 需要上层按需 profile 才能拿到 optional 收益 |
| release notes / changelog | 已明确最终口径 | release body 使用状态/动画 release notes + 本目录报告；package/site changelog 由 release workflow 生成 |
| compile smoke | 已通过 | `rush compile -t @visactor/vrender` 覆盖 core/animate/kits/components/vrender |
| full test | 需要 release-day 重跑 | 本报告生成阶段未重跑所有单测 |

## Release-Day 建议命令

正式打包前建议在最终 release commit 上重跑：

```bash
git status --short --branch
git diff --check
rush compile -t @visactor/vrender
cd packages/vrender-core && rushx test --runInBand
cd packages/vrender-animate && rushx test --runInBand
cd packages/vrender-components && rushx test --runInBand
cd packages/vrender && rushx test --runInBand
cd packages/vrender-kits && rushx test --runInBand
```

如果 release 环境包含 Node 出图能力，Node lane 需要使用与 `canvas` native ABI 匹配的 Node 版本。当前状态/动画 release notes 中记录的本地发布验证 Node 是 `20.19.6`。

## Release Notes And Changelog

正式 1.1.0 的发布说明来源为：

- [State and animation stable release notes](../../refactor/state-engine/D3_STABLE_RELEASE_NOTES_DRAFT.md)
- [升级功能报告](./VRENDER_1_1_0_UPGRADE_FUNCTION_REPORT.md)
- [业务使用报告](./VRENDER_1_1_0_BUSINESS_USAGE_REPORT.md)
- [代码增加说明与包体积报告](./VRENDER_1_1_0_CODE_AND_BUNDLE_SIZE_REPORT.md)

自动生成内容的边界：

- package 级 `CHANGELOG.md` 由 release workflow 的 Rush changelog 步骤生成，不手改。
- 站点 `docs/assets/changelog` 由 GitHub Release 发布后的 `release-changelog.yml` 生成 PR。
- 如果正式 release commit 不再是本报告记录的提交，需要先刷新本目录报告和 release notes。

## 需要同步给上层的结论

1. VRender root/default 仍保持完整易用性；上层不用为了普通升级立刻改成 lite。
2. 如果上层要拿包体积收益，应从 VRender public subpath/register 接入，不要 deep import `src/es/cjs` 内部路径。
3. VChart / VTable 应给用户一个可选模式，例如 `full`、`auto`、显式 capability list 或 `false/lite`。
4. VTable 常规场景暂以 VChart line/pie/simple/full 为主要代理；只有 table-only env/component 链路需要单独补 VTable stats。
5. 后续不应继续为了小于 5KB analyzer gzip 的单点能力做 P0 拆分，除非上层场景收益和用户选择语义清楚。
