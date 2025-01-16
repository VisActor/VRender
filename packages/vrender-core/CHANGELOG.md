# Change Log - @visactor/vrender-core

This log was last generated on Wed, 15 Jan 2025 12:13:28 GMT and should not be manually modified.

## 0.21.11
Wed, 15 Jan 2025 12:13:28 GMT

### Updates

- fix: fix issue with area connect type

## 0.21.10
Wed, 15 Jan 2025 03:14:32 GMT

_Version update only_

## 0.21.9
Mon, 13 Jan 2025 03:23:50 GMT

### Updates

- feat: change effect for connectedType, closed #1660 
- fix: fix issue with animate error when graphic.stage is null

## 0.21.8
Mon, 06 Jan 2025 11:07:36 GMT

### Updates

- feat: add isImageAnonymous in global

## 0.21.7
Wed, 25 Dec 2024 07:53:11 GMT

### Updates

- fix: upgrade vutils to 0.19.3



## 0.21.6
Tue, 24 Dec 2024 12:46:37 GMT

### Updates

- fix: fix issue with stroke clip

## 0.21.5
Tue, 24 Dec 2024 07:53:11 GMT

### Updates

- fix: fix issue with image background stroke, closed #1640

## 0.21.4
Mon, 23 Dec 2024 10:16:00 GMT

_Version update only_

## 0.21.3
Mon, 23 Dec 2024 08:28:14 GMT

### Updates

- feat: support loadFont
- feat: support penetrateEventList
- fix: fix issue with image stroke and background
- fix: fix issue with html when include interactive layer
- fix: fix issue with richtext not support setShadowBlendStyle
- fix: optimize the performance of ticks in time-scale



## 0.21.2
Thu, 12 Dec 2024 10:23:51 GMT

### Updates

- fix: fix issue with shadow-root transform

## 0.21.1
Thu, 05 Dec 2024 07:50:47 GMT

### Updates

- fix: fix issue with insertAfter and insertBefore
- fix: fix the issue when line is configured to connect, closed #3238
- fix: fix issue with richtext setAttribute, closed #1578
- fix: fix issue with richtext default font

## 0.21.0
Thu, 28 Nov 2024 03:30:36 GMT

### Updates

- feat: use ascend and decent to make measure more accurate
- feat: sync animated attribute while call render func, closed #1416
- fix: smooth out stuttering effects when multiple TagPointsUpdate instances execute concurrently
- fix: fix issue with dirtyBounds incorrectly while set visible

## 0.20.16
Thu, 21 Nov 2024 06:58:23 GMT

### Updates

- fix: fix issue with _debug_bounds
- fix: fix issue with string linear-gradient
- fix: fix issue where not work when lineWidth is set to 0
- fix: fix drawing issue when size is array

## 0.20.15
Fri, 15 Nov 2024 08:34:34 GMT

### Updates

- feat: support keepStrokeScale

## 0.20.14
Wed, 13 Nov 2024 07:47:16 GMT

_Version update only_

## 0.20.13
Wed, 13 Nov 2024 06:35:02 GMT

### Updates

- feat: support auto refresh plugin
- fix: fix smartInvert of gradient bar


- fix: fix issue with text clip

## 0.20.12
Thu, 31 Oct 2024 02:49:49 GMT

_Version update only_

## 0.20.11
Wed, 30 Oct 2024 13:10:03 GMT

### Updates

- fix: fix group fill gradient #1518
- fix: annotate the Ramer Douglas Peucker algorithm in point optimization

## 0.20.10
Wed, 23 Oct 2024 08:37:33 GMT

### Updates

- feat: support fillStrokeOrder, closed #1505
- fix: fix issue with parse m where multi pos follow, closed #1490
- fix: fix the accuracy issue of number matching, closed #1488

## 0.20.9
Tue, 15 Oct 2024 03:50:15 GMT

### Updates

- feat: text support keep-all, closed #1466
- fix: fix max width of arc label in left



## 0.20.8
Sun, 29 Sep 2024 09:44:02 GMT

### Updates

- fix: fix line bounds with defined false, closed #1463

## 0.20.7
Fri, 27 Sep 2024 03:22:31 GMT

_Version update only_

## 0.20.6
Thu, 26 Sep 2024 09:28:36 GMT

### Updates

- fix: fix customPath of arc


- feat: support obb bounds in text graphic
- fix: fix limit width of arc label when has customized align offset


- fix: fix error of `alternateColor`


- fix: fix issue with interactive graphic while parent was removed
- fix: outside label should not apply `smartInvert`


- fix: fix `boundsPadding` of legend focus icon


- fix: line segment update animation result error

## 0.20.5
Fri, 20 Sep 2024 06:37:57 GMT

### Updates

- feat: poptip suppport multiline text, closed #1444
- feat: fix issue with richtext width on disableAutoWrapLine mode, support clip attr
- fix: fix error of `bounds-contex` when use `arcTo` in customShape
- fix: fix maxLineWidth of arc label


- fix: fix path string of arc, fix #1434


- fix: fix error of morphing animation in `multiToOneMorph`, fix #1439



## 0.20.4
Thu, 12 Sep 2024 07:33:20 GMT

### Updates

- feat: pauseRender support pass count
- fix: add updateHoverIconState in richtext

## 0.20.3
Sat, 07 Sep 2024 09:16:33 GMT

### Updates

- fix: fix error of updateAABBbounds when morphing


- fix: tag padding not work when label is rich text. fix@VisActor/VChart#3151

## 0.20.2
Wed, 04 Sep 2024 12:52:31 GMT

### Updates

- fix: fix error of interpolate when use rgba color


- fix: fix bug of label in radarchart triggered by aniamtion



## 0.20.1
Fri, 30 Aug 2024 09:55:08 GMT

### Updates

- fix: fix issue with poptip release
- fix: fix issue with animate zero duration
- fix: fix textAlign of label when set different angle


- fix: fix memory leak problem in ResourceLoader
- fix: fix issue with richtext edit plugin while defucus out of text

## 0.20.0
Thu, 15 Aug 2024 07:26:54 GMT

### Updates

- fix: fix bug of auto-render when remove some graphics


- fix: optimize triangle symbols


- refactor: optimize cornerRadius parse of arc


- refactor: remove polyfill from reflect-metadata

## 0.19.24
Tue, 13 Aug 2024 07:47:29 GMT

### Updates

- feat: support polygon of circle-axis


- feat: support rect corner array with array stroke
- fix: fix wrong stroke style is applied to area


- fix: fix issue with baseOpacity equal to 0
- fix: fix edge and corner stroke in createRectPath()
- fix: fix issue with shadow group matrix
- fix: fix issue with disableAutoWrapLine
- fix: fix richtext icon pick range #1362
- fix: fix issue with richtext attribute update

## 0.19.23
Tue, 06 Aug 2024 05:17:39 GMT

### Updates

- fix: fix picker of shadow root group



## 0.19.22
Mon, 05 Aug 2024 09:08:30 GMT

### Updates

- feat: shadow graphic support pick group
- fix: fix issue with Event class in harmony event

## 0.19.21
Mon, 05 Aug 2024 01:39:45 GMT

_Version update only_

## 0.19.20
Wed, 31 Jul 2024 09:48:37 GMT

### Updates

- feat: support array cornerRadius, closed #1322
- feat: support catmull-rom and catmull-rom-closed curve, closed #1320

## 0.19.19
Tue, 23 Jul 2024 11:56:39 GMT

### Updates

- feat: marker label support custom shape. close @Visactor/VChart#2959
- fix: fixed the problem that the bounds calculation of line mark is wrong when the defiend of some points is false



## 0.19.18
Fri, 12 Jul 2024 07:18:10 GMT

### Updates

- fix: support react 17 in react attributes



## 0.19.17
Fri, 05 Jul 2024 17:26:17 GMT

_Version update only_

## 0.19.16
Fri, 05 Jul 2024 14:29:15 GMT

### Updates

- fix: fix syncState of label when re-render stage


- fix: fix issue with setAttribute while play with startAt

## 0.19.15
Fri, 28 Jun 2024 10:32:37 GMT

### Updates

- fix: fix issue with area clip direction
- feat: support `clip` effect for new points in tagPointsUpdate animation
- fix: get default end props

## 0.19.14
Wed, 26 Jun 2024 09:16:23 GMT

### Updates

- feat: support richtext editor
- feat: upgrade @visactor/vutils
- fix: fix issue with rect bounds while the wh is not setted

## 0.19.13
Tue, 25 Jun 2024 11:17:14 GMT

### Updates

- fix: fix issue with stage while it is released

## 0.19.12
Fri, 21 Jun 2024 06:52:50 GMT

_Version update only_

## 0.19.11
Fri, 14 Jun 2024 09:50:59 GMT

_Version update only_

## 0.19.10
Thu, 13 Jun 2024 09:52:46 GMT

### Updates

- feat(streamLight): streamLight support direction and  parent support x1y1 attribute. close@Visactor/VChart#2734
- fix: fix issue with interploate while color is array
- fix: only clear animation when has no state animation

## 0.19.9
Wed, 05 Jun 2024 12:25:00 GMT

_Version update only_

## 0.19.8
Wed, 05 Jun 2024 08:24:28 GMT

_Version update only_

## 0.19.7
Tue, 04 Jun 2024 11:10:08 GMT

### Updates

- fix: fix `useStates` of glyph


- feat: image support stroke and border, closed #1242
- fix: fix env check in micro frontend env

## 0.19.6
Wed, 29 May 2024 06:57:11 GMT

### Updates

- fix: fix issue with color array interpolate
- fix: fix issue with detailPath that list will not be cleard
- fix: fix issue with _nodeList while removeAllChild
- fix: fix issue with unTap
- fix: fix animation of state change



## 0.19.5
Fri, 24 May 2024 09:21:23 GMT

_Version update only_

## 0.19.4
Fri, 17 May 2024 06:46:41 GMT

### Updates

- feat: support harmony env

## 0.19.3
Fri, 10 May 2024 09:24:39 GMT

### Updates

- feat: support baseOpacity for group

## 0.19.2
Thu, 09 May 2024 12:26:00 GMT

### Updates

- feat: event support detailPath
- feat: support pauseTriggerEvent to pause stage event trigger

## 0.19.1
Wed, 08 May 2024 08:47:35 GMT

### Updates

- feat: rename forceBreakLine to disableAutoWrapLine
- fix: fix issue with disableAutoWrapLine ellipsis
- fix: fix issue with interactive graphic while base graphic is removed

## 0.19.0
Tue, 30 Apr 2024 08:40:53 GMT

### Updates

- fix: fix point of event when stage has transform


- feat: draw-contribution support check appName, closed #1122
- feat: set renderService to multi-instance
- feat: support `opacity`/`fillOpacity`/`strokeOpacity` in richtext
- feat: support style callback in html and react, fix 1102



## 0.18.17
Tue, 30 Apr 2024 07:48:41 GMT

### Updates

- fix: fix issue with setLineDash crash, closed #1047
- fix: fix error of label when all the labels are cleared


- fix: fix flex-end layout order
- fix: fix issue with rect stroke array while defined by x1y1, closed #1169

## 0.18.16
Mon, 29 Apr 2024 07:40:31 GMT

### Updates

- fix: theme should not support 3d graphics



## 0.18.15
Fri, 26 Apr 2024 10:37:19 GMT

### Updates

- feat: support forceBoundsWH, closed #1128
- feat: support renderable attribute, closed #1128

## 0.18.14
Wed, 24 Apr 2024 08:07:48 GMT

### Updates

- feat: richtext support forceBreakLine, closed #1055
- fix: fix flex layout crossLen problem
- fix: pointerenter should not bubble when inside the same group, and revert previous wrong fix, fixed #1132
- fix: fix issue with feishu program, closed #2567

## 0.18.13
Fri, 19 Apr 2024 08:46:08 GMT

_Version update only_

## 0.18.12
Fri, 19 Apr 2024 07:48:17 GMT

### Updates

- fix: when clear states, the animations of state should clear


- fix: fix issue with render html
- fix: fix issue with richtext background
- fix: fix the issue of update selected value of slider


- docs: update changlog of rush


- fix: add ellipsis in height limit

## 0.18.11
Wed, 17 Apr 2024 03:02:22 GMT

### Updates

- feat: 支持background-opacity配置
- fix: fix issue with wh changed by flex layout, closed #1088
- fix: pointerenter and pointerleave do not bubble, fixed #1132
- fix: fix for dragenter triggering error in drag event
- fix: fix memory issue with stage timeline and DefaultRenderService

## 0.18.10
Fri, 29 Mar 2024 08:02:16 GMT

_Version update only_

## 0.18.9
Thu, 28 Mar 2024 10:13:24 GMT

### Updates

- fix: fix issue with empty global bounds

## 0.18.8
Wed, 27 Mar 2024 11:33:58 GMT

### Updates

- fix: fix issue with pointer tap event point map
- fix: fix issue for multi line text with underline, closed #1100

## 0.18.7
Fri, 22 Mar 2024 08:46:19 GMT

### Updates

- fix: fix issue with offscreen style
- fix: fix issue with area animate

## 0.18.6
Tue, 19 Mar 2024 10:10:17 GMT

### Updates

- feat: richtext support combine linewidth style
- fix: html-plugin support release
- feat: support native render for react, closed #400

## 0.18.5
Tue, 12 Mar 2024 15:16:46 GMT

_Version update only_

## 0.18.4
Tue, 12 Mar 2024 09:40:06 GMT

_Version update only_

## 0.18.3
Mon, 11 Mar 2024 08:24:00 GMT

_Version update only_

## 0.18.2
Fri, 08 Mar 2024 03:19:08 GMT

_Version update only_

## 0.18.1
Mon, 04 Mar 2024 08:29:15 GMT

_Version update only_

## 0.18.0
Wed, 28 Feb 2024 10:09:04 GMT

### Updates

- feat: support flatten_simplify
- feat: support innerpadding and outerpadding
- feat: richtext support inherit attribute, closed #946
- fix: multiline text underline bugfix, closed #1029

## 0.17.26
Wed, 28 Feb 2024 08:06:31 GMT

### Updates

- feat: animate with stage timeline
- feat: support underline Dash and undeline offset, closed #1025
- fix: fix issue with load svg sync, fix issue with decode react dom

## 0.17.25
Fri, 23 Feb 2024 04:29:58 GMT

### Updates

- feat: support flatten_simplify
- feat: jsx attribute support name and id
- fix: fix issue with check gradient str color, closed #984
- fix: globalZIndex attribute should not do animation
- fix: fix issue with string star path
- fix: fix issue with text background while angle attr configed, closed #1002

## 0.17.24
Tue, 06 Feb 2024 09:48:26 GMT

_Version update only_

## 0.17.23
Sun, 04 Feb 2024 12:41:45 GMT

### Updates

- feat: support renderStyle config
- fix: fix issue with single point in area graphic

## 0.17.22
Fri, 02 Feb 2024 07:17:07 GMT

### Updates

- fix: revert richtext inherit

## 0.17.21
Thu, 01 Feb 2024 12:22:29 GMT

### Updates

- feat: richtext support inherit attribute, closed #946
- fix: fix issue with remove html and change html pos, closed #944

## 0.17.20
Thu, 01 Feb 2024 09:26:17 GMT

### Updates

- feat: enhance flex effect, support pauseFlex api, closed #874, closed #912
- feat: support keepMatrix api
- fix: compatible with illegal richText value

## 0.17.19
Wed, 24 Jan 2024 13:11:27 GMT

### Updates

- fix: fix issue with 3d draw dirtybounds

## 0.17.18
Wed, 24 Jan 2024 10:10:41 GMT

### Updates

- feat: support backgroundCornerRadius
- fix: fix issue with multiline text textBaseline, closed #886
- fix: fix issue with union empty bounds
- fix: richtext.textConfig supports number type text

## 0.17.17
Mon, 22 Jan 2024 08:19:38 GMT

### Updates

- feat: html only append dom inside body
- feat: color support str gradient color
- fix: fix issue with rerun getTextBounds
- fix: fix issue with set image
- fix: fix issue with loaded tree-shaking

## 0.17.16
Wed, 17 Jan 2024 09:02:13 GMT

### Updates

- feat: enable pass supportsPointerEvents and supportsTouchEvents

## 0.17.15
Wed, 17 Jan 2024 06:43:01 GMT

### Updates

- fix: fix issue with html attribute
- feat: add supportsTouchEvents and supportsPointerEvents params
- fix: fix issue with env-check
- fix: fix issue with text background opacity

## 0.17.14
Fri, 12 Jan 2024 10:33:32 GMT

### Updates

- fix: fix `splitRect` when rect has `x1` or `y1`



## 0.17.13
Wed, 10 Jan 2024 14:18:21 GMT

### Updates

- fix: fix issue with incremental draw
- feat: background support opacity
- fix: supply the `getTheme()` api for `IStage`

## 0.17.12
Wed, 10 Jan 2024 03:56:46 GMT

_Version update only_

## 0.17.11
Fri, 05 Jan 2024 11:54:56 GMT

### Updates

- feat: add backgroundFit attribute
- fix: fix issue with position in html attribute

## 0.17.10
Wed, 03 Jan 2024 13:19:34 GMT

### Updates

- feat: support fillPickable and strokePickable for area, closed #792
- feat: support `lastVisible` of LineAxis label


- fix: fix issue with area-line highperformance draw
- fix: fix the auto limit width of label when the label has vertical `direction` in orient top or bottom


- fix: disable layer picker in interactive layer

## 0.17.9
Fri, 29 Dec 2023 09:59:13 GMT

### Updates

- fix: fix issue with conical cache not work as expect

## 0.17.8
Fri, 29 Dec 2023 07:20:26 GMT

### Updates

- fix: fix issue with rect.toCustomPath
- feat: support drawGraphicToCanvas
- fix: fix issue with area segment with single point, closed #801
- fix: fix issue with new Function in miniapp
- fix: fix morphing of rect


- fix: fix issue with side-effect in some env
- fix: fix issue with check tt env
- fix: fix issue with cliped attribute in vertical text, closed #827

## 0.17.7
Wed, 20 Dec 2023 10:05:55 GMT

### Updates

- fix: fix issue with create layer in miniapp env

## 0.17.6
Wed, 20 Dec 2023 07:39:54 GMT

_Version update only_

## 0.17.5
Tue, 19 Dec 2023 09:13:27 GMT

### Updates

- fix: fix issue with plugin unregister
- fix: fix issue with text while whitespace is normal

## 0.17.4
Thu, 14 Dec 2023 11:00:38 GMT

### Updates

- fix: fix issue with arc imprecise bounds, closed #728

## 0.17.3
Wed, 13 Dec 2023 12:04:17 GMT

_Version update only_

## 0.17.2
Tue, 12 Dec 2023 13:05:58 GMT

### Updates

- feat(dataZoom): add mask to modify hot zone. feat @visactor/vchart#1415'
- feat: rect3d support x1y1, fix -radius issue with rect
- fix: fix shadow pick issue

## 0.17.1
Wed, 06 Dec 2023 11:19:22 GMT

### Updates

- feat: support pickStrokeBuffer, closed #758
- fix: fix issue in area chart with special points
- fix: fix issue with rebind pick-contribution
- fix: fix error with wrap text and normal whiteSpace text

## 0.17.0
Thu, 30 Nov 2023 12:58:15 GMT

### Minor changes

- feat: optmize bounds performance

### Updates

- feat: support disableCheckGraphicWidthOutRange to skip check if graphic out of range
- feat: rect support x1 and y1
- feat: don't rewrite global reflect
- feat: text support background, closed #711
- perf: area support drawLinearAreaHighPerformance, closed #672
- refactor: refact inversify completely, closed #657

## 0.16.18
Thu, 30 Nov 2023 09:40:58 GMT

### Updates

- feat: support suffixPosition, closed #625
- fix: fix issue with attribute interpolate, closed #741
- refactor: event-related coordinate points do not require complex Point classes
- fix: fix issue about calcuate bounds with shadow, closed #474
- fix: fix issue with white line in some dpr device, closed #666

## 0.16.17
Thu, 23 Nov 2023 13:32:49 GMT

### Updates

- feat: add `event` config for Stage params, which can configure `clickInterval` and some other options in eventSystem
- feat: support fill and stroke while svg don't support, closed #710
- fix: richtext may throw error when textConfig is null


- fix: fix issue with image repeat, closed #712
- perf: not setAttribute while background is not url, closed #696
- fix: fix issue with restore and save count not equal

## 0.16.16
Fri, 17 Nov 2023 02:33:59 GMT

### Updates

- fix: assign symbol rect function to old

## 0.16.15
Thu, 16 Nov 2023 02:46:27 GMT

_Version update only_

## 0.16.14
Wed, 15 Nov 2023 09:56:28 GMT

### Updates

- feat: add round line symbol, closed #1458
- feat: lineHeight support string, which means percent
- fix: fix issue with render while in scale transform

## 0.16.13
Thu, 09 Nov 2023 11:49:33 GMT

### Updates

- feat: add preventRender function
- feat: merge wrap text function to text

## 0.16.12
Tue, 07 Nov 2023 10:52:54 GMT

### Updates

- feat: optimize text increase animation
- fix: fix node-canvas max count issue

## 0.16.11
Thu, 02 Nov 2023 13:43:18 GMT

### Updates

- fix: fix issue with xul and html attribute, closed #634

## 0.16.9
Fri, 27 Oct 2023 02:21:19 GMT

### Updates

- feat: stage background support image

## 0.16.8
Mon, 23 Oct 2023 11:38:47 GMT

_Version update only_

## 0.16.7
Mon, 23 Oct 2023 08:53:33 GMT

### Updates

- fix: fix issue with creating multi chart in miniapp

## 0.16.6
Mon, 23 Oct 2023 06:30:33 GMT

_Version update only_

## 0.16.5
Fri, 20 Oct 2023 04:22:42 GMT

### Updates

- fix: `onStart` is missing in `AnimateGroup`

## 0.16.4
Thu, 19 Oct 2023 10:30:12 GMT

### Updates

- feat: add getCurrentEnv function
- fix: fix lark canvasId issue

## 0.16.3
Wed, 18 Oct 2023 07:43:09 GMT

### Updates

- fix: fix event issue of graphic.stage is null, closed #578
- feat: set some params: `supportEvent` `supportsTouchEvents` `supportsPointerEvents` `supportsMouseEvents` `applyStyles` be writeable
- fix: fix monotine defined, closed #547
- fix: fix sideEffect of @visactor/vrender-core
- feat(vrender-components): add LineDataLabel support DataLabel of line



## 0.16.2
Tue, 10 Oct 2023 11:48:48 GMT

### Updates

- feat: provide disableActiveEffect api to support users to close the interactive effect of components


- fix: fix pattern blur issue, closed #567

## 0.16.1
Mon, 09 Oct 2023 09:51:01 GMT

### Updates

- fix: fix the `currentStates` when use `clearStates()`
- fix: fix the problem of stopPropagation not work
- fix: fix flex issue, closed, fix node dpr issue, closed #554, closed #555

## 0.16.0
Thu, 28 Sep 2023 07:23:52 GMT

### Updates

- feat: add globalCompositeOperation, closed #540
- feat: support interactive config, closed #446
- feat: support scrollbar, closed #529

