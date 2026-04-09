# 任务模板和执行规范

> **文档类型**：开发规范文档
> **负责人**：架构设计师（Claude）
> **读者**：资深一线开发者（执行规范）
> **用途**：指导资深一线开发者如何执行任务

---

## 📋 任务执行流程

### 1. 读取任务
```bash
# 1. 读取任务队列
cat TASK_QUEUE.md

# 2. 选择一个未完成的任务
# 建议优先选择 P0 任务，按任务组顺序执行
```

### 2. 理解上下文
```bash
# 阅读相关文档
cat TASK_PLAN.md           # 总体规划
cat TASK_QUEUE.md          # 任务队列
cat CLAUDE.md              # 项目指南
cat MEMORY.md              # 项目记忆
```

### 3. 执行任务
1. **创建测试文件**（如果文件不存在）
2. **编写测试用例**（按照任务描述中的测试用例清单）
3. **运行测试**：`rush test`
4. **验证覆盖率**：确保覆盖关键路径
5. **修复失败**：调试并修复失败的测试

### 4. 标记完成
在 `TASK_QUEUE.md` 中：
- 将任务下的所有 `[ ]` 改为 `[x]`
- 在"完成标记"处标记 ✅
- 更新"统计信息"和"当前进度"

### 5. 提交结果
```bash
# 提交测试文件
git add packages/vrender-core/__tests__/unit/graphic/*.test.ts
git commit -m "test(vrender-core): add state system tests"
```

---

## 📝 测试文件模板

### 单元测试模板
```typescript
import { Graphic, createGraphic } from '../../../src/graphic';

describe('Graphic State API', () => {
  let graphic: Graphic;

  beforeEach(() => {
    graphic = createGraphic({
      type: 'rect',
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      fill: 'blue'
    });
  });

  afterEach(() => {
    graphic.release();
  });

  describe('useStates', () => {
    test('should apply single state correctly', () => {
      // 准备
      graphic.states = {
        hover: { fill: 'red' }
      };

      // 执行
      graphic.useStates(['hover'], false);

      // 验证
      expect(graphic.attribute.fill).toBe('red');
      expect(graphic.currentStates).toContain('hover');
    });

    test('should merge multiple states', () => {
      // 准备
      graphic.states = {
        hover: { fill: 'red' },
        active: { stroke: 'black' }
      };

      // 执行
      graphic.useStates(['hover', 'active'], false);

      // 验证
      expect(graphic.attribute.fill).toBe('red');
      expect(graphic.attribute.stroke).toBe('black');
      expect(graphic.currentStates).toEqual(['hover', 'active']);
    });
  });
});
```

### 集成测试模板
```typescript
import { createStage } from '../../../src/core';

describe('State Animation Integration', () => {
  let stage: Stage;
  let graphic: Graphic;

  beforeEach(async () => {
    stage = createStage({
      canvas: document.createElement('canvas'),
      width: 800,
      height: 600
    });
    graphic = createGraphic({ type: 'rect', width: 100, height: 100 });
    stage.defaultLayer.add(graphic);
  });

  afterEach(() => {
    stage.release();
  });

  test('should trigger animation when state changes', async () => {
    // 准备
    graphic.states = { hover: { fill: 'red' } };

    // 执行
    graphic.useStates(['hover'], true);

    // 等待动画开始
    await new Promise(resolve => setTimeout(resolve, 50));

    // 验证动画被触发
    expect(graphic.animates.size).toBeGreaterThan(0);
  });
});
```

---

## ✅ 测试编写规范

### 1. 测试命名
```typescript
// ✅ 好的命名：描述性行为
test('should apply single state correctly', () => {});
test('should trigger animation when hasAnimation is true', () => {});

// ❌ 避免的命名：模糊不清
test('test state', () => {});
test('case 1', () => {});
```

### 2. 测试结构
```typescript
// 使用 AAA 模式：Arrange, Act, Assert
test('should merge multiple states', () => {
  // Arrange（准备）
  graphic.states = {
    hover: { fill: 'red' },
    active: { stroke: 'black' }
  };

  // Act（执行）
  graphic.useStates(['hover', 'active'], false);

  // Assert（验证）
  expect(graphic.attribute.fill).toBe('red');
  expect(graphic.attribute.stroke).toBe('black');
});
```

### 3. 边界情况测试
```typescript
describe('edge cases', () => {
  test('should handle non-existent state gracefully', () => {
    // 准备
    graphic.states = {};

    // 执行
    graphic.useStates(['nonexistent'], false);

    // 验证：不应该报错，属性不应该变化
    expect(graphic.attribute.fill).toBe('blue');
  });

  test('should handle empty state array', () => {
    // 执行
    graphic.useStates([], false);

    // 验证
    expect(graphic.currentStates).toEqual([]);
  });
});
```

### 4. Mock 和 Spy
```typescript
import { jest } from '@jest/globals';

test('should call stateProxy with correct parameters', () => {
  // 准备
  const stateProxy = jest.fn((stateName) => {
    return { fill: 'custom' };
  });
  graphic.stateProxy = stateProxy;

  // 执行
  graphic.useStates(['hover'], false);

  // 验证
  expect(stateProxy).toHaveBeenCalledWith('hover', ['hover']);
});
```

---

## 🎯 覆盖率目标

### 测试覆盖率要求
- **语句覆盖率**：≥ 70%
- **分支覆盖率**：≥ 60%
- **函数覆盖率**：≥ 70%
- **行覆盖率**：≥ 70%

### 检查覆盖率
```bash
# 运行测试并生成覆盖率报告
rush test -- --coverage

# 查看覆盖率报告
open coverage/lcov-report/index.html
```

---

## 🐛 常见问题处理

### 1. 测试失败
```bash
# 运行单个测试文件
rush test -- --path packages/vrender-core/__tests__/unit/graphic/graphic-state.test.ts

# 运行特定测试用例
rush test -- --testNamePattern="should apply single state"
```

### 2. Mock 问题
```typescript
// 如果需要 Mock 依赖注入
jest.mock('../../../src/core/global', () => ({
  container: {
    get: jest.fn()
  }
}));
```

### 3. 异步测试
```typescript
// 使用 async/await
test('should complete animation', async () => {
  graphic.useStates(['hover'], true);

  await new Promise(resolve => setTimeout(resolve, 300));

  expect(graphic.animates.size).toBe(0);
});
```

---

## 📊 任务完成检查清单

在标记任务完成前，确保：

- [ ] 所有测试用例都已编写并运行
- [ ] 所有测试用例都通过
- [ ] 测试覆盖率达标（≥ 70%）
- [ ] 代码无 TypeScript 错误
- [ ] 代码符合 ESLint 规范
- [ ] 测试文件已提交到 Git
- [ ] `TASK_QUEUE.md` 已更新完成状态
- [ ] 统计信息和进度已更新

---

## 🔄 反馈循环

### 如果遇到问题
1. **阅读错误信息**：仔细阅读测试失败的原因
2. **查阅文档**：参考 `CLAUDE.md` 和相关包文档
3. **查看源码**：阅读被测试代码的实现
4. **记录问题**：在 `TASK_QUEUE.md` 的任务描述中添加备注

### 如果任务阻塞
1. **标记为阻塞**：在任务描述中添加 `🚫 阻塞原因：...`
2. **继续下一个任务**：选择其他可执行的任务
3. **等待反馈**：等待人类或其他 Agent 提供帮助

---

## 🎓 最佳实践

### 1. 测试独立性
```typescript
// ✅ 每个测试都独立
beforeEach(() => {
  graphic = createGraphic({ ... });
});

afterEach(() => {
  graphic.release();
});

// ❌ 测试之间有依赖
let graphic = createGraphic({ ... }); // 所有测试共享
```

### 2. 清晰的断言
```typescript
// ✅ 清晰的断言
expect(graphic.currentStates).toEqual(['hover', 'active']);
expect(graphic.attribute.fill).toBe('red');

// ❌ 模糊的断言
expect(graphic.currentStates).toBeTruthy();
expect(graphic.attribute).toBeDefined();
```

### 3. 测试边界
```typescript
// 测试正常情况
test('should handle normal case', () => {});

// 测试边界情况
test('should handle edge case: empty array', () => {});
test('should handle edge case: null value', () => {});

// 测试异常情况
test('should throw error for invalid input', () => {});
```

---

## 📚 参考资料

- **Jest 文档**：https://jestjs.io/docs/getting-started
- **测试最佳实践**：https://testingjavascript.com/
- **VRender 项目指南**：`CLAUDE.md`
- **测试覆盖率分析**：`node scripts/analyze-test-coverage.js`

---

**文档版本**：v1.0
**创建时间**：2026-03-27
**最后更新**：2026-03-27
