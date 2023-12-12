# Change Log - @visactor/vrender-core

This log was last generated on Tue, 12 Dec 2023 13:05:58 GMT and should not be manually modified.

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

