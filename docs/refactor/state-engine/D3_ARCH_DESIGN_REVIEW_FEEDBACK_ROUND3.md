# D3 架构设计三轮修订意见

面向文档：

- `/Users/bytedance/Documents/GitHub/VRender2/D3_ARCH_DESIGN.md`
- `/Users/bytedance/Documents/GitHub/VRender-develop/graphic-state-animation-refactor-expectation.md`
- `/Users/bytedance/Documents/GitHub/VRender-develop/D3_ARCH_DESIGN_REVIEW_FEEDBACK.md`
- `/Users/bytedance/Documents/GitHub/VRender-develop/D3_ARCH_DESIGN_REVIEW_FEEDBACK_ROUND2.md`

日期：

- `2026-04-06`

## 使用说明

这份文档是第三轮约束性评审意见，目标不是重复前两轮问题，而是收敛当前版本里仍未闭环的核心机制。

考虑到后续修订仍可能由 agent 执行，本文档继续遵循 harness 风格：

- 结论前置
- 上下文自包含
- 每条问题都说明：
  - 具体问题
  - 为什么仍不符合期望
  - 需要如何修订
  - 修订后应达到什么验收状态

## 当前结论

`D3_ARCH_DESIGN.md` v1.4 已经比 v1.3 明显更接近期望，以下内容已经有实质修正：

- 实例级同名状态定义已从总览图中移出
- resolver 显式失效入口已写入文档
- `isPaintOnly` 已从“只看 geometry”改为“基于 key 分类判断”
- resolver 签名已统一
- `clearStates` 伪代码已补返回值

但当前版本仍不建议直接进入实现拆分。

原因不是大方向错误，而是还剩下两类问题：

- 有些机制在文档中“名义上已经修正”，但伪代码层面仍然不成立
- 有些机制在正文某处已经修正，但总览/流程图/提交语义仍残留旧说法

我当前判断是：

- 方向已基本对齐
- 还差最后一轮收口
- 至少还有 2 个必须修改的问题，外加 2 个建议同步修正的问题

## 必须修改

### 1. 纯视觉快路径仍未真正落地，`PAINT` 仍被提交到 bounds 路径

#### 问题

文档已经把 `_syncAttribute()` 从“无条件打 bounds tag”改成了“基于 delta keys 分类提交”，这是正确方向。

但最终提交函数 `submitUpdate()` 仍然写成：

- `SHAPE` -> `addUpdateShapeAndBoundsTag()`
- `BOUNDS` 或 `PAINT` -> `addUpdateBoundTag()`

对应位置：

- [D3_ARCH_DESIGN.md:632](/Users/bytedance/Documents/GitHub/VRender2/D3_ARCH_DESIGN.md#L632)
- [D3_ARCH_DESIGN.md:634](/Users/bytedance/Documents/GitHub/VRender2/D3_ARCH_DESIGN.md#L634)
- [D3_ARCH_DESIGN.md:636](/Users/bytedance/Documents/GitHub/VRender2/D3_ARCH_DESIGN.md#L636)
- [D3_ARCH_DESIGN.md:637](/Users/bytedance/Documents/GitHub/VRender2/D3_ARCH_DESIGN.md#L637)

#### 为什么仍不符合期望

这意味着：

- 即使某次状态切换只改 `fill/stroke/opacity` 这类纯视觉属性
- 最终仍然会进入 bounds 更新路径

而期望文档对此的约束很明确：

- 纯视觉状态切换应保持快路径
- 不应因为能力支持几何状态，就让默认路径承受几何/bounds 成本

对应约束：

- [graphic-state-animation-refactor-expectation.md:435](/Users/bytedance/Documents/GitHub/VRender-develop/graphic-state-animation-refactor-expectation.md#L435)
- [graphic-state-animation-refactor-expectation.md:459](/Users/bytedance/Documents/GitHub/VRender-develop/graphic-state-animation-refactor-expectation.md#L459)

#### 修订要求

架构文档需要把“纯视觉提交路径”真正写闭环，而不是只在 `_syncAttribute()` 前半段出现。

至少需要明确：

- `PAINT` 不能默认映射到 `addUpdateBoundTag()`
- 纯视觉更新应有独立提交语义
- 如果现有底层框架没有单独的 paint tag，也必须在文档中明确说明：
  - 当前将如何模拟纯视觉更新
  - 为什么这仍然可以视为快路径
  - 它与 bounds 路径在成本上有什么区别

如果做不到这一步，文档就不能再宣称“纯视觉快路径已经建立”。

#### 验收标准

修订后的文档必须能明确回答下面这个问题：

- 当某图元从 normal 切到 hover，只改 `fill`
- 最终到底会触发哪一类 update 提交
- 为什么这条提交路径不等同于 bounds 慢路径

### 2. `_syncAttribute()` 的“真实 delta”伪代码仍不成立，旧值并没有被正确比较

#### 问题

当前文档把 `_syncAttribute()` 描述成“旧值 vs 新值对比”，并明确说 `deltaKeys` 是：

- 新增 key
- 值变化的 key
- 被删除的 key

对应位置：

- [D3_ARCH_DESIGN.md:363](/Users/bytedance/Documents/GitHub/VRender2/D3_ARCH_DESIGN.md#L363)
- [D3_ARCH_DESIGN.md:367](/Users/bytedance/Documents/GitHub/VRender2/D3_ARCH_DESIGN.md#L367)
- [D3_ARCH_DESIGN.md:389](/Users/bytedance/Documents/GitHub/VRender2/D3_ARCH_DESIGN.md#L389)
- [D3_ARCH_DESIGN.md:398](/Users/bytedance/Documents/GitHub/VRender2/D3_ARCH_DESIGN.md#L398)

但这段伪代码实际只记录了：

- `oldKeys`

并没有记录：

- `oldValue`

随后 patch 层的比较又是基于“已经被 base 层写过一遍的 `attribute` 当前值”，而不是旧 final result。

#### 为什么仍不符合期望

这会在关键场景中产生误报。

例如：

- 旧最终值：`fill = 'red'`
- 新 base：`fill = 'blue'`
- 新 patch：又把 `fill` 覆盖回 `'red'`

最终新旧 final result 都是 `'red'`，真实 delta 应该为空。  
但当前伪代码在 base 写入阶段已经看到 `'blue'`，随后 patch 再写回 `'red'`，仍会把 `fill` 判进 `deltaKeys`。

也就是说，文档当前并没有真正做到：

- “旧 final result vs 新 final result”的比较

而只是做了：

- “同步过程中的局部中间态比较”

这和前面已经确认的期望仍不一致。

对应约束：

- [graphic-state-animation-refactor-expectation.md:459](/Users/bytedance/Documents/GitHub/VRender-develop/graphic-state-animation-refactor-expectation.md#L459)
- [graphic-state-animation-refactor-expectation.md:476](/Users/bytedance/Documents/GitHub/VRender-develop/graphic-state-animation-refactor-expectation.md#L476)

#### 修订要求

架构文档必须把这里改成真正的“旧 final result vs 新 final result”比较模型。

至少要写清楚其中一种合法实现：

1. 先完整保存旧 final result 快照，再计算新 final result，最后比较

或

2. 先生成一份新目标结果，再与旧 `attribute` 做对比，最后再同步写回

但不能继续使用“只记录 oldKeys，再在原地同步过程中顺手比较”的写法。

#### 验收标准

修订后的文档必须能明确解释下面这个例子：

- 旧 final result：`fill = 'red'`
- 新 base：`fill = 'blue'`
- 新 patch：`fill = 'red'`

最终结果不变时：

- `deltaKeys` 不应包含 `fill`
- 后续分类提交通知也不应包含 `fill`

只要文档无法正确解释这个例子，就不能算“真实 delta 已闭环”。

## 建议修改

### 3. resolver 场景下的 `paint-only` 判定仍需补齐运行时约束

#### 问题

文档已把 `isPaintOnly()` 改为基于：

- `affectedKeys`
- `ATTRIBUTE_CATEGORY`

来判断，这比上一版明显更对。

对应位置：

- [D3_ARCH_DESIGN.md:871](/Users/bytedance/Documents/GitHub/VRender2/D3_ARCH_DESIGN.md#L871)
- [D3_ARCH_DESIGN.md:879](/Users/bytedance/Documents/GitHub/VRender2/D3_ARCH_DESIGN.md#L879)
- [D3_ARCH_DESIGN.md:888](/Users/bytedance/Documents/GitHub/VRender2/D3_ARCH_DESIGN.md#L888)

但当前文档仍将 `affectedKeys` 定义为编译产物的一部分：

- [D3_ARCH_DESIGN.md:664](/Users/bytedance/Documents/GitHub/VRender2/D3_ARCH_DESIGN.md#L664)

对于静态 patch，这没有问题。  
但对于 resolver 状态，如果 patch 的 key 集会随业务上下文变化，那么只靠编译期 `affectedKeys` 仍然不足以判断这次变化是否真的是 `paint-only`。

#### 为什么要修

期望文档中已经明确：

- 影响范围自动推断来自“编译后的状态定义 + 本次真实 patch delta”

对应位置：

- [graphic-state-animation-refactor-expectation.md:412](/Users/bytedance/Documents/GitHub/VRender-develop/graphic-state-animation-refactor-expectation.md#L412)
- [graphic-state-animation-refactor-expectation.md:416](/Users/bytedance/Documents/GitHub/VRender-develop/graphic-state-animation-refactor-expectation.md#L416)
- [graphic-state-animation-refactor-expectation.md:417](/Users/bytedance/Documents/GitHub/VRender-develop/graphic-state-animation-refactor-expectation.md#L417)

如果文档不把 resolver 这层补齐，后续实现会面临两种不一致：

- 要么错误地把 resolver 状态当成稳定 `paint-only`
- 要么在实现时悄悄引入额外的运行时特判，偏离文档

#### 修订要求

建议在文档中补上一条明确约束，二选一即可：

1. resolver 返回的 key 集必须在定义上稳定，可提前分类

或

2. 对含 resolver 的状态，`paint-only` 判定退化为运行时基于本次真实 patch / delta 判断

只要文档明确选定一种，后续实现就不会摇摆。

### 4. 文档中仍残留少量旧语义，影响 agent 继续修订时的判断

#### 问题

虽然正文主体已经修到 v1.4，但仍有几处旧说法残留：

1. 流程图 Step 7 还写着：
   - `delta = patch - prevPatch`
   - [D3_ARCH_DESIGN.md:308](/Users/bytedance/Documents/GitHub/VRender2/D3_ARCH_DESIGN.md#L308)
   - [D3_ARCH_DESIGN.md:309](/Users/bytedance/Documents/GitHub/VRender2/D3_ARCH_DESIGN.md#L309)

2. 总览图里的 State Patch Resolver 仍写：
   - “仅在状态集合变化时重新计算”
   - [D3_ARCH_DESIGN.md:230](/Users/bytedance/Documents/GitHub/VRender2/D3_ARCH_DESIGN.md#L230)
   - [D3_ARCH_DESIGN.md:231](/Users/bytedance/Documents/GitHub/VRender2/D3_ARCH_DESIGN.md#L231)

但 v1.4 后文已经正式引入：

- 业务显式失效
- [D3_ARCH_DESIGN.md:964](/Users/bytedance/Documents/GitHub/VRender2/D3_ARCH_DESIGN.md#L964)
- [D3_ARCH_DESIGN.md:985](/Users/bytedance/Documents/GitHub/VRender2/D3_ARCH_DESIGN.md#L985)

3. `clearStates()` 的 `changed` 仍然基于对象身份比较：
   - [D3_ARCH_DESIGN.md:582](/Users/bytedance/Documents/GitHub/VRender2/D3_ARCH_DESIGN.md#L582)
   - [D3_ARCH_DESIGN.md:588](/Users/bytedance/Documents/GitHub/VRender2/D3_ARCH_DESIGN.md#L588)

#### 为什么要修

这类问题看似是文案残留，但对 agent 很危险，因为 agent 往往会把：

- 总览图
- 流程图
- 伪代码

都当成可执行设计线索。

只要这些地方仍然保留旧语义，下一轮实现或继续修订时就可能再次发散。

#### 修订要求

建议在下一轮修订中做一次全文清扫：

- 所有涉及 delta 的地方统一成“旧 final result vs 新 final result”
- 所有涉及 resolver 触发时机的地方统一包含“业务显式失效”
- `clearStates()` 的 `changed` 改成真正有语义的判断，或在文档里明确说明该字段只是占位

## 建议给架构评审会的结论

当前版本建议评语如下：

> v1.4 已经基本对齐重构方向，且修掉了上一轮多项关键偏差，但还不适合直接进入实现拆分。  
> 当前仍需先修正两处原则性问题：一是纯视觉更新在最终提交通路里仍被抬升到 bounds 路径；二是 `_syncAttribute()` 的真实 delta 伪代码并未真正比较旧 final result 与新 final result。  
> 另外建议同步补齐 resolver 场景下的 `paint-only` 判定和全文旧语义清扫，再进入实现拆分。

## 重点关注项

下一轮修订里，优先不要再扩展新内容，而是把以下几项真正闭环：

- 性能
  - `PAINT` 是否真的有独立于 bounds 的提交语义
  - 纯视觉状态切换是否在最终提交通路里仍是快路径
- 正确性
  - delta 是否真的是“旧 final result vs 新 final result”
  - 同 key 先写 base 再被 patch 覆盖时，是否会被误报为变化
- 一致性
  - resolver 触发条件是否在全文统一
  - 总览图、流程图、伪代码是否仍残留旧版本语义

只有这些点收口后，架构文档才适合进入实现拆分阶段。
