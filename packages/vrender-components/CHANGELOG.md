# Change Log - @visactor/vrender-components

This log was last generated on Mon, 23 Oct 2023 11:38:47 GMT and should not be manually modified.

## 0.16.8
Mon, 23 Oct 2023 11:38:47 GMT

### Updates

- fix: fix the issue of error position of focus when legend item just has label

## 0.16.7
Mon, 23 Oct 2023 08:53:33 GMT

### Updates

- fix(label): fix the issue that `clampForce` does not work when`overlapPadding` is configured

## 0.16.6
Mon, 23 Oct 2023 06:30:33 GMT

### Updates

- feat: optimize the layout method of circle axis label
- fix: fix the layout issue of legend item because of the error logic of `focusStartX`

## 0.16.5
Fri, 20 Oct 2023 04:22:42 GMT

### Updates

- fix: fix the data-label of line/area, when the group has multiple lines/areas


- fix: if in non browser, use this.stage

## 0.16.4
Thu, 19 Oct 2023 10:30:12 GMT

### Updates

- feat(datazoom): support zoomlock & span & throttle setting and rename callback
- feat: datazoom and scrollbar support realtime

## 0.16.3
Wed, 18 Oct 2023 07:43:09 GMT

### Updates

- fix: fix the issue with poptip does not disappear when scrolling, closed #580
- fix: brush and data-zoom should stop event propagation
- fix: fix title component layout height
- feat(vrender-components): add LineDataLabel support DataLabel of line



## 0.16.2
Tue, 10 Oct 2023 11:48:48 GMT

### Updates

- feat: add checkbox component
- feat: provide disableActiveEffect api to support users to close the interactive effect of components


- fix: fix event not remove as expected due to capture, closed #570
- refactor: use polygon to replace line to support cornerRadius
- feat: add `getArea()` `getLine()` and `getLabel()` method for markLine markArea component

## 0.16.1
Mon, 09 Oct 2023 09:51:01 GMT

### Updates

-     feat: support `syncState` in label component
- fix: fix the issue of dataFilter result in incorrect arc label layout
- fix: fix the problem of drag events not being consumed in the component

## 0.16.0
Thu, 28 Sep 2023 07:23:52 GMT

### Updates

- feat: support scrollbar, closed #529

## 0.15.5
Wed, 27 Sep 2023 09:33:50 GMT

_Version update only_

## 0.15.4
Mon, 25 Sep 2023 03:05:18 GMT

### Updates

- feat: add outsideEnable config of smartInvert

## 0.15.3
Wed, 20 Sep 2023 13:12:13 GMT

### Updates

- fix: label not show when dataFilter
- feat: emit change events of data-zoom


- feat: brush support attributes: trigger, udpateTrigger, endTrigger, resetTrigger, hasMask


- fix(label): fix the issue of invalid position in overlap strategy might throw error

## 0.15.2
Thu, 14 Sep 2023 09:55:56 GMT

_Version update only_

## 0.15.1
Wed, 13 Sep 2023 02:21:58 GMT

### Updates

- feat: support `label.autoRange` for markLine and markPoint components
- feat: segment and markLine component supports multiple segment draw
- feat: add `clipInRange` property to control whether do the clip for mark component, and rename clipRange to limitRect
- fix: roseChart inner labels are unclear, #884
- fix: the layout of the inner label when the pie chart has a center offset

## 0.15.0
Tue, 12 Sep 2023 12:20:48 GMT

### Minor changes

- refactor: seperate grid from axis, relate #327

### Patches

- feat: pie label line support smooth line
- fix: legend custom event should contain the nativeEvent object
- fix: overwrite function attribute for components

### Updates

- fix: fix empty items error in axis component when label flush is true
- fix: pie chart labels are not drawn as expected when animation is turned on, #750

## 0.14.8
Thu, 07 Sep 2023 11:56:00 GMT

### Patches

- fix: fix the bug of rose chart label conflict with legend, fixed the issue #453

## 0.14.7
Thu, 31 Aug 2023 10:03:38 GMT

### Patches

- fix: rose chart label layout 
- fix player visible error and rename event name
- fix: fix the issue with poptip, closed #322
- feat: poptip support wrap

## 0.14.6
Tue, 29 Aug 2023 11:30:33 GMT

### Patches

- feat: support simple polygon and point label
- feat(component): support label overlapPadding for sparse display
- fix: axis label's flush should handle before overlap
- feat(brush): add event release function

## 0.14.5
Wed, 23 Aug 2023 11:53:28 GMT

### Patches

- feat: config 'pickable: flase' as default
- fix: fix the issue with poptip, closed #322
- fix: slider should handle the scenarios where max and min values are the same

## 0.14.4
Fri, 18 Aug 2023 10:16:08 GMT

### Patches

- feat: change labelLine of arc label from path mark to line mark to adapt to animation'
- feat: smartInvert support fillStrategy strokeStrategy
- fix: user's align config should be first
- fix: label shoud omit automaticly when label's width exceeds item's width, relate https://github.com/VisActor/VChart/issues/505

## 0.14.3
Wed, 16 Aug 2023 06:46:13 GMT

_Version update only_

## 0.14.2
Fri, 11 Aug 2023 10:05:27 GMT

_Version update only_

## 0.14.1
Thu, 10 Aug 2023 12:14:14 GMT

_Version update only_

## 0.14.0
Thu, 10 Aug 2023 07:22:55 GMT

### Minor changes

- feat: add `verticalMinSize` and `containerAlign` for line type axis, `verticalMinSize` is used to set the minumum vertical size of axis, and `containerAlign` is to set the all labels's alignment in axis container, support https://github.com/VisActor/VChart/issues/380
- refactor: rename global and window to vglobal and vwindow

### Patches

- feat: arc label sink
- feat: modify arcLabel position
- fix: the axis label's textAlign and textBaseline should auto adjust when angle is set, releate https://github.com/VisActor/VChart/issues/439
- fix: panel only works for line axis
- fix: line axis states should set default value
- feat(component): label component support avoidMarks
- feat(component): label component support custom layout and dataFilter
- fix: fix the issue of using interactive layer in only on canvas env

### Updates

- feat(brush): add sizeThreshold setting

## 0.13.10
Wed, 09 Aug 2023 07:34:23 GMT

### Patches

- fix(brush): fix brushEnd interactive judge and reconfig operateType
- fix(brush): reconfig operateType and add operateType about click space
- fix: it should consider the `maxLineWidth` and \ set in `label.style` when do auto limit, relate https://github.com/VisActor/VChart/issues/456
- math.floor axis label size to determine whether it exceeds, fixed https://github.com/VisActor/VChart/issues/477

## 0.13.9
Tue, 08 Aug 2023 09:27:52 GMT

### Patches

- fix(components): overlap bitmap test will intercept invalid range, fix #265

## 0.13.8
Thu, 03 Aug 2023 10:04:34 GMT

### Patches

- feat(component): label component support custom layout and dataFilter
- chore: trigger publish alpha version
- fix(marker): formatMethod logic should not in vrender
- fix(marker): formatMethod logic should not in vrender
- fix(marker): segement support autoRotate setting
- fix(marker): formatMethod logic should not in vrender

## 0.13.7
Wed, 02 Aug 2023 03:13:00 GMT

### Patches

- feat(chore): trigger publish
- fix(legend): when discrete legend's item's width does not exceed maxWidth, it should use its own width, fix:https://github.com/VisActor/VChart/issues/300

### Updates

- feat(marker): add formatMethod of label
- fix(dataZoom): updateStateCallback don not effect when setStartAndEnd

## 0.13.6
Fri, 28 Jul 2023 07:17:04 GMT

### Patches

- Merge pull request #225 from VisActor/sync-0.13.5

Sync 0.13.5


## 0.13.5
Thu, 27 Jul 2023 12:27:43 GMT

### Patches

- feat(component): label component support custom layout and dataFilter
- fix: fix the issue of using interactive layer in only on canvas env

## 0.13.4
Tue, 25 Jul 2023 13:33:47 GMT

_Version update only_

## 0.13.3
Tue, 25 Jul 2023 07:34:59 GMT

### Patches

- feat(vrender-components): discreate legend's item's state style supports function
- feat(vrender-components): axis label, tick and subTick's state style supports function
- fix: fix the issue of maxLineWidth's value is negative

## 0.13.2
Fri, 21 Jul 2023 10:50:41 GMT

### Patches

- fix(vrender-components): fix the calculation of axis title offset
- fix(vrender-components): fix the issue of bounds when labelContainer is empty

### Updates

- fix: fix the poptip not work due to mount and unmount issue

## 0.13.1
Thu, 20 Jul 2023 10:41:23 GMT

### Patches

- fix: fix the offset of axis title

## 0.13.0
Wed, 19 Jul 2023 08:29:52 GMT

### Minor changes

- feat(axis): support `dataFilter` property for tick and label's data filter
- feat(axis): add anti-overlapping logic for cartesian axis labels
- feat: support poptip component and plugin

### Patches

- feat(axis): support custom method for autohide
- feat: tooltip supports rich text which can wrap
- fix(legend): compact the undefiend scene when use Object.keys

### Updates

- perf(marker): performance enhance

## 0.12.3
Wed, 12 Jul 2023 12:30:46 GMT

_Version update only_

## 0.12.2
Tue, 11 Jul 2023 13:17:12 GMT

### Patches

- fix(components): fix a layout issue when legend item is larger than maxWidth
- fix(components): adjust the drawing level of grid and subGrid
- fix: set the pickMode of pager handler to imprecise to improve the click in mobile
- chore: remove gl-matrix

## 0.12.1
Fri, 07 Jul 2023 09:04:45 GMT

### Patches

- fix: check label inside in smartInvert 

## 0.12.0
Thu, 06 Jul 2023 09:09:12 GMT

### Minor changes

- refactor: refactor interfaces and types of typescript

### Patches

- fix: tooltip should not throw error when title not exist



### Updates

- fix(marker): pickable problem
- fix(marker): add interactive config

## 0.11.1
Tue, 27 Jun 2023 13:38:36 GMT

_Version update only_

## 0.11.0
Tue, 27 Jun 2023 03:18:18 GMT

### Minor changes

- update vUtils version
- rename all of the borderRadius to cornerRadius

### Patches

- fix the position offset of the tooltip content shape

## 0.10.3
Tue, 20 Jun 2023 06:23:42 GMT

_Version update only_

## 0.10.2
Tue, 20 Jun 2023 03:25:23 GMT

_Version update only_

## 0.10.1
Mon, 19 Jun 2023 09:49:38 GMT

### Patches

- limit the range of dragMask, it should not exceeded the display range of datazoom

## 0.10.0
Fri, 16 Jun 2023 03:13:09 GMT

### Minor changes

- code style
- export version

### Patches

- upgrade vrender
- fix enableView3dTranform
- fix legend shape's color does not change in unselected state
- upgrade vrender

### Updates

- release

## 0.9.1
Thu, 08 Jun 2023 11:34:32 GMT

_Version update only_

## 0.9.0
Wed, 07 Jun 2023 12:20:05 GMT

_Initial release_

