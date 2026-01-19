# vrender-core 去 DI（inversify / Reflect-metadata）改造进度更新

## 当前状态（Registry-only 已落地）
- 运行时架构已切换到 ServiceRegistry + ContributionRegistry：
  - Stage/Window/Render/Plugin/Picker 等核心路径不再使用 container.get/ContainerModule
  - preLoadAllModule() 由 registerAllModules() 完成默认注册（无 ContainerModule）
- Canvas 工厂与 Context 工厂：
  - wrapCanvas/wrapContext 通过 ContributionRegistry 按 env 选择工厂（不再使用 container.getNamed）
- Kits 环境与窗口：
  - kits 平台（browser/node/wx/feishu/taro/lynx/harmony/tt）统一通过 registerXxxEnvRegistry 注册 Env 与 WindowHandler，实现 registry-only

## 已删除/置空的旧模块
- 入口模块与加载器（改为 no-op）：
  - render/render-modules.ts（no-op）
  - render/contributions/modules.ts（no-op）
  - core/contributions/modules.ts（no-op）
  - core/core-modules.ts（no-op）
- env/layer/textMeasure 模块（no-op）：
  - core/contributions/env/modules.ts
  - core/contributions/layerHandler/modules.ts
  - core/contributions/textMeasure/modules.ts
- picker/plugin/graphic 模块（no-op）：
  - picker/pick-modules.ts
  - plugins/plugin-modules.ts
  - graphic/graphic-service/graphic-module.ts
- 渲染单元模块导出（全部删除旧导出）：
  - text/symbol/rect/path/image/area/arc/circle/polygon/line/glyph/star/richtext/rect3d/arc3d/pyramid3d 的 *-module.ts 均已移除导出与内部 ContainerModule 逻辑

## 已删除的 DI 基础设施
- 删除目录：
  - src/common/inversify-lite/**
  - src/common/inversify/**
- 删除文件：
  - src/container.ts
  - src/common/contribution-provider.ts（退役化后整体删除）
  - src/core/global-module.ts

## 关键文件现状
- core/stage.ts：通过 serviceRegistry.createInstance/get 获取 IWindow/IRenderService/IPickerService/Plugin/Layer/Graphic 服务（不再使用 container）
- core/window.ts：通过 application.contributions.get(WindowHandlerContribution) 按 env 选择 handler
- canvas/util.ts：通过 ContributionRegistry 获取 ICanvasFactory/IContext2dFactory
- modules.ts：preLoadAllModule → registerAllModules，随后从 serviceRegistry 获取并挂载 application.global/graphicUtil/transformUtil/graphicService/layerService

## 后续检查清单
- 构建验证：
  - rush build（确保删除的目录/文件不在编译输入中）
  - 类型检查是否仍有对 removed 文件/目录的引用
- 注册面完整性：
  - registerAllModules 与 kits 的 registerXxxEnvRegistry 是否覆盖所有默认能力
- 测试与示例：
  - 移除/更新仍引用旧 ContainerModule 或 container 的测试/示例
  - Smoke test：createStage + 基本渲染/拾取/插件启用流程
- 对外导出清理：
  - 确认 core/index.ts 不再暴露 common/inversify(-lite) 能力（breaking 已接受）

## 风险与对策（维持不变）
- 初始化顺序/副作用：保留 index.ts 的 side-effect 初始化，preLoadAllModule() 等价
- 贡献列表顺序：ContributionRegistry 保持 order 语义
- 多端构建兼容：在 wx/tt/feishu 等 demo/产物中进行 smoke test，确保无 Reflect 依赖

## 完成标记
- 旧 DI 路径已全面移除，运行时完全 registry-only
- 等待构建与测试通过后关闭此计划
