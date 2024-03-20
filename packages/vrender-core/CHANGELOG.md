# Change Log - @visactor/vrender-core

This log was last generated on Wed, 20 Mar 2024 02:51:42 GMT and should not be manually modified.

## 0.17.29
Wed, 20 Mar 2024 02:51:42 GMT

_Version update only_

## 0.17.28
Tue, 12 Mar 2024 12:32:07 GMT

_Version update only_

## 0.17.27
Thu, 07 Mar 2024 08:20:12 GMT

_Version update only_

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

