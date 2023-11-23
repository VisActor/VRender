import { createPyramid3d } from '@visactor/vrender';
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
// import { json } from './json';
// import { json3 } from './xtable';
import { roughModule } from '@visactor/vrender-kits';

const json = {
  attribute: {
    background: 'white'
  },
  _uid: 281,
  type: 'group',
  children: [
    {
      attribute: {},
      _uid: 287,
      type: 'group',
      children: [
        {
          attribute: {
            x: 0,
            y: 0,
            width: 846,
            height: 522,
            sizeAttrs: {
              x: 0,
              y: 0,
              width: 846,
              height: 522
            }
          },
          _uid: 291,
          type: 'group',
          name: 'root',
          children: [
            {
              attribute: {
                visible: true,
                clip: false,
                x: 47,
                y: 26,
                width: 779,
                height: 452,
                sizeAttrs: {
                  x: 47,
                  y: 26,
                  width: 779,
                  height: 452
                },
                pickable: false,
                zIndex: 450
              },
              _uid: 316,
              type: 'group',
              name: 'regionGroup_47',
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
                  _uid: 317,
                  type: 'group',
                  name: 'seriesGroup_area_48_50',
                  children: [
                    {
                      attribute: {
                        pickable: false,
                        zIndex: 300
                      },
                      _uid: 432,
                      type: 'group',
                      name: 'area_51',
                      children: [
                        {
                          attribute: {
                            y1: 0,
                            fill: '#1664FF',
                            stroke: ['#1664FF', false, false, false],
                            defined: true,
                            points: [
                              {
                                x: 61.499999999999964,
                                y: 271.2,
                                context: '2:00_0',
                                y1: 452
                              },
                              {
                                x: 143.49999999999997,
                                y: 248.60000000000002,
                                context: '4:00_0',
                                y1: 452
                              },
                              {
                                x: 225.49999999999997,
                                y: 203.39999999999998,
                                context: '6:00_0',
                                y1: 452
                              },
                              {
                                x: 307.49999999999994,
                                y: 135.60000000000002,
                                context: '8:00_0',
                                y1: 452
                              },
                              {
                                x: 389.49999999999994,
                                y: 90.39999999999998,
                                context: '10:00_0',
                                y1: 452
                              },
                              {
                                x: 471.49999999999994,
                                y: 67.80000000000001,
                                context: '12:00_0',
                                y1: 452
                              },
                              {
                                x: 553.4999999999999,
                                y: 67.80000000000001,
                                context: '14:00_0',
                                y1: 452
                              },
                              {
                                x: 635.4999999999999,
                                y: 90.39999999999998,
                                context: '16:00_0',
                                y1: 452
                              },
                              {
                                x: 717.4999999999999,
                                y: 113,
                                context: '18:00_0',
                                y1: 452
                              }
                            ],
                            segments: null,
                            visible: true,
                            lineWidth: 2,
                            lineCap: 'round',
                            lineJoin: 'round',
                            fillOpacity: 0.2,
                            connectedType: 'none',
                            x: 0,
                            y: 0,
                            x1: 0,
                            pickable: true,
                            clipRange: 1
                          },
                          _uid: 433,
                          type: 'area',
                          children: []
                        }
                      ]
                    },
                    {
                      attribute: {
                        pickable: false,
                        zIndex: 300
                      },
                      _uid: 422,
                      type: 'group',
                      name: 'point_53',
                      children: [
                        {
                          attribute: {
                            visible: true,
                            size: 8,
                            symbolType: 'circle',
                            lineWidth: 1,
                            stroke: '#ffffff',
                            fillOpacity: 1,
                            x: 61.499999999999964,
                            y: 271.2,
                            fill: '#1664FF',
                            imageAttrs: {
                              fill: '#1664FF'
                            },
                            pickable: true,
                            scaleX: 1,
                            scaleY: 1
                          },
                          _uid: 423,
                          type: 'symbol',
                          children: []
                        },
                        {
                          attribute: {
                            visible: true,
                            size: 8,
                            symbolType: 'circle',
                            lineWidth: 1,
                            stroke: '#ffffff',
                            fillOpacity: 1,
                            x: 143.49999999999997,
                            y: 248.60000000000002,
                            fill: '#1664FF',
                            imageAttrs: {
                              fill: '#1664FF'
                            },
                            pickable: true,
                            scaleX: 1,
                            scaleY: 1
                          },
                          _uid: 424,
                          type: 'symbol',
                          children: []
                        },
                        {
                          attribute: {
                            visible: true,
                            size: 8,
                            symbolType: 'circle',
                            lineWidth: 1,
                            stroke: '#ffffff',
                            fillOpacity: 1,
                            x: 225.49999999999997,
                            y: 203.39999999999998,
                            fill: '#1664FF',
                            imageAttrs: {
                              fill: '#1664FF'
                            },
                            pickable: true,
                            scaleX: 1,
                            scaleY: 1
                          },
                          _uid: 425,
                          type: 'symbol',
                          children: []
                        },
                        {
                          attribute: {
                            visible: true,
                            size: 8,
                            symbolType: 'circle',
                            lineWidth: 1,
                            stroke: '#ffffff',
                            fillOpacity: 1,
                            x: 307.49999999999994,
                            y: 135.60000000000002,
                            fill: '#1664FF',
                            imageAttrs: {
                              fill: '#1664FF'
                            },
                            pickable: true,
                            scaleX: 1,
                            scaleY: 1
                          },
                          _uid: 426,
                          type: 'symbol',
                          children: []
                        },
                        {
                          attribute: {
                            visible: true,
                            size: 8,
                            symbolType: 'circle',
                            lineWidth: 1,
                            stroke: '#ffffff',
                            fillOpacity: 1,
                            x: 389.49999999999994,
                            y: 90.39999999999998,
                            fill: '#1664FF',
                            imageAttrs: {
                              fill: '#1664FF'
                            },
                            pickable: true,
                            scaleX: 1,
                            scaleY: 1
                          },
                          _uid: 427,
                          type: 'symbol',
                          children: []
                        },
                        {
                          attribute: {
                            visible: true,
                            size: 8,
                            symbolType: 'circle',
                            lineWidth: 1,
                            stroke: '#ffffff',
                            fillOpacity: 1,
                            x: 471.49999999999994,
                            y: 67.80000000000001,
                            fill: '#1664FF',
                            imageAttrs: {
                              fill: '#1664FF'
                            },
                            pickable: true,
                            scaleX: 1,
                            scaleY: 1
                          },
                          _uid: 428,
                          type: 'symbol',
                          children: []
                        },
                        {
                          attribute: {
                            visible: true,
                            size: 8,
                            symbolType: 'circle',
                            lineWidth: 1,
                            stroke: '#ffffff',
                            fillOpacity: 1,
                            x: 553.4999999999999,
                            y: 67.80000000000001,
                            fill: '#1664FF',
                            imageAttrs: {
                              fill: '#1664FF'
                            },
                            pickable: true,
                            scaleX: 1,
                            scaleY: 1
                          },
                          _uid: 429,
                          type: 'symbol',
                          children: []
                        },
                        {
                          attribute: {
                            visible: true,
                            size: 8,
                            symbolType: 'circle',
                            lineWidth: 1,
                            stroke: '#ffffff',
                            fillOpacity: 1,
                            x: 635.4999999999999,
                            y: 90.39999999999998,
                            fill: '#1664FF',
                            imageAttrs: {
                              fill: '#1664FF'
                            },
                            pickable: true,
                            scaleX: 1,
                            scaleY: 1
                          },
                          _uid: 430,
                          type: 'symbol',
                          children: []
                        },
                        {
                          attribute: {
                            visible: true,
                            size: 8,
                            symbolType: 'circle',
                            lineWidth: 1,
                            stroke: '#ffffff',
                            fillOpacity: 1,
                            x: 717.4999999999999,
                            y: 113,
                            fill: '#1664FF',
                            imageAttrs: {
                              fill: '#1664FF'
                            },
                            pickable: true,
                            scaleX: 1,
                            scaleY: 1
                          },
                          _uid: 431,
                          type: 'symbol',
                          children: []
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
              _uid: 292,
              type: 'group',
              name: 'axis-bottom_61',
              children: [
                {
                  attribute: {
                    title: {
                      space: 8,
                      padding: 0,
                      textStyle: {
                        fontSize: 12,
                        fill: '#606773',
                        fontWeight: 'normal',
                        fillOpacity: 1,
                        lineHeight: 15.600000000000001
                      },
                      autoRotate: false,
                      angle: null,
                      shape: {},
                      background: {},
                      state: {
                        text: null,
                        shape: null,
                        background: null
                      },
                      pickable: true,
                      childrenPickable: true,
                      text: 'time',
                      maxWidth: null
                    },
                    label: {
                      visible: true,
                      inside: false,
                      space: 8,
                      padding: 0,
                      style: {
                        fontSize: 12,
                        fill: '#89909d',
                        fontWeight: 'normal',
                        fillOpacity: 1
                      },
                      formatMethod: null,
                      state: null
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
                    x: 47,
                    y: 478,
                    start: {
                      x: 0,
                      y: 0
                    },
                    end: {
                      x: 779,
                      y: 0
                    },
                    items: [
                      [
                        {
                          id: '2:00',
                          label: '2:00',
                          value: 0.07894736842105259,
                          rawValue: '2:00'
                        },
                        {
                          id: '4:00',
                          label: '4:00',
                          value: 0.18421052631578944,
                          rawValue: '4:00'
                        },
                        {
                          id: '6:00',
                          label: '6:00',
                          value: 0.28947368421052627,
                          rawValue: '6:00'
                        },
                        {
                          id: '8:00',
                          label: '8:00',
                          value: 0.3947368421052631,
                          rawValue: '8:00'
                        },
                        {
                          id: '10:00',
                          label: '10:00',
                          value: 0.49999999999999994,
                          rawValue: '10:00'
                        },
                        {
                          id: '12:00',
                          label: '12:00',
                          value: 0.6052631578947367,
                          rawValue: '12:00'
                        },
                        {
                          id: '14:00',
                          label: '14:00',
                          value: 0.7105263157894736,
                          rawValue: '14:00'
                        },
                        {
                          id: '16:00',
                          label: '16:00',
                          value: 0.8157894736842104,
                          rawValue: '16:00'
                        },
                        {
                          id: '18:00',
                          label: '18:00',
                          value: 0.9210526315789472,
                          rawValue: '18:00'
                        }
                      ]
                    ],
                    visible: true,
                    pickable: true,
                    orient: 'bottom',
                    panel: {
                      state: null
                    },
                    verticalFactor: 1,
                    verticalLimitSize: 156.6,
                    verticalMinSize: null
                  },
                  _uid: 293,
                  type: 'group',
                  name: 'axis',
                  children: [
                    {
                      attribute: {
                        x: 0,
                        y: 0,
                        pickable: false
                      },
                      _uid: 382,
                      type: 'group',
                      children: [
                        {
                          attribute: {
                            x: 0,
                            y: 0,
                            zIndex: 1
                          },
                          _uid: 383,
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
                                    x: 779,
                                    y: 0
                                  }
                                ]
                              },
                              _uid: 384,
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
                                        x: 779,
                                        y: 0
                                      }
                                    ],
                                    lineWidth: 1,
                                    stroke: '#d9dde4',
                                    strokeOpacity: 1,
                                    fill: false,
                                    closePath: false
                                  },
                                  _uid: 385,
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
                              _uid: 386,
                              type: 'group',
                              name: 'axis-tick-container',
                              children: [
                                {
                                  attribute: {
                                    points: [
                                      {
                                        x: 61.499999999999964,
                                        y: 0
                                      },
                                      {
                                        x: 61.499999999999964,
                                        y: 3.9999999999999996
                                      }
                                    ],
                                    lineWidth: 1,
                                    stroke: '#d9dde4',
                                    strokeOpacity: 1
                                  },
                                  _uid: 387,
                                  type: 'line',
                                  name: 'axis-tick',
                                  children: []
                                },
                                {
                                  attribute: {
                                    points: [
                                      {
                                        x: 143.49999999999997,
                                        y: 0
                                      },
                                      {
                                        x: 143.49999999999997,
                                        y: 3.9999999999999996
                                      }
                                    ],
                                    lineWidth: 1,
                                    stroke: '#d9dde4',
                                    strokeOpacity: 1
                                  },
                                  _uid: 388,
                                  type: 'line',
                                  name: 'axis-tick',
                                  children: []
                                },
                                {
                                  attribute: {
                                    points: [
                                      {
                                        x: 225.49999999999997,
                                        y: 0
                                      },
                                      {
                                        x: 225.49999999999997,
                                        y: 3.9999999999999996
                                      }
                                    ],
                                    lineWidth: 1,
                                    stroke: '#d9dde4',
                                    strokeOpacity: 1
                                  },
                                  _uid: 389,
                                  type: 'line',
                                  name: 'axis-tick',
                                  children: []
                                },
                                {
                                  attribute: {
                                    points: [
                                      {
                                        x: 307.49999999999994,
                                        y: 0
                                      },
                                      {
                                        x: 307.49999999999994,
                                        y: 3.9999999999999996
                                      }
                                    ],
                                    lineWidth: 1,
                                    stroke: '#d9dde4',
                                    strokeOpacity: 1
                                  },
                                  _uid: 390,
                                  type: 'line',
                                  name: 'axis-tick',
                                  children: []
                                },
                                {
                                  attribute: {
                                    points: [
                                      {
                                        x: 389.49999999999994,
                                        y: 0
                                      },
                                      {
                                        x: 389.49999999999994,
                                        y: 3.9999999999999996
                                      }
                                    ],
                                    lineWidth: 1,
                                    stroke: '#d9dde4',
                                    strokeOpacity: 1
                                  },
                                  _uid: 391,
                                  type: 'line',
                                  name: 'axis-tick',
                                  children: []
                                },
                                {
                                  attribute: {
                                    points: [
                                      {
                                        x: 471.4999999999999,
                                        y: 0
                                      },
                                      {
                                        x: 471.4999999999999,
                                        y: 3.9999999999999996
                                      }
                                    ],
                                    lineWidth: 1,
                                    stroke: '#d9dde4',
                                    strokeOpacity: 1
                                  },
                                  _uid: 392,
                                  type: 'line',
                                  name: 'axis-tick',
                                  children: []
                                },
                                {
                                  attribute: {
                                    points: [
                                      {
                                        x: 553.4999999999999,
                                        y: 0
                                      },
                                      {
                                        x: 553.4999999999999,
                                        y: 3.9999999999999996
                                      }
                                    ],
                                    lineWidth: 1,
                                    stroke: '#d9dde4',
                                    strokeOpacity: 1
                                  },
                                  _uid: 393,
                                  type: 'line',
                                  name: 'axis-tick',
                                  children: []
                                },
                                {
                                  attribute: {
                                    points: [
                                      {
                                        x: 635.4999999999999,
                                        y: 0
                                      },
                                      {
                                        x: 635.4999999999999,
                                        y: 3.9999999999999996
                                      }
                                    ],
                                    lineWidth: 1,
                                    stroke: '#d9dde4',
                                    strokeOpacity: 1
                                  },
                                  _uid: 394,
                                  type: 'line',
                                  name: 'axis-tick',
                                  children: []
                                },
                                {
                                  attribute: {
                                    points: [
                                      {
                                        x: 717.4999999999999,
                                        y: 0
                                      },
                                      {
                                        x: 717.4999999999999,
                                        y: 3.9999999999999996
                                      }
                                    ],
                                    lineWidth: 1,
                                    stroke: '#d9dde4',
                                    strokeOpacity: 1
                                  },
                                  _uid: 395,
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
                              _uid: 396,
                              type: 'group',
                              name: 'axis-label-container',
                              children: [
                                {
                                  attribute: {
                                    x: 0,
                                    y: 0,
                                    pickable: false
                                  },
                                  _uid: 397,
                                  type: 'group',
                                  name: 'axis-label-container-layer-0',
                                  children: [
                                    {
                                      attribute: {
                                        x: 61.499999999999964,
                                        y: 11.999999999999998,
                                        text: '2:00',
                                        lineHeight: 12,
                                        textAlign: 'center',
                                        textBaseline: 'top',
                                        fontSize: 12,
                                        fill: '#89909d',
                                        fontWeight: 'normal',
                                        fillOpacity: 1
                                      },
                                      _uid: 398,
                                      type: 'text',
                                      name: 'axis-label',
                                      children: []
                                    },
                                    {
                                      attribute: {
                                        x: 143.49999999999997,
                                        y: 11.999999999999998,
                                        text: '4:00',
                                        lineHeight: 12,
                                        textAlign: 'center',
                                        textBaseline: 'top',
                                        fontSize: 12,
                                        fill: '#89909d',
                                        fontWeight: 'normal',
                                        fillOpacity: 1
                                      },
                                      _uid: 399,
                                      type: 'text',
                                      name: 'axis-label',
                                      children: []
                                    },
                                    {
                                      attribute: {
                                        x: 225.49999999999997,
                                        y: 11.999999999999998,
                                        text: '6:00',
                                        lineHeight: 12,
                                        textAlign: 'center',
                                        textBaseline: 'top',
                                        fontSize: 12,
                                        fill: '#89909d',
                                        fontWeight: 'normal',
                                        fillOpacity: 1
                                      },
                                      _uid: 400,
                                      type: 'text',
                                      name: 'axis-label',
                                      children: []
                                    },
                                    {
                                      attribute: {
                                        x: 307.49999999999994,
                                        y: 11.999999999999998,
                                        text: '8:00',
                                        lineHeight: 12,
                                        textAlign: 'center',
                                        textBaseline: 'top',
                                        fontSize: 12,
                                        fill: '#89909d',
                                        fontWeight: 'normal',
                                        fillOpacity: 1
                                      },
                                      _uid: 401,
                                      type: 'text',
                                      name: 'axis-label',
                                      children: []
                                    },
                                    {
                                      attribute: {
                                        x: 389.49999999999994,
                                        y: 11.999999999999998,
                                        text: '10:00',
                                        lineHeight: 12,
                                        textAlign: 'center',
                                        textBaseline: 'top',
                                        fontSize: 12,
                                        fill: '#89909d',
                                        fontWeight: 'normal',
                                        fillOpacity: 1
                                      },
                                      _uid: 402,
                                      type: 'text',
                                      name: 'axis-label',
                                      children: []
                                    },
                                    {
                                      attribute: {
                                        x: 471.4999999999999,
                                        y: 11.999999999999998,
                                        text: '12:00',
                                        lineHeight: 12,
                                        textAlign: 'center',
                                        textBaseline: 'top',
                                        fontSize: 12,
                                        fill: '#89909d',
                                        fontWeight: 'normal',
                                        fillOpacity: 1
                                      },
                                      _uid: 403,
                                      type: 'text',
                                      name: 'axis-label',
                                      children: []
                                    },
                                    {
                                      attribute: {
                                        x: 553.4999999999999,
                                        y: 11.999999999999998,
                                        text: '14:00',
                                        lineHeight: 12,
                                        textAlign: 'center',
                                        textBaseline: 'top',
                                        fontSize: 12,
                                        fill: '#89909d',
                                        fontWeight: 'normal',
                                        fillOpacity: 1
                                      },
                                      _uid: 404,
                                      type: 'text',
                                      name: 'axis-label',
                                      children: []
                                    },
                                    {
                                      attribute: {
                                        x: 635.4999999999999,
                                        y: 11.999999999999998,
                                        text: '16:00',
                                        lineHeight: 12,
                                        textAlign: 'center',
                                        textBaseline: 'top',
                                        fontSize: 12,
                                        fill: '#89909d',
                                        fontWeight: 'normal',
                                        fillOpacity: 1
                                      },
                                      _uid: 405,
                                      type: 'text',
                                      name: 'axis-label',
                                      children: []
                                    },
                                    {
                                      attribute: {
                                        x: 717.4999999999999,
                                        y: 11.999999999999998,
                                        text: '18:00',
                                        lineHeight: 12,
                                        textAlign: 'center',
                                        textBaseline: 'top',
                                        fontSize: 12,
                                        fill: '#89909d',
                                        fontWeight: 'normal',
                                        fillOpacity: 1
                                      },
                                      _uid: 406,
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
                pickable: false,
                zIndex: 100
              },
              _uid: 302,
              type: 'group',
              name: 'axis-left_64',
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
                        lineHeight: 15.600000000000001
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
                      text: 'value',
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
                      visible: false,
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
                      visible: false,
                      style: {
                        lineWidth: 1,
                        stroke: '#d9dde4',
                        strokeOpacity: 1
                      },
                      startSymbol: {},
                      endSymbol: {}
                    },
                    x: 47,
                    y: 26,
                    start: {
                      x: 0,
                      y: 0
                    },
                    end: {
                      x: 0,
                      y: 452
                    },
                    items: [
                      [
                        {
                          id: 0,
                          label: 0,
                          value: 1,
                          rawValue: 0
                        },
                        {
                          id: 5,
                          label: 5,
                          value: 0.75,
                          rawValue: 5
                        },
                        {
                          id: 10,
                          label: 10,
                          value: 0.5,
                          rawValue: 10
                        },
                        {
                          id: 15,
                          label: 15,
                          value: 0.25,
                          rawValue: 15
                        },
                        {
                          id: 20,
                          label: 20,
                          value: 0,
                          rawValue: 20
                        }
                      ]
                    ],
                    visible: true,
                    pickable: true,
                    orient: 'left',
                    panel: {
                      state: null
                    },
                    verticalFactor: 1,
                    verticalLimitSize: 253.8,
                    verticalMinSize: null
                  },
                  _uid: 303,
                  type: 'group',
                  name: 'axis',
                  children: [
                    {
                      attribute: {
                        x: 0,
                        y: 0,
                        pickable: false
                      },
                      _uid: 407,
                      type: 'group',
                      children: [
                        {
                          attribute: {
                            x: 0,
                            y: 0,
                            zIndex: 1
                          },
                          _uid: 408,
                          type: 'group',
                          name: 'axis-container',
                          children: [
                            {
                              attribute: {
                                x: 0,
                                y: 0,
                                pickable: false
                              },
                              _uid: 409,
                              type: 'group',
                              name: 'axis-label-container',
                              children: [
                                {
                                  attribute: {
                                    x: 0,
                                    y: 0,
                                    pickable: false
                                  },
                                  _uid: 410,
                                  type: 'group',
                                  name: 'axis-label-container-layer-0',
                                  children: [
                                    {
                                      attribute: {
                                        x: -12,
                                        y: 452,
                                        text: 0,
                                        lineHeight: 12,
                                        textAlign: 'end',
                                        textBaseline: 'middle',
                                        fontSize: 12,
                                        fill: '#89909d',
                                        fontWeight: 'normal',
                                        fillOpacity: 1
                                      },
                                      _uid: 411,
                                      type: 'text',
                                      name: 'axis-label',
                                      children: []
                                    },
                                    {
                                      attribute: {
                                        x: -12,
                                        y: 339,
                                        text: 5,
                                        lineHeight: 12,
                                        textAlign: 'end',
                                        textBaseline: 'middle',
                                        fontSize: 12,
                                        fill: '#89909d',
                                        fontWeight: 'normal',
                                        fillOpacity: 1
                                      },
                                      _uid: 412,
                                      type: 'text',
                                      name: 'axis-label',
                                      children: []
                                    },
                                    {
                                      attribute: {
                                        x: -12,
                                        y: 226,
                                        text: 10,
                                        lineHeight: 12,
                                        textAlign: 'end',
                                        textBaseline: 'middle',
                                        fontSize: 12,
                                        fill: '#89909d',
                                        fontWeight: 'normal',
                                        fillOpacity: 1
                                      },
                                      _uid: 413,
                                      type: 'text',
                                      name: 'axis-label',
                                      children: []
                                    },
                                    {
                                      attribute: {
                                        x: -12,
                                        y: 113,
                                        text: 15,
                                        lineHeight: 12,
                                        textAlign: 'end',
                                        textBaseline: 'middle',
                                        fontSize: 12,
                                        fill: '#89909d',
                                        fontWeight: 'normal',
                                        fillOpacity: 1
                                      },
                                      _uid: 414,
                                      type: 'text',
                                      name: 'axis-label',
                                      children: []
                                    },
                                    {
                                      attribute: {
                                        x: -12,
                                        y: 0,
                                        text: 20,
                                        lineHeight: 12,
                                        textAlign: 'end',
                                        textBaseline: 'middle',
                                        fontSize: 12,
                                        fill: '#89909d',
                                        fontWeight: 'normal',
                                        fillOpacity: 1
                                      },
                                      _uid: 415,
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
                pickable: false,
                zIndex: 50
              },
              _uid: 312,
              type: 'group',
              name: 'axis-left-grid_65',
              children: [
                {
                  attribute: {
                    style: {
                      lineWidth: 1,
                      stroke: '#f1f2f5',
                      strokeOpacity: 1,
                      lineDash: []
                    },
                    subGrid: {
                      visible: false,
                      style: {
                        lineWidth: 1,
                        stroke: '#f1f2f5',
                        strokeOpacity: 1,
                        lineDash: [4, 4]
                      },
                      type: 'line'
                    },
                    visible: true,
                    x: 47,
                    y: 26,
                    pickable: true,
                    type: 'line',
                    start: {
                      x: 0,
                      y: 0
                    },
                    end: {
                      x: 0,
                      y: 452
                    },
                    items: [
                      {
                        id: 0,
                        label: 0,
                        value: 1,
                        rawValue: 0
                      },
                      {
                        id: 5,
                        label: 5,
                        value: 0.75,
                        rawValue: 5
                      },
                      {
                        id: 10,
                        label: 10,
                        value: 0.5,
                        rawValue: 10
                      },
                      {
                        id: 15,
                        label: 15,
                        value: 0.25,
                        rawValue: 15
                      },
                      {
                        id: 20,
                        label: 20,
                        value: 0,
                        rawValue: 20
                      }
                    ],
                    verticalFactor: 1,
                    depth: 0,
                    length: 779
                  },
                  _uid: 313,
                  type: 'group',
                  name: 'axis-grid',
                  children: [
                    {
                      attribute: {
                        x: 0,
                        y: 0,
                        pickable: false
                      },
                      _uid: 416,
                      type: 'group',
                      children: [
                        {
                          attribute: {
                            path: 'M0,452L779,452',
                            z: 0,
                            lineWidth: 1,
                            stroke: '#f1f2f5',
                            strokeOpacity: 1,
                            lineDash: []
                          },
                          _uid: 417,
                          type: 'path',
                          name: 'axis-grid-line',
                          children: []
                        },
                        {
                          attribute: {
                            path: 'M0,339L779,339',
                            z: 0,
                            lineWidth: 1,
                            stroke: '#f1f2f5',
                            strokeOpacity: 1,
                            lineDash: []
                          },
                          _uid: 418,
                          type: 'path',
                          name: 'axis-grid-line',
                          children: []
                        },
                        {
                          attribute: {
                            path: 'M0,226L779,226',
                            z: 0,
                            lineWidth: 1,
                            stroke: '#f1f2f5',
                            strokeOpacity: 1,
                            lineDash: []
                          },
                          _uid: 419,
                          type: 'path',
                          name: 'axis-grid-line',
                          children: []
                        },
                        {
                          attribute: {
                            path: 'M0,113L779,113',
                            z: 0,
                            lineWidth: 1,
                            stroke: '#f1f2f5',
                            strokeOpacity: 1,
                            lineDash: []
                          },
                          _uid: 420,
                          type: 'path',
                          name: 'axis-grid-line',
                          children: []
                        },
                        {
                          attribute: {
                            path: 'M0,0L779,0',
                            z: 0,
                            lineWidth: 1,
                            stroke: '#f1f2f5',
                            strokeOpacity: 1,
                            lineDash: []
                          },
                          _uid: 421,
                          type: 'path',
                          name: 'axis-grid-line',
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
};

container.load(roughModule);

let arcList = [];
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
    const t = createText({ ...json.attribute, z: json.attribute.z || 0, keepDirIn3d: false });
    group.add(t);
    t.addEventListener('mousemove', () => {
      t.setAttribute('fill', 'red');
    });
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
