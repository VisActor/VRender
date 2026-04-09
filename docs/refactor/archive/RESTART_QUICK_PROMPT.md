# 🔄 重启 Claude 快速提示

## 复制这段话给重启后的 Claude：

---

**我正在为 VRender 项目进行重构前的准备工作。**

## 📋 阅读文档

请按顺序阅读并理解以下文档：
1. **`REFACTOR_PREPARATION_PLAN_FIXED.md`** ⭐（最新的细化重构方案，重点读这个）
2. **`REFACTOR_PREPARATION_SUMMARY.md`**（准备工作总结）
3. **`CLAUDE.md`**（项目级指南）

## 🎯 重构目标

1. **删除依赖注入体系** - 移除 `inversify / inversify-lite`，改用显式注册 + 工厂模式
2. **重构图形状态系统** - 重构整条链路：
   ```
   graphic state model -> state style resolution -> state transition orchestration -> animation execution
   ```

**重要澄清**：这不是"动画模块重构"，而是"图形状态系统重构，动画只是执行层之一"

## ✅ 兼容性边界

- ✅ 保持公开 API 签名和主要入口（stage、components、graphic 使用方式）
- ✅ 允许修正当前不一致/混乱/错误的行为
- ✅ 行为变化需要通过设计说明和迁移说明记录
- ❌ 不进行大面积破坏性接口改造

## 📊 当前状态

- **测试覆盖率**: ~15% (vrender-core)
- **依赖注入**: 使用 inversify-lite
- **状态管理**: 分散在 graphic、animate、components 中
- **已有文档**: 7个包级 CLAUDE.md + 项目级指南

## 🚀 请你：

1. **确认理解**：总结你对重构目标的理解
2. **分析现状**：分析当前 inversify 使用情况和状态系统现状
3. **建议优先级**：基于 REFACTOR_PREPARATION_PLAN_FIXED.md，建议准备工作的优先级

---

## 💡 备选：如果你想快速开始分析

如果文档较长，你也可以直接说：

```
请先快速分析：
1. packages/vrender-core/src/ 中 inversify 的使用情况
2. packages/vrender-core/src/graphic/ 中状态相关的代码
3. packages/vrender-animate/src/ 中与状态系统的集成点

然后我们基于 REFACTOR_PREPARATION_PLAN_FIXED.md 讨论准备工作。
```

## 📁 文档位置提醒

- **重构方案**: `REFACTOR_PREPARATION_PLAN_FIXED.md`
- **项目指南**: `CLAUDE.md`
- **包文档**: `packages/vrender-core/CLAUDE.md`
- **完整恢复指南**: `RESTART_TASK_RECOVERY.md`

---

**准备好后重启 Claude，粘贴上面的内容即可继续工作！** 🎯
