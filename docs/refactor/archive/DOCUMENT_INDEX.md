# 📚 VRender 重构项目文档索引

## 🚀 重启 Claude 后从这里开始

### 方式一：完整恢复（推荐）
**文件**: `RESTART_TASK_RECOVERY.md`
- 完整的任务上下文
- 详细的恢复步骤
- 关键上下文要点
- 实用命令和沟通模板

### 方式二：快速恢复
**文件**: `RESTART_QUICK_PROMPT.md` ⭐ **推荐首次使用**
- 可直接复制粘贴的提示词
- 简洁的上下文说明
- 快速开始分析的建议

---

## 📋 核心文档（按阅读顺序）

### 1. 重构方案文档 ⭐⭐⭐
**必读**:
- `REFACTOR_PREPARATION_PLAN_FIXED.md` - **最新的细化重构方案**
- `REFACTOR_PREPARATION_SUMMARY.md` - 准备工作总结

参考:
- `REFACTOR_PREPARATION_PLAN.md` - 原始的泛化准备计划
- `REFACTOR_PREP_QUICK_START.md` - 快速开始指南

### 2. 项目文档
**项目级**:
- `CLAUDE.md` - 项目级指南（包含开发命令和架构说明）
- `MEMORY.md` - 项目记忆索引（包含重构目标）

**包级**:
- `packages/vrender-core/CLAUDE.md` - 核心引擎指南
- `packages/vrender-kits/CLAUDE.md` - 图形注册指南
- `packages/vrender-components/CLAUDE.md` - UI 组件指南
- `packages/vrender-animate/CLAUDE.md` - 动画系统指南
- `packages/react-vrender/CLAUDE.md` - React 绑定指南
- `packages/react-vrender-utils/CLAUDE.md` - React 工具指南
- `packages/vrender/CLAUDE.md` - 主包集成指南

### 3. 工具和检查清单
- `scripts/analyze-test-coverage.js` - 测试覆盖率分析工具
- `scripts/test-checklist.md` - 测试补充检查清单

---

## 🎯 快速导航

### 我想...

#### 了解重构目标
→ 读 `REFACTOR_PREPARATION_PLAN_FIXED.md`

#### 重启 Claude 后恢复工作
→ 用 `RESTART_QUICK_PROMPT.md` 中的提示词

#### 分析当前代码
→ 先读 `packages/vrender-core/CLAUDE.md`

#### 补充测试
→ 用 `scripts/analyze-test-coverage.js` 分析覆盖
→ 参考 `scripts/test-checklist.md`

#### 了解包结构
→ 读对应包的 `CLAUDE.md`

#### 查找文件
```bash
# 查找 inversify 使用
grep -r "inversify" packages/vrender-core/src --include="*.ts"

# 查找状态相关代码
grep -r "state" packages/vrender-core/src/graphic --include="*.ts"

# 查找动画集成
grep -r "animate" packages/vrender-core/src/graphic --include="*.ts"
```

---

## 📊 文档分类

### 🎯 重构相关（最重要）
- `REFACTOR_PREPARATION_PLAN_FIXED.md` ⭐⭐⭐
- `REFACTOR_PREPARATION_SUMMARY.md` ⭐⭐
- `RESTART_TASK_RECOVERY.md` ⭐⭐
- `RESTART_QUICK_PROMPT.md` ⭐⭐⭐

### 📚 项目文档
- `CLAUDE.md` ⭐⭐
- `MEMORY.md` ⭐⭐
- `packages/*/CLAUDE.md` ⭐

### 🛠️ 工具和清单
- `scripts/analyze-test-coverage.js` ⭐⭐
- `scripts/test-checklist.md` ⭐

### 📖 参考文档
- `REFACTOR_PREPARATION_PLAN.md`
- `REFACTOR_PREP_QUICK_START.md`

---

## 🔍 文档关系图

```
RESTART_QUICK_PROMPT.md (重启入口)
    ↓
REFACTOR_PREPARATION_PLAN_FIXED.md (重构方案)
    ↓
CLAUDE.md (项目指南)
    ↓
packages/vrender-core/CLAUDE.md (核心包)
    ↓
scripts/analyze-test-coverage.js (分析工具)
    ↓
scripts/test-checklist.md (测试清单)
```

---

## 💡 使用建议

### 第一次使用
1. 读 `RESTART_QUICK_PROMPT.md`
2. 复制其中的提示词
3. 粘贴给重启后的 Claude

### 需要详细上下文
1. 读 `RESTART_TASK_RECOVERY.md`
2. 根据需要引用其中的内容

### 分析代码时
1. 先读对应的 `CLAUDE.md`
2. 使用 `grep` 查找相关代码
3. 让 Claude 分析特定模块

### 补充测试时
1. 运行 `scripts/analyze-test-coverage.js`
2. 查看 `scripts/test-checklist.md`
3. 优先补充核心模块测试

---

## ⚠️ 重要提醒

### 重启 Claude 后务必做的事
1. ✅ 告诉 Claude 重构目标（复制 `RESTART_QUICK_PROMPT.md`）
2. ✅ 确保 Claude 理解兼容性边界
3. ✅ 明确当前是**准备阶段**，不是实施阶段

### 避免的错误
1. ❌ 不要让 Claude 直接开始重构代码
2. ❌ 不要跳过分析阶段
3. ❌ 不要忘记测试先行原则
4. ❌ 不要忽视兼容性约束

---

## 📞 快速命令

```bash
# 分析测试覆盖
node scripts/analyze-test-coverage.js

# 运行所有测试
rush test

# 查找 inversify 使用
grep -r "inversify" packages/vrender-core/src --include="*.ts"

# 查看重构方案
cat REFACTOR_PREPARATION_PLAN_FIXED.md

# 查看重启提示
cat RESTART_QUICK_PROMPT.md
```

---

**准备就绪！需要重启 Claude 时，打开 `RESTART_QUICK_PROMPT.md` 复制提示词即可。** 🚀
