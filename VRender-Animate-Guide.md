# VRender-Animate 使用指南

VRender-Animate 是 VRender 图形引擎的动画系统，提供强大的动画能力，支持属性动画、自定义动画、状态管理等功能。

## 升级变更

### animate 注册机制

0.x 的 VRender 默认自带 animate，现在需要手动注册。

```typescript
import { registerAnimate, registerCustomAnimate } from '@visactor/vrender-animate';

// 注册基本的动画接口
registerAnimate();
// 注册自定义动画
registerCustomAnimate();
```

### Ticker 接口变更

0.x 的 VRender 中 Ticker 和 Stage 不对应，所以无需传入 Stage，现在需要传入 Stage。并且 Stage 和 Ticker 一一对应

```typescript
import { DefaultTicker } from '@visactor/vrender-animate';
const ticker = new DefaultTicker(stage);
```

## 1. Timeline、Ticker、Animate 核心架构

### 1.1 Timeline（时间线管理器）

Timeline 是动画系统的时间管理核心，负责统一管理所有动画的时间推进。

**核心特性：**

- 基于链表的动画节点管理，支持高效的增删操作
- 支持播放速度控制
- 支持暂停/恢复功能
- 自动计算总时长
- 事件系统支持

**使用示例：**

```typescript
import { DefaultTimeline } from '@visactor/vrender-animate';

// 创建时间线
const timeline = new DefaultTimeline();

// 设置播放速度
timeline.setPlaySpeed(2.0); // 2倍速播放

// 暂停和恢复
timeline.pause();
timeline.resume();

// 监听动画结束事件
timeline.on('animationEnd', () => {
  console.log('所有动画已完成');
});

// 获取时间线状态
console.log('动画数量:', timeline.animateCount);
console.log('播放状态:', timeline.getPlayState()); // 'playing' | 'paused' | 'stopped'
console.log('总时长:', timeline.getTotalDuration());
```

**Timeline 主要方法：**

- `addAnimate(animate)` - 添加动画到时间线
- `removeAnimate(animate, release)` - 从时间线移除动画
- `tick(delta)` - 推进时间线（通常由 Ticker 调用）
- `clear()` - 清空所有动画
- `forEachAccessAnimate(callback)` - 遍历所有可执行动画

### 1.2 Ticker（时钟驱动器）

Ticker 负责驱动时间的推进，有两种实现：

#### DefaultTicker（默认时钟）

基于 requestAnimationFrame 的实时时钟，适用于正常的动画播放场景。

```typescript
import { DefaultTicker } from '@visactor/vrender-animate';

const ticker = new DefaultTicker(stage);

// 添加时间线
ticker.addTimeline(timeline);

// 设置帧率
ticker.setFPS(60);
ticker.setInterval(16); // 或直接设置间隔（毫秒）

// 启动时钟
ticker.start();

// 暂停和恢复
ticker.pause();
ticker.resume();

// 停止时钟
ticker.stop();
```

**DefaultTicker 特性：**

- 自动启停：当没有动画时自动停止
- 帧率控制：支持设置 FPS 或间隔时间
- 随机扰动：避免所有 tick 发生在同一帧

#### ManualTicker（手动时钟）

手动控制的时钟，适用于测试、录制或精确控制的场景。

```typescript
import { ManualTicker } from '@visactor/vrender-animate';

const manualTicker = new ManualTicker(stage);
manualTicker.addTimeline(timeline);

// 手动推进时间
manualTicker.tick(16.67); // 推进一帧的时间

// 跳转到指定时间点
manualTicker.tickTo(1000); // 跳转到1秒时间点
manualTicker.tickAt(5000); // 跳转到5s时间点

// 获取当前时间
console.log('当前时间:', manualTicker.getTime());
```

### 1.3 Animate（动画实例）

Animate 是单个动画的执行实体，支持链式调用的动画定义。

**基本使用：**

```typescript
import { Animate } from '@visactor/vrender-animate';

// 创建动画
const animate = new Animate('moveAnimation', timeline);

// 绑定目标图形（真正使用时请用myRect.animate()）
animate.bind(myRect);

if (!myRect.animates) {
  myRect.animates = new Map();
}
myRect.animates.set(animate.id, animate);

// 定义动画序列
animate
  .to({ x: 100, y: 50 }, 1000, 'easeInOut') // 移动动画
  .wait(500) // 等待500ms
  .to({ fill: 'red' }, 800, 'linear') // 颜色变化
  .from({ opacity: 0.5 }, 300, 'easeOut'); // 从指定状态开始

// 设置回调
animate.onStart(() => console.log('动画开始'));
animate.onFrame((step, ratio) => console.log('动画进度:', ratio));
animate.onEnd(() => console.log('动画结束'));
animate.onRemove(() => console.log('动画被移除'));
```

**动画控制方法：**

```typescript
// 播放控制
animate.play(); // 开始播放
animate.pause(); // 暂停
animate.resume(); // 恢复
animate.stop('end'); // 停止并跳到结束状态
animate.stop('start'); // 停止并回到开始状态
animate.stop({ x: 50, y: 25 }); // 停止并设置为指定状态

// 时间控制
animate.startAt(1000); // 延迟1秒开始
animate.getDuration(); // 获取总时长
animate.getStartTime(); // 获取开始时间

// 属性控制
animate.preventAttr('x'); // 阻止x属性被后续动画修改
animate.preventAttrs(['x', 'y']); // 阻止多个属性
animate.validAttr('x'); // 检查属性是否可以被修改
```

**高级功能：**

```typescript
// 循环动画
animate.loop(3); // 循环3次
animate.loop(Infinity); // 无限循环

// 回弹动画
animate.bounce(true); // 启用回弹效果

// 动画链式依赖
const anim1 = animate1.to({ x: 100 }, 1000);
const anim2 = animate2.after(anim1).to({ y: 100 }, 1000); // anim2在anim1后执行
const anim3 = animate3.afterAll([anim1, anim2]).to({ opacity: 0 }, 500); // anim3在所有动画后执行

// 并行动画
const anim4 = animate4.parallel(anim1).to({ opacity: 0.5 }, 1000); // anim4与anim1并行
```

**动画步骤（Step）详解：**

```typescript
// Step是Animate内部的执行单元
// 每个to()、wait()、from()调用都会创建一个Step

// Step的主要属性
interface IStep {
  type: 'to' | 'wait' | 'from';
  duration: number;
  props: Record<string, any>;
  easing: EasingTypeFunc;

  // 链表结构
  prev?: IStep;
  next?: IStep;

  // 执行方法
  onStart(): void;
  update(end: boolean, ratio: number, out: Record<string, any>): void;
  onEnd(): void;
}
```

---

## 2. AnimationState 使用及 AnimationTransition 管理

### 2.1 动画状态概念

AnimationState 为图形元素提供状态驱动的动画系统，支持预定义状态之间的平滑过渡。

**状态配置接口：**

```typescript
interface IAnimationState {
  name: string; // 状态名称
  animation: IAnimationConfig; // 动画配置
}

interface IAnimationConfig {
  from?: Record<string, any>; // 起始属性
  to?: Record<string, any>; // 目标属性
  duration?: number; // 持续时间
  delay?: number; // 延迟时间
  easing?: EasingType; // 缓动函数
  loop?: boolean | number; // 循环设置
  // ... 更多配置选项
}
```

### 2.2 注册和使用动画状态

```typescript
import { AnimationStates } from '@visactor/vrender-animate';

// 1. 注册基础动画状态
myRect.registerAnimationState({
  name: AnimationStates.APPEAR,
  animation: {
    from: { opacity: 0, scaleX: 0, scaleY: 0 },
    to: { opacity: 1, scaleX: 1, scaleY: 1 },
    duration: 800,
    easing: 'bounceOut'
  }
});

myRect.registerAnimationState({
  name: AnimationStates.HIGHLIGHT,
  animation: {
    to: { fill: 'yellow', lineWidth: 3 },
    duration: 300,
    easing: 'easeInOut'
  }
});

// 2. 注册自定义状态
myRect.registerAnimationState({
  name: 'customGlow',
  animation: {
    to: {
      fill: 'gold',
      stroke: 'orange',
      shadowBlur: 10,
      shadowColor: 'yellow'
    },
    duration: 500,
    easing: 'easeOutQuad'
  }
});

// 3. 应用状态
el.applyAnimationState(
  ['update'],
  [
    {
      name: 'update',
      animation: {
        selfOnly: true,
        ...animationConfig.update,
        type: 'axisUpdate',
        customParameters: {
          config: animationConfig.update,
          diffAttrs,
          lastScale
        }
      }
    }
  ]
);
```

### 2.3 AnimationTransition 转换规则

AnimationTransitionRegistry 管理状态之间的转换规则，决定哪些状态可以互相切换。

**内置转换规则：**

```typescript
// appear动画可以被任何动画覆盖（除了disappear、exit会停止appear）
'appear' -> '*'         // 允许转换，不停止原动画
'appear' -> 'appear'    // 不允许转换（避免重复）
'appear' -> 'disappear' // 允许转换，停止原动画
'appear' -> 'exit'      // 允许转换，停止原动画

// 循环动画（normal）的转换规则
'normal' -> '*'         // 允许转换，不停止原动画
'normal' -> 'normal'    // 不允许转换
'normal' -> 'disappear' // 允许转换，停止原动画
'normal' -> 'exit'      // 允许转换，停止原动画

// 退出动画不能被覆盖（除了disappear）
'exit' -> '*'           // 不允许转换
'exit' -> 'disappear'   // 允许转换，停止原动画
'exit' -> 'enter'       // 允许转换，停止原动画
'exit' -> 'exit'        // 不允许转换

// update和state动画的转换规则
'update' -> '*'         // 允许转换，不停止原动画
'update' -> 'disappear' // 允许转换，停止原动画
'update' -> 'exit'      // 允许转换，停止原动画

'state' -> '*'          // 允许转换，不停止原动画
'state' -> 'disappear'  // 允许转换，停止原动画
'state' -> 'exit'       // 允许转换，停止原动画
```

**自定义转换规则：**

```typescript
import { AnimationTransitionRegistry } from '@visactor/vrender-animate';

const registry = AnimationTransitionRegistry.getInstance();

// 注册自定义转换规则
registry.registerTransition('customState1', 'customState2', (graphic, fromState) => {
  return {
    allowTransition: true, // 是否允许转换
    stopOriginalTransition: true // 是否停止原动画
  };
});

// 通配符规则
registry.registerTransition('*', 'emergency', (graphic, fromState) => {
  // 紧急状态可以打断任何动画
  return {
    allowTransition: true,
    stopOriginalTransition: true
  };
});
```

**转换函数的参数：**

```typescript
type TransitionFunction = (
  graphic: IGraphic, // 目标图形对象
  fromState: string // 源状态名称
) => {
  allowTransition: boolean; // 是否允许进行状态转换
  stopOriginalTransition: boolean; // 是否停止当前正在执行的动画
};
```

---

## 3. 动画注册机制（registerAnimate）

### 3.1 注册过程

```typescript
import { registerAnimate } from '@visactor/vrender-animate';

// 全局注册动画功能到Graphic原型
registerAnimate();
```

**注册效果：**

- 所有继承自 Graphic 的图形对象都将具备动画能力

### 3.2 扩展后的图形功能

注册后，所有图形对象将具备以下动画能力：

#### 状态管理方法（来自 GraphicStateExtension）

```typescript
// 状态注册
myRect.registerAnimationState(state: IAnimationState): this;

// 状态应用
myRect.applyAnimationState(
  state: string[],
  animationConfig: (IAnimationState | IAnimationState[])[],
  callback?: (empty?: boolean) => void
): this;

// 预定义状态方法
myRect.applyAppearState(config: IAnimationConfig, callback?: () => void): this;
myRect.applyDisappearState(config: IAnimationConfig, callback?: () => void): this;
myRect.applyUpdateState(config: IAnimationConfig, callback?: () => void): this;
myRect.applyHighlightState(config: IAnimationConfig, callback?: () => void): this;
myRect.applyUnhighlightState(config: IAnimationConfig, callback?: () => void): this;

// 状态控制
myRect.stopAnimationState(state: string, type?: 'start' | 'end' | Record<string, any>): this;
myRect.clearAnimationStates(): this;
```

#### 动画执行方法（来自 AnimateExtension）

```typescript
// 基础动画创建
myRect.animate(params?: IGraphicAnimateParams): IAnimate;

// 动画执行器
myRect.executeAnimation(config: IAnimationConfig): this;
myRect.executeAnimations(configs: IAnimationConfig[]): this;

// 时间线和时钟创建
myRect.createTimeline(): DefaultTimeline;
myRect.createTicker(stage: any): DefaultTicker;

// 属性管理
myRect.getAttributes(final?: boolean): Record<string, any>;
myRect.setFinalAttributes(finalAttribute: Record<string, any>): void;
myRect.initFinalAttributes(finalAttribute: Record<string, any>): void;
myRect.getGraphicAttribute(key: string, prev?: boolean): any;
```

### 3.3 完整使用示例

```typescript
import { registerAnimate, AnimationStates, DefaultTimeline, DefaultTicker } from '@visactor/vrender-animate';
import { Rect, Circle, Stage } from '@visactor/vrender-core';

// 1. 注册动画系统
registerAnimate();

// 2. 创建舞台和图形
const stage = new Stage({
  container: 'main',
  width: 800,
  height: 600
});

const rect = new Rect({
  x: 100,
  y: 100,
  width: 50,
  height: 50,
  fill: 'blue'
});

stage.defaultLayer.add(rect);

// 3. 使用链式动画API
rect
  .animate()
  .to({ x: 200, fill: 'red' }, 1000, 'linear')
  .wait(500)
  .to({ y: 200, opacity: 0.5 }, 800, 'linear')
  .onEnd(() => console.log('矩形动画完成'));

// 4. 事件驱动的动画
rect.addEventListener('pointerenter', () => {
  rect.applyAnimationState(
    ['hover'],
    [
      {
        name: 'hover',
        animation: {
          to: { fill: 'yellow', scaleX: 1.2, scaleY: 1.2 },
          duration: 200,
          easing: 'easeOutQuad'
        }
      }
    ]
  );
});

rect.addEventListener('pointertap', () => {
  rect.applyAnimationState(
    ['selected'],
    [
      {
        name: 'selected',
        animation: {
          to: {
            stroke: 'orange',
            lineWidth: 3,
            shadowBlur: 5,
            shadowColor: 'orange'
          },
          duration: 300
        }
      }
    ]
  );
});
```
