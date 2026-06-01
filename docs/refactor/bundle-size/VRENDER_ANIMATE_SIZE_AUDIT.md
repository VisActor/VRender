# VRender Animate 包体积审计

> 文档类型：`@visactor/vrender-animate` 体积风险与可拆方向
> 当前状态：只读源码事实 + 候选建议

## 当前入口事实

| 入口 | 源码路径 | 当前行为 | 体积判断 |
| --- | --- | --- | --- |
| root `@visactor/vrender-animate` | `packages/vrender-animate/src/index.ts` | 创建 `defaultTicker`，将 `defaultTimeline` 加入 ticker，并导出 animate、timeline、ticker、state、component、custom/register、custom class | root barrel 宽，CJS/root import 风险高 |
| `@visactor/vrender-animate/register` | `packages/vrender-animate/src/register.ts` | `registerAnimate()` 只 mixin `GraphicStateExtension` 和 `AnimateExtension` | 基础注册入口，当前不带入 custom/register |
| `@visactor/vrender-animate/custom/register` | `packages/vrender-animate/src/custom/register.ts` | 一次性注册多类 built-in custom animate | full custom 入口，适合 optional / full bootstrap |
| state | `packages/vrender-animate/src/state/*` | state animation manager / registry / graphic extension | 基础状态动画需要 |
| component | `packages/vrender-animate/src/component/*` | component animator / extension | components 需要，基础图元动画不一定全量需要 |
| executor / timeline / ticker / step | `executor/*`、`timeline.ts`、`ticker/*`、`step.ts` | 动画执行核心 | 基础动画必需 |

## Bootstrap 关系

- `packages/vrender/src/entries/bootstrap.ts` full app 路径调用 `registerAnimate` 和 `registerCustomAnimate`。
- `packages/vrender/src/entries/bootstrap-browser.ts` shared browser full 当前只调用 `registerAnimate`，没有调用 `registerCustomAnimate`。
- `packages/vrender/src/entries/bootstrap-browser-lite.ts` lite 当前只调用 `registerAnimate`，没有调用 `registerCustomAnimate`。

这意味着：`registerAnimate()` 不是 custom 动画体积来源；full app bootstrap 的 `registerCustomAnimate()` 才是一次性带入 custom 的关键链路。

## 自定义动画清单

| 能力 | 源码路径 | 是否由 `custom/register` 默认注册 | 基础图表常规动画需要 | optional 判断 |
| --- | --- | --- | --- | --- |
| fade | `custom/fade.ts` | 是，`fadeIn` / `fadeOut` | 常规 appear/disappear 可能需要 | 可归入 basic custom |
| scale | `custom/scale.ts` | 是，`scaleIn` / `scaleOut` | 常规 symbol/mark 动画可能需要 | 可归入 basic custom |
| rotate | `custom/rotate.ts` | 是 | 部分 mark 需要 | optional/basic 边界待 VChart stats |
| move | `custom/move.ts` | 是 | 常规 transition 可用 | basic custom |
| growHeight / growWidth / growCenter | `custom/growHeight.ts`、`growWidth.ts`、`growCenter.ts` | 是 | bar/area/line 常用 | basic chart custom |
| growAngle / growRadius | `custom/growAngle.ts`、`growRadius.ts` | 是 | pie/radar/arc 常用 | polar/arc custom |
| growPoints | `custom/growPoints.ts` | 是 | line/area 常用 | line/area custom |
| morphing | `custom/morphing.ts`、`config/morphing.ts` | root 导出；未见 `custom/register.ts` 注册 built-in key | 高级形变 | optional heavy |
| streamLight | `custom/streamLight.ts` | 是 | 非基础 line 必需 | optional effect |
| tag-points | `custom/tag-points.ts` | root 导出；未见 `custom/register.ts` 注册 built-in key | 非基础 | optional |
| story | `custom/story.ts` | 是，slide/grow/spin/moveScale/moveRotate/stroke in/out | 非基础 | optional heavy |
| richtext | `custom/richtext/*` | 是，input/output/slide richtext | 非基础 line 必需 | optional richtext |
| poptip | `custom/poptip-animate.ts` | 是 | poptip 组件需要 | component optional |
| label item | `custom/label-item-animate.ts` | 是 | label-item 组件需要 | component optional |
| disappear effects | `custom/disappear/*` | 是，dissolve/grayscale/distortion/particle/glitch/gaussianBlur/pixelation | 非基础 | optional heavy |
| input text | `custom/input-text.ts` | 是 | 非基础 | optional |
| motion path | `custom/motionPath.ts` | 是，`MotionPath` | 非基础 | optional |
| clip / fromTo / update / state / number | `custom/clip.ts`、`fromTo.ts`、`update.ts`、`state.ts`、`number.ts` | 是 | 部分常规动画基础能力 | 拆分时需谨慎 |

## 已确认不能回退的能力

`scaleIn` 的 `fromScale` / `fromScaleX` / `fromScaleY` 是当前已确认能力，后续拆 register 或重组 basic custom 时必须保留。证据路径：

- `packages/vrender-animate/src/custom/scale.ts`
- `docs/refactor/state-engine/D3_STABLE_RELEASE_NOTES_DRAFT.md`
- `docs/assets/guide/zh/asd/Basic/Upgrade_to_1_1_0.md`

## D3 口径风险

历史文档容易混淆两件事：

- 已删除：旧 runtime fallback 读取/写入 `target.animates` 的路径。
- 仍保留：`AnimationStateManager` 将 tracked animates map 暴露到 `graphic.animates`，作为兼容表象。

后续包体积优化不能把 `graphic.animates` 表象误判成旧 fallback 死代码直接删除。

## 体积风险判断

| 模块 | 风险 | 说明 |
| --- | --- | --- |
| root `index.ts` | High | 默认创建 ticker/timeline 并导出 custom/register 和 custom class，root import 容易变宽 |
| `custom/register.ts` | High | 一次性 import fade/scale/rotate/move/grow/story/richtext/poptip/disappear 等 |
| story / disappear / richtext | High | 对基础 line/simple 不是硬必需，且效果类多 |
| growPoints / growWidth / growHeight | Medium | 常规 chart 需要，不能简单 optional |
| state animation | Medium | D3 状态动画主路径，不建议为体积重开语义 |
| ticker/timeline/executor | Low | 动画核心骨架，真实依赖 |

## 后续可拆建议

1. 保留 `registerAnimate()` 轻量语义，禁止加入 custom/register。
2. 新增 custom 分组 register 候选：
   - `registerBasicChartAnimate`：fade、scale、move、fromTo、update、state、growWidth/Height/Points。
   - `registerPolarAnimate`：growAngle、growRadius。
   - `registerRichTextAnimate`：richtext/input text。
   - `registerStoryAnimate`：story / streamLight / disappear effects。
   - `registerComponentAnimate`：poptip、label-item 等。
3. full app 入口保持 `registerCustomAnimate()` 行为不变；lite / shared browser 不自动带 custom。
4. VChart line/simple 侧如果需要 built-in type 动画，应明确通过标准窄入口注册，不要求上层 workaround deep import。

## 验证方式

```bash
rush compile -t @visactor/vrender-animate
cd packages/vrender-animate && rushx test --runInBand
```

体积验证：

- `@visactor/vrender-animate` root vs `@visactor/vrender-animate/register` vs `custom/register` metafile。
- VChart line/simple 开启动画场景 before/after；重点确认 `scaleIn fromScale/fromScaleX/fromScaleY` 未回退。
