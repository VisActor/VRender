# Change Log - @visactor/vrender-components

This log was last generated on Wed, 15 Jan 2025 12:13:28 GMT and should not be manually modified.

## 0.21.11
Wed, 15 Jan 2025 12:13:28 GMT

_Version update only_

## 0.21.10
Wed, 15 Jan 2025 03:14:32 GMT

### Updates

- fix: marker area support more position

## 0.21.9
Mon, 13 Jan 2025 03:23:50 GMT

### Updates

- feat: add GifImage component
- fix: fix duplicate label issue after custom filtering with label dataFilter

## 0.21.8
Mon, 06 Jan 2025 11:07:36 GMT

### Updates

- fix: handle the additional logic of 3d arc label layout
- fix: fix layout of title component



## 0.21.7
Wed, 25 Dec 2024 07:53:11 GMT

### Updates

- feat: support polygon sector crosshair for non-smooth angle axis
- feat: add switch component
- Revert "fix: fix the bug of axis pickable"

This reverts commit 55637a84c01f7af8f4b64ccdfc8cd7215a257c03.


- fix: upgrade vutils to 0.19.3



## 0.21.6
Tue, 24 Dec 2024 12:46:37 GMT

### Updates

- fix: add onBeforeAttributeUpdate in base-component
- fix: fix the bug of axis pickable



## 0.21.5
Tue, 24 Dec 2024 07:53:11 GMT

_Version update only_

## 0.21.4
Mon, 23 Dec 2024 10:16:00 GMT

_Version update only_

## 0.21.3
Mon, 23 Dec 2024 08:28:14 GMT

### Updates

- feat: optimization legend layout in isHorizontal


- fix: axis break should filter ticks when set `tickStep`


- fix: obb autoHide should support autoHideSeparation(without rotate)
- fix: label overlapPadding not work correctly
- fix: optimize the performance of ticks in time-scale



## 0.21.2
Thu, 12 Dec 2024 10:23:51 GMT

### Updates

- feat: support 'inside-middle' position for line-data label

## 0.21.1
Thu, 05 Dec 2024 07:50:47 GMT

### Updates

- feat: support `restorePosition` in position/bound label overlap strategy
- feat: support vertex point of marker area label. close @VisActor/VChart#3442
- fix: end symbol angle when arc line in markpoint. fix @VisActor/VChart#3427
- fix: fix issue with scroll-plugin

## 0.21.0
Thu, 28 Nov 2024 03:30:36 GMT

### Updates

-  feat: support label overlap for inside arc labels

## 0.20.16
Thu, 21 Nov 2024 06:58:23 GMT

_Version update only_

## 0.20.15
Fri, 15 Nov 2024 08:34:34 GMT

_Version update only_

## 0.20.14
Wed, 13 Nov 2024 07:47:16 GMT

_Version update only_

## 0.20.13
Wed, 13 Nov 2024 06:35:02 GMT

### Updates

- feat: support custom event trigger in discrete legend
- feat: support scrollMask in scroll type discrete legend
- refactor: optimize the scroll effect of discrete legend
- fix: fix the issue of the legend scrollbar being clipped when positioned left or right
- fix: fix smartInvert of gradient bar



## 0.20.12
Thu, 31 Oct 2024 02:49:49 GMT

_Version update only_

## 0.20.11
Wed, 30 Oct 2024 13:10:03 GMT

### Updates

- fix: optimize limit length calculation for line axis label autoWrap
- fix: fix bounds of circle axis


- fix: last page is empty in legend. fix@VisActor/VChart#3344

## 0.20.10
Wed, 23 Oct 2024 08:37:33 GMT

_Version update only_

## 0.20.9
Tue, 15 Oct 2024 03:50:15 GMT

### Updates

- fix: fix smartInvert when `outsideEnable` is true


- feat: support axis label `firstVisible` in autoHide and linear axis sampling
- feat: add `interactInvertType` for smartInvert


- fix: fix max width of arc label in left


- fix: fix `pager.space` of discrete legend


- fix: fix smart invert when only has intercet width base mark


- fix: fix `legend.item.label.space` when has value


- fix: legend scroll critical value leads last page not render. fix@VisActor/VChart#3172

## 0.20.8
Sun, 29 Sep 2024 09:44:02 GMT

_Version update only_

## 0.20.7
Fri, 27 Sep 2024 03:22:31 GMT

### Updates

- feat: legend support roam scroll. close@VisActor/VChart#3254

## 0.20.6
Thu, 26 Sep 2024 09:28:36 GMT

### Updates

-  feat: support obb text bounds to enhance autoHide effect
- fix: fix limit width of arc label when has customized align offset


- fix: fix error of `alternateColor`


- fix: outside label should not apply `smartInvert`


- fix: fix `boundsPadding` of legend focus icon



## 0.20.5
Fri, 20 Sep 2024 06:37:57 GMT

### Updates

- fix: update parameters
- fix: fix maxLineWidth of arc label


- fix: fix path string of arc, fix #1434


- fix: fix `textStyle` of data-zoom


- fix: fix error of morphing animation in `multiToOneMorph`, fix #1439



## 0.20.4
Thu, 12 Sep 2024 07:33:20 GMT

### Updates

- fix: fix the issue where labels are not drawn when the linelabel animation is enabled.

## 0.20.3
Sat, 07 Sep 2024 09:16:33 GMT

### Updates

- feat: add `alignOffset` in arc-label, `line2MinLength` support customized callback


- feat: support axis `breaks` for line axis
- feat: support `autoWrap` in line axis label
- feat: label component supports disable specific state animation
- fix: tag padding not work when label is rich text. fix@VisActor/VChart#3151

## 0.20.2
Wed, 04 Sep 2024 12:52:31 GMT

_Version update only_

## 0.20.1
Fri, 30 Aug 2024 09:55:07 GMT

### Updates

- feat: support position `inside-center` of arc label
- feat: add necessary APIs to player component
- fix: fix textAlign of label when set different angle


- fix: indicator stop tooltip interaction. fix@VisActor/VChart#3123
- fix: segment line will cause incorrect label position
- fix: fix issue with poptip memory while stage is released
- feat: support line segments update animation in TagPointsUpdate custom animation
- perf: optimize the performance of label component

## 0.20.0
Thu, 15 Aug 2024 07:26:54 GMT

### Updates

- fix: arc label line color should follow arc mark by default, related #3067
- fix: fix bug of auto-render when remove some graphics


- fix: set container pick false to allow tooltip interactive
- fix: fix issue with timeline animate duration compute
- fix: optimize triangle symbols


- refactor: optimize cornerRadius parse of arc



## 0.19.24
Tue, 13 Aug 2024 07:47:29 GMT

### Updates

- feat: support polygon of circle-axis


- fix: fix wrong stroke style is applied to area


- fix: improve slightly the accuracy of the pager size calculation, related #3045
- fix: fix issue with timeline appearAnimate opacity attr prevented by next animate

## 0.19.23
Tue, 06 Aug 2024 05:17:39 GMT

_Version update only_

## 0.19.22
Mon, 05 Aug 2024 09:08:30 GMT

### Updates

- feat: support react and html of indicator


- feat: support timeline component
- fix: fix issue with indicator autolimit

## 0.19.21
Mon, 05 Aug 2024 01:39:45 GMT

### Updates

- feat: label line support custom path. feat @VisActor/VChart#3000

## 0.19.20
Wed, 31 Jul 2024 09:48:37 GMT

_Version update only_

## 0.19.19
Tue, 23 Jul 2024 11:56:39 GMT

### Updates

- feat: marker label support custom shape. close @Visactor/VChart#2959
- fix: in vertical layout, if only one line can be displayed, the layout will be directly based on the width of the legend item itself
- fix: markpoint target size compute error. fix@Visactor/VChart#2766

## 0.19.18
Fri, 12 Jul 2024 07:18:10 GMT

_Version update only_

## 0.19.17
Fri, 05 Jul 2024 17:26:17 GMT

_Version update only_

## 0.19.16
Fri, 05 Jul 2024 14:29:15 GMT

### Updates

- fix: fix the issue where the arc label is still truncated despite setting `ellipsis: false`
- fix: fix syncState of label when re-render stage



## 0.19.15
Fri, 28 Jun 2024 10:32:37 GMT

_Version update only_

## 0.19.14
Wed, 26 Jun 2024 09:16:23 GMT

### Updates

- feat: upgrade @visactor/vutils

## 0.19.13
Tue, 25 Jun 2024 11:17:14 GMT

_Version update only_

## 0.19.12
Fri, 21 Jun 2024 06:52:50 GMT

_Version update only_

## 0.19.11
Fri, 14 Jun 2024 09:50:59 GMT

### Updates

- fix: fix position of canvas tooltip shape



## 0.19.10
Thu, 13 Jun 2024 09:52:46 GMT

### Updates

- feat: support `align` right of canvas tooltip



## 0.19.9
Wed, 05 Jun 2024 12:25:00 GMT

### Updates

- fix: colorLegend handler cannot customize fill color

## 0.19.8
Wed, 05 Jun 2024 08:24:28 GMT

_Version update only_

## 0.19.7
Tue, 04 Jun 2024 11:10:08 GMT

### Updates

- fix: fix useless re-render of datazoom and brush



## 0.19.6
Wed, 29 May 2024 06:57:11 GMT

### Updates

- feat: add empty-tip component


- fix(marker): fix marker position and ref bad case. fix@visactor/vchart#2721
- fix: fix animation of state change



## 0.19.5
Fri, 24 May 2024 09:21:23 GMT

### Updates

- feat: add \`containerTextAlign\` for tag component

## 0.19.4
Fri, 17 May 2024 06:46:41 GMT

### Updates

- feat: add  scrollbar propagation spec to allow close stop propagation
- feat: support harmony env
- feat(marker): mark point support arc and target item. close@VisActor/VChart#2590
- feat(player): index can be looped when set backward or forward button in player if user config loop. close@Vi
- fix: fix error of arc label


- fix: fix error of tooltip when rich text is empty


- fix(legend): active item error when rerender legend. fix@VisActor/VChart#2690

## 0.19.3
Fri, 10 May 2024 09:24:38 GMT

_Version update only_

## 0.19.2
Thu, 09 May 2024 12:26:00 GMT

### Updates

- feat: support `focus` mode in discrete legend



## 0.19.1
Wed, 08 May 2024 08:47:35 GMT

_Version update only_

## 0.19.0
Tue, 30 Apr 2024 08:40:53 GMT

### Updates

- fix: fix point of event when stage has transform


- feat: support style callback in html and react, fix 1102



## 0.18.17
Tue, 30 Apr 2024 07:48:41 GMT

### Updates

- fix: fix error of label when all the labels are cleared



## 0.18.16
Mon, 29 Apr 2024 07:40:31 GMT

### Updates

- fix: theme should not support 3d graphics



## 0.18.15
Fri, 26 Apr 2024 10:37:19 GMT

### Updates

- fix: `label.rotate: false` not work in inside arc label 

## 0.18.14
Wed, 24 Apr 2024 08:07:48 GMT

_Version update only_

## 0.18.13
Fri, 19 Apr 2024 08:46:08 GMT

_Version update only_

## 0.18.12
Fri, 19 Apr 2024 07:48:17 GMT

### Updates

- feat: add radio component
- fix(brush): state not correctly when operating mask bounds is not right. fix@VisActor/VChart#2555
- fix: when clear states, the animations of state should clear


- fix(event): event pos error when scale
- fix: fix the issue of update selected value of slider


- docs: update changlog of rush


- refactor: replace wrapText with text

## 0.18.11
Wed, 17 Apr 2024 03:02:22 GMT

### Updates

- fix: change click into pointup in checkbox
- fix: player click event not working
- fix: player slider value error after resize

## 0.18.10
Fri, 29 Mar 2024 08:02:16 GMT

### Updates

- fix: when user set `defaultSelected` value to be [], all legend's items should be unselected, fixed https://github.com/VisActor/VChart/issues/2445
- fix: when user set `defaultSelected` value to be [], all legend's items should be unselected, fixed https://github.com/VisActor/VChart/issues/2445
- fix: fix alignment calculation for line axis axis text, fixed https://github.com/VisActor/VChart/issues/2449

## 0.18.9
Thu, 28 Mar 2024 10:13:24 GMT

_Version update only_

## 0.18.8
Wed, 27 Mar 2024 11:33:58 GMT

### Updates

- feat: support `inverse` in slider and size-lengend, color-legend



## 0.18.7
Fri, 22 Mar 2024 08:46:19 GMT

### Updates

- feat(segment): support curve type. feat VisActor/VChart#2417
- fix: fix auto-limit of horizontal and vertical text



## 0.18.6
Tue, 19 Mar 2024 10:10:17 GMT

### Updates

- fix: fix the issue of axis's update transition animation not work
- fix: fix the direction of legend scrollbar

## 0.18.5
Tue, 12 Mar 2024 15:16:46 GMT

### Updates

- fix(debounce): dataZoom and scrollbar and brush debounce leads to remove event fail

## 0.18.4
Tue, 12 Mar 2024 09:40:06 GMT

_Version update only_

## 0.18.3
Mon, 11 Mar 2024 08:24:00 GMT

### Updates

- fix(dataZoom): fix datazoom realtime error and export scrollbar event name 

## 0.18.2
Fri, 08 Mar 2024 03:19:08 GMT

_Version update only_

## 0.18.1
Mon, 04 Mar 2024 08:29:15 GMT

### Updates

-     feat: support `autoEllipsisStrategy` of legend item

## 0.18.0
Wed, 28 Feb 2024 10:09:04 GMT

### Updates

- feat(scrollbar): reconfig scrollbar api of scrollDrag and scrollDown
- feat: support oriented padding in label overlap bitmap
- feat: support item align of discrete legend
- feat: support scrollbar in legend
- feat: support tooltip in SizeLegend and ColorLegend
- fix(datazoom): realtime & pickable not work
- fix(dataZoom): compute line width when compute bounds
- feat: support lazyload of Legend, and pageFormatter of Pager



## 0.17.26
Wed, 28 Feb 2024 08:06:31 GMT

_Version update only_

## 0.17.25
Fri, 23 Feb 2024 04:29:58 GMT

### Updates

-  feat: export more basic type defination in vrender-components
- fix: fix auto-limit of top/bottom axis when no rotate


- fix: legend disappear when label is empty string in focus mode

## 0.17.24
Tue, 06 Feb 2024 09:48:26 GMT

### Updates

- fix(datazoom): realtime & pickable not work

## 0.17.23
Sun, 04 Feb 2024 12:41:45 GMT

_Version update only_

## 0.17.22
Fri, 02 Feb 2024 07:17:07 GMT

_Version update only_

## 0.17.21
Thu, 01 Feb 2024 12:22:29 GMT

### Updates

- fix: fix issue with remove html, closed #944

## 0.17.20
Thu, 01 Feb 2024 09:26:17 GMT

### Updates

- feat: unify richtext config
- feat: support richtext in legend components
- feat: tag support textAlwaysCenter, closed #915

## 0.17.19
Wed, 24 Jan 2024 13:11:27 GMT

_Version update only_

## 0.17.18
Wed, 24 Jan 2024 10:10:41 GMT

### Updates

- feat: adjust the timing for label customLayoutFunc invocation
- feat: label component will sync maxLineWidth to maxWidth in richText
- fix: event pos error when interactive in site

## 0.17.17
Mon, 22 Jan 2024 08:19:38 GMT

### Updates

- fix: title support multiline

## 0.17.16
Wed, 17 Jan 2024 09:02:13 GMT

### Updates

- fix: when no brush is active, brush should not call stopPropagation()



## 0.17.15
Wed, 17 Jan 2024 06:43:01 GMT

### Updates

- fix: fix the flush of axis when axis label has rotate angle


- fix: arc label line not shown
-  feat: support boolean config in label
-  fix: error happens in line-label when line has no points

## 0.17.14
Fri, 12 Jan 2024 10:33:32 GMT

_Version update only_

## 0.17.13
Wed, 10 Jan 2024 14:18:21 GMT

### Updates

- fix: filter out invisible indicator spec
- fix: `measureTextSize` needs to take into account the fonts configured on the stage theme

## 0.17.12
Wed, 10 Jan 2024 03:56:46 GMT

### Updates

- fix(marker): fix problem of no render when set visible attr and add valid judgment logic. fix@Visactor/Vchart#1901
- feat: support fit strategy for indicator
- feat(marker): mark point support confine. fix @Visactor/VChart#1573
- fix(datazoom): adaptive handler text layout. fix@Visactor/VChart#1809
- fix(datazoom): set pickable false when zoomLock. fix @Visactor/VChart#1565
- fix(datazoom): handler not follow mouse after resize. fix@Visactor/Vchart#1490
- fix: arc outside label invisible with visible label line

## 0.17.11
Fri, 05 Jan 2024 11:54:56 GMT

_Version update only_

## 0.17.10
Wed, 03 Jan 2024 13:19:34 GMT

### Updates

- feat: support `lastVisible` of LineAxis label


- 'feat: support label line in label component'
- fix: fix the auto limit width of label when the label has vertical `direction` in orient top or bottom


- fix: fix issue with legend symbol size
- fix: fixed height calculation issue after multi-layer axis text rotation
- fix: fixed height calculation issue after multi-layer axis text rotation

## 0.17.9
Fri, 29 Dec 2023 09:59:13 GMT

### Updates

- fix: fix label position when offset is 0



## 0.17.8
Fri, 29 Dec 2023 07:20:26 GMT

### Updates

- feat: optimize outer label layout in tangential direction
- fix: when axis label space is 0, and axis tick' inside is true, the axis label's position is not correct
- fix: fix morphing of rect



## 0.17.7
Wed, 20 Dec 2023 10:05:55 GMT

_Version update only_

## 0.17.6
Wed, 20 Dec 2023 07:39:54 GMT

_Version update only_

## 0.17.5
Tue, 19 Dec 2023 09:13:27 GMT

### Updates

- feat(scrollbar): dispatch scrollDown event
- feat: labelLine support animate
- fix: fix issue with arc animate with delayafter
- feat: label don't create enter animate animationEnter while duration less than 0
- fix: fix issue with poptip circular dependencies

## 0.17.4
Thu, 14 Dec 2023 11:00:38 GMT

### Updates

- fix(datazoom): symbol size problem

## 0.17.3
Wed, 13 Dec 2023 12:04:17 GMT

### Updates

- fix(datazoom): handler zindex to interaction error

## 0.17.2
Tue, 12 Dec 2023 13:05:58 GMT

### Updates

- feat(dataZoom): add mask to modify hot zone. feat @visactor/vchart#1415'
- fix: scrollbar slider width/height should not be negative
- fix: datazoom event block window event. fix @visactor/vchart#1686
- perf: optimize the `_handleStyle()` in legend


- fix: fix the issue of brushEnd trigger multiple times, related https://github.com/VisActor/VChart/issues/1694

## 0.17.1
Wed, 06 Dec 2023 11:19:22 GMT

_Version update only_

## 0.17.0
Thu, 30 Nov 2023 12:58:15 GMT

### Updates

- feat: optmize bounds performance
- perf: add option `skipDefault` to vrender-components

## 0.16.18
Thu, 30 Nov 2023 09:40:58 GMT

### Updates

- feat: discrete legend's pager support position property
- refactor: move getSizeHandlerPath out of sizlegend

## 0.16.17
Thu, 23 Nov 2023 13:32:49 GMT

### Updates

- feat: support rich text for label, axis, marker,tooltip, indicator and title
- feat: add mode type of smartInvert
- feat: place more label for overlapPadding case

## 0.16.16
Fri, 17 Nov 2023 02:33:59 GMT

### Updates

- fix: fix the issue of legend item.shape can not set visible, related https://github.com/VisActor/VChart/issues/1508

## 0.16.15
Thu, 16 Nov 2023 02:46:27 GMT

### Updates

- fix: legendItemHover and legendItemUnHover should trigger once

## 0.16.14
Wed, 15 Nov 2023 09:56:28 GMT

### Updates

- feat: datazoom update callback supports new trigger tag param
- feat(label): support line/area label
- feat: lineHeight support string, which means percent

## 0.16.13
Thu, 09 Nov 2023 11:49:33 GMT

_Version update only_

## 0.16.12
Tue, 07 Nov 2023 10:52:54 GMT

### Updates

- fix: padding of title component
- fix: padding offset of AABBbounds

## 0.16.11
Thu, 02 Nov 2023 13:43:18 GMT

### Updates

- fix: optimize the auto-overlap of axis label, which use rotateBounds when text rotated, relate https://github.com/VisActor/VChart/issues/133
- fix: flush should not sue width height
- fix: fix the lastvisible logic of axis's auto-hide

## 0.16.9
Fri, 27 Oct 2023 02:21:19 GMT

### Updates

- feat: add checkbox indeterminate state
- feat(label): rect label support position `top-right`|`top-left`|`bottom-righ`|`bottom-left`
- fix: all the group container of marker do not trigger event
- fix: all the group container of marker do not trigger event
- fix(datazoom): text bounds when visible is false. fix VisActor/VChart#1281

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

