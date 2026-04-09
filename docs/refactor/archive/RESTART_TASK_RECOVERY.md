# 重启 Claude 后任务恢复指南

## 🎯 当前任务上下文

### 任务目标
为 VRender 项目进行全面重构前的准备工作，重点是：

1. **删除依赖注入体系** - 移除 `inversify / inversify-lite`
2. **重构图形状态系统** - 重构 `graphic state model -> state style resolution -> state transition orchestration -> animation execution` 链路

**重要**: 这不是"动画模块重构"，而是"图形状态系统重构，动画只是执行层之一"

### 兼容性边界
- ✅ 保持公开 API 签名和主要入口
- ✅ 允许修正当前不一致/混乱/错误的行为
- ✅ 行为变化需要通过设计说明和迁移说明记录
- ❌ 不进行大面积破坏性接口改造

## 📁 关键文档位置

### 重构计划文档（必读）
1. **`REFACTOR_PREPARATION_PLAN_FIXED.md`** ⭐ **最新的细化重构方案（重点）**
2. **`REFACTOR_PREPARATION_PLAN.md`** - 原始的泛化准备计划
3. **`REFACTOR_PREPARATION_SUMMARY.md`** - 准备工作总结
4. **`REFACTOR_PREP_QUICK_START.md`** - 快速开始指南

### 技术文档
5. **`CLAUDE.md`** - 项目级指南（中文偏好）
6. **`MEMORY.md`** - 项目记忆索引
7. **`packages/*/CLAUDE.md`** - 7个包的详细指南

### 工具和检查清单
8. **`scripts/analyze-test-coverage.js`** - 测试覆盖率分析工具
9. **`scripts/test-checklist.md`** - 测试补充检查清单

## 🚀 重启后的恢复步骤

### 步骤 1: 告诉 Claude 上下文（复制以下消息）

```
我正在为 VRender 项目进行重构前的准备工作。

重构目标：
1. 删除 inversify/inversify-lite 依赖注入体系
2. 重构图形状态系统链路（state model -> style resolution -> transition orchestration -> animation execution）

重要：这不是动画模块重构，而是图形状态系统重构。

请阅读以下文档了解详细情况：
1. REFACTOR_PREPARATION_PLAN_FIXED.md（最新的细化方案）
2. REFACTOR_PREPARATION_SUMMARY.md（准备工作总结）

然后告诉我：
1. 你对重构目标的理解
2. 建议的准备工作优先级
```

### 步骤 2: 等待 Claude 确认理解

Claude 应该会：
- 确认理解重构目标（删除 DI + 重构状态系统）
- 确认理解兼容性边界
- 提供具体的准备工作建议

### 步骤 3: 继续具体工作

根据 Claude 的建议，继续以下工作之一：

**选项 A: 分析当前代码结构**
```bash
# 让 Claude 帮助分析
# 1. inversify 使用情况
# 2. 图形状态系统现状
# 3. 动画集成点
```

**选项 B: 补充测试**
```bash
# 为即将重构的部分补充测试
# 1. DI 系统相关测试
# 2. 状态系统相关测试
# 3. 动画集成测试
```

**选项 C: 创建设计文档**
```bash
# 为新系统创建设计文档
# 1. 新的状态系统设计
# 2. 无 DI 的架构设计
# 3. 迁移方案
```

## 📋 关键上下文要点

### 当前代码状态
- **依赖注入**: 使用 `inversify-lite`
- **状态管理**: 分散在 graphic、animate、components 中
- **测试覆盖率**: ~15% (vrender-core)
- **文档**: 有包级 CLAUDE.md，缺架构设计文档

### 技术债务
1. **依赖注入过度复杂**
   - 使用 inversify-lite 的容器系统
   - 贡献者模式（Contribution Provider）
   - 需要简化为显式注册 + 工厂模式

2. **状态系统混乱**
   - graphic state、style、animation 耦合严重
   - 状态转换逻辑不清晰
   - 样式解析逻辑分散

3. **动画集成问题**
   - 动画触发机制不统一
   - 状态切换到动画的映射不明确

### 重构约束
- **时间**: 准备阶段 6 周
- **兼容性**: 保持公开 API
- **风险**: 需要完整测试覆盖

## 🎯 当前进度

### 已完成
- ✅ 创建 7 个包级 CLAUDE.md 文档
- ✅ 创建项目级 CLAUDE.md 和 MEMORY.md
- ✅ 创建泛化的准备工作计划
- ✅ 创建测试覆盖率分析工具
- ✅ 创建测试检查清单

### 待完成
- ⏳ **阅读和理解 REFACTOR_PREPARATION_PLAN_FIXED.md**
- ⏳ **分析 inversify 使用情况**
- ⏳ **分析图形状态系统现状**
- ⏳ **补充关键模块测试**
- ⏳ **创建新系统设计文档**
- ⏳ **制定迁移方案**

## 🔧 实用命令

### 重启后快速恢复
```bash
# 1. 查看最新的重构方案
cat REFACTOR_PREPARATION_PLAN_FIXED.md

# 2. 查看项目结构
cat CLAUDE.md

# 3. 分析测试覆盖
node scripts/analyze-test-coverage.js

# 4. 查找 inversify 使用
grep -r "inversify" packages/vrender-core/src --include="*.ts"

# 5. 查找状态相关代码
grep -r "state" packages/vrender-core/src/graphic --include="*.ts"
```

## 📝 与 Claude 的有效沟通方式

### 提问模板

**分析代码时**:
```
请分析 packages/vrender-core/src/xxx 模块：
1. 当前实现方式
2. 使用了哪些 inversify 特性
3. 与状态系统的关系
4. 重构建议
```

**制定方案时**:
```
基于 REFACTOR_PREPARATION_PLAN_FIXED.md 中的目标：
1. 分析当前 xxx 模块的实现
2. 提出重构方案
3. 列出需要补充的测试
4. 说明迁移步骤
```

**补充测试时**:
```
为 xxx 模块补充测试：
1. 核心功能测试
2. 边界情况测试
3. 集成测试
4. 重构后回归测试
```

## ⚠️ 重要提醒

### 给 Claude 的关键信息
1. **重构目标明确**: 删除 DI + 重构状态系统
2. **兼容性约束**: 保持公开 API
3. **当前阶段**: 准备阶段，不是实施阶段
4. **优先级**: 理解现状 > 补充测试 > 设计方案

### 避免的陷阱
1. ❌ 不要让 Claude 直接开始重构代码
2. ❌ 不要跳过分析阶段直接写方案
3. ❌ 不要忽视兼容性约束
4. ❌ 不要忘记测试先行原则

## 🎯 验证理解

重启后，确保 Claude 能正确回答：

1. **重构目标是什么？**
   - 删除 inversify DI 体系
   - 重构图形状态系统链路

2. **兼容性边界是什么？**
   - 保持公开 API
   - 允许修正错误行为
   - 需要迁移文档

3. **当前阶段做什么？**
   - 分析现有代码
   - 补充关键测试
   - 设计新系统
   - **不是直接重构**

4. **关键文档有哪些？**
   - REFACTOR_PREPARATION_PLAN_FIXED.md（重点）
   - CLAUDE.md（项目级）
   - packages/*/CLAUDE.md（包级）

## 📞 需要帮助？

如果重启后遇到问题，参考以下资源：

1. **查看最新方案**: `REFACTOR_PREPARATION_PLAN_FIXED.md`
2. **查看项目指南**: `CLAUDE.md`
3. **查看包文档**: `packages/vrender-core/CLAUDE.md`
4. **运行分析工具**: `node scripts/analyze-test-coverage.js`

---

**准备就绪！重启 Claude 后，按照"步骤 1"的消息模板开始对话即可。** 🚀
