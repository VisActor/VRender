# VRender 重构 - 总体任务规划

> **文档类型**：架构规划文档
> **负责人**：架构设计师（Claude）
> **读者**：总监与协调者、资深一线开发者

---

## 👥 角色身份

- **总监与协调者**：制定目标、协调资源、审查决策
- **架构设计师（Claude）**：架构设计、任务规划、质量审查
- **资深一线开发者（另一个 Agent）**：执行任务、编写代码

---

## 📋 项目背景

### 重构目标
1. **删除依赖注入体系**：移除 `inversify/inversify-lite`，改用显式注册 + 工厂模式
2. **重构图形状态系统**：重构 `graphic state model -> state style resolution -> state transition orchestration -> animation execution` 链路

### 兼容性边界
- ✅ 保持公开 API 签名和主要入口（stage、components、graphic）
- ✅ 允许修正当前不一致/混乱/错误的行为
- ✅ 行为变化需要通过设计说明和迁移说明记录
- ❌ 不进行大面积破坏性接口改造

---

## 📊 当前状态（2026-04-04）

### 已完成

| 阶段 | 状态 | 任务数 |
|------|------|--------|
| 基础设施：jest-electron 稳定性修复 | ✅ 已完��� | 4/4 |
| 状态系统关键测试补充 | ✅ 已完成 | 10/10 |
| **A1：对象组装模型重构** | ✅ 已完成 | 17/17 |
| **遗留项处理** | ✅ 已完成 | 4/4 |
| **B1：图形状态系统重构** | ✅ 已完成 | 11/11 |
| **Major 清理预研（C1）** | ✅ 已完成 | 5/5 |
| **Phase 0：前置准备** | ✅ 已完成 | 6/6 |
| **Phase 1：切断默认全局初始化** | ✅ 已完成 | 3/3 |
| **Phase 2：移除 container 公开入口** | ✅ 已完成 | 4/4 |
| **Phase 3：删除 common/inversify** | ✅ 已完成 | 6/6 |

### 当前架构状态

```
新架构（主推）
  createBrowserVRenderApp() → AppContext → Factory/Registry/Plugin
  ✅ 可用，推荐所有新代码使用

Legacy 兼容层（窄化，不含 inversify）
  preLoadAllModule() + getLegacyBindingContext()
  + modules.ts 懒代理 + vglobal 全局单例
  ⚠️ 仅供旧代码兼容，不推荐新代码使用

已移除
  container.ts ✗  common/inversify/ ✗
```

### 发布策略

- Major 清理代码已完成，但**暂不发布 minor/major**
- 等图形状态和动画重构完成后，一起发布

### 待完成

- ⏳ 图形状态与动画重构（下一阶段）

---

## 🎯 下一步行动

**待确认**：图形状态与动画重构的具体范围和任务分解

---

## 📚 相关文档

### 重构文档

| 阶段 | 文档 | 状态 |
|------|------|------|
| A1 对象组装 | `A1_ARCH_DESIGN.md` / `A1_TASK_QUEUE.md` | ✅ 17/17 |
| B1 状态系统 | `B1_ARCH_DESIGN.md` / `B1_TASK_QUEUE.md` | ✅ 11/11 |
| 遗留项 | `LEGACY_TASK_QUEUE.md` | ✅ 4/4 |
| Major 预研 | `C1_TASK_QUEUE.md` | ✅ 5/5 |
| Phase 0-3 | `C0_TASK_QUEUE.md` | ✅ 19/19 |

### 基础设施

| 文档 | 状态 |
|------|------|
| `TASK_QUEUE.md` | ✅ 10/10 |
| `INFRA_TASK_QUEUE.md` | ✅ 4/4 |

### 项目文档

| 文档 | 说明 |
|------|------|
| `CLAUDE.md` | 项目级指南 |
| `NEW_ARCH_GUIDE.md` | 新架构与迁移指南（正式版） |
| `REFACTOR_PREPARATION_PLAN_FIXED.md` | 重构方案 |

---

**文档版本**：v4.0
**创建时间**：2026-03-27
**最后更新**：2026-04-04
