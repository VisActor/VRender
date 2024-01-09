import { createImage, createPyramid3d } from '@visactor/vrender';
import {
  createStage,
  createGroup,
  createLine,
  createText,
  createSymbol,
  createRect,
  createRect3d,
  createPath,
  createArc,
  createArea,
  createCircle,
  IArc,
  container,
  IGroup,
  GroupFadeIn,
  GroupFadeOut,
  AnimateGroup,
  AttributeAnimate
} from '@visactor/vrender';
import { graphicUtil } from '@visactor/vrender-core';
// import { json } from './json';
// import { json3 } from './xtable';
import { roughModule } from '@visactor/vrender-kits';

const json = {
  attribute: {
    background: 'white'
  },
  _uid: 3,
  type: 'group',
  children: [
    {
      attribute: {},
      _uid: 9,
      type: 'group',
      children: [
        {
          attribute: {
            x: 0,
            y: 0,
            width: 1904,
            height: 500,
            sizeAttrs: {
              x: 0,
              y: 0,
              width: 1904,
              height: 500
            }
          },
          _uid: 13,
          type: 'group',
          name: 'root',
          children: [
            {
              attribute: {
                visible: true,
                clip: false,
                x: 84,
                y: 20,
                width: 1800,
                height: 460,
                sizeAttrs: {
                  x: 84,
                  y: 20,
                  width: 1800,
                  height: 460
                },
                pickable: false,
                zIndex: 450
              },
              _uid: 14,
              type: 'group',
              name: 'regionGroup_4',
              children: [
                {
                  attribute: {
                    visible: true,
                    x: 0,
                    y: 0,
                    clip: false,
                    sizeAttrs: {
                      x: 0,
                      y: 0
                    },
                    pickable: false,
                    zIndex: 0
                  },
                  _uid: 15,
                  type: 'group',
                  name: 'seriesGroup_bar_5_7',
                  children: [
                    {
                      attribute: {
                        pickable: false,
                        zIndex: 300
                      },
                      _uid: 60,
                      type: 'group',
                      name: 'bar_8',
                      children: [
                        {
                          attribute: {
                            visible: true,
                            lineWidth: 0,
                            fill: false,
                            x: 0,
                            y: 25.090909090909065,
                            stroke: '#1664FF',
                            x1: 0,
                            height: 75.27272727272728,
                            sizeAttrs: {
                              x: 1620,
                              y: 25.090909090909065,
                              x1: 0,
                              height: 75.27272727272728
                            },
                            width: 1620,
                            pickable: true
                          },
                          _uid: 61,
                          type: 'rect',
                          children: []
                        },
                        {
                          attribute: {
                            visible: true,
                            lineWidth: 0,
                            fill: false,
                            x: 0,
                            y: 108.7272727272727,
                            stroke: '#1664FF',
                            x1: 0,
                            height: 75.27272727272728,
                            sizeAttrs: {
                              x: 1080,
                              y: 108.7272727272727,
                              x1: 0,
                              height: 75.27272727272728
                            },
                            width: 1080,
                            pickable: true
                          },
                          _uid: 62,
                          type: 'rect',
                          children: []
                        },
                        {
                          attribute: {
                            visible: true,
                            lineWidth: 0,
                            fill: false,
                            x: 0,
                            y: 192.36363636363635,
                            stroke: '#1664FF',
                            x1: 0,
                            height: 75.27272727272728,
                            sizeAttrs: {
                              x: 540,
                              y: 192.36363636363635,
                              x1: 0,
                              height: 75.27272727272728
                            },
                            width: 540,
                            pickable: true
                          },
                          _uid: 63,
                          type: 'rect',
                          children: []
                        },
                        {
                          attribute: {
                            visible: true,
                            lineWidth: 0,
                            fill: false,
                            x: 0,
                            y: 276,
                            stroke: '#1664FF',
                            x1: 0,
                            height: 75.27272727272728,
                            sizeAttrs: {
                              x: 900,
                              y: 276,
                              x1: 0,
                              height: 75.27272727272728
                            },
                            width: 900,
                            pickable: true
                          },
                          _uid: 64,
                          type: 'rect',
                          children: []
                        },
                        {
                          attribute: {
                            visible: true,
                            lineWidth: 0,
                            fill: false,
                            x: 0,
                            y: 359.6363636363636,
                            stroke: '#1664FF',
                            x1: 0,
                            height: 75.27272727272728,
                            sizeAttrs: {
                              x: 720,
                              y: 359.6363636363636,
                              x1: 0,
                              height: 75.27272727272728
                            },
                            width: 720,
                            pickable: true
                          },
                          _uid: 65,
                          type: 'rect',
                          children: []
                        }
                      ]
                    },
                    {
                      attribute: {
                        pickable: false,
                        zIndex: 10000
                      },
                      _uid: 16,
                      type: 'group',
                      name: '__VCHART_series_5_extensionMark_0_10',
                      children: [
                        {
                          attribute: {
                            visible: true,
                            lineWidth: 0,
                            repeatX: 'repeat',
                            x: 0,
                            y: 10,
                            width: 1620,
                            height: 75.27272727272728,
                            image:
                              'http://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/demo/008_%E5%92%96%E5%95%A1%20(1).png',
                            stroke: '#1664FF',
                            pickable: true
                          },
                          _uid: 17,
                          type: 'image',
                          children: []
                        },
                        {
                          attribute: {
                            visible: true,
                            lineWidth: 0,
                            repeatX: 'repeat',
                            x: 0,
                            y: 10,
                            width: 1080,
                            height: 75.27272727272728,
                            image:
                              'http://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/demo/008_%E7%81%AB%E9%94%85%20(1).png',
                            stroke: '#1664FF',
                            pickable: true
                          },
                          _uid: 18,
                          type: 'image',
                          children: []
                        },
                        {
                          attribute: {
                            visible: true,
                            lineWidth: 0,
                            repeatX: 'repeat',
                            x: 0,
                            y: 10,
                            width: 540,
                            height: 75.27272727272728,
                            image:
                              'http://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/demo/008_%E7%B1%B3%E7%B2%89%E9%9D%A2%E6%9D%A1%20(1).png',
                            stroke: '#1664FF',
                            pickable: true
                          },
                          _uid: 19,
                          type: 'image',
                          children: []
                        },
                        {
                          attribute: {
                            visible: true,
                            lineWidth: 0,
                            repeatX: 'repeat',
                            x: 0,
                            y: 10,
                            width: 900,
                            height: 75.27272727272728,
                            image:
                              'http://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/demo/008_%E9%9B%AA%E7%B3%95%E5%86%B0%E6%A3%92%20(1).png',
                            stroke: '#1664FF',
                            pickable: true
                          },
                          _uid: 20,
                          type: 'image',
                          children: []
                        },
                        {
                          attribute: {
                            visible: true,
                            lineWidth: 0,
                            repeatX: 'repeat',
                            x: 0,
                            y: 10,
                            width: 720,
                            height: 75.27272727272728,
                            image:
                              'http://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/demo/008_%E9%B2%9C%E8%8A%B1%E7%BB%BF%E6%A4%8D%20(1).png',
                            stroke: '#1664FF',
                            pickable: true
                          },
                          _uid: 21,
                          type: 'image',
                          children: []
                        }
                      ]
                    }
                  ]
                },
                {
                  attribute: {
                    pickable: false,
                    zIndex: 300
                  },
                  _uid: 66,
                  type: 'group',
                  name: 'bar-label-0-component_32',
                  children: [
                    {
                      attribute: {
                        pickable: false,
                        size: {
                          width: 1800,
                          height: 460
                        },
                        dataLabels: [
                          {
                            type: 'rect',
                            data: [
                              {
                                text: 900,
                                fill: '#1664FF',
                                data: {
                                  type: '咖啡',
                                  value: 900,
                                  __VCHART_DEFAULT_DATA_SERIES_FIELD: 'bar_5',
                                  __VCHART_DEFAULT_DATA_INDEX: 0,
                                  __VCHART_DEFAULT_DATA_KEY: '咖啡_0',
                                  VGRAMMAR_DATA_ID_KEY_15: 0
                                },
                                visible: true,
                                x: 0,
                                y: 0,
                                angle: 0,
                                textAlign: 'center',
                                lineWidth: 2,
                                fontSize: 14,
                                lineHeight: '150%',
                                fontWeight: 'normal',
                                fillOpacity: 1,
                                stroke: '#ffffff'
                              },
                              {
                                text: 600,
                                fill: '#1664FF',
                                data: {
                                  type: '火锅',
                                  value: 600,
                                  __VCHART_DEFAULT_DATA_SERIES_FIELD: 'bar_5',
                                  __VCHART_DEFAULT_DATA_INDEX: 1,
                                  __VCHART_DEFAULT_DATA_KEY: '火锅_0',
                                  VGRAMMAR_DATA_ID_KEY_15: 1
                                },
                                visible: true,
                                x: 0,
                                y: 0,
                                angle: 0,
                                textAlign: 'center',
                                lineWidth: 2,
                                fontSize: 14,
                                lineHeight: '150%',
                                fontWeight: 'normal',
                                fillOpacity: 1,
                                stroke: '#ffffff'
                              },
                              {
                                text: 300,
                                fill: '#1664FF',
                                data: {
                                  type: '米粉面条',
                                  value: 300,
                                  __VCHART_DEFAULT_DATA_SERIES_FIELD: 'bar_5',
                                  __VCHART_DEFAULT_DATA_INDEX: 2,
                                  __VCHART_DEFAULT_DATA_KEY: '米粉面条_0',
                                  VGRAMMAR_DATA_ID_KEY_15: 2
                                },
                                visible: true,
                                x: 0,
                                y: 0,
                                angle: 0,
                                textAlign: 'center',
                                lineWidth: 2,
                                fontSize: 14,
                                lineHeight: '150%',
                                fontWeight: 'normal',
                                fillOpacity: 1,
                                stroke: '#ffffff'
                              },
                              {
                                text: 500,
                                fill: '#1664FF',
                                data: {
                                  type: '雪糕冰棒',
                                  value: 500,
                                  __VCHART_DEFAULT_DATA_SERIES_FIELD: 'bar_5',
                                  __VCHART_DEFAULT_DATA_INDEX: 3,
                                  __VCHART_DEFAULT_DATA_KEY: '雪糕冰棒_0',
                                  VGRAMMAR_DATA_ID_KEY_15: 3
                                },
                                visible: true,
                                x: 0,
                                y: 0,
                                angle: 0,
                                textAlign: 'center',
                                lineWidth: 2,
                                fontSize: 14,
                                lineHeight: '150%',
                                fontWeight: 'normal',
                                fillOpacity: 1,
                                stroke: '#ffffff'
                              },
                              {
                                text: 400,
                                fill: '#1664FF',
                                data: {
                                  type: '鲜花绿植',
                                  value: 400,
                                  __VCHART_DEFAULT_DATA_SERIES_FIELD: 'bar_5',
                                  __VCHART_DEFAULT_DATA_INDEX: 4,
                                  __VCHART_DEFAULT_DATA_KEY: '鲜花绿植_0',
                                  VGRAMMAR_DATA_ID_KEY_15: 4
                                },
                                visible: true,
                                x: 0,
                                y: 0,
                                angle: 0,
                                textAlign: 'center',
                                lineWidth: 2,
                                fontSize: 14,
                                lineHeight: '150%',
                                fontWeight: 'normal',
                                fillOpacity: 1,
                                stroke: '#ffffff'
                              }
                            ],
                            overlap: {
                              size: {
                                width: 1000,
                                height: 1000
                              },
                              strategy: [
                                {
                                  type: 'position'
                                }
                              ],
                              avoidMarks: []
                            },
                            smartInvert: false,
                            baseMarkGroupName: 'bar_8',
                            textStyle: {
                              pickable: false,
                              fontSize: 14,
                              lineHeight: '150%',
                              fontWeight: 'normal',
                              fillOpacity: 1,
                              lineWidth: 2,
                              stroke: '#ffffff'
                            },
                            visible: true,
                            offset: 5,
                            hover: false,
                            select: false,
                            centerOffset: 0
                          }
                        ]
                      },
                      _uid: 67,
                      type: 'group',
                      name: 'data-label',
                      children: [
                        {
                          attribute: {
                            textStyle: {
                              fontSize: 14,
                              textAlign: 'center',
                              textBaseline: 'middle',
                              boundsPadding: [-1, 0, -1, 0],
                              fill: '#000',
                              pickable: false,
                              lineHeight: '150%',
                              fontWeight: 'normal',
                              fillOpacity: 1,
                              lineWidth: 2,
                              stroke: '#ffffff'
                            },
                            offset: 5,
                            pickable: false,
                            type: 'rect',
                            data: [
                              {
                                text: 900,
                                fill: '#1664FF',
                                data: {
                                  type: '咖啡',
                                  value: 900,
                                  __VCHART_DEFAULT_DATA_SERIES_FIELD: 'bar_5',
                                  __VCHART_DEFAULT_DATA_INDEX: 0,
                                  __VCHART_DEFAULT_DATA_KEY: '咖啡_0',
                                  VGRAMMAR_DATA_ID_KEY_15: 0
                                },
                                visible: true,
                                x: 0,
                                y: 0,
                                angle: 0,
                                textAlign: 'center',
                                lineWidth: 2,
                                fontSize: 14,
                                lineHeight: '150%',
                                fontWeight: 'normal',
                                fillOpacity: 1,
                                stroke: '#ffffff',
                                id: 'vrender-component-label-0'
                              },
                              {
                                text: 600,
                                fill: '#1664FF',
                                data: {
                                  type: '火锅',
                                  value: 600,
                                  __VCHART_DEFAULT_DATA_SERIES_FIELD: 'bar_5',
                                  __VCHART_DEFAULT_DATA_INDEX: 1,
                                  __VCHART_DEFAULT_DATA_KEY: '火锅_0',
                                  VGRAMMAR_DATA_ID_KEY_15: 1
                                },
                                visible: true,
                                x: 0,
                                y: 0,
                                angle: 0,
                                textAlign: 'center',
                                lineWidth: 2,
                                fontSize: 14,
                                lineHeight: '150%',
                                fontWeight: 'normal',
                                fillOpacity: 1,
                                stroke: '#ffffff',
                                id: 'vrender-component-label-1'
                              },
                              {
                                text: 300,
                                fill: '#1664FF',
                                data: {
                                  type: '米粉面条',
                                  value: 300,
                                  __VCHART_DEFAULT_DATA_SERIES_FIELD: 'bar_5',
                                  __VCHART_DEFAULT_DATA_INDEX: 2,
                                  __VCHART_DEFAULT_DATA_KEY: '米粉面条_0',
                                  VGRAMMAR_DATA_ID_KEY_15: 2
                                },
                                visible: true,
                                x: 0,
                                y: 0,
                                angle: 0,
                                textAlign: 'center',
                                lineWidth: 2,
                                fontSize: 14,
                                lineHeight: '150%',
                                fontWeight: 'normal',
                                fillOpacity: 1,
                                stroke: '#ffffff',
                                id: 'vrender-component-label-2'
                              },
                              {
                                text: 500,
                                fill: '#1664FF',
                                data: {
                                  type: '雪糕冰棒',
                                  value: 500,
                                  __VCHART_DEFAULT_DATA_SERIES_FIELD: 'bar_5',
                                  __VCHART_DEFAULT_DATA_INDEX: 3,
                                  __VCHART_DEFAULT_DATA_KEY: '雪糕冰棒_0',
                                  VGRAMMAR_DATA_ID_KEY_15: 3
                                },
                                visible: true,
                                x: 0,
                                y: 0,
                                angle: 0,
                                textAlign: 'center',
                                lineWidth: 2,
                                fontSize: 14,
                                lineHeight: '150%',
                                fontWeight: 'normal',
                                fillOpacity: 1,
                                stroke: '#ffffff',
                                id: 'vrender-component-label-3'
                              },
                              {
                                text: 400,
                                fill: '#1664FF',
                                data: {
                                  type: '鲜花绿植',
                                  value: 400,
                                  __VCHART_DEFAULT_DATA_SERIES_FIELD: 'bar_5',
                                  __VCHART_DEFAULT_DATA_INDEX: 4,
                                  __VCHART_DEFAULT_DATA_KEY: '鲜花绿植_0',
                                  VGRAMMAR_DATA_ID_KEY_15: 4
                                },
                                visible: true,
                                x: 0,
                                y: 0,
                                angle: 0,
                                textAlign: 'center',
                                lineWidth: 2,
                                fontSize: 14,
                                lineHeight: '150%',
                                fontWeight: 'normal',
                                fillOpacity: 1,
                                stroke: '#ffffff',
                                id: 'vrender-component-label-4'
                              }
                            ],
                            overlap: {
                              size: {
                                width: 1000,
                                height: 1000
                              },
                              strategy: [
                                {
                                  type: 'position'
                                }
                              ],
                              avoidMarks: []
                            },
                            smartInvert: false,
                            baseMarkGroupName: 'bar_8',
                            visible: true,
                            hover: false,
                            select: false,
                            centerOffset: 0
                          },
                          _uid: 68,
                          type: 'group',
                          name: 'label',
                          children: [
                            {
                              attribute: {
                                fill: '#1664FF',
                                fontSize: 14,
                                textAlign: 'center',
                                textBaseline: 'middle',
                                boundsPadding: [-1, 0, -1, 0],
                                pickable: false,
                                lineHeight: '150%',
                                fontWeight: 'normal',
                                fillOpacity: 1,
                                lineWidth: 2,
                                stroke: '#ffffff',
                                text: 900,
                                data: {
                                  type: '咖啡',
                                  value: 900,
                                  __VCHART_DEFAULT_DATA_SERIES_FIELD: 'bar_5',
                                  __VCHART_DEFAULT_DATA_INDEX: 0,
                                  __VCHART_DEFAULT_DATA_KEY: '咖啡_0',
                                  VGRAMMAR_DATA_ID_KEY_15: 0
                                },
                                visible: true,
                                x: 1638.5999908447266,
                                y: 62.727272727272705,
                                angle: 0,
                                id: 'vrender-component-label-0',
                                opacity: 1,
                                strokeOpacity: 1
                              },
                              _uid: 69,
                              type: 'text',
                              children: []
                            },
                            {
                              attribute: {
                                fill: '#1664FF',
                                fontSize: 14,
                                textAlign: 'center',
                                textBaseline: 'middle',
                                boundsPadding: [-1, 0, -1, 0],
                                pickable: false,
                                lineHeight: '150%',
                                fontWeight: 'normal',
                                fillOpacity: 1,
                                lineWidth: 2,
                                stroke: '#ffffff',
                                text: 600,
                                data: {
                                  type: '火锅',
                                  value: 600,
                                  __VCHART_DEFAULT_DATA_SERIES_FIELD: 'bar_5',
                                  __VCHART_DEFAULT_DATA_INDEX: 1,
                                  __VCHART_DEFAULT_DATA_KEY: '火锅_0',
                                  VGRAMMAR_DATA_ID_KEY_15: 1
                                },
                                visible: true,
                                x: 1098.5999908447266,
                                y: 146.36363636363635,
                                angle: 0,
                                id: 'vrender-component-label-1',
                                opacity: 1,
                                strokeOpacity: 1
                              },
                              _uid: 70,
                              type: 'text',
                              children: []
                            },
                            {
                              attribute: {
                                fill: '#1664FF',
                                fontSize: 14,
                                textAlign: 'center',
                                textBaseline: 'middle',
                                boundsPadding: [-1, 0, -1, 0],
                                pickable: false,
                                lineHeight: '150%',
                                fontWeight: 'normal',
                                fillOpacity: 1,
                                lineWidth: 2,
                                stroke: '#ffffff',
                                text: 300,
                                data: {
                                  type: '米粉面条',
                                  value: 300,
                                  __VCHART_DEFAULT_DATA_SERIES_FIELD: 'bar_5',
                                  __VCHART_DEFAULT_DATA_INDEX: 2,
                                  __VCHART_DEFAULT_DATA_KEY: '米粉面条_0',
                                  VGRAMMAR_DATA_ID_KEY_15: 2
                                },
                                visible: true,
                                x: 558.5999908447266,
                                y: 230,
                                angle: 0,
                                id: 'vrender-component-label-2',
                                opacity: 1,
                                strokeOpacity: 1
                              },
                              _uid: 71,
                              type: 'text',
                              children: []
                            },
                            {
                              attribute: {
                                fill: '#1664FF',
                                fontSize: 14,
                                textAlign: 'center',
                                textBaseline: 'middle',
                                boundsPadding: [-1, 0, -1, 0],
                                pickable: false,
                                lineHeight: '150%',
                                fontWeight: 'normal',
                                fillOpacity: 1,
                                lineWidth: 2,
                                stroke: '#ffffff',
                                text: 500,
                                data: {
                                  type: '雪糕冰棒',
                                  value: 500,
                                  __VCHART_DEFAULT_DATA_SERIES_FIELD: 'bar_5',
                                  __VCHART_DEFAULT_DATA_INDEX: 3,
                                  __VCHART_DEFAULT_DATA_KEY: '雪糕冰棒_0',
                                  VGRAMMAR_DATA_ID_KEY_15: 3
                                },
                                visible: true,
                                x: 918.5999908447266,
                                y: 313.6363636363636,
                                angle: 0,
                                id: 'vrender-component-label-3',
                                opacity: 1,
                                strokeOpacity: 1
                              },
                              _uid: 72,
                              type: 'text',
                              children: []
                            },
                            {
                              attribute: {
                                fill: '#1664FF',
                                fontSize: 14,
                                textAlign: 'center',
                                textBaseline: 'middle',
                                boundsPadding: [-1, 0, -1, 0],
                                pickable: false,
                                lineHeight: '150%',
                                fontWeight: 'normal',
                                fillOpacity: 1,
                                lineWidth: 2,
                                stroke: '#ffffff',
                                text: 400,
                                data: {
                                  type: '鲜花绿植',
                                  value: 400,
                                  __VCHART_DEFAULT_DATA_SERIES_FIELD: 'bar_5',
                                  __VCHART_DEFAULT_DATA_INDEX: 4,
                                  __VCHART_DEFAULT_DATA_KEY: '鲜花绿植_0',
                                  VGRAMMAR_DATA_ID_KEY_15: 4
                                },
                                visible: true,
                                x: 738.5999908447266,
                                y: 397.27272727272725,
                                angle: 0,
                                id: 'vrender-component-label-4',
                                opacity: 1,
                                strokeOpacity: 1
                              },
                              _uid: 73,
                              type: 'text',
                              children: []
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            },
            {
              attribute: {
                pickable: false,
                zIndex: 100
              },
              _uid: 22,
              type: 'group',
              name: 'axis-left_19',
              children: [
                {
                  attribute: {
                    title: {
                      space: 12,
                      padding: 0,
                      textStyle: {
                        fontSize: 12,
                        fill: '#606773',
                        fontWeight: 'normal',
                        fillOpacity: 1,
                        textAlign: 'center',
                        textBaseline: 'bottom',
                        lineHeight: '130%'
                      },
                      autoRotate: false,
                      angle: -1.5707963267948966,
                      shape: {},
                      background: {},
                      state: {
                        text: null,
                        shape: null,
                        background: null
                      },
                      pickable: true,
                      childrenPickable: true,
                      text: 'type',
                      maxWidth: null
                    },
                    label: {
                      visible: true,
                      inside: false,
                      space: 12,
                      padding: 0,
                      style: {
                        fontSize: 12,
                        fill: '#89909d',
                        fontWeight: 'normal',
                        fillOpacity: 1
                      },
                      formatMethod: null,
                      state: null,
                      autoLimit: true
                    },
                    tick: {
                      visible: true,
                      inside: false,
                      alignWithLabel: true,
                      length: 4,
                      style: {
                        lineWidth: 1,
                        stroke: '#d9dde4',
                        strokeOpacity: 1
                      },
                      state: null
                    },
                    subTick: {
                      visible: false,
                      inside: false,
                      count: 4,
                      length: 2,
                      style: {
                        lineWidth: 1,
                        stroke: '#d9dde4',
                        strokeOpacity: 1
                      },
                      state: null
                    },
                    line: {
                      visible: true,
                      style: {
                        lineWidth: 1,
                        stroke: '#d9dde4',
                        strokeOpacity: 1
                      },
                      startSymbol: {},
                      endSymbol: {}
                    },
                    x: 84,
                    y: 20,
                    start: {
                      x: 0,
                      y: 0
                    },
                    end: {
                      x: 0,
                      y: 460
                    },
                    visible: true,
                    pickable: true,
                    orient: 'left',
                    panel: {
                      state: null
                    },
                    verticalFactor: 1,
                    items: [
                      [
                        {
                          id: '咖啡',
                          label: '咖啡',
                          value: 0.13636363636363633,
                          rawValue: '咖啡'
                        },
                        {
                          id: '火锅',
                          label: '火锅',
                          value: 0.3181818181818181,
                          rawValue: '火锅'
                        },
                        {
                          id: '米粉面条',
                          label: '米粉面条',
                          value: 0.5,
                          rawValue: '米粉面条'
                        },
                        {
                          id: '雪糕冰棒',
                          label: '雪糕冰棒',
                          value: 0.6818181818181818,
                          rawValue: '雪糕冰棒'
                        },
                        {
                          id: '鲜花绿植',
                          label: '鲜花绿植',
                          value: 0.8636363636363636,
                          rawValue: '鲜花绿植'
                        }
                      ]
                    ],
                    verticalLimitSize: 571.2,
                    verticalMinSize: null
                  },
                  _uid: 23,
                  type: 'group',
                  name: 'axis',
                  children: [
                    {
                      attribute: {
                        x: 0,
                        y: 0,
                        pickable: false
                      },
                      _uid: 43,
                      type: 'group',
                      children: [
                        {
                          attribute: {
                            x: 0,
                            y: 0,
                            zIndex: 1
                          },
                          _uid: 44,
                          type: 'group',
                          name: 'axis-container',
                          children: [
                            {
                              attribute: {
                                visible: true,
                                lineStyle: {
                                  lineWidth: 1,
                                  stroke: '#d9dde4',
                                  strokeOpacity: 1
                                },
                                startSymbol: {
                                  visible: false,
                                  autoRotate: true,
                                  symbolType: 'triangle',
                                  size: 12,
                                  refX: 0,
                                  refY: 0,
                                  refAngle: 0,
                                  style: {
                                    fill: '#000',
                                    zIndex: 1
                                  }
                                },
                                endSymbol: {
                                  visible: false,
                                  autoRotate: true,
                                  symbolType: 'triangle',
                                  size: 12,
                                  refX: 0,
                                  refY: 0,
                                  refAngle: 0,
                                  style: {
                                    fill: '#000',
                                    zIndex: 1
                                  }
                                },
                                points: [
                                  {
                                    x: 0,
                                    y: 0
                                  },
                                  {
                                    x: 0,
                                    y: 460
                                  }
                                ]
                              },
                              _uid: 45,
                              type: 'group',
                              name: 'axis-line',
                              children: [
                                {
                                  attribute: {
                                    points: [
                                      {
                                        x: 0,
                                        y: 0
                                      },
                                      {
                                        x: 0,
                                        y: 460
                                      }
                                    ],
                                    lineWidth: 1,
                                    stroke: '#d9dde4',
                                    strokeOpacity: 1,
                                    fill: false,
                                    closePath: false
                                  },
                                  _uid: 46,
                                  type: 'polygon',
                                  name: 'axis-line-line',
                                  children: []
                                }
                              ]
                            },
                            {
                              attribute: {
                                x: 0,
                                y: 0,
                                pickable: false
                              },
                              _uid: 47,
                              type: 'group',
                              name: 'axis-tick-container',
                              children: [
                                {
                                  attribute: {
                                    points: [
                                      {
                                        x: 0,
                                        y: 62.72727272727271
                                      },
                                      {
                                        x: -4,
                                        y: 62.72727272727271
                                      }
                                    ],
                                    lineWidth: 1,
                                    stroke: '#d9dde4',
                                    strokeOpacity: 1
                                  },
                                  _uid: 48,
                                  type: 'line',
                                  name: 'axis-tick',
                                  children: []
                                },
                                {
                                  attribute: {
                                    points: [
                                      {
                                        x: 0,
                                        y: 146.36363636363635
                                      },
                                      {
                                        x: -4,
                                        y: 146.36363636363635
                                      }
                                    ],
                                    lineWidth: 1,
                                    stroke: '#d9dde4',
                                    strokeOpacity: 1
                                  },
                                  _uid: 49,
                                  type: 'line',
                                  name: 'axis-tick',
                                  children: []
                                },
                                {
                                  attribute: {
                                    points: [
                                      {
                                        x: 0,
                                        y: 230
                                      },
                                      {
                                        x: -4,
                                        y: 230
                                      }
                                    ],
                                    lineWidth: 1,
                                    stroke: '#d9dde4',
                                    strokeOpacity: 1
                                  },
                                  _uid: 50,
                                  type: 'line',
                                  name: 'axis-tick',
                                  children: []
                                },
                                {
                                  attribute: {
                                    points: [
                                      {
                                        x: 0,
                                        y: 313.6363636363636
                                      },
                                      {
                                        x: -4,
                                        y: 313.6363636363636
                                      }
                                    ],
                                    lineWidth: 1,
                                    stroke: '#d9dde4',
                                    strokeOpacity: 1
                                  },
                                  _uid: 51,
                                  type: 'line',
                                  name: 'axis-tick',
                                  children: []
                                },
                                {
                                  attribute: {
                                    points: [
                                      {
                                        x: 0,
                                        y: 397.27272727272725
                                      },
                                      {
                                        x: -4,
                                        y: 397.27272727272725
                                      }
                                    ],
                                    lineWidth: 1,
                                    stroke: '#d9dde4',
                                    strokeOpacity: 1
                                  },
                                  _uid: 52,
                                  type: 'line',
                                  name: 'axis-tick',
                                  children: []
                                }
                              ]
                            },
                            {
                              attribute: {
                                x: 0,
                                y: 0,
                                pickable: false
                              },
                              _uid: 53,
                              type: 'group',
                              name: 'axis-label-container',
                              children: [
                                {
                                  attribute: {
                                    x: 0,
                                    y: 0,
                                    pickable: false
                                  },
                                  _uid: 54,
                                  type: 'group',
                                  name: 'axis-label-container-layer-0',
                                  children: [
                                    {
                                      attribute: {
                                        x: -16,
                                        y: 62.72727272727271,
                                        text: '咖啡',
                                        lineHeight: 12,
                                        textAlign: 'end',
                                        textBaseline: 'middle',
                                        fontSize: 12,
                                        fill: '#89909d',
                                        fontWeight: 'normal',
                                        fillOpacity: 1
                                      },
                                      _uid: 55,
                                      type: 'text',
                                      name: 'axis-label',
                                      children: []
                                    },
                                    {
                                      attribute: {
                                        x: -16,
                                        y: 146.36363636363635,
                                        text: '火锅',
                                        lineHeight: 12,
                                        textAlign: 'end',
                                        textBaseline: 'middle',
                                        fontSize: 12,
                                        fill: '#89909d',
                                        fontWeight: 'normal',
                                        fillOpacity: 1
                                      },
                                      _uid: 56,
                                      type: 'text',
                                      name: 'axis-label',
                                      children: []
                                    },
                                    {
                                      attribute: {
                                        x: -16,
                                        y: 230,
                                        text: '米粉面条',
                                        lineHeight: 12,
                                        textAlign: 'end',
                                        textBaseline: 'middle',
                                        fontSize: 12,
                                        fill: '#89909d',
                                        fontWeight: 'normal',
                                        fillOpacity: 1
                                      },
                                      _uid: 57,
                                      type: 'text',
                                      name: 'axis-label',
                                      children: []
                                    },
                                    {
                                      attribute: {
                                        x: -16,
                                        y: 313.6363636363636,
                                        text: '雪糕冰棒',
                                        lineHeight: 12,
                                        textAlign: 'end',
                                        textBaseline: 'middle',
                                        fontSize: 12,
                                        fill: '#89909d',
                                        fontWeight: 'normal',
                                        fillOpacity: 1
                                      },
                                      _uid: 58,
                                      type: 'text',
                                      name: 'axis-label',
                                      children: []
                                    },
                                    {
                                      attribute: {
                                        x: -16,
                                        y: 397.27272727272725,
                                        text: '鲜花绿植',
                                        lineHeight: 12,
                                        textAlign: 'end',
                                        textBaseline: 'middle',
                                        fontSize: 12,
                                        fill: '#89909d',
                                        fontWeight: 'normal',
                                        fillOpacity: 1
                                      },
                                      _uid: 59,
                                      type: 'text',
                                      name: 'axis-label',
                                      children: []
                                    }
                                  ]
                                }
                              ]
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            },
            {
              attribute: {
                rectStyle: {
                  fill: '#f1f2f5',
                  opacity: 0.7,
                  pickable: false,
                  visible: true,
                  lineDash: []
                },
                start: {
                  x: 84,
                  y: 45.090909090909065
                },
                end: {
                  x: 1884,
                  y: 120.36363636363635
                },
                zIndex: 100
              },
              _uid: 92,
              type: 'group',
              name: 'crosshair',
              children: [
                {
                  attribute: {
                    x: 84,
                    y: 45.090909090909065,
                    width: 1800,
                    height: 75.27272727272728,
                    fill: '#f1f2f5',
                    opacity: 0.7,
                    pickable: false,
                    visible: true,
                    lineDash: []
                  },
                  _uid: 93,
                  type: 'rect',
                  name: 'crosshair-rect',
                  children: []
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};
container.load(roughModule);

let arcList = [];
let tlist = [];
function _add(group, json) {
  if (json.type === 'group') {
    const g = createGroup(json.attribute);
    group.add(g);
    json.children &&
      json.children.forEach(item => {
        _add(g, item);
      });
  } else if (json.type === 'line') {
    console.log(json.points);
    group.add(createLine({ ...json.attribute, keepDirIn3d: false }));
  } else if (json.type === 'text') {
    const t = createText({ ...json.attribute, z: json.attribute.z || 0, keepDirIn3d: false, _debug_bounds: true });
    group.add(t);
    t.addEventListener('mousemove', () => {
      t.setAttribute('fill', 'red');
    });
    tlist.push(t);
  } else if (json.type === 'pyramid3d') {
    group.setMode('3d');
    group.add(createPyramid3d({ ...json.attribute, keepDirIn3d: false }));
  } else if (json.type === 'symbol') {
    const s = createSymbol({ ...json.attribute, keepDirIn3d: true });
    // s.animate().to({ scaleX: 0.5, scaleY: 0.5 }, 1000, 'linear');
    // s.addEventListener('mouseenter', () => {
    //   s.setAttribute('fill', 'red');
    // });
    // console.log(s);
    group.add(s);
  } else if (json.type === 'rect') {
    group.add(createRect(json.attribute));
  } else if (json.type === 'rect3d') {
    group.setMode('3d');
    group.add(createRect3d({ ...json.attribute, length: 6 }));
  } else if (json.type === 'path') {
    group.add(createPath(json.attribute));
  } else if (json.type === 'arc') {
    const arc = createArc(json.attribute);
    arcList.push(arc);
    group.add(arc);
  } else if (json.type === 'area') {
    group.add(createArea(json.attribute));
  } else if (json.type === 'circle') {
    group.add(createCircle(json.attribute));
  } else if (json.type === 'image') {
    group.add(createImage(json.attribute));
  }
}

export const page = () => {
  const c = document.getElementById('main') as HTMLCanvasElement;

  const stage = createStage({
    canvas: c as HTMLCanvasElement,
    width: 802,
    height: 500,
    // disableDirtyBounds: true,
    // canvasControled: true,
    autoRender: false
  });

  const layer = stage.at(0);

  json.children[0].children.forEach(item => {
    _add(layer, item);
  });
  stage.render();

  setTimeout(() => {
    stage.render();
  }, 2000);

  tlist.reverse().forEach(t => {
    const c = graphicUtil.drawGraphicToCanvas(t, stage);
    console.log(c, t.attribute.text);
    document.body.appendChild(c);
  });

  // const t = performance.now();
  // const b = layer.AABBBounds;
  // console.log(performance.now() - t);
  // console.log(b);

  // const btn = document.createElement('button');
  // btn.innerHTML = 'render';
  // document.body.appendChild(btn);
  // btn.addEventListener('click', () => {
  //   stage.render();
  // });
  // stage.set3dOptions({
  //   alpha: 0,
  //   // beta: 0,
  //   enable: true
  // });

  // stage.children[0].children[0].setMode('3d');

  // const group = stage.defaultLayer.getChildren()[0] as IGroup;
  // group.setAttribute('fill', 'green');

  // group
  //   .animate()
  //   .play(
  //     new AnimateGroup(2000, [
  //       new AttributeAnimate({ fill: 'red' }, 2000, 'quadIn'),
  //       new GroupFadeIn(1000, 'quadIn')
  //     ])
  //   )
  //   .wait(1000)
  //   .play(new GroupFadeIn(1000, 'quadIn'))
  //   .wait(3000)
  //   .play(new GroupFadeOut(1000, 'quadIn'));

  // stage.render(undefined, {});

  // const button = document.createElement('button');
  // button.innerHTML = 'click';
  // document.body.appendChild(button);
  // button.addEventListener('click', () => {
  //   stage.getElementsByType('rect').forEach(r => {
  //     r.setAttribute('fill', 'red');
  //   });
  //   stage.render(undefined, {});
  // });

  // stage.enableView3dTransform();
};
