# D3 架构设计二轮修订意见

面向文档：

- `/Users/bytedance/Documents/GitHub/VRender2/D3_ARCH_DESIGN.md`
- `/Users/bytedance/Documents/GitHub/VRender-develop/graphic-state-animation-refactor-expectation.md`
- `/Users/bytedance/Documents/GitHub/VRender-develop/D3_ARCH_DESIGN_REVIEW_FEEDBACK.md`

日期：

- `2026-04-06`

## 使用说明

这份文档不是泛泛 review，而是给下一轮架构修订直接使用的“约束性反馈”。

考虑到架构师是以 agent 方式工作，本文档按 harness 原则组织：

- 上下文自包含，不依赖口头记忆。
- 结论前置，避免“读完全篇才知道要做什么”。
- 每个问题都给出：
  - 问题本身；
  - 为什么它仍然不符合期望；
  - 需要如何修订；
  - 修订后应达到的验收状态。
- 区分“必须修改”和“建议修改”，避免 agent 自行重排优先级。
- 避免使用“可以考虑”“也许”这类弱约束措辞，除非该项确实允许讨论。

如果要把这份文档直接喂给 agent，应与下列文档一起使用：

- 期望文档：[graphic-state-animation-refactor-expectation.md](/Users/bytedance/Documents/GitHub/VRender-develop/graphic-state-animation-refactor-expectation.md)
- 一轮修订意见：[D3_ARCH_DESIGN_REVIEW_FEEDBACK.md](/Users/bytedance/Documents/GitHub/VRender-develop/D3_ARCH_DESIGN_REVIEW_FEEDBACK.md)

## 当前结论

更新后的 `D3_ARCH_DESIGN.md` 比上一版明显更接近期望，以下问题已经有实质修正：

- 状态过渡动画目标已从 `resolvedStatePatch` 改为 `final result`
- patch 收缩场景已开始处理旧 key 清理
- 实例级同名状态覆写在正文主体中已尝试移出核心路径
- 状态集合已有去重
- 分帧示意代码已修正 `frameStart` 重置

但当前版本仍不建议直接进入实现拆分，原因不是“方向不对”，而是“核心机制还没有完全闭环”。

我当前的判断是：

- 可以进入下一轮架构修订；
- 还不适合直接进入实现设计；
- 至少还有 2 个原则性问题和 3 个架构自洽性问题需要收敛。

## 必须修改

### 1. `affectedKeys` 不是“真实 delta”，会同时造成误报和漏报

#### 问题

文档现在把 `_syncAttribute()` 改成返回 `affectedKeys`，并据此做精确提交通知：

- [D3_ARCH_DESIGN.md:364](/Users/bytedance/Documents/GitHub/VRender2/D3_ARCH_DESIGN.md#L364)
- [D3_ARCH_DESIGN.md:375](/Users/bytedance/Documents/GitHub/VRender2/D3_ARCH_DESIGN.md#L375)
- [D3_ARCH_DESIGN.md:381](/Users/bytedance/Documents/GitHub/VRender2/D3_ARCH_DESIGN.md#L381)
- [D3_ARCH_DESIGN.md:437](/Users/bytedance/Documents/GitHub/VRender2/D3_ARCH_DESIGN.md#L437)

但这里的 `affectedKeys` 实际上是：

- 当前 `baseAttributes` 的全部 key
- 加上当前 `resolvedStatePatch` 的全部 key
- 不包含本次被删除的旧 key

它不是“旧 final result 与新 final result 的真实差异 key 集”。

#### 为什么仍不符合期望

这会同时产生两类错误：

1. 误报慢路径  
如果图元 base 上本来就有 `x/y/width`，这次状态切换只改 `fill`，当前方案仍会把 `x/y/width` 放进 `affectedKeys`，随后进入几何/bounds 分类。这破坏了纯视觉快路径。

2. 漏报真实更新  
如果某个状态移除后，某个 key 从 final result 中消失，`_syncAttribute()` 虽然删除了该 key，但并没有把“删除的 key”记录进 `affectedKeys`，导致后续分类提交通知可能漏掉真实变化。

而期望文档要求的是：

- 提交判断基于真实 delta
- 纯视觉状态切换保留快路径

对应约束：

- [graphic-state-animation-refactor-expectation.md:459](/Users/bytedance/Documents/GitHub/VRender-develop/graphic-state-animation-refactor-expectation.md#L459)
- [graphic-state-animation-refactor-expectation.md:476](/Users/bytedance/Documents/GitHub/VRender-develop/graphic-state-animation-refactor-expectation.md#L476)

#### 修订要求

架构文档必须把这里改成“真实 delta 模型”，而不是“当前 key 集模型”。

至少需要明确：

- 比较对象是“旧 final result”与“新 final result”。
- `affectedKeys` 必须包含：
  - 新增 key
  - 值发生变化的 key
  - 被删除的 key
- 不能把“当前存在但值没变的 base key”当成 delta。
- `_syncAttribute()` 本身可以负责同步，但 delta 计算应当以“旧值/新值对比”为准，而不是顺手把现有 key 收集出来。

#### 验收标准

修订后的文档必须能明确回答下面这个例子：

- base 有 `x/y/fill`
- hover 只覆盖 `fill`
- 进入 hover 时
  - 提交结果只能按 `fill` 走 `paint`
  - 不能因为 base 上存在 `x/y` 而进入 transform/bounds 慢路径

同时也必须能明确回答另一个例子：

- base 没有 `shadowBlur`
- hover patch 写入 `shadowBlur`
- 移除 hover 后 `shadowBlur` 从 final result 中消失
- 这次移除仍然必须被分类提交，而不是静默删除

### 2. resolver 失效模型不完整，缺少“业务显式失效”入口

#### 问题

当前文档把 resolver 缓存策略写成：

- 缓存键：`resolverFn + currentEffectiveStates + definitionVersion`
- 失效条件：`effectiveStates` 变化或定义版本变化

对应位置：

- [D3_ARCH_DESIGN.md:920](/Users/bytedance/Documents/GitHub/VRender2/D3_ARCH_DESIGN.md#L920)
- [D3_ARCH_DESIGN.md:921](/Users/bytedance/Documents/GitHub/VRender2/D3_ARCH_DESIGN.md#L921)
- [D3_ARCH_DESIGN.md:927](/Users/bytedance/Documents/GitHub/VRender2/D3_ARCH_DESIGN.md#L927)
- [D3_ARCH_DESIGN.md:928](/Users/bytedance/Documents/GitHub/VRender2/D3_ARCH_DESIGN.md#L928)

但我们前面已明确：

- resolver 可以读取图元外部业务上下文
- VRender 不自动探测上下文变化
- 业务必须能显式触发状态失效/重解析

对应期望约束：

- [graphic-state-animation-refactor-expectation.md:278](/Users/bytedance/Documents/GitHub/VRender-develop/graphic-state-animation-refactor-expectation.md#L278)
- [graphic-state-animation-refactor-expectation.md:282](/Users/bytedance/Documents/GitHub/VRender-develop/graphic-state-animation-refactor-expectation.md#L282)
- [graphic-state-animation-refactor-expectation.md:284](/Users/bytedance/Documents/GitHub/VRender-develop/graphic-state-animation-refactor-expectation.md#L284)
- [graphic-state-animation-refactor-expectation.md:291](/Users/bytedance/Documents/GitHub/VRender-develop/graphic-state-animation-refactor-expectation.md#L291)

#### 为什么仍不符合期望

如果业务上下文变了，但 `effectiveStates` 没变，当前文档模型下 resolver 不会失效，结果会直接陈旧。

这不是细节问题，而是能力模型缺失。

只要文档继续允许 resolver 读取业务上下文，就必须同时定义“业务显式失效”的机制；否则这条能力在语义上是不完整的。

#### 修订要求

架构文档需要明确补上一条正式机制：

- 业务显式触发状态失效 / resolver 重解析

文档不一定要锁死 API 名称，但必须锁死能力语义。至少要写清：

- 失效是图元级、批量图元级，还是上下文级版本号驱动
- 失效后会触发哪些步骤
  - resolver 重算
  - patch 重算
  - final result 同步
  - 分类提交
- 它不会进入 render/animation/pick/bounds tick

#### 验收标准

修订后的文档必须能明确回答下面这个例子：

- 图元当前 `activeStates = ['customPick']`
- resolver 读取外部筛选上下文
- 筛选条件变化，但 `activeStates` 不变

此时文档必须能说明：

- VRender 不自动追踪
- 业务可显式触发一次失效
- 失效后 resolver 会重新执行
- 最终样式会更新到新的业务上下文结果

## 建议修改

### 3. 文档内部仍然存在“实例级状态定义是否在核心路径中”的前后矛盾

#### 问题

总览图中仍然把 `Graphic 实例局部状态定义` 列成状态定义来源的一层：

- [D3_ARCH_DESIGN.md:192](/Users/bytedance/Documents/GitHub/VRender2/D3_ARCH_DESIGN.md#L192)
- [D3_ARCH_DESIGN.md:194](/Users/bytedance/Documents/GitHub/VRender2/D3_ARCH_DESIGN.md#L194)

但后面的编译器与共享状态定义章节又写成：

- 实例级同名状态覆写不在核心路径中

对应位置：

- [D3_ARCH_DESIGN.md:647](/Users/bytedance/Documents/GitHub/VRender2/D3_ARCH_DESIGN.md#L647)
- [D3_ARCH_DESIGN.md:650](/Users/bytedance/Documents/GitHub/VRender2/D3_ARCH_DESIGN.md#L650)
- [D3_ARCH_DESIGN.md:662](/Users/bytedance/Documents/GitHub/VRender2/D3_ARCH_DESIGN.md#L662)
- [D3_ARCH_DESIGN.md:665](/Users/bytedance/Documents/GitHub/VRender2/D3_ARCH_DESIGN.md#L665)

#### 为什么要修

这个矛盾会直接影响实现分层：

- 如果实例定义仍在核心路径里，就要处理来源优先级、编译合并、缓存失效和调试来源追踪
- 如果不在核心路径里，就应只保留共享定义 + resolver

这不是排版问题，是状态来源模型是否收敛的问题。

#### 修订要求

文档需要只保留一种说法，不能前后并存。

建议保持与期望文档一致：

- 核心路径只有共享定义
- 实例差异通过 resolver 处理

如果架构师坚持保留实例级同名状态覆写，也必须在文档中正面说明：

- 为什么要保留
- 如何避免来源层次失控
- 与期望文档冲突的地方准备如何处理

### 4. `paint-only` 判定条件仍然过窄，尚未真正覆盖 bounds/pick/layout 一致性约束

#### 问题

批量状态切换部分现在写的是：

- 仅 `paint-only` 状态变化默认走分帧
- 涉及几何/bounds/pick 变化时保持同步收敛

对应位置：

- [D3_ARCH_DESIGN.md:829](/Users/bytedance/Documents/GitHub/VRender2/D3_ARCH_DESIGN.md#L829)
- [D3_ARCH_DESIGN.md:830](/Users/bytedance/Documents/GitHub/VRender2/D3_ARCH_DESIGN.md#L830)
- [D3_ARCH_DESIGN.md:887](/Users/bytedance/Documents/GitHub/VRender2/D3_ARCH_DESIGN.md#L887)
- [D3_ARCH_DESIGN.md:891](/Users/bytedance/Documents/GitHub/VRender2/D3_ARCH_DESIGN.md#L891)

但 `isPaintOnly()` 的伪代码实际只检查 `affectsGeometry`：

- [D3_ARCH_DESIGN.md:850](/Users/bytedance/Documents/GitHub/VRender2/D3_ARCH_DESIGN.md#L850)
- [D3_ARCH_DESIGN.md:853](/Users/bytedance/Documents/GitHub/VRender2/D3_ARCH_DESIGN.md#L853)

同时分类枚举里已经存在：

- `BOUNDS`
- `LAYOUT`
- `PICK`

对应位置：

- [D3_ARCH_DESIGN.md:712](/Users/bytedance/Documents/GitHub/VRender2/D3_ARCH_DESIGN.md#L712)
- [D3_ARCH_DESIGN.md:714](/Users/bytedance/Documents/GitHub/VRender2/D3_ARCH_DESIGN.md#L714)
- [D3_ARCH_DESIGN.md:715](/Users/bytedance/Documents/GitHub/VRender2/D3_ARCH_DESIGN.md#L715)

#### 为什么要修

如果一个状态不改几何，但会影响：

- bounds
- pick
- layout

当前伪代码仍可能把它判成 `paint-only`，这会和期望文档里的“仅默认适用于纯视觉状态”冲突。

对应期望约束：

- [graphic-state-animation-refactor-expectation.md:596](/Users/bytedance/Documents/GitHub/VRender-develop/graphic-state-animation-refactor-expectation.md#L596)
- [graphic-state-animation-refactor-expectation.md:600](/Users/bytedance/Documents/GitHub/VRender-develop/graphic-state-animation-refactor-expectation.md#L600)
- [graphic-state-animation-refactor-expectation.md:603](/Users/bytedance/Documents/GitHub/VRender-develop/graphic-state-animation-refactor-expectation.md#L603)
- [graphic-state-animation-refactor-expectation.md:605](/Users/bytedance/Documents/GitHub/VRender-develop/graphic-state-animation-refactor-expectation.md#L605)

#### 修订要求

文档里的 `paint-only` 判定必须与正文约束一致。

要么：

- `isPaintOnly()` 明确检查分类结果只包含 `PAINT`

要么：

- 明确改名为别的判定函数，避免误导

但不能继续写成“检查 geometry 就够了”。

### 5. 伪代码与类型定义仍有几处不自洽，需在评审版收敛

#### 问题

当前至少还存在以下不一致：

- `UpdateCategory` 被定义为 bitflag 枚举，但 `submitUpdate()` 按对象字段读取 `category.shape / category.bounds / category.paint`
  - [D3_ARCH_DESIGN.md:611](/Users/bytedance/Documents/GitHub/VRender2/D3_ARCH_DESIGN.md#L611)
  - [D3_ARCH_DESIGN.md:709](/Users/bytedance/Documents/GitHub/VRender2/D3_ARCH_DESIGN.md#L709)
- 前文 `StateDefinition.resolver` 的签名与后文单状态 resolver 类型不一致
  - [D3_ARCH_DESIGN.md:99](/Users/bytedance/Documents/GitHub/VRender2/D3_ARCH_DESIGN.md#L99)
  - [D3_ARCH_DESIGN.md:911](/Users/bytedance/Documents/GitHub/VRender2/D3_ARCH_DESIGN.md#L911)
- `clearStates(): StateTransitionResult` 的伪代码未展示返回值
  - [D3_ARCH_DESIGN.md:563](/Users/bytedance/Documents/GitHub/VRender2/D3_ARCH_DESIGN.md#L563)

#### 为什么要修

这些问题虽然看起来像“文档伪代码细节”，但对 agent 来说不是小问题。

因为 agent 会把它们当作可执行设计线索：

- 枚举到底是 bitflag 还是对象结构
- resolver 调用协议到底是哪一个
- `clearStates` 是否也走统一状态迁移结果语义

如果这里不统一，后面的实现草案很容易沿着不同分支发散。

#### 修订要求

评审版文档至少要做到：

- 所有类型签名在全文只保留一种写法
- bitflag 读法与写法一致
- 关键 API 伪代码有闭合的返回语义

## 建议给架构师 agent 的工作方式

如果下一轮修订仍然由 agent 完成，我建议显式要求它遵守以下工作方式：

1. 不要只在文档末尾追加“补充说明”，而是就地修正文中冲突段落。
2. 每修一个问题，都要检查全文是否还有旧说法残留。
3. 如果决定偏离期望文档，必须显式写出：
   - 偏离点；
   - 原因；
   - 风险；
   - 为什么这不是遗漏而是有意折中。
4. 不要把“暂不展开”用于核心机制闭环问题。
5. 对需要执行的机制，优先写“语义和验收状态”，再写伪代码。

## 建议给架构评审会的结论

当前版本建议评语如下：

> 当前版本比上一轮明显更接近期望，方向已基本对齐，但仍未完全闭环。  
> 必须先修正“真实 delta 提交模型”和“resolver 显式失效模型”这两个原则性问题；同时应收敛实例定义来源、分帧 `paint-only` 判定和伪代码自洽性。  
> 在这些问题修正前，不建议直接进入实现拆分。

## 重点关注项

下一轮修订中，优先关注以下几点，不要被次要兼容性细节稀释：

- 性能
  - 纯视觉状态切换是否真的只按真实 delta 走快路径
  - 分帧调度是否只覆盖真正的 `paint-only`
- 稳定性
  - `attribute` 是否始终能表达正确 final result
  - 业务上下文变化时 resolver 是否存在明确失效通路
- 可维护性
  - 状态来源是否已经完全收敛
  - 文档是否还存在前后矛盾的机制描述
- agent 可执行性
  - 文档是否足够自包含
  - 类型、伪代码、术语是否统一
  - 下一位 agent 是否能不依赖额外口头说明继续工作
