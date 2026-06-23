# D3 架构设计二轮修订 Prompt

你现在需要修订一份架构设计文档，而不是开始实现。

## 你的任务

更新以下文档：

- `/Users/bytedance/Documents/GitHub/VRender2/D3_ARCH_DESIGN.md`

同时参考以下输入：

- 期望文档：`/Users/bytedance/Documents/GitHub/VRender-develop/graphic-state-animation-refactor-expectation.md`
- 一轮评审：`/Users/bytedance/Documents/GitHub/VRender-develop/D3_ARCH_DESIGN_REVIEW_FEEDBACK.md`
- 二轮评审：`/Users/bytedance/Documents/GitHub/VRender-develop/D3_ARCH_DESIGN_REVIEW_FEEDBACK_ROUND2.md`

## 工作边界

- 你要做的是修订架构文档，使其语义闭环、前后一致、可进入实现拆分。
- 你现在不要写实现代码，不要写测试，不要开始模块拆分。
- 你不能假设读者知道我们之前的口头讨论；文档本身必须自包含。

## 重要约束

如果 `D3_ARCH_DESIGN.md` 与期望文档冲突，默认以期望文档为准，除非你在文档中明确写出：

- 偏离点是什么
- 为什么要偏离
- 带来的收益和风险是什么

不要把“未写清楚”伪装成“工程折中”。

## 本轮必须修正的问题

### 1. 把“当前 key 集”改成“真实 delta”

你必须修正文档中的状态提交模型，使其基于：

- 旧 final result
- 新 final result
- 二者的真实差异

必须明确：

- delta 包含新增 key、值变化 key、删除 key
- 不能把所有当前 base key 都算成 affected keys
- 纯视觉状态切换不能因为 base 中存在几何 key 而进入慢路径

修订后，文档必须能明确解释这个例子：

- base 有 `x/y/fill`
- hover 只改 `fill`
- 进入 hover 只能按 `fill` 走 `paint`

同时也要解释：

- 某状态移除后，一个只由状态带来的 key 从 final result 中消失
- 该删除也必须进入 delta 分类提交

### 2. 补上 resolver 的“业务显式失效”机制

你必须修正文档中的 resolver 缓存/失效模型。

当前问题是：

- 文档允许 resolver 读取业务上下文
- 但失效条件只写了 `effectiveStates` 变化和定义版本变化

你必须补上正式机制，使文档能表达：

- VRender 不自动追踪外部业务上下文
- 业务可以显式触发一次状态失效/重解析
- 失效后会发生什么
  - resolver 重算
  - patch 重算
  - final result 同步
  - 分类提交

你不必锁死 API 名称，但必须锁死能力语义。

### 3. 消除“实例级状态定义是否在核心路径中”的前后矛盾

你必须通读全文，确保只保留一种说法。

推荐保持：

- 核心路径只有共享状态定义
- 实例差异通过 resolver 处理

如果你决定保留实例级同名状态定义，则必须在文档中明确解释：

- 为什么需要它
- 如何避免来源层级失控
- 为什么这比共享定义 + resolver 更值得保留

不能继续出现：

- 某一节说“实例定义是来源之一”
- 另一节又说“实例定义不在核心路径”

### 4. 让 deferred state update 的 `paint-only` 判定与正文约束一致

你必须修正文档，使“是否可分帧”与全文约束保持一致。

当前要求是：

- 仅真正的 `paint-only` 默认可分帧
- 涉及几何、bounds、layout、pick 一致性的状态变化默认同步收敛

所以：

- 如果继续使用 `isPaintOnly`，它必须检查分类结果是否只包含 `PAINT`
- 不能只检查 `affectsGeometry`

### 5. 修正文档内的类型与伪代码不一致问题

你必须至少修正以下一致性问题：

- `UpdateCategory` 是 bitflag 还是对象结构，全文统一
- `StateDefinition.resolver` 与单状态 resolver 类型签名统一
- `clearStates()` 等关键 API 的伪代码返回语义闭合

## 你必须遵守的写法要求

这是给 agent 和人类共同阅读的架构文档，必须符合以下 harness 风格：

- 就地修改正文，不要只在文末追加补丁说明
- 术语统一，不要同一概念出现两套叫法
- 每个核心机制都写清楚：
  - 输入是什么
  - 输出是什么
  - 什么时候触发
  - 不触发什么
- 不要依赖“读者会自己脑补”
- 不要把核心机制留在“后续实现再定”

## 交付要求

完成修订后，请给出一个简短结果说明，格式必须包含：

1. 已修正的问题列表
2. 仍未修正但你有意保留的偏离点
3. 你认为现在是否可以进入实现拆分

如果你认为某一条评审意见不应采纳，不能直接忽略。你必须明确写出：

- 不采纳哪一条
- 技术理由是什么
- 会带来什么影响

## 完成标准

只有当以下条件同时成立时，才算本轮修订完成：

- `D3_ARCH_DESIGN.md` 不再依赖口头上下文才能理解
- 文档里不存在前后矛盾的状态来源描述
- 文档对真实 delta、resolver 显式失效、paint-only 判定三件事都有明确闭环
- 类型签名、伪代码、分类模型在全文中保持一致
- 评审人可以基于文档直接判断“能否进入实现拆分”
