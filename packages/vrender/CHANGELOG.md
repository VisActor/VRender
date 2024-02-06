# Change Log - @visactor/vrender

This log was last generated on Sun, 04 Feb 2024 12:41:45 GMT and should not be manually modified.

## 0.17.23
Sun, 04 Feb 2024 12:41:45 GMT

### Updates

- feat: support renderStyle config

## 0.17.22
Fri, 02 Feb 2024 07:17:07 GMT

_Version update only_

## 0.17.21
Thu, 01 Feb 2024 12:22:29 GMT

_Version update only_

## 0.17.20
Thu, 01 Feb 2024 09:26:17 GMT

### Updates

- feat: refactor GetImage in ResourceLoader

## 0.17.19
Wed, 24 Jan 2024 13:11:27 GMT

_Version update only_

## 0.17.18
Wed, 24 Jan 2024 10:10:41 GMT

_Version update only_

## 0.17.17
Mon, 22 Jan 2024 08:19:38 GMT

### Updates

- feat: color support str gradient color

## 0.17.16
Wed, 17 Jan 2024 09:02:13 GMT

_Version update only_

## 0.17.15
Wed, 17 Jan 2024 06:43:01 GMT

_Version update only_

## 0.17.14
Fri, 12 Jan 2024 10:33:32 GMT

### Updates

- fix: fix `splitRect` when rect has `x1` or `y1`



## 0.17.13
Wed, 10 Jan 2024 14:18:21 GMT

_Version update only_

## 0.17.12
Wed, 10 Jan 2024 03:56:46 GMT

_Version update only_

## 0.17.11
Fri, 05 Jan 2024 11:54:56 GMT

_Version update only_

## 0.17.10
Wed, 03 Jan 2024 13:19:34 GMT

### Updates

- feat: support `lastVisible` of LineAxis label


- fix: fix the auto limit width of label when the label has vertical `direction` in orient top or bottom



## 0.17.9
Fri, 29 Dec 2023 09:59:13 GMT

_Version update only_

## 0.17.8
Fri, 29 Dec 2023 07:20:26 GMT

### Updates

- feat: support drawGraphicToCanvas
- fix: fix issue with area segment with single point, closed #801
- fix: fix morphing of rect


- fix: fix issue with side-effect in some env

## 0.17.7
Wed, 20 Dec 2023 10:05:55 GMT

_Version update only_

## 0.17.6
Wed, 20 Dec 2023 07:39:54 GMT

_Version update only_

## 0.17.5
Tue, 19 Dec 2023 09:13:27 GMT

### Updates

- feat: add disableAutoClipedPoptip attribute in text graphic
- fix: fix cursor update error in multi-stage

## 0.17.4
Thu, 14 Dec 2023 11:00:38 GMT

_Version update only_

## 0.17.3
Wed, 13 Dec 2023 12:04:17 GMT

_Version update only_

## 0.17.2
Tue, 12 Dec 2023 13:05:58 GMT

### Updates

- feat(dataZoom): add mask to modify hot zone. feat @visactor/vchart#1415'

## 0.17.1
Wed, 06 Dec 2023 11:19:22 GMT

_Version update only_

## 0.17.0
Thu, 30 Nov 2023 12:58:15 GMT

### Minor changes

- feat: optmize bounds performance

### Updates

- feat: don't rewrite global reflect
- feat: skip update bounds while render small node-tree, closed #660
- refactor: refact inversify completely, closed #657

## 0.16.18
Thu, 30 Nov 2023 09:40:58 GMT

### Updates

- feat: support suffixPosition, closed #625

## 0.16.17
Thu, 23 Nov 2023 13:32:49 GMT

_Version update only_

## 0.16.16
Fri, 17 Nov 2023 02:33:59 GMT

_Version update only_

## 0.16.15
Thu, 16 Nov 2023 02:46:27 GMT

_Version update only_

## 0.16.14
Wed, 15 Nov 2023 09:56:28 GMT

_Version update only_

## 0.16.13
Thu, 09 Nov 2023 11:49:33 GMT

_Version update only_

## 0.16.12
Tue, 07 Nov 2023 10:52:54 GMT

_Version update only_

## 0.16.11
Thu, 02 Nov 2023 13:43:18 GMT

_Version update only_

## 0.16.9
Fri, 27 Oct 2023 02:21:19 GMT

_Version update only_

## 0.16.8
Mon, 23 Oct 2023 11:38:47 GMT

_Version update only_

## 0.16.7
Mon, 23 Oct 2023 08:53:33 GMT

_Version update only_

## 0.16.6
Mon, 23 Oct 2023 06:30:33 GMT

_Version update only_

## 0.16.5
Fri, 20 Oct 2023 04:22:42 GMT

_Version update only_

## 0.16.4
Thu, 19 Oct 2023 10:30:12 GMT

_Version update only_

## 0.16.3
Wed, 18 Oct 2023 07:43:09 GMT

### Updates

- fix: fix monotine defined, closed #547

## 0.16.2
Tue, 10 Oct 2023 11:48:48 GMT

_Version update only_

## 0.16.1
Mon, 09 Oct 2023 09:51:01 GMT

### Updates

- fix: fix reinit env issue

## 0.16.0
Thu, 28 Sep 2023 07:23:52 GMT

### Updates

- refactor: minify color code, closed #438, closed #396
- refactor: minify graphic code, closed #443
- refactor: rewrite reflect-metadata to minify code, closed #442
- refactor: rewrite inversify-lite, closed #476
- feat: text support verticalMode, closed #503

## 0.15.5
Wed, 27 Sep 2023 09:33:50 GMT

_Version update only_

## 0.15.4
Mon, 25 Sep 2023 03:05:18 GMT

### Updates

- fix: fix shadow bounds error while have outerborder
- fix: fix string anchor issue

## 0.15.3
Wed, 20 Sep 2023 13:12:13 GMT

### Updates

- feat: appendChild add highPerformance params
- feat: add _debug_bounds attribute to draw bounds, closed #500
- feat: text support verticalMode, closed #503
- fix: custom animate solve validattr issue
- fix: fix arc stroke issue
- feat: emit change events of data-zoom


- feat: brush support attributes: trigger, udpateTrigger, endTrigger, resetTrigger, hasMask


- fix: fix release graphic don't remove html issue, closed #502

## 0.15.2
Thu, 14 Sep 2023 09:55:56 GMT

### Updates

- feat: export no work animate attr, closed #483
- feat: polygon support closePath, closed #482
- fix: fix arc stroke error, closed #481
- fix: fix the line closed issue, closed #487
- fix: fix the typo issue in wx env

## 0.15.1
Wed, 13 Sep 2023 02:21:59 GMT

_Version update only_

## 0.15.0
Tue, 12 Sep 2023 12:20:48 GMT

### Minor changes

- feat: toCanvas api support viewBox params, closed #272
- feat: support html attribute plugin, closed #153
- feat: support ignoreBuf config, closed #374
- feat: support jsx describe, closed #320
- feat: symbol support more type and support svg format, closed #110 #313
- fix: wrapText support wordBreak

### Patches

- feat: poptip support formatMethod
- fix: poptip fix width error and add maxWidthPercent
- feat: text limit ignore wordBreak, closed #389
- feat: enhance timeline funciton, closed #348
- fix: increase IntersectionObserver robustness in browser env
- fix: pass fontFamily in measureText
- perf: improve animate by skip render without window

## 0.14.8
Thu, 07 Sep 2023 11:56:00 GMT

### Patches

- feat: line support closePath attribute as another definition of linearClosed, closed #423
- feat: poptip support formatMethod
- feat: add scaleCenter attribute
- fix: increase the robustness of segments, closed #424

## 0.14.7
Thu, 31 Aug 2023 10:03:38 GMT

### Patches

- fix: poptip fix width error and add maxWidthPercent

## 0.14.6
Tue, 29 Aug 2023 11:30:33 GMT

### Patches

- fix: increase robustness for wx compatibility
- fix: fix the issue of area stroke, closed #392
- feat(brush): add event release function
- fix: stage support setDpr, closed #382
- fix: fix the circluar dependecies issue caused by importing global from index.js

## 0.14.5
Wed, 23 Aug 2023 11:53:28 GMT

### Patches

- fix: fix _prePointTargetCache error in EventManager
- fix: fix the issue of * event invalidation when * and named event exist simultaneously
- fix: fix the outerBorder issue with false stroke, closed #342
- fix: fix the issue with outerborder gradient color, closed #343

## 0.14.4
Fri, 18 Aug 2023 10:16:08 GMT

### Patches

- fix: fix the issue with arc conical color after configuring cap, closed #455
- fix: fix wrapText line cut error

## 0.14.3
Wed, 16 Aug 2023 06:46:13 GMT

### Patches

- fix: fix wrapText line cut error

## 0.14.2
Fri, 11 Aug 2023 10:05:27 GMT

### Patches

- chore: set target to es2016

## 0.14.1
Thu, 10 Aug 2023 12:14:14 GMT

### Patches

- fix: fix the error of text bounds in safari env, closed #294

## 0.14.0
Thu, 10 Aug 2023 07:22:55 GMT

### Minor changes

- feat: add connect type to line and area
- feat: support flex layout
- feat: support animate-bind event
- feat: support text word-break
- feat: support for vertical layout of text graphic
- refactor: rename global and window to vglobal and vwindow

### Patches

- fix: fix the issue of area stroke with texture
- fix: fix the issue of using interactive layer in only on canvas env

## 0.13.9
Wed, 09 Aug 2023 07:34:23 GMT

### Patches

- fix: fix the issue of text bounding box height

## 0.13.8
Tue, 08 Aug 2023 09:27:52 GMT

### Patches

- perf: enhance the effect of requestAnimationFrame in miniapp

## 0.13.7
Thu, 03 Aug 2023 10:04:34 GMT

### Patches

- fix(marker): segement support autoRotate setting

## 0.13.6
Wed, 02 Aug 2023 03:13:00 GMT

### Patches

- fix: fix the issue of arc bounds while outerRadius is smaller than innerRadius
- fix: fix the issue when the segment points is empty
-  fix(wrapText): fix wrapText clip caculate error

## 0.13.5
Thu, 27 Jul 2023 12:27:43 GMT

### Patches

- fix: fix the issue of area stroke with texture
- fix: fix the issue of using interactive layer in only on canvas env

## 0.13.4
Tue, 25 Jul 2023 13:33:47 GMT

### Patches

- ci: align bugserver config to vchart

## 0.13.3
Tue, 25 Jul 2023 07:34:59 GMT

### Patches

- feat: export wrap canvas and context
- fix: fix the issue related to load image in lynx env

## 0.13.2
Fri, 21 Jul 2023 10:50:41 GMT

### Patches

- fix: fix the poptip not work due to mount and unmount issue

## 0.13.1
Thu, 20 Jul 2023 10:41:23 GMT

### Patches

- fix: fix the error of drawing arc background
- fix: fix the error caused by reflect-metadata in react env
- fix: fix the bounds issue caused by fontWeight

## 0.13.0
Wed, 19 Jul 2023 08:29:52 GMT

### Minor changes

- feat: area support stroke
- feat: support interactive layer
- feat: support createCanvasNG in lynx env
- feat: support wx env
- feat: support interactive contribution

### Patches

- fix: add compatibility on createPattern
- feat: new api to measure rich text bounds
- feat: add `stopAnimates()` to IGraphic



### Updates

- perf(marker): performance enhance

## 0.12.3
Wed, 12 Jul 2023 12:30:46 GMT

### Patches

- new api to measure rich text bounds
- fix: fix the issue of arc background do not work
- fix: fix the issue of warning while call insertIntoKeepIdx

## 0.12.2
Tue, 11 Jul 2023 13:17:12 GMT

### Patches

- fix: fix the issue of false warn
- fix: fix the error of setLineDash in lynx

## 0.12.1
Fri, 07 Jul 2023 09:04:45 GMT

### Patches

- feat: text support scaleIn3d in 3d mode
- fix the bug of view3dtransform caused by undefined beta

## 0.12.0
Thu, 06 Jul 2023 09:09:12 GMT

### Minor changes

- support sine and expo ease

### Patches

- fix the bug where repeat attribute doesn't work in image
- fix the bug in arc bounds
- fix the bug of stroke bounds
- fix the bug in FadeInPlus
- fix the bug of rendering pyramid3d graphic
-  fix the bug of releasing in node env
- fix the bug of pick path
- fix: tooltip should not throw error when title not exist


- refactor: refactor interfaces and types of typescript

## 0.11.1
Tue, 27 Jun 2023 13:38:36 GMT

### Patches

- optimize the performance of drawing conical-gradient

## 0.11.0
Tue, 27 Jun 2023 03:18:18 GMT

### Minor changes

- update vUtils version
- move enableView3dTransform into options3d
- rename all of the borderRadius to cornerRadius

### Patches

- fix the bug of arc in 3d mode
- fix the bug of gradient-color caused by bounds and offsetXY
- fix the bug of gradient color while the x1 in color is zero caused by ||
- fix the bug of dpr in node env
- fix the error of options3d default value
- fix the bug of rect cornerRadius on left top

## 0.10.3
Tue, 20 Jun 2023 06:23:42 GMT

### Patches

- fix the error while call createColor caused by zero scale

## 0.10.2
Tue, 20 Jun 2023 03:25:23 GMT

### Patches

- fix the bug of gradient color while scale

## 0.10.1
Mon, 19 Jun 2023 09:49:38 GMT

### Patches

- fix the bug of mapToCanvasPoint
- clear nextFrameRenderLayerSet after render

## 0.10.0
Fri, 16 Jun 2023 03:13:09 GMT

### Minor changes

- code style
- export version

### Patches

- several bugfix
- fix the bug that forgot to export container
- solve reflect import problem by export reflect
- fix the bug of fill-stroke refactor
- modify smart invert to adapt stroke&fill of Canopus
- support color interpolate between pure color with gradient color
- fix enableView3dTranform
- fix the bug of interpolate color
- fix the defined bug in basis and monotone curve
- fix the bug of pyramid in some case
- fix the bug that will be overwritten after stage.setCursor
- fix the bug of strokeText in 3d mode
- fix the bug in css transform

### Updates

- release

## 0.9.1
Thu, 08 Jun 2023 11:34:32 GMT

### Patches

- release

## 0.9.0
Wed, 07 Jun 2023 12:20:05 GMT

### Minor changes

- the official version

