# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> 说明：本仓库是 **Rush + PNPM** 管理的 monorepo（见 `rush.json`、`common/config/rush/*`）。大多数开发命令应通过 `rush` 运行。

## 常用命令（开发/构建/测试）

### 安装依赖

```bash
rush install
```

> `rush.json` 指定了 PNPM 版本与 Node 支持范围（`nodeSupportedVersionRange`）。

### 构建

```bash
# 构建所有项目（bulk command）
rush build

# 重新构建所有项目（bulk command）
rush rebuild

# 仅构建某个 package（在该 package 的 scripts 中存在 build 时）
rush run -p @visactor/vrender-core -s build
```

### 启动开发服务

```bash
# 启动 VRender 开发服务（等价于：rush run -p @visactor/vrender -s start）
rush start

# 启动组件库开发服务（等价于：rush run -p @visactor/vrender-components -s start）
rush components

# 启动文档站点开发服务（等价于：rush run -p @internal/docs -s start）
rush docs
```

### Lint / 格式化

```bash
# 运行各 package 的 eslint 脚本（bulk command）
rush eslint

# 预提交相关（仓库自定义全局命令，见 common/config/rush/command-line.json）
rush lint-staged
rush prettier
```

### 测试

```bash
# 运行各 package 的 test 脚本（bulk command）
rush test

# 仅运行某个 package 的测试（前提：该 package 定义了 test 脚本）
rush run -p @visactor/vrender-core -s test

# 运行单个测试文件/用例：
# 本仓库通常使用 Jest（见 share/jest-config），具体参数以对应 package 的 test 脚本为准。
# 常见做法是把 Jest 参数透传给 package 的 test 脚本，例如：
# rush run -p @visactor/vrender-core -s test -- --runTestsByPath <path>
```

## 代码架构（大图景）

### Monorepo 包划分（按职责）

- `packages/vrender`：对外的“整合包”。入口会根据运行环境（browser/node）加载对应 env，并注册常用图元、插件与动画，然后 re-export 各子包能力（见 `packages/vrender/src/index.ts`）。
- `packages/vrender-core`：渲染核心与基础设施（Stage/Layer/Window、渲染管线、事件、拾取、插件系统、资源加载等）。对外导出面很大（见 `packages/vrender-core/src/index.ts`）。
- `packages/vrender-kits`：图元/环境适配与“套件”能力（例如 browser/node 环境加载、各类 registerXXX 图元注册函数等；整合包会调用这些注册）。
- `packages/vrender-animate`：动画系统与自定义动画（ticker、插值、状态动画、组件动画扩展等）。
- `packages/vrender-components`：更高层的可复用组件（如 axis、brush 等），通常依赖 core/kits。
- `packages/react-vrender`、`packages/react-vrender-utils`：React 绑定/宿主配置与工具。

### 核心运行时模型：Window / Stage / Layer

（仓库内也有简短说明：`packages/vrender-core/src/core/README.md`）

- **Window**：对接“原生环境窗口/Canvas 区域”的抽象（浏览器 Canvas、小程序 Canvas 等）。
- **Stage**：逻辑上的“舞台/视口”，不必与单个 Canvas 一一对应；可以是整个窗口，也可以是窗口中的一个区域。Stage 负责组织图形树、驱动渲染与事件系统（见 `packages/vrender-core/src/core/stage.ts`）。
- **Layer**：Stage 内的图层抽象。多图层时通常对应多个底层渲染目标（Canvas / ImageData / WebGL FrameBuffer 等），并支持子图层与混合（见 `packages/vrender-core/src/core/layer.ts`）。

### 图形树与创建入口

- 图形对象以 `Group` 为容器节点，Stage/Layer 也继承自 `Group`，因此“场景图”本质是一棵图形树。
- 常用创建入口：`createStage`（见 `packages/vrender-core/src/create.ts`）。

### 插件与模块注册（“按需注册”思路）

- `@visactor/vrender`（整合包）在入口中会：
  1) `preLoadAllModule()` 预加载模块；
  2) 根据环境调用 `loadBrowserEnv/loadNodeEnv`；
  3) 调用大量 `registerXXX()` 注册图元；
  4) 注册内置插件（flex layout、3D view transform、HTML/React attribute 等）；
  5) 注册动画（`registerCustomAnimate/registerAnimate`）。

这意味着：
- 如果你在 **core/kits/animate/components** 中新增能力，通常需要提供/更新对应的 `register...` 入口，并确认整合包是否需要默认注册。
- 排查“某图元/能力不可用”时，优先检查是否已注册（入口通常在 `packages/vrender/src/index.ts` 或各包的 `register/` 目录）。
