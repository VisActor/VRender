# 遗留项处理任务队列 - 架构清晰化

> **文档类型**：遗留项处理任务队列
> **负责人**：架构设计师（Claude）制定，资深开发者执行
> **审核者**：总监与协调者
> **设计文档**：A1_ARCH_DESIGN.md
> **当前阶段**：A1 遗留项处理
> **版本**：v1.0
> **创建时间**：2026-04-02

---

## 👥 角色分工

- **架构设计师**：定义任务、验收标准、审查完成质量
- **资深开发者**：执行任务、编写代码、标记完成状态
- **总监与协调者**：监控进度、决策、验收

---

## 📋 遗留项概览

### 遗留原因

A1 重构验收时保留的兼容层代码，主要是为了避免破坏性变更，但需要明确标记为"不推荐新代码使用"。

### 处理目标

1. 明确新旧架构的关系
2. 标记旧架构为 deprecated / internal
3. 补充新架构使用文档
4. 确保架构清晰稳定

---

## 🟡 任务 1：标记 common/inversify 为内部模块

**优先级**：🟡 P1
**预估时间**：1-2 小时
**当前状态**：✅ 已完成
**负责人**：资深开发者

**任务描述**：
将 `common/inversify` 目录标记为内部模块，不作为公开 API 导出。

**具体任务**：
- [x] 从 `packages/vrender-core/src/index.ts` 中移除 `export * from './common/inversify'`
- [x] 添加 `@internal` JSDoc 注释到 `common/inversify` 目录入口
- [x] 评估 `packages/vrender-core/src/index.ts` 中 `export * from './common/explicit-binding'`；当前保持公开，不在任务 1 扩大 API 变更范围
- [x] 确认没有其他入口导出 `common/inversify`
- [x] 确保 TypeScript 编译通过

**验收标准**：
- [x] `common/inversify` 不再作为公开 API 导出
- [x] `common/inversify` 仍有 `@internal` 标记
- [x] TypeScript 编译通过
- [x] 相关测试通过

**补充说明**：
- `container.ts` 和 `modules.ts` 仍可在内部使用，但不再作为公开 API
- 如果需要导出容器相关类型，使用 `@internal` 标记
- 当前代码库中 `common/inversify` 的剩余使用仅为 `packages/vrender-core/src/container.ts` 内部依赖。
- 本轮额外验证了 `packages/vrender-core` 稳定测试，确保入口导出收缩未引入行为回归。

**完成标记**：
- ⏸️ 待开始
- 🔄 进行中
- ✅ 已完成 - 2026-04-02 - 资深开发者

---

## 🟡 任务 2：标记旧模块加载为 deprecated

**优先级**：🟡 P1
**预估时间**：1-2 小时
**当前状态**：✅ 已完成
**负责人**：资深开发者

**任务描述**：
标记旧的 `modules.ts` 和 `container.ts` 为 deprecated，不推荐新代码使用。

**具体任务**：
- [x] 在 `packages/vrender-core/src/container.ts` 顶部添加 `@deprecated` JSDoc 注释
- [x] 在 `packages/vrender-core/src/modules.ts` 顶部添加 `@deprecated` JSDoc 注释
- [x] 在注释中说明应使用 `createBrowserApp()` 或 `createNodeApp()` 替代
- [x] 确保 TypeScript 编译通过

**验收标准**：
- [x] `container.ts` 有 `@deprecated` 标记
- [x] `modules.ts` 有 `@deprecated` 标记
- [x] 编译通过

**补充说明**：
- 保留功能，但明确标记为不推荐使用
- 提供迁移到新架构的说明
- 注释中同时补充了 `createMiniappApp()`，与当前 `entries/` 实际导出的三类 App 入口保持一致。

**完成标记**：
- ⏸️ 待开始
- 🔄 进行中
- ✅ 已完成 - 2026-04-02 - 资深开发者

---

## 🟡 任务 3：补充新架构使用文档

**优先级**：🟡 P1
**预估时间**：2-3 小时
**当前状态**：✅ 已完成
**负责人**：资深开发者 + 架构设计师

**任务描述**：
补充新架构使用文档，指导用户如何使用新的 factory + registry + entries 模式。

**具体任务**：
- [x] 参考 `NEW_ARCH_GUIDE.md` 文档框架
- [x] 在 `packages/vrender-core/CLAUDE.md` 中补充新架构使用指南
- [x] 说明 `createBrowserApp()` / `createNodeApp()` / `createMiniappApp()` 的用法
- [x] 说明 `AppContext` 的作用
- [x] 说明 Factory 和 Registry 的用法
- [x] 提供从旧架构迁移到新架构的指南
- [x] 补充具体代码示例

**验收标准**：
- [x] CLAUDE.md 中有新架构使用指南
- [x] 有从旧架构迁移的说明
- [x] 文档内容准确完整

**补充说明**：
- 架构设计师已提供 `NEW_ARCH_GUIDE.md` 文档框架
- 资深开发者补充到 `packages/vrender-core/CLAUDE.md`
- 参考 `packages/vrender-core/src/entries/` 和 `packages/vrender-core/src/factory/` 中的实现
- 本轮通过源码对照核验了文档中涉及的入口、类型和方法名，确保 `CLAUDE.md` 与当前实现保持一致。

**完成标记**：
- ⏸️ 待开始
- 🔄 进行中
- ✅ 已完成 - 2026-04-02 - 资深开发者

---

## 🟢 任务 4：设定废弃时间线

**优先级**：🟢 P2
**预估时间**：1 小时
**当前状态**：✅ 已完成
**负责人**：架构设计师

**任务描述**：
在文档中明确旧架构的废弃时间线。

**具体任务**：
- [x] 在 `A1_ARCH_DESIGN.md` 中补充废弃时间线章节
- [x] 说明旧架构（`container.ts` / `modules.ts`）的废弃计划
- [x] 说明 `common/inversify` 的清理计划
- [x] 说明 major 版本升级时的变更计划

**验收标准**：
- [x] 废弃时间线已在文档中明确
- [x] 时间线合理可行

**补充说明**：
- 建议 major 版本前保持兼容
- 建议 minor 版本开始提示 deprecated
- 当前文档已明确三阶段策略：当前兼容保留期、下一个 minor 版本只维护不演进、下一个 major 版本执行清理。

**完成标记**：
- ⏸️ 待开始
- 🔄 进行中
- ✅ 已完成 - 2026-04-02 - 资深开发者

---

## 📊 任务完成追踪

### 统计信息
- **总任务数**：4 个
- **已完成**：4 个
- **进行中**：0 个
- **待开始**：0 个

### 当前进度
```
进度：100% (4/4)
[■■■■■■■■■■]
```

---

## ✅ 完成标准

### 任务 1-2 完成
- [x] `common/inversify` 不再作为公开 API 导出
- [x] `container.ts` 和 `modules.ts` 有 `@deprecated` 标记
- [x] TypeScript 编译通过

### 任务 3 完成
- [x] CLAUDE.md 中有新架构使用指南
- [x] 有从旧架构迁移的说明

### 任务 4 完成
- [x] 废弃时间线已在文档中明确

### 整体完成
- [x] 所有 4 个任务完成
- [x] 架构清晰稳定
- [x] 新旧架构关系明确

---

## 🎯 执行顺序

### 推荐顺序
1. **任务 1**：标记 common/inversify 为内部模块（最基础）
2. **任务 2**：标记旧模块为 deprecated（与任务 1 配合）
3. **任务 3**：补充新架构使用文档（需要架构设计师配合）
4. **任务 4**：设定废弃时间线（架构设计师完成）

### 并行可能性
- 任务 1 和任务 2 可以并行
- 任务 3 需要任务 1-2 完成后补充
- 任务 4 由架构设计师完成

---

**文档版本**：v1.0
**创建时间**：2026-04-02
