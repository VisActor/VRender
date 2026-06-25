# VRender Agent 文档入口

本目录是面向后续 agent / 维护者的长期项目知识库，用来快速建立 VRender 当前代码结构、模块边界、运行时装配和验证入口的上下文。

## 与其他文档的关系

- `AGENTS.md` 是操作约束：规定工作方式、验证要求、性能边界、1.1 状态系统约束和提交规范。
- `docs/agent/` 是项目知识库：记录当前代码事实、路径导航、owner 判断和测试入口，不替代操作约束。
- `docs/refactor/state-engine/` 是状态/动画重构规范源：涉及状态语义、shared-state、动画静态真值时仍应优先阅读专项文档。
- 本目录只做当前代码结构导航。历史状态引擎文档如果与当前代码不一致，应记录为“历史文档可能过期”，不要据此回退实现。

本目录不承诺 public API。公开 API 仍以 package exports、README、用户文档和类型定义为准。

## 推荐阅读顺序

1. [VRENDER_PROJECT_MAP.md](./VRENDER_PROJECT_MAP.md)：先看 monorepo 全局地图和包 owner。
2. [VRENDER_PACKAGE_MAP.md](./VRENDER_PACKAGE_MAP.md)：确认目标 package 的入口、exports、验证命令和不该承担的职责。
3. 按任务类型阅读对应专题文档。
4. [VRENDER_TEST_AND_VERIFICATION.md](./VRENDER_TEST_AND_VERIFICATION.md)：最后确定最小验证矩阵和 Not-tested 记录方式。

## 按任务类型阅读路径

修改 core / graphic：
- 先读 [VRENDER_CORE_ARCHITECTURE.md](./VRENDER_CORE_ARCHITECTURE.md)。
- 再读 [VRENDER_GRAPHIC_PIPELINE.md](./VRENDER_GRAPHIC_PIPELINE.md)。
- 涉及状态语义时回到 `docs/refactor/state-engine/README.md`、`D3_REMOVED_API_AND_CALL_CHAIN_LOG.md` 和当前测试。

修改 runtime / entries：
- 先读 [VRENDER_RUNTIME_AND_ENTRIES.md](./VRENDER_RUNTIME_AND_ENTRIES.md)。
- 再读 [VRENDER_KITS_ARCHITECTURE.md](./VRENDER_KITS_ARCHITECTURE.md) 和 [VRENDER_RENDER_PICKER_REGISTRY.md](./VRENDER_RENDER_PICKER_REGISTRY.md)。
- 涉及上层 renderer contribution 接入时读 [VRENDER_APP_SCOPED_RENDERER_CONTRIBUTIONS.md](./VRENDER_APP_SCOPED_RENDERER_CONTRIBUTIONS.md)。

修改 renderer / picker：
- 先读 [VRENDER_RENDER_PICKER_REGISTRY.md](./VRENDER_RENDER_PICKER_REGISTRY.md)。
- 再读 [VRENDER_CORE_ARCHITECTURE.md](./VRENDER_CORE_ARCHITECTURE.md) 的 render / picker / registry 部分。

修改 animate：
- 先读 [VRENDER_ANIMATE_ARCHITECTURE.md](./VRENDER_ANIMATE_ARCHITECTURE.md)。
- 涉及状态动画时再读 [VRENDER_GRAPHIC_PIPELINE.md](./VRENDER_GRAPHIC_PIPELINE.md) 和状态引擎文档。

修改 components：
- 先读 [VRENDER_COMPONENTS_ARCHITECTURE.md](./VRENDER_COMPONENTS_ARCHITECTURE.md)。
- 涉及组件动画或 final attrs 时再读 [VRENDER_ANIMATE_ARCHITECTURE.md](./VRENDER_ANIMATE_ARCHITECTURE.md)。

修改 kits / env：
- 先读 [VRENDER_KITS_ARCHITECTURE.md](./VRENDER_KITS_ARCHITECTURE.md)。
- 涉及 entries bootstrap 时再读 [VRENDER_RUNTIME_AND_ENTRIES.md](./VRENDER_RUNTIME_AND_ENTRIES.md)。

修改 React 接入：
- 先读 [VRENDER_REACT_INTEGRATION.md](./VRENDER_REACT_INTEGRATION.md)。
- React 层不应承载 core 状态/动画语义；必要时回到 core / animate 文档确认边界。

做测试 / 验证：
- 读 [VRENDER_TEST_AND_VERIFICATION.md](./VRENDER_TEST_AND_VERIFICATION.md)。
- 文档类改动至少跑 `git diff --check` 并确认 `git diff --stat` 只包含文档。

## 当前文档边界

- 本目录基于当前代码事实和 package exports 梳理，不做包体积专项结论。
- 包体积、tree-shaking、bundle 成本分析应放到 `docs/refactor/bundle-size/`。
- 不确定项会写成“待验证”，不写成事实。
- 后续若修改源码导致路径或语义变化，应同步更新本目录，而不是只依赖临时会话记忆。
