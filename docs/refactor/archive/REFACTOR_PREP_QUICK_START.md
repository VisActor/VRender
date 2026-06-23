# VRender 重构前准备工作 - 快速开始指南

## 🚀 立即开始的 5 个步骤

### 步骤 1: 分析当前测试覆盖（10 分钟）

```bash
# 运行测试覆盖率分析脚本
node scripts/analyze-test-coverage.js

# 查看生成的报告
cat test-coverage-report.json
```

**目标**: 了解当前测试覆盖情况，找出缺失测试最多的模块。

---

### 步骤 2: 运行现有测试（15 分钟）

```bash
# 运行所有测试
rush test

# 查看测试结果
rush test -- --verbose
```

**目标**:
- 确保所有现有测试通过
- 识别失败的测试（如果有）
- 了解测试运行时间

---

### 步骤 3: 补充第一个核心测试（30 分钟）

从最重要的模块开始：**Stage 核心功能**

```bash
# 创建测试文件
touch packages/vrender-core/__tests__/unit/core/stage-lifecycle.test.ts
```

**测试模板**:

```typescript
import { createStage } from '@visactor/vrender-core';

describe('Stage - 生命周期', () => {
  it('应该正确创建 Stage', () => {
    const stage = createStage({
      canvas: 'test-canvas',
      width: 800,
      height: 600
    });

    expect(stage).toBeDefined();
    expect(stage.width).toBe(800);
    expect(stage.height).toBe(600);
  });

  it('应该正确渲染', () => {
    const stage = createStage({
      canvas: 'test-canvas',
      width: 800,
      height: 600
    });

    // 添加一个简单的图形
    const circle = stage.defaultLayer.createCircle();
    circle.x = 400;
    circle.y = 300;
    circle.radius = 50;

    // 触发渲染
    stage.render();

    // 验证渲染结果
    expect(circle).toBeDefined();
  });

  it('应该正确清理资源', () => {
    const stage = createStage({
      canvas: 'test-canvas',
      width: 800,
      height: 600
    });

    // 清理
    stage.release();

    // 验证清理结果
    expect(stage.defaultLayer.children.length).toBe(0);
  });
});
```

**运行测试**:

```bash
rush test -p @visactor/vrender-core -- --testPathPattern=stage-lifecycle
```

---

### 步骤 4: 创建第一个架构文档（20 分钟）

为 **Window/Stage/Layer 架构** 创建设计文档

```bash
# 创建文档文件
touch packages/vrender-core/docs/ARCHITECTURE.md
```

**文档模板**:

```markdown
# Window/Stage/Layer 架构设计

## 概述

VRender 使用三层架构来管理渲染：
- **Window**: 原生环境窗口
- **Stage**: 视口，管理渲染区域
- **Layer**: 图层，管理可叠加的渲染层

## 架构图

```
┌─────────────────────────────────────┐
│         Browser / Native Window     │  ← Window
│  ┌───────────────────────────────┐  │
│  │          Stage                │  │  ← Stage
│  │  ┌───────┐ ┌───────┐ ┌─────┐ │  │
│  │  │Layer1 │ │Layer2 │ │...  │ │  │  ← Layers
│  │  └───────┘ └───────┘ └─────┘ │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

## 职责划分

### Window
- **职责**: 管理原生 Canvas/DOM
- **实现**: `src/core/window.ts`
- **关键方法**:
  - `getCanvas()`: 获取 Canvas 元素
  - `getContext()`: 获取渲染上下文

### Stage
- **职责**: 管理视口和渲染流程
- **实现**: `src/core/stage.ts`
- **关键方法**:
  - `render()`: 触发渲染
  - `addLayer()`: 添加图层
  - `removeLayer()`: 移除图层

### Layer
- **职责**: 管理图形集合
- **实现**: `src/core/layer.ts`
- **关键方法**:
  - `add()`: 添加图形
  - `remove()`: 移除图形
  - `clear()`: 清空图形

## 数据流

```
用户操作 → Stage → Layer → Graphic → Render → Canvas
```

## 事件流

```
用户事件 → Window → Stage → Layer → Graphic → Handler
```

## 设计决策

### 为什么使用三层架构？

1. **关注点分离**: 每层有明确的职责
2. **可扩展性**: 易于添加新的图层类型
3. **性能优化**: 支持增量渲染和脏区域管理
4. **跨平台**: 易于适配不同平台

### 关键权衡

- **复杂度 vs 灵活性**: 三层架构增加了复杂度，但提供了更好的灵活性
- **性能 vs 抽象**: 抽象层可能带来性能开销，但提高了可维护性

## 使用示例

```typescript
// 创建 Stage（自动创建 Window）
const stage = createStage({
  canvas: 'main',
  width: 800,
  height: 600
});

// 添加 Layer
const layer = new Layer();
stage.addLayer(layer);

// 添加图形到 Layer
const circle = createCircle({ x: 400, y: 300, r: 50 });
layer.add(circle);

// 渲染
stage.render();
```

## 相关文件

- `src/core/window.ts`
- `src/core/stage.ts`
- `src/core/layer.ts`
- `src/core/global.ts`

## 未来改进方向

- [ ] 支持离屏渲染
- [ ] 支持 WebGPU
- [ ] 支持多线程渲染
```

---

### 步骤 5: 建立性能基线（15 分钟）

创建简单的性能测试

```bash
# 创建性能测试文件
touch packages/vrender-core/__tests__/performance/stage-performance.test.ts
```

**性能测试模板**:

```typescript
import { createStage, createRect } from '@visactor/vrender-core';

describe('Stage - 性能测试', () => {
  it('应该在合理时间内创建 1000 个图形', () => {
    const stage = createStage({
      canvas: 'test-canvas',
      width: 800,
      height: 600
    });

    const startTime = performance.now();

    for (let i = 0; i < 1000; i++) {
      const rect = createRect({
        x: Math.random() * 800,
        y: Math.random() * 600,
        width: 10,
        height: 10,
        fill: 'blue'
      });
      stage.defaultLayer.add(rect);
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    // 应该在 100ms 内完成
    expect(duration).toBeLessThan(100);
  });

  it('应该在合理时间内渲染 1000 个图形', () => {
    const stage = createStage({
      canvas: 'test-canvas',
      width: 800,
      height: 600
    });

    // 添加 1000 个图形
    for (let i = 0; i < 1000; i++) {
      const rect = createRect({
        x: Math.random() * 800,
        y: Math.random() * 600,
        width: 10,
        height: 10,
        fill: 'blue'
      });
      stage.defaultLayer.add(rect);
    }

    const startTime = performance.now();
    stage.render();
    const endTime = performance.now();

    const duration = endTime - startTime;

    // 应该在 50ms 内完成渲染
    expect(duration).toBeLessThan(50);
  });
});
```

---

## 📋 第一周任务清单

### Day 1: 环境准备和分析
- [ ] 运行测试覆盖率分析
- [ ] 运行所有现有测试
- [ ] 创建测试报告基线
- [ ] 熟悉测试工具和框架

### Day 2-3: 核心架构测试
- [ ] 补充 Stage 生命周期测试
- [ ] 补充 Layer 管理测试
- [ ] 补充事件系统基础测试
- [ ] 创建 Window/Stage/Layer 架构文档

### Day 4-5: 图形系统测试
- [ ] 补充基本图形测试（Circle, Rect, Line）
- [ ] 补充图形变换测试
- [ ] 补充图形层级测试
- [ ] 创建图形系统设计文档

### 周末回顾
- [ ] 检查测试覆盖率进度
- [ ] 运行所有测试确保通过
- [ ] 更新测试检查清单
- [ ] 准备下周计划

---

## 🎯 成功标准

完成第一周后，你应该：

✅ **测试方面**
- 至少补充 20-30 个核心测试用例
- vrender-core 测试覆盖率从 15% 提升到 30%+
- 所有现有测试继续通过

✅ **文档方面**
- 至少创建 2-3 个架构文档
- 有清晰的架构图
- 记录了关键设计决策

✅ **性能方面**
- 建立了基础性能测试
- 记录了当前性能基线
- 识别了性能瓶颈

---

## 🔧 实用命令

```bash
# 运行特定包的测试
rush test -p @visactor/vrender-core

# 运行特定测试文件
rush test -p @visactor/vrender-core -- --testPathPattern=stage

# 监听模式（开发时使用）
rush test -p @visactor/vrender-core -- --watch

# 生成覆盖率报告
rush test -p @visactor/vrender-core -- --coverage

# 查看覆盖率报告
open packages/vrender-core/coverage/lcov-report/index.html
```

---

## 📚 参考资源

### 测试相关
- [Jest 官方文档](https://jestjs.io/docs/getting-started)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

### 文档相关
- [Markdown 语法](https://www.markdownguide.org/)
- [Mermaid 图表](https://mermaid-js.github.io/)

### 性能相关
- [Performance API](https://developer.mozilla.org/en-US/docs/Web/API/Performance)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)

---

## 🆘 遇到问题？

### 测试失败
1. 检查测试环境配置
2. 查看 Jest 配置
3. 确保所有依赖已安装

### 测试运行慢
1. 使用 `--testPathPattern` 只运行相关测试
2. 使用 `--watch` 模式在开发时只运行变更的测试
3. 考虑使用 `jest.maxWorkers` 限制并行度

### 不知道测什么
1. 从关键用户场景开始
2. 测试边界情况
3. 测试错误处理
4. 参考现有测试的模式

---

## 🎉 开始行动！

现在就开始第一步：

```bash
node scripts/analyze-test-coverage.js
```

然后按照上面的步骤一步步执行。记住：**一个好的测试胜过一千个重构**。

祝重构顺利！🚀
