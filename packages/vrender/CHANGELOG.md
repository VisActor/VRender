# Change Log - @visactor/vrender

This log was last generated on Wed, 09 Aug 2023 07:34:23 GMT and should not be manually modified.

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

## 0.9.1
Thu, 08 Jun 2023 11:34:32 GMT

### Patches

- release

## 0.9.0
Wed, 07 Jun 2023 12:20:05 GMT

### Minor changes

- the official version

