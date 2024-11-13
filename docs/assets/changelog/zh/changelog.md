# v0.20.12

2024-10-31


**What's Changed**

* feat: upgrade vutils to ~0.18.18 by @neuqzxy in https://github.com/VisActor/VRender/pull/1528


**Full Changelog**: https://github.com/VisActor/VRender/compare/v0.20.11...v0.20.12

[更多详情请查看 v0.20.12](https://github.com/VisActor/VRender/releases/tag/v0.20.12)

# v0.20.11

2024-10-31


**🐛 功能修复**

- **@visactor/vrender-components**: optimize limit length calculation for line axis label autoWrap
- **@visactor/vrender-components**: fix bounds of circle axis
- **@visactor/vrender-components**: last page is empty in legend. fix@VisActor/VChart[#3344](https://github.com/VisActor/VRender/issues/3344)
- **@visactor/vrender-core**: fix group fill gradient [#1518](https://github.com/VisActor/VRender/issues/1518)
- **@visactor/vrender-core**: annotate the Ramer Douglas Peucker algorithm in point optimization



[更多详情请查看 v0.20.11](https://github.com/VisActor/VRender/releases/tag/v0.20.11)

# v0.20.10

2024-10-25


**🆕 新增功能**

- **@visactor/vrender-core**: support fillStrokeOrder, closed [#1505](https://github.com/VisActor/VRender/issues/1505)

**🐛 功能修复**

- **@visactor/vrender-core**: fix issue with parse m where multi pos follow, closed [#1490](https://github.com/VisActor/VRender/issues/1490)
- **@visactor/vrender-core**: fix the accuracy issue of number matching, closed [#1488](https://github.com/VisActor/VRender/issues/1488)



[更多详情请查看 v0.20.10](https://github.com/VisActor/VRender/releases/tag/v0.20.10)

# v0.20.9

2024-10-15


**🆕 新增功能**

- **@visactor/vrender-components**: support axis label `firstVisible` in autoHide and linear axis sampling
- **@visactor/vrender-components**: add `interactInvertType` for smartInvert
- **@visactor/vrender-core**: text support keep-all, closed [#1466](https://github.com/VisActor/VRender/issues/1466)

**🐛 功能修复**

- **@visactor/vrender-components**: fix smartInvert when `outsideEnable` is true
- **@visactor/vrender-components**: fix max width of arc label in left
- **@visactor/vrender-components**: fix `pager.space` of discrete legend
- **@visactor/vrender-components**: fix smart invert when only has intercet width base mark
- **@visactor/vrender-components**: fix `legend.item.label.space` when has value
- **@visactor/vrender-components**: legend scroll critical value leads last page not render. fix@VisActor/VChart[#3172](https://github.com/VisActor/VRender/issues/3172)
- **@visactor/vrender-kits**: fix max width of arc label in left
- **@visactor/vrender-core**: fix max width of arc label in left



[更多详情请查看 v0.20.9](https://github.com/VisActor/VRender/releases/tag/v0.20.9)

# v0.20.8

2024-09-30


**🐛 功能修复**

- **@visactor/vrender-core**: fix line bounds with defined false, closed [#1463](https://github.com/VisActor/VRender/issues/1463)



[更多详情请查看 v0.20.8](https://github.com/VisActor/VRender/releases/tag/v0.20.8)

# v0.20.7

2024-09-27


**🆕 新增功能**

- **@visactor/vrender-components**: legend support roam scroll. close@VisActor/VChart[#3254](https://github.com/VisActor/VRender/issues/3254)

[更多详情请查看 v0.20.7](https://github.com/VisActor/VRender/releases/tag/v0.20.7)

# v0.20.6

2024-09-26


**🆕 新增功能**

- **@visactor/vrender-components**: support obb text bounds to enhance autoHide effect
- **@visactor/vrender-core**: support obb bounds in text graphic

**🐛 功能修复**

- **@visactor/vrender-components**: fix limit width of arc label when has customized align offset
- **@visactor/vrender-components**: fix error of `alternateColor`
- **@visactor/vrender-components**: outside label should not apply `smartInvert`
- **@visactor/vrender-components**: fix `boundsPadding` of legend focus icon
- **@visactor/vrender-core**: fix customPath of arc
- **@visactor/vrender-core**: fix issue with interactive graphic while parent was removed
- **@visactor/vrender-core**: line segment update animation result error



[更多详情请查看 v0.20.6](https://github.com/VisActor/VRender/releases/tag/v0.20.6)

# v0.20.5

2024-09-20


**🆕 新增功能**

- **@visactor/vrender-core**: poptip suppport multiline text, closed [#1444](https://github.com/VisActor/VRender/issues/1444)
- **@visactor/vrender-core**: fix issue with richtext width on disableAutoWrapLine mode, support clip attr

**🐛 功能修复**

- **@visactor/vrender-components**: update parameters
- **@visactor/vrender-components**: fix maxLineWidth of arc label
- **@visactor/vrender-components**: fix `textStyle` of data-zoom
- **@visactor/vrender-core**: fix error of `bounds-contex` when use `arcTo` in customShape
- **@visactor/vrender-core**: fix path string of arc, fix [#1434](https://github.com/VisActor/VRender/issues/1434)
- **@visactor/vrender-core**: fix error of morphing animation in `multiToOneMorph`, fix [#1439](https://github.com/VisActor/VRender/issues/1439)
- **@visactor/vrender**: add disableFill box color in checkbox and radio [#1437](https://github.com/VisActor/VRender/issues/1437)

[更多详情请查看 v0.20.5](https://github.com/VisActor/VRender/releases/tag/v0.20.5)

# v0.20.4

2024-09-12


**🆕 新增功能**

- **@visactor/vrender-core**: pauseRender support pass count

**🐛 功能修复**

- **@visactor/vrender-components**: fix the issue where labels are not drawn when the linelabel animation is enabled.
- **@visactor/vrender-core**: add updateHoverIconState in richtext



[更多详情请查看 v0.20.4](https://github.com/VisActor/VRender/releases/tag/v0.20.4)

# v0.20.3

2024-09-09


**🆕 新增功能**

- **@visactor/vrender-components**: add `alignOffset` in arc-label, `line2MinLength` support customized callback
- **@visactor/vrender-components**: support axis `breaks` for line axis
- **@visactor/vrender-components**: support `autoWrap` in line axis label
- **@visactor/vrender-components**: label component supports disable specific state animation

**🐛 功能修复**

- **@visactor/vrender-components**: tag padding not work when label is rich text. fix@VisActor/VChart[#3151](https://github.com/VisActor/VRender/issues/3151)
- **@visactor/vrender-core**: fix error of updateAABBbounds when morphing
- **@visactor/vrender-core**: tag padding not work when label is rich text. fix@VisActor/VChart[#3151](https://github.com/VisActor/VRender/issues/3151)



[更多详情请查看 v0.20.3](https://github.com/VisActor/VRender/releases/tag/v0.20.3)

# v0.20.1

2024-09-03


**🆕 新增功能**

- **@visactor/vrender-components**: support position `inside-center` of arc label
- **@visactor/vrender-components**: add necessary APIs to player component
- **@visactor/vrender-components**: support line segments update animation in TagPointsUpdate custom animation

**🐛 功能修复**

- **@visactor/vrender-components**: fix textAlign of label when set different angle
- **@visactor/vrender-components**: indicator stop tooltip interaction. fix@VisActor/VChart[#3123](https://github.com/VisActor/VRender/issues/3123)
- **@visactor/vrender-components**: segment line will cause incorrect label position
- **@visactor/vrender-components**: fix issue with poptip memory while stage is released
- **@visactor/vrender-core**: fix issue with poptip release
- **@visactor/vrender-core**: fix issue with animate zero duration
- **@visactor/vrender-core**: fix textAlign of label when set different angle
- **@visactor/vrender-core**: fix memory leak problem in ResourceLoader
- **@visactor/vrender-core**: fix issue with richtext edit plugin while defucus out of text

**⚡ 性能优化**

- **@visactor/vrender-components**: optimize the performance of label component



[更多详情请查看 v0.20.1](https://github.com/VisActor/VRender/releases/tag/v0.20.1)

# v0.20.0

2024-08-16


**🐛 功能修复**

- **@visactor/vrender-components**: arc label line color should follow arc mark by default, related [#3067](https://github.com/VisActor/VRender/issues/3067)
- **@visactor/vrender-components**: fix bug of auto-render when remove some graphics
- **@visactor/vrender-components**: set container pick false to allow tooltip interactive
- **@visactor/vrender-components**: fix issue with timeline animate duration compute
- **@visactor/vrender-components**: optimize triangle symbols
- **@visactor/react-vrender-utils**: fix bug of auto-render when remove some graphics
- **@visactor/react-vrender-utils**: optimize triangle symbols
- **@visactor/react-vrender**: fix bug of auto-render when remove some graphics
- **@visactor/react-vrender**: optimize triangle symbols
- **@visactor/vrender-kits**: fix bug of auto-render when remove some graphics
- **@visactor/vrender-kits**: optimize triangle symbols
- **@visactor/vrender-core**: fix bug of auto-render when remove some graphics
- **@visactor/vrender-core**: optimize triangle symbols
- **@visactor/vrender**: fix bug of auto-render when remove some graphics
- **@visactor/vrender**: optimize triangle symbols

**🔨 功能重构**

- **@visactor/vrender-components**: optimize cornerRadius parse of arc
- **@visactor/react-vrender-utils**: optimize cornerRadius parse of arc
- **@visactor/react-vrender**: optimize cornerRadius parse of arc
- **@visactor/vrender-kits**: optimize cornerRadius parse of arc
- **@visactor/vrender-core**: optimize cornerRadius parse of arc
- **@visactor/vrender-core**: remove polyfill from reflect-metadata
- **@visactor/vrender**: optimize cornerRadius parse of arc



[更多详情请查看 v0.20.0](https://github.com/VisActor/VRender/releases/tag/v0.20.0)

# v0.19.24

2024-08-14


**🆕 新增功能**

- **@visactor/vrender-components**: support polygon of circle-axis
- **@visactor/vrender-core**: support polygon of circle-axis
- **@visactor/vrender-core**: support rect corner array with array stroke
- **@visactor/vrender**: support polygon of circle-axis

**🐛 功能修复**

- **@visactor/vrender-components**: fix wrong stroke style is applied to area
- **@visactor/vrender-components**: improve slightly the accuracy of the pager size calculation, related [#3045](https://github.com/VisActor/VRender/issues/3045)
- **@visactor/vrender-components**: fix issue with timeline appearAnimate opacity attr prevented by next animate
- **@visactor/vrender-kits**: fix wrong stroke style is applied to area
- **@visactor/vrender-core**: fix wrong stroke style is applied to area
- **@visactor/vrender-core**: fix issue with baseOpacity equal to 0
- **@visactor/vrender-core**: fix edge and corner stroke in createRectPath()
- **@visactor/vrender-core**: fix issue with shadow group matrix
- **@visactor/vrender-core**: fix issue with disableAutoWrapLine
- **@visactor/vrender-core**: fix richtext icon pick range [#1362](https://github.com/VisActor/VRender/issues/1362)
- **@visactor/vrender-core**: fix issue with richtext attribute update
- **@visactor/vrender**: fix wrong stroke style is applied to area



[更多详情请查看 v0.19.24](https://github.com/VisActor/VRender/releases/tag/v0.19.24)


# v0.19.23

2024-08-06

**🐛 功能修复**

- **@visactor/vrender-core**: fix picker of shadow root group


[更多详情请查看 v0.19.23](https://github.com/VisActor/VRender/releases/tag/v0.19.23)

# v0.19.22

2024-08-06

**🆕 新增功能**

- **@visactor/vrender-components**: support react and html of indicator
- **@visactor/vrender-components**: support timeline component
- **@visactor/vrender-core**: shadow graphic support pick group

**🐛 功能修复**

- **@visactor/vrender-components**: fix issue with indicator autolimit
- **@visactor/vrender-core**: fix issue with Event class in harmony event


[更多详情请查看 v0.19.22](https://github.com/VisActor/VRender/releases/tag/v0.19.22)


# v0.19.21

2024-08-05


**🆕 新增功能**

- **@visactor/vrender-components**: label line support custom path. feat @VisActor/VChart[#3000](https://github.com/VisActor/VRender/issues/3000)



[更多详情请查看 v0.19.21](https://github.com/VisActor/VRender/releases/tag/v0.19.21)

# v0.19.20

2024-08-01


**🆕 新增功能**

- **@visactor/vrender-core**: support array cornerRadius, closed [#1322](https://github.com/VisActor/VRender/issues/1322)
- **@visactor/vrender-core**: support catmull-rom and catmull-rom-closed curve, closed [#1320](https://github.com/VisActor/VRender/issues/1320)
- **@visactor/vrender**: support array cornerRadius, closed [#1322](https://github.com/VisActor/VRender/issues/1322)



[更多详情请查看 v0.19.20](https://github.com/VisActor/VRender/releases/tag/v0.19.20)

# v0.19.19

2024-07-25


**🆕 新增功能**

- **@visactor/vrender-components**: marker label support custom shape. close @Visactor/VChart[#2959](https://github.com/VisActor/VRender/issues/2959)
- **@visactor/vrender-core**: marker label support custom shape. close @Visactor/VChart[#2959](https://github.com/VisActor/VRender/issues/2959)

**🐛 功能修复**

- **@visactor/vrender-components**: in vertical layout, if only one line can be displayed, the layout will be directly based on the width of the legend item itself
- **@visactor/vrender-components**: markpoint target size compute error. fix@Visactor/VChart[#2766](https://github.com/VisActor/VRender/issues/2766)
- **@visactor/vrender-core**: fixed the problem that the bounds calculation of line mark is wrong when the defiend of some points is false



[更多详情请查看 v0.19.19](https://github.com/VisActor/VRender/releases/tag/v0.19.19)

# v0.19.18

2024-07-15


**🐛 功能修复**

- **@visactor/vrender-core**: support react 17 in react attributes



[更多详情请查看 v0.19.18](https://github.com/VisActor/VRender/releases/tag/v0.19.18)

# v0.19.17

2024-07-11


**What's Changed**

* [Auto release] release 0.19.17 by @github-actions in https://github.com/VisActor/VRender/pull/1295


**Full Changelog**: https://github.com/VisActor/VRender/compare/v0.19.16...v0.19.17

[更多详情请查看 v0.19.17](https://github.com/VisActor/VRender/releases/tag/v0.19.17)

# v0.19.16

2024-07-10


**🐛 功能修复**

- **@visactor/vrender-components**: fix the issue where the arc label is still truncated despite setting `ellipsis: false`
- **@visactor/vrender-components**: fix syncState of label when re-render stage
- **@visactor/vrender-core**: fix syncState of label when re-render stage
- **@visactor/vrender-core**: fix issue with setAttribute while play with startAt



[更多详情请查看 v0.19.16](https://github.com/VisActor/VRender/releases/tag/v0.19.16)

# v0.19.15

2024-07-01


**🆕 新增功能**

- **@visactor/vrender-core**: support `clip` effect for new points in tagPointsUpdate animation

**🐛 功能修复**

- **@visactor/vrender-core**: fix issue with area clip direction
- **@visactor/vrender-core**: get default end props



[更多详情请查看 v0.19.15](https://github.com/VisActor/VRender/releases/tag/v0.19.15)

# v0.19.14

2024-06-28


**🆕 新增功能**

- **@visactor/vrender-components**: upgrade @visactor/vutils
- **@visactor/react-vrender-utils**: upgrade @visactor/vutils
- **@visactor/react-vrender**: upgrade @visactor/vutils
- **@visactor/vrender-kits**: upgrade @visactor/vutils
- **@visactor/vrender-core**: support richtext editor
- **@visactor/vrender-core**: upgrade @visactor/vutils
- **@visactor/vrender**: support richtext editor
- **@visactor/vrender**: upgrade @visactor/vutils

**🐛 功能修复**

- **@visactor/vrender-core**: fix issue with rect bounds while the wh is not setted
- **@visactor/vrender**: fix issue with rect bounds while the wh is not setted



[更多详情请查看 v0.19.14](https://github.com/VisActor/VRender/releases/tag/v0.19.14)

# v0.19.13

2024-06-25


**🐛 功能修复**

- **@visactor/vrender-core**: fix issue with stage while it is released



[更多详情请查看 v0.19.13](https://github.com/VisActor/VRender/releases/tag/v0.19.13)

# v0.19.12

2024-06-21

fix: fix issue with stage while it is released [#1270](https://github.com/VisActor/VRender/issues/1270)



[更多详情请查看 v0.19.12](https://github.com/VisActor/VRender/releases/tag/v0.19.12)

# v0.19.11

2024-06-17


**🐛 功能修复**

- **@visactor/vrender-components**: fix position of canvas tooltip shape



[更多详情请查看 v0.19.11](https://github.com/VisActor/VRender/releases/tag/v0.19.11)

# v0.19.10

2024-06-14


**🆕 新增功能**

- **@visactor/vrender-components**: support `align` right of canvas tooltip
- **streamLight**: streamLight support direction and  parent support x1y1 attribute. close@Visactor/VChart[#2734](https://github.com/VisActor/VRender/issues/2734)
- **streamLight**: streamLight support direction and  parent support x1y1 attribute. close@Visactor/VChart[#2734](https://github.com/VisActor/VRender/issues/2734)

**🐛 功能修复**

- **@visactor/vrender-core**: fix issue with interploate while color is array
- **@visactor/vrender-core**: only clear animation when has no state animation
- **@visactor/vrender**: fix issue with interploate while color is array



[更多详情请查看 v0.19.10](https://github.com/VisActor/VRender/releases/tag/v0.19.10)

# v0.19.9

2024-06-05


**🐛 功能修复**

- **@visactor/vrender-components**: colorLegend handler cannot customize fill color



[更多详情请查看 v0.19.9](https://github.com/VisActor/VRender/releases/tag/v0.19.9)

# v0.19.8

2024-06-05


**What's Changed**

* fix issue with https://github.com/VisActor/VRender/pull/1247
* [Auto release] release 0.19.8 by @github-actions in https://github.com/VisActor/VRender/pull/1249


**Full Changelog**: https://github.com/VisActor/VRender/compare/v0.19.7...v0.19.8

[更多详情请查看 v0.19.8](https://github.com/VisActor/VRender/releases/tag/v0.19.8)

# v0.19.7

2024-06-04


**🆕 新增功能**

- **@visactor/vrender-core**: image support stroke and border, closed [#1242](https://github.com/VisActor/VRender/issues/1242)
- **@visactor/vrender**: image support stroke and border, closed [#1242](https://github.com/VisActor/VRender/issues/1242)

**🐛 功能修复**

- **@visactor/vrender-components**: fix useless re-render of datazoom and brush
- **@visactor/vrender-core**: fix `useStates` of glyph
- **@visactor/vrender-core**: fix env check in micro frontend env



[更多详情请查看 v0.19.7](https://github.com/VisActor/VRender/releases/tag/v0.19.7)

# v0.19.6

2024-05-29


**🆕 新增功能**

- **@visactor/vrender-components**: add empty-tip component

**🐛 功能修复**

- **marker**: fix marker position and ref bad case. fix@visactor/vchart[#2721](https://github.com/VisActor/VRender/issues/2721)
- **@visactor/vrender-components**: fix animation of state change
- **@visactor/vrender-core**: fix issue with color array interpolate
- **@visactor/vrender-core**: fix issue with detailPath that list will not be cleard
- **@visactor/vrender-core**: fix issue with _nodeList while removeAllChild
- **@visactor/vrender-core**: fix issue with unTap
- **@visactor/vrender-core**: fix animation of state change



[更多详情请查看 v0.19.6](https://github.com/VisActor/VRender/releases/tag/v0.19.6)

# v0.19.5

2024-05-24


**🆕 新增功能**

- **@visactor/vrender-components**: add \`containerTextAlign\` for tag component



[更多详情请查看 v0.19.5](https://github.com/VisActor/VRender/releases/tag/v0.19.5)

# v0.19.4

2024-05-20


**🆕 新增功能**

- **@visactor/vrender-components**: add  scrollbar propagation spec to allow close stop propagation
- **@visactor/vrender-components**: support harmony env
- **marker**: mark point support arc and target item. close@VisActor/VChart[#2590](https://github.com/VisActor/VRender/issues/2590)
- **player**: index can be looped when set backward or forward button in player if user config loop. close@Vi
- **@visactor/vrender-kits**: support harmony env
- **@visactor/vrender-core**: support harmony env
- **@visactor/vrender**: support harmony env

**🐛 功能修复**

- **@visactor/vrender-components**: fix error of arc label
- **@visactor/vrender-components**: fix error of tooltip when rich text is empty
- **legend**: active item error when rerender legend. fix@VisActor/VChart[#2690](https://github.com/VisActor/VRender/issues/2690)



[更多详情请查看 v0.19.4](https://github.com/VisActor/VRender/releases/tag/v0.19.4)

# v0.19.3

2024-05-10


**🆕 新增功能**

- **@visactor/vrender-kits**: support baseOpacity for group
- **@visactor/vrender-core**: support baseOpacity for group



[更多详情请查看 v0.19.3](https://github.com/VisActor/VRender/releases/tag/v0.19.3)

# v0.19.2

2024-05-09


**🆕 新增功能**

- **@visactor/vrender-components**: support `focus` mode in discrete legend
- **@visactor/vrender-kits**: support tt env, closed [#1129](https://github.com/VisActor/VRender/issues/1129)
- **@visactor/vrender-core**: event support detailPath
- **@visactor/vrender-core**: support pauseTriggerEvent to pause stage event trigger



[更多详情请查看 v0.19.2](https://github.com/VisActor/VRender/releases/tag/v0.19.2)

# v0.19.1

2024-05-08


**🆕 新增功能**

- **@visactor/vrender-core**: rename forceBreakLine to disableAutoWrapLine

**🐛 功能修复**

- **@visactor/vrender-core**: fix issue with disableAutoWrapLine ellipsis
- **@visactor/vrender-core**: fix issue with interactive graphic while base graphic is removed



[更多详情请查看 v0.19.1](https://github.com/VisActor/VRender/releases/tag/v0.19.1)

# v0.19.0

2024-04-30


**🆕 新增功能**

- **@visactor/vrender-components**: support style callback in html and react, fix 1102
- **@visactor/vrender-kits**: support style callback in html and react, fix 1102
- **@visactor/vrender-core**: draw-contribution support check appName, closed [#1122](https://github.com/VisActor/VRender/issues/1122)
- **@visactor/vrender-core**: set renderService to multi-instance
- **@visactor/vrender-core**: support `opacity`/`fillOpacity`/`strokeOpacity` in richtext
- **@visactor/vrender-core**: support style callback in html and react, fix 1102

**🐛 功能修复**

- **@visactor/vrender-components**: fix point of event when stage has transform
- **@visactor/vrender-core**: fix point of event when stage has transform



[更多详情请查看 v0.19.0](https://github.com/VisActor/VRender/releases/tag/v0.19.0)

# v0.18.17

2024-04-30


**🐛 功能修复**

- **@visactor/vrender-components**: fix error of label when all the labels are cleared
- **@visactor/vrender-kits**: fix issue with setLineDash crash, closed [#1047](https://github.com/VisActor/VRender/issues/1047)
- **@visactor/vrender-core**: fix issue with setLineDash crash, closed [#1047](https://github.com/VisActor/VRender/issues/1047)
- **@visactor/vrender-core**: fix error of label when all the labels are cleared
- **@visactor/vrender-core**: fix flex-end layout order
- **@visactor/vrender-core**: fix issue with rect stroke array while defined by x1y1, closed [#1169](https://github.com/VisActor/VRender/issues/1169)



[更多详情请查看 v0.18.17](https://github.com/VisActor/VRender/releases/tag/v0.18.17)

# v0.18.16

2024-04-29


**🐛 功能修复**

- **@visactor/vrender-components**: theme should not support 3d graphics
- **@visactor/vrender-core**: theme should not support 3d graphics



[更多详情请查看 v0.18.16](https://github.com/VisActor/VRender/releases/tag/v0.18.16)

# v0.18.15

2024-04-28


**🆕 新增功能**

- **@visactor/vrender-core**: support forceBoundsWH, closed [#1128](https://github.com/VisActor/VRender/issues/1128)
- **@visactor/vrender-core**: support renderable attribute, closed [#1128](https://github.com/VisActor/VRender/issues/1128)

**🐛 功能修复**

- **@visactor/vrender-components**: `label.rotate: false` not work in inside arc label



[更多详情请查看 v0.18.15](https://github.com/VisActor/VRender/releases/tag/v0.18.15)

# v0.18.13

2024-04-23


**What's Changed**

* [Auto release] release 0.18.13 by @github-actions in https://github.com/VisActor/VRender/pull/1150
https://github.com/VisActor/VRender/pull/1147

**Full Changelog**: https://github.com/VisActor/VRender/compare/v0.18.11...v0.18.13

[更多详情请查看 v0.18.13](https://github.com/VisActor/VRender/releases/tag/v0.18.13)

# v0.18.12

2024-04-19


**🆕 新增功能**

- **@visactor/vrender-components**: add radio component

**🐛 功能修复**

- **brush**: state not correctly when operating mask bounds is not right. fix@VisActor/VChart[#2555](https://github.com/VisActor/VRender/issues/2555)
- **@visactor/vrender-components**: when clear states, the animations of state should clear
- **event**: event pos error when scale
- **@visactor/vrender-components**: fix the issue of update selected value of slider
- **@visactor/vrender-core**: when clear states, the animations of state should clear
- **@visactor/vrender-core**: fix issue with render html
- **@visactor/vrender-core**: fix issue with richtext background
- **@visactor/vrender-core**: fix the issue of update selected value of slider
- **@visactor/vrender-core**: add ellipsis in height limit

**🔨 功能重构**

- **@visactor/vrender-components**: replace wrapText with text

**📖 文档更新**

- **@visactor/vrender-components**: update changlog of rush
- **@visactor/vrender-core**: update changlog of rush


**Full Changelog**: https://github.com/VisActor/VRender/compare/v0.18.10...v0.18.12

**Full Changelog**: https://github.com/VisActor/VRender/compare/v0.18.12...v0.18.12

[更多详情请查看 v0.18.12](https://github.com/VisActor/VRender/releases/tag/v0.18.12)

# v0.18.11

2024-04-18


**🆕 新增功能**

- **@visactor/vrender-core**: 支持background-opacity配置

**🐛 功能修复**

- **@visactor/vrender-components**: change click into pointup in checkbox
- **@visactor/vrender-components**: player click event not working
- **@visactor/vrender-components**: player slider value error after resize
- **@visactor/vrender-kits**: fix for dragenter triggering error in drag event
- **@visactor/vrender-core**: fix issue with wh changed by flex layout, closed [#1088](https://github.com/VisActor/VRender/issues/1088)
- **@visactor/vrender-core**: pointerenter and pointerleave do not bubble, fixed [#1132](https://github.com/VisActor/VRender/issues/1132)
- **@visactor/vrender-core**: fix for dragenter triggering error in drag event
- **@visactor/vrender-core**: fix memory issue with stage timeline and DefaultRenderService



[更多详情请查看 v0.18.11](https://github.com/VisActor/VRender/releases/tag/v0.18.11)

# v0.18.10

2024-03-29


**🐛 功能修复**

- **@visactor/vrender-components**: when user set `defaultSelected` value to be [], all legend's items should be unselected, fixed https://github.com/VisActor/VChart/issues/2445
- **@visactor/vrender-components**: fix alignment calculation for line axis axis text, fixed https://github.com/VisActor/VChart/issues/2449



[更多详情请查看 v0.18.10](https://github.com/VisActor/VRender/releases/tag/v0.18.10)

# v0.18.8

2024-03-29


**🆕 新增功能**

- **@visactor/vrender-components**: support `inverse` in slider and size-lengend, color-legend

**🐛 功能修复**

- **@visactor/vrender-kits**: fix issue with pointer tap event point map
- **@visactor/vrender-core**: fix issue with pointer tap event point map
- **@visactor/vrender-core**: fix issue for multi line text with underline, closed [#1100](https://github.com/VisActor/VRender/issues/1100)



[更多详情请查看 v0.18.8](https://github.com/VisActor/VRender/releases/tag/v0.18.8)

# v0.18.7

2024-03-25


**🆕 新增功能**

- **segment**: support curve type. feat VisActor/VChart[#2417](https://github.com/VisActor/VRender/issues/2417)

**🐛 功能修复**

- **@visactor/vrender-components**: fix auto-limit of horizontal and vertical text
- **@visactor/vrender-kits**: set vtag params to optional
- **@visactor/vrender-core**: fix issue with offscreen style
- **@visactor/vrender-core**: fix issue with area animate



[更多详情请查看 v0.18.7](https://github.com/VisActor/VRender/releases/tag/v0.18.7)

# v0.18.6

2024-03-19


**🆕 新增功能**

- **@visactor/vrender-core**: richtext support combine linewidth style
- **@visactor/vrender-core**: support native render for react, closed [#400](https://github.com/VisActor/VRender/issues/400)

**🐛 功能修复**

- **@visactor/vrender-components**: fix the issue of axis's update transition animation not work
- **@visactor/vrender-components**: fix the direction of legend scrollbar
- **@visactor/vrender-core**: html-plugin support release



[更多详情请查看 v0.18.6](https://github.com/VisActor/VRender/releases/tag/v0.18.6)

# v0.18.5

2024-03-14


**🐛 功能修复**

- **debounce**: dataZoom and scrollbar and brush debounce leads to remove event fail



[更多详情请查看 v0.18.5](https://github.com/VisActor/VRender/releases/tag/v0.18.5)

# v0.18.2

2024-03-12


**What's Changed**

* [Auto Sync] Sync the code from branch main to branch develop after release 0.18.1 by @github-actions in https://github.com/VisActor/VRender/pull/1045
* [Auto changelog] changlog of v0.18.1 by @github-actions in https://github.com/VisActor/VRender/pull/1046
* fix: label strategy overlapping not work in some cases by @xiaoluoHe in https://github.com/VisActor/VRender/pull/1043
* Revert "Merge pull request [#1021](https://github.com/VisActor/VRender/issues/1021) from VisActor/fix/last-alternateColo… by @xiaoluoHe in https://github.com/VisActor/VRender/pull/1052
* [Auto release] release 0.18.2 by @github-actions in https://github.com/VisActor/VRender/pull/1054


**Full Changelog**: https://github.com/VisActor/VRender/compare/v0.18.1...v0.18.2

[更多详情请查看 v0.18.2](https://github.com/VisActor/VRender/releases/tag/v0.18.2)

# v0.18.1

2024-03-04


**🆕 新增功能**

- **@visactor/vrender-components**: support `autoEllipsisStrategy` of legend item



[更多详情请查看 v0.18.1](https://github.com/VisActor/VRender/releases/tag/v0.18.1)

# v0.18.0

2024-02-28


**🆕 新增功能**

- **scrollbar**: reconfig scrollbar api of scrollDrag and scrollDown
- **@visactor/vrender-components**: support oriented padding in label overlap bitmap
- **@visactor/vrender-components**: support item align of discrete legend
- **@visactor/vrender-components**: support scrollbar in legend
- **@visactor/vrender-components**: support tooltip in SizeLegend and ColorLegend
- **@visactor/vrender-components**: support lazyload of Legend, and pageFormatter of Pager
- **@visactor/vrender-core**: support flatten_simplify
- **@visactor/vrender-core**: support innerpadding and outerpadding
- **@visactor/vrender-core**: richtext support inherit attribute, closed [#946](https://github.com/VisActor/VRender/issues/946)

**🐛 功能修复**

- **datazoom**: realtime & pickable not work
- **dataZoom**: compute line width when compute bounds
- **@visactor/vrender-core**: multiline text underline bugfix, closed [#1029](https://github.com/VisActor/VRender/issues/1029)



[更多详情请查看 v0.18.0](https://github.com/VisActor/VRender/releases/tag/v0.18.0)

# v0.17.26

2024-02-28


**🆕 新增功能**

- **@visactor/vrender-core**: animate with stage timeline
- **@visactor/vrender-core**: support underline Dash and undeline offset, closed [#1025](https://github.com/VisActor/VRender/issues/1025)

**🐛 功能修复**

- **@visactor/vrender-kits**: fix issue with load svg sync, fix issue with decode react dom
- **@visactor/vrender-core**: fix issue with load svg sync, fix issue with decode react dom
- **@visactor/vrender**: fix issue with load svg sync, fix issue with decode react dom



[更多详情请查看 v0.17.26](https://github.com/VisActor/VRender/releases/tag/v0.17.26)

# v0.17.25

2024-02-27


**🆕 新增功能**

- **@visactor/vrender-components**: export more basic type defination in vrender-components
- **@visactor/vrender-kits**: support offscreenCanvas in lynx env, closed [#994](https://github.com/VisActor/VRender/issues/994)
- **@visactor/vrender-core**: support flatten_simplify
- **@visactor/vrender-core**: jsx attribute support name and id

**🐛 功能修复**

- **@visactor/vrender-components**: fix auto-limit of top/bottom axis when no rotate
- **@visactor/vrender-components**: legend disappear when label is empty string in focus mode
- **@visactor/vrender-core**: fix issue with check gradient str color, closed [#984](https://github.com/VisActor/VRender/issues/984)
- **@visactor/vrender-core**: globalZIndex attribute should not do animation
- **@visactor/vrender-core**: fix issue with string star path
- **@visactor/vrender-core**: fix issue with text background while angle attr configed, closed [#1002](https://github.com/VisActor/VRender/issues/1002)
- **@visactor/vrender**: fix issue with text background while angle attr configed, closed [#1002](https://github.com/VisActor/VRender/issues/1002)



[更多详情请查看 v0.17.25](https://github.com/VisActor/VRender/releases/tag/v0.17.25)

# v0.17.24

2024-02-06


**🐛 功能修复**

- **datazoom**: realtime & pickable not work



[更多详情请查看 v0.17.24](https://github.com/VisActor/VRender/releases/tag/v0.17.24)

# v0.17.23

2024-02-04


**🆕 新增功能**

- **@visactor/vrender-core**: support renderStyle config
- **@visactor/vrender**: support renderStyle config

**🐛 功能修复**

- **@visactor/vrender-core**: fix issue with single point in area graphic



[更多详情请查看 v0.17.23](https://github.com/VisActor/VRender/releases/tag/v0.17.23)

# v0.17.22

2024-02-02


**🐛 功能修复**

- **@visactor/vrender-core**: revert richtext inherit



[更多详情请查看 v0.17.22](https://github.com/VisActor/VRender/releases/tag/v0.17.22)

# v0.17.21

2024-02-02


**🆕 新增功能**

- **@visactor/vrender-core**: richtext support inherit attribute, closed [#946](https://github.com/VisActor/VRender/issues/946)

**🐛 功能修复**

- **@visactor/vrender-components**: fix issue with remove html, closed [#944](https://github.com/VisActor/VRender/issues/944)
- **@visactor/vrender-core**: fix issue with remove html and change html pos, closed [#944](https://github.com/VisActor/VRender/issues/944)



[更多详情请查看 v0.17.21](https://github.com/VisActor/VRender/releases/tag/v0.17.21)

# v0.17.20

2024-02-01


**🆕 新增功能**

- **@visactor/vrender-components**: unify richtext config
- **@visactor/vrender-components**: support richtext in legend components
- **@visactor/vrender-components**: tag support textAlwaysCenter, closed [#915](https://github.com/VisActor/VRender/issues/915)
- **@visactor/vrender-core**: enhance flex effect, support pauseFlex api, closed [#874](https://github.com/VisActor/VRender/issues/874), closed [#912](https://github.com/VisActor/VRender/issues/912)
- **@visactor/vrender-core**: support keepMatrix api
- **@visactor/vrender**: refactor GetImage in ResourceLoader

**🐛 功能修复**

- **@visactor/vrender-core**: compatible with illegal richText value



[更多详情请查看 v0.17.20](https://github.com/VisActor/VRender/releases/tag/v0.17.20)

# v0.17.18

2024-01-24


**🆕 新增功能**

- **@visactor/vrender-components**: adjust the timing for label customLayoutFunc invocation
- **@visactor/vrender-components**: label component will sync maxLineWidth to maxWidth in richText
- **@visactor/vrender-kits**: compatible canvas in lynx env
- **@visactor/vrender-core**: support backgroundCornerRadius

**🐛 功能修复**

- **@visactor/vrender-components**: event pos error when interactive in site
- **@visactor/vrender-kits**: fix issue with interface
- **@visactor/vrender-core**: fix issue with multiline text textBaseline, closed [#886](https://github.com/VisActor/VRender/issues/886)
- **@visactor/vrender-core**: fix issue with union empty bounds
- **@visactor/vrender-core**: richtext.textConfig supports number type text



[更多详情请查看 v0.17.18](https://github.com/VisActor/VRender/releases/tag/v0.17.18)

# v0.17.17

2024-01-22


**🆕 新增功能**

- **@visactor/vrender-core**: html only append dom inside body
- **@visactor/vrender-core**: color support str gradient color
- **@visactor/vrender**: color support str gradient color

**🐛 功能修复**

- **@visactor/vrender-components**: title support multiline
- **@visactor/vrender-kits**: fix issue with loaded tree-shaking
- **@visactor/vrender-core**: fix issue with rerun getTextBounds
- **@visactor/vrender-core**: fix issue with set image
- **@visactor/vrender-core**: fix issue with loaded tree-shaking



[更多详情请查看 v0.17.17](https://github.com/VisActor/VRender/releases/tag/v0.17.17)

# v0.17.16

2024-01-18


**🆕 新增功能**

- **@visactor/vrender-core**: enable pass supportsPointerEvents and supportsTouchEvents

**🐛 功能修复**

- **@visactor/vrender-components**: when no brush is active, brush should not call stopPropagation()

[更多详情请查看 v0.17.16](https://github.com/VisActor/VRender/releases/tag/v0.17.16)

# v0.17.15

2024-01-17


**🆕 新增功能**

- **@visactor/vrender-components**: support boolean config in label
- **@visactor/vrender-core**: add supportsTouchEvents and supportsPointerEvents params

**🐛 功能修复**

- **@visactor/vrender-components**: fix the flush of axis when axis label has rotate angle
- **@visactor/vrender-components**: arc label line not shown
- **@visactor/vrender-components**: error happens in line-label when line has no points
- **@visactor/vrender-core**: fix issue with html attribute
- **@visactor/vrender-core**: fix issue with env-check
- **@visactor/vrender-core**: fix issue with text background opacity



[更多详情请查看 v0.17.15](https://github.com/VisActor/VRender/releases/tag/v0.17.15)

# v0.17.14

2024-01-12

**🐛 功能修复**
- **@visactor/vrender-core**: fix `splitRect` when rect has `x1` or `y1`
- **@visactor/vrender**: fix `splitRect` when rect has `x1` or `y1`


[更多详情请查看 v0.17.14](https://github.com/VisActor/VRender/releases/tag/v0.17.14)

# v0.17.13

2024-01-10

**🆕 新增功能**
- **@visactor/vrender-core**: background support opacity
**🐛 功能修复**
- **@visactor/vrender-components**: filter out invisible indicator spec
- **@visactor/vrender-components**: `measureTextSize` needs to take into account the fonts configured on the stage theme
- **@visactor/vrender-core**: fix issue with incremental draw
- **@visactor/vrender-core**: supply the `getTheme()` api for `IStage`



[更多详情请查看 v0.17.13](https://github.com/VisActor/VRender/releases/tag/v0.17.13)

# v0.17.12

2024-01-10

**🆕 新增功能**
- **@visactor/vrender-components**: support fit strategy for indicator
- **marker**: mark point support confine. fix @Visactor/VChart[#1573](https://github.com/VisActor/VRender/issues/1573)
**🐛 功能修复**
- **marker**: fix problem of no render when set visible attr and add valid judgment logic. fix@Visactor/Vchart[#1901](https://github.com/VisActor/VRender/issues/1901)
- **datazoom**: adaptive handler text layout. fix@Visactor/VChart[#1809](https://github.com/VisActor/VRender/issues/1809)
- **datazoom**: set pickable false when zoomLock. fix @Visactor/VChart[#1565](https://github.com/VisActor/VRender/issues/1565)
- **datazoom**: handler not follow mouse after resize. fix@Visactor/Vchart[#1490](https://github.com/VisActor/VRender/issues/1490)
- **@visactor/vrender-components**: arc outside label invisible with visible label line



[更多详情请查看 v0.17.12](https://github.com/VisActor/VRender/releases/tag/v0.17.12)

# v0.17.11

2024-01-05

**🆕 新增功能**
- **@visactor/vrender-core**: add backgroundFit attribute
**🐛 功能修复**
- **@visactor/vrender-core**: fix issue with position in html attribute
- fix: label invisible when baseMark visible is false

**Full Changelog**: https://github.com/VisActor/VRender/compare/v0.17.10...v0.17.11

[更多详情请查看 v0.17.11](https://github.com/VisActor/VRender/releases/tag/v0.17.11)

# v0.17.10

2024-01-03

**🆕 新增功能**
- **@visactor/vrender-components**: support `lastVisible` of LineAxis label
- **@visactor/vrender-kits**: support fillPickable and strokePickable for area, closed [#792](https://github.com/VisActor/VRender/issues/792)
- **@visactor/vrender-core**: support fillPickable and strokePickable for area, closed [#792](https://github.com/VisActor/VRender/issues/792)
- **@visactor/vrender-core**: support `lastVisible` of LineAxis label
- **@visactor/vrender**: support `lastVisible` of LineAxis label
**🐛 功能修复**
- **@visactor/vrender-components**: fix the auto limit width of label when the label has vertical `direction` in orient top or bottom
- **@visactor/vrender-components**: fix issue with legend symbol size
- **@visactor/vrender-components**: fixed height calculation issue after multi-layer axis text rotation
- **@visactor/vrender-core**: fix issue with area-line highperformance draw
- **@visactor/vrender-core**: fix the auto limit width of label when the label has vertical `direction` in orient top or bottom
- **@visactor/vrender-core**: disable layer picker in interactive layer
- **@visactor/vrender**: fix the auto limit width of label when the label has vertical `direction` in orient top or bottom
**🔖 其他**
- **@visactor/vrender-components**: 'feat: support label line in label component'



[更多详情请查看 v0.17.10](https://github.com/VisActor/VRender/releases/tag/v0.17.10)

# v0.17.9

2024-01-03

**🐛 功能修复**
- **@visactor/vrender-components**: fix label position when offset is 0
- **@visactor/vrender-core**: fix issue with conical cache not work as expect



[更多详情请查看 v0.17.9](https://github.com/VisActor/VRender/releases/tag/v0.17.9)

# v0.17.8

2023-12-29

**🆕 新增功能**
- **@visactor/vrender-components**: optimize outer label layout in tangential direction
- **@visactor/vrender-core**: support drawGraphicToCanvas
- **@visactor/vrender**: support drawGraphicToCanvas
**🐛 功能修复**
- **@visactor/vrender-components**: when axis label space is 0, and axis tick' inside is true, the axis label's position is not correct
- **@visactor/vrender-components**: fix morphing of rect
- **@visactor/vrender-kits**: fix issue with mapToCanvasPoint in miniapp, closed [#828](https://github.com/VisActor/VRender/issues/828)
- **@visactor/vrender-core**: fix issue with rect.toCustomPath
- **@visactor/vrender-core**: fix issue with area segment with single point, closed [#801](https://github.com/VisActor/VRender/issues/801)
- **@visactor/vrender-core**: fix issue with new Function in miniapp
- **@visactor/vrender-core**: fix morphing of rect
- **@visactor/vrender-core**: fix issue with side-effect in some env
- **@visactor/vrender-core**: fix issue with check tt env
- **@visactor/vrender-core**: fix issue with cliped attribute in vertical text, closed [#827](https://github.com/VisActor/VRender/issues/827)
- **@visactor/vrender**: fix issue with area segment with single point, closed [#801](https://github.com/VisActor/VRender/issues/801)
- **@visactor/vrender**: fix morphing of rect
- **@visactor/vrender**: fix issue with side-effect in some env



[更多详情请查看 v0.17.8](https://github.com/VisActor/VRender/releases/tag/v0.17.8)

# v0.17.7

2023-12-21

**🐛 功能修复**
- **@visactor/vrender-kits**: fix issue with create layer in miniapp env
- **@visactor/vrender-core**: fix issue with create layer in miniapp env



[更多详情请查看 v0.17.7](https://github.com/VisActor/VRender/releases/tag/v0.17.7)

# v0.17.6

2023-12-20

**What's Changed**
* Main by @neuqzxy in https://github.com/VisActor/VRender/pull/813
* fix: fix issue with rect stroke contribution by @neuqzxy in https://github.com/VisActor/VRender/pull/814
* [Auto release] release 0.17.6 by @github-actions in https://github.com/VisActor/VRender/pull/815


**Full Changelog**: https://github.com/VisActor/VRender/compare/v0.17.5...v0.17.6

[更多详情请查看 v0.17.6](https://github.com/VisActor/VRender/releases/tag/v0.17.6)

# v0.17.5

2023-12-19

**🆕 新增功能**
- **scrollbar**: dispatch scrollDown event
- **@visactor/vrender-components**: labelLine support animate
- **@visactor/vrender-components**: label don't create enter animate animationEnter while duration less than 0
- **@visactor/vrender**: add disableAutoClipedPoptip attribute in text graphic
**🐛 功能修复**
- **@visactor/vrender-components**: fix issue with arc animate with delayafter
- **@visactor/vrender-components**: fix issue with poptip circular dependencies
- **@visactor/vrender-core**: fix issue with plugin unregister
- **@visactor/vrender-core**: fix issue with text while whitespace is normal
- **@visactor/vrender**: fix cursor update error in multi-stage



[更多详情请查看 v0.17.5](https://github.com/VisActor/VRender/releases/tag/v0.17.5)

# v0.17.4

2023-12-15

**🐛 功能修复**
- **datazoom**: symbol size problem
- **@visactor/vrender-core**: fix issue with arc imprecise bounds, closed [#728](https://github.com/VisActor/VRender/issues/728)



[更多详情请查看 v0.17.4](https://github.com/VisActor/VRender/releases/tag/v0.17.4)

# v0.17.3

2023-12-14

**🐛 功能修复**
- **datazoom**: handler zindex to interaction error



[更多详情请查看 v0.17.3](https://github.com/VisActor/VRender/releases/tag/v0.17.3)

# v0.17.2

2023-12-14

**🆕 新增功能**
- **dataZoom**: add mask to modify hot zone. feat @visactor/vchart[#1415](https://github.com/VisActor/VRender/issues/1415)'
- **dataZoom**: add mask to modify hot zone. feat @visactor/vchart[#1415](https://github.com/VisActor/VRender/issues/1415)'
- **dataZoom**: add mask to modify hot zone. feat @visactor/vchart[#1415](https://github.com/VisActor/VRender/issues/1415)'
- **dataZoom**: add mask to modify hot zone. feat @visactor/vchart[#1415](https://github.com/VisActor/VRender/issues/1415)'
- **dataZoom**: add mask to modify hot zone. feat @visactor/vchart[#1415](https://github.com/VisActor/VRender/issues/1415)'
- **@visactor/vrender-core**: rect3d support x1y1, fix -radius issue with rect
- **dataZoom**: add mask to modify hot zone. feat @visactor/vchart[#1415](https://github.com/VisActor/VRender/issues/1415)'
**🐛 功能修复**
- **@visactor/vrender-components**: scrollbar slider width/height should not be negative
- **@visactor/vrender-components**: datazoom event block window event. fix @visactor/vchart[#1686](https://github.com/VisActor/VRender/issues/1686)
- **@visactor/vrender-components**: fix the issue of brushEnd trigger multiple times, related https://github.com/VisActor/VChart/issues/1694
- **@visactor/vrender-core**: fix shadow pick issue
**⚡ 性能优化**
- **@visactor/vrender-components**: optimize the `_handleStyle()` in legend



[更多详情请查看 v0.17.2](https://github.com/VisActor/VRender/releases/tag/v0.17.2)

# v0.17.1

2023-12-06

**🆕 新增功能**
- **@visactor/vrender-kits**: support pickStrokeBuffer, closed [#758](https://github.com/VisActor/VRender/issues/758)
- **@visactor/vrender-core**: support pickStrokeBuffer, closed [#758](https://github.com/VisActor/VRender/issues/758)
**🐛 功能修复**
- **@visactor/vrender-kits**: fix issue with rebind pick-contribution
- **@visactor/vrender-core**: fix issue in area chart with special points
- **@visactor/vrender-core**: fix issue with rebind pick-contribution
- **@visactor/vrender-core**: fix error with wrap text and normal whiteSpace text



[更多详情请查看 v0.17.1](https://github.com/VisActor/VRender/releases/tag/v0.17.1)

# v0.17.0

2023-11-30

**🆕 新增功能**
- **@visactor/vrender-components**: optmize bounds performance
- **@visactor/vrender-kits**: rect support x1 and y1
- **@visactor/vrender-kits**: optmize bounds performance
- **@visactor/vrender-core**: support disableCheckGraphicWidthOutRange to skip check if graphic out of range
- **@visactor/vrender-core**: rect support x1 and y1
- **@visactor/vrender-core**: don't rewrite global reflect
- **@visactor/vrender-core**: text support background, closed [#711](https://github.com/VisActor/VRender/issues/711)
- **@visactor/vrender-core**: optmize bounds performance
- **@visactor/vrender**: don't rewrite global reflect
- **@visactor/vrender**: skip update bounds while render small node-tree, closed [#660](https://github.com/VisActor/VRender/issues/660)
- **@visactor/vrender**: optmize bounds performance
**🔨 功能重构**
- **@visactor/vrender-kits**: refact inversify completely, closed [#657](https://github.com/VisActor/VRender/issues/657)
- **@visactor/vrender-core**: refact inversify completely, closed [#657](https://github.com/VisActor/VRender/issues/657)
- **@visactor/vrender**: refact inversify completely, closed [#657](https://github.com/VisActor/VRender/issues/657)
**⚡ 性能优化**
- **@visactor/vrender-components**: add option `skipDefault` to vrender-components
- **@visactor/vrender-core**: area support drawLinearAreaHighPerformance, closed [#672](https://github.com/VisActor/VRender/issues/672)



[更多详情请查看 v0.17.0](https://github.com/VisActor/VRender/releases/tag/v0.17.0)

# v0.16.18

2023-11-30

**🆕 新增功能**
- **@visactor/vrender-components**: discrete legend's pager support position property
- **@visactor/vrender-core**: support suffixPosition, closed [#625](https://github.com/VisActor/VRender/issues/625)
- **@visactor/vrender**: support suffixPosition, closed [#625](https://github.com/VisActor/VRender/issues/625)
**🐛 功能修复**
- **@visactor/vrender-kits**: doubletap should not be triggered when the target is different twice before and after
- **@visactor/vrender-core**: fix issue with attribute interpolate, closed [#741](https://github.com/VisActor/VRender/issues/741)
- **@visactor/vrender-core**: fix issue about calcuate bounds with shadow, closed [#474](https://github.com/VisActor/VRender/issues/474)
- **@visactor/vrender-core**: fix issue with white line in some dpr device, closed [#666](https://github.com/VisActor/VRender/issues/666)
**🔨 功能重构**
- **@visactor/vrender-components**: move getSizeHandlerPath out of sizlegend
- **@visactor/vrender-core**: event-related coordinate points do not require complex Point classes



[更多详情请查看 v0.16.18](https://github.com/VisActor/VRender/releases/tag/v0.16.18)

# v0.16.17

2023-11-23

**🆕 新增功能**
- **@visactor/vrender-components**: support rich text for label, axis, marker,tooltip, indicator and title
- **@visactor/vrender-components**: add mode type of smartInvert
- **@visactor/vrender-components**: place more label for overlapPadding case
- **@visactor/vrender-kits**: support 'tap' gesture for Gesture plugin
- **@visactor/vrender-core**: add `event` config for Stage params, which can configure `clickInterval` and some other options in eventSystem
- **@visactor/vrender-core**: support fill and stroke while svg don't support, closed [#710](https://github.com/VisActor/VRender/issues/710)
**🐛 功能修复**
- **@visactor/vrender-kits**: \`pickMode: 'imprecise'\` not work in polygon
- **@visactor/vrender-core**: richtext may throw error when textConfig is null
- **@visactor/vrender-core**: fix issue with image repeat, closed [#712](https://github.com/VisActor/VRender/issues/712)
- **@visactor/vrender-core**: fix issue with restore and save count not equal
**⚡ 性能优化**
- **@visactor/vrender-core**: not setAttribute while background is not url, closed [#696](https://github.com/VisActor/VRender/issues/696)



[更多详情请查看 v0.16.17](https://github.com/VisActor/VRender/releases/tag/v0.16.17)

# v0.16.16

2023-11-17

**🐛 功能修复**
- **@visactor/vrender-components**: fix the issue of legend item.shape can not set visible, related https://github.com/VisActor/VChart/issues/1508
- **@visactor/vrender-core**: assign symbol rect function to old



[更多详情请查看 v0.16.16](https://github.com/VisActor/VRender/releases/tag/v0.16.16)

# v0.16.15

2023-11-16

**🐛 功能修复**
- **@visactor/vrender-compoments**: legendItemHover and legendItemUnHover should trigger once



[更多详情请查看 v0.16.15](https://github.com/VisActor/VRender/releases/tag/v0.16.15)

# v0.16.14

2023-11-15

**🆕 新增功能**
- **@visactor/vrender-components**: datazoom update callback supports new trigger tag param
- **@visactor/vrender-components**: support line/area label
- **@visactor/vrender-components**: lineHeight support string, which means percent
- **@visactor/vrender-core**: add round line symbol, closed [#1458](https://github.com/VisActor/VRender/issues/1458)
- **@visactor/vrender-core**: lineHeight support string, which means percent
**🐛 功能修复**
- **@visactor/vrender-core**: fix issue with render while in scale transform



[更多详情请查看 v0.16.14](https://github.com/VisActor/VRender/releases/tag/v0.16.14)

# v0.16.13

2023-11-15

**🆕 新增功能**
- **@visactor/vrender-core**: add preventRender function
- **@visactor/vrender-core**: merge wrap text function to text
**🐛 功能修复**
- **@visactor/vrender-kits**: temp fix issue with lynx measuretext



[更多详情请查看 v0.16.13](https://github.com/VisActor/VRender/releases/tag/v0.16.13)

# v0.16.12

2023-11-07

**🆕 新增功能**
- **@visactor/vrender-core**: optimize text increase animation
**🐛 功能修复**
- **@visactor/vrender-components**: padding of title component
- **@visactor/vrender-components**: padding offset of AABBbounds
- **@visactor/vrender-kits**: fix node-canvas max count issue
- **@visactor/vrender-core**: fix node-canvas max count issue



[更多详情请查看 v0.16.12](https://github.com/VisActor/VRender/releases/tag/v0.16.12)

# v0.16.11

2023-11-07

**🐛 功能修复**
- **@visactor/vrender-components**: optimize the auto-overlap of axis label, which use rotateBounds when text rotated, relate https://github.com/VisActor/VChart/issues/133
- **@visactor/vrender-components**: flush should not sue width height
- **@visactor/vrender-components**: fix the lastvisible logic of axis's auto-hide
- **@visactor/vrender-kits**: fix issue with xul and html attribute, closed [#634](https://github.com/VisActor/VRender/issues/634)
- **@visactor/vrender-core**: fix issue with xul and html attribute, closed [#634](https://github.com/VisActor/VRender/issues/634)



[更多详情请查看 v0.16.11](https://github.com/VisActor/VRender/releases/tag/v0.16.11)

# v0.16.10

2023-11-02

**What's Changed**
* Sync main by @neuqzxy in https://github.com/VisActor/VRender/pull/640
* fix: fix issue with xul and html attribute, closed [#634](https://github.com/VisActor/VRender/issues/634) by @neuqzxy in https://github.com/VisActor/VRender/pull/635
* Echance/axis auto rotate by @kkxxkk2019 in https://github.com/VisActor/VRender/pull/633
* [Auto release] release 0.16.9 by @github-actions in https://github.com/VisActor/VRender/pull/641


**Full Changelog**: https://github.com/VisActor/VRender/compare/v0.16.9...v0.16.10

[更多详情请查看 v0.16.10](https://github.com/VisActor/VRender/releases/tag/v0.16.10)

# v0.16.9

2023-10-27

**🆕 新增功能**
- **@visactor/vrender-components**: add checkbox indeterminate state
- **label**: rect label support position `top-right`|`top-left`|`bottom-righ`|`bottom-left`
- **@visactor/vrender-core**: stage background support image
**🐛 功能修复**
- **@visactor/vrender-components**: all the group container of marker do not trigger event
- **datazoom**: text bounds when visible is false. fix VisActor/VChart[#1281](https://github.com/VisActor/VRender/issues/1281)



[更多详情请查看 v0.16.9](https://github.com/VisActor/VRender/releases/tag/v0.16.9)

# v0.16.8

2023-10-23

**🐛 功能修复**
- **@visactor/vrender-components**: fix the issue of error position of focus when legend item just has label



[更多详情请查看 v0.16.8](https://github.com/VisActor/VRender/releases/tag/v0.16.8)

# v0.16.7

2023-10-23

**🐛 功能修复**
- **label**: fix the issue that `clampForce` does not work when`overlapPadding` is configured
- **@visactor/vrender-core**: fix issue with creating multi chart in miniapp



[更多详情请查看 v0.16.7](https://github.com/VisActor/VRender/releases/tag/v0.16.7)

# v0.16.6

2023-10-23

**🆕 新增功能**
- **@visactor/vrender-components**: optimize the layout method of circle axis label
**🐛 功能修复**
- **@visactor/vrender-components**: fix the layout issue of legend item because of the error logic of `focusStartX`



[更多详情请查看 v0.16.6](https://github.com/VisActor/VRender/releases/tag/v0.16.6)

