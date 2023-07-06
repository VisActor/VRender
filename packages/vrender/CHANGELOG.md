# Change Log - @visactor/vrender

This log was last generated on Thu, 06 Jul 2023 09:09:12 GMT and should not be manually modified.

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

