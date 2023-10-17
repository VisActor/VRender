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
  attribute: {},
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
            width: 981,
            height: 500,
            sizeAttrs: {
              x: 0,
              y: 0,
              width: 981,
              height: 500
            }
          },
          _uid: 14,
          type: 'group',
          name: 'root',
          children: [
            {
              attribute: {
                visible: true,
                clip: true,
                x: 68,
                y: 70,
                width: 845,
                height: 334,
                sizeAttrs: {
                  x: 68,
                  y: 70,
                  width: 845,
                  height: 334
                },
                pickable: false,
                zIndex: 450
              },
              _uid: 53,
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
                  _uid: 54,
                  type: 'group',
                  name: 'seriesGroup_area_5_7',
                  children: [
                    {
                      attribute: {
                        pickable: false,
                        zIndex: 300
                      },
                      _uid: 223,
                      type: 'group',
                      name: 'area_8',
                      children: [
                        {
                          attribute: {
                            y1: 0,
                            defined: true,
                            points: [
                              {
                                x: 66.71052631578947,
                                y: 305.75028000000003,
                                context: 0,
                                y1: 334
                              },
                              {
                                x: 155.65789473684208,
                                y: 307.73424,
                                context: 4,
                                y1: 334
                              },
                              {
                                x: 244.60526315789474,
                                y: 299.12372,
                                context: 8,
                                y1: 334
                              },
                              {
                                x: 333.5526315789474,
                                y: 272.16992,
                                context: 12,
                                y1: 334
                              },
                              {
                                x: 422.5,
                                y: 311.90256,
                                context: 16,
                                y1: 334
                              },
                              {
                                x: 511.4473684210526,
                                y: 297.71424,
                                context: 20,
                                y1: 334
                              },
                              {
                                x: 600.3947368421053,
                                y: 242.47732000000002,
                                context: 24,
                                y1: 334
                              },
                              {
                                x: 689.3421052631578,
                                y: 307.22656,
                                context: 28,
                                y1: 334
                              },
                              {
                                x: 778.2894736842105,
                                y: 209.00384,
                                context: 32,
                                y1: 334
                              }
                            ],
                            segments: null,
                            visible: true,
                            lineWidth: 2,
                            lineCap: 'round',
                            lineJoin: 'round',
                            fillOpacity: 0.2,
                            fill: '#1664FF',
                            stroke: ['#1664FF', false, false, false],
                            connectedType: 'none',
                            x: 0,
                            y: 0,
                            x1: 0,
                            pickable: true
                          },
                          _uid: 224,
                          type: 'area',
                          children: []
                        },
                        {
                          attribute: {
                            y1: 0,
                            defined: true,
                            points: [
                              {
                                x: 66.71052631578947,
                                y: 276.5186,
                                context: 1,
                                y1: 305.75028000000003
                              },
                              {
                                x: 155.65789473684208,
                                y: 281.10108,
                                context: 5,
                                y1: 307.73424
                              },
                              {
                                x: 244.60526315789474,
                                y: 275.24940000000004,
                                context: 9,
                                y1: 299.12372
                              },
                              {
                                x: 333.5526315789474,
                                y: 242.93824,
                                context: 13,
                                y1: 272.16992
                              },
                              {
                                x: 422.5,
                                y: 281.3616,
                                context: 17,
                                y1: 311.90256
                              },
                              {
                                x: 511.4473684210526,
                                y: 274.88867999999997,
                                context: 21,
                                y1: 297.71424
                              },
                              {
                                x: 600.3947368421053,
                                y: 207.53424,
                                context: 25,
                                y1: 242.47732000000002
                              },
                              {
                                x: 689.3421052631578,
                                y: 276.6856,
                                context: 29,
                                y1: 307.22656
                              },
                              {
                                x: 778.2894736842105,
                                y: 168.02872,
                                context: 33,
                                y1: 209.00384
                              }
                            ],
                            segments: null,
                            visible: true,
                            lineWidth: 2,
                            lineCap: 'round',
                            lineJoin: 'round',
                            fillOpacity: 0.2,
                            fill: '#1AC6FF',
                            stroke: ['#1AC6FF', false, false, false],
                            connectedType: 'none',
                            x: 0,
                            y: 0,
                            x1: 0,
                            pickable: true
                          },
                          _uid: 225,
                          type: 'area',
                          children: []
                        },
                        {
                          attribute: {
                            y1: 0,
                            defined: true,
                            points: [
                              {
                                x: 66.71052631578947,
                                y: 256.11788,
                                context: 2,
                                y1: 276.5186
                              },
                              {
                                x: 155.65789473684208,
                                y: 247.25352,
                                context: 6,
                                y1: 281.10108
                              },
                              {
                                x: 244.60526315789474,
                                y: 228.46268000000003,
                                context: 10,
                                y1: 275.24940000000004
                              },
                              {
                                x: 333.5526315789474,
                                y: 182.45752,
                                context: 14,
                                y1: 242.93824
                              },
                              {
                                x: 422.5,
                                y: 200.91436,
                                context: 18,
                                y1: 281.3616
                              },
                              {
                                x: 511.4473684210526,
                                y: 174.24111999999997,
                                context: 22,
                                y1: 274.88867999999997
                              },
                              {
                                x: 600.3947368421053,
                                y: 139.93932,
                                context: 26,
                                y1: 207.53424
                              },
                              {
                                x: 689.3421052631578,
                                y: 196.23835999999997,
                                context: 30,
                                y1: 276.6856
                              },
                              {
                                x: 778.2894736842105,
                                y: 98.42979999999999,
                                context: 34,
                                y1: 168.02872
                              }
                            ],
                            segments: null,
                            visible: true,
                            lineWidth: 2,
                            lineCap: 'round',
                            lineJoin: 'round',
                            fillOpacity: 0.2,
                            fill: '#FF8A00',
                            stroke: ['#FF8A00', false, false, false],
                            connectedType: 'none',
                            x: 0,
                            y: 0,
                            x1: 0,
                            pickable: true
                          },
                          _uid: 226,
                          type: 'area',
                          children: []
                        },
                        {
                          attribute: {
                            y1: 0,
                            defined: true,
                            points: [
                              {
                                x: 66.71052631578947,
                                y: 170.52036,
                                context: 3,
                                y1: 256.11788
                              },
                              {
                                x: 155.65789473684208,
                                y: 160.33336,
                                context: 7,
                                y1: 247.25352
                              },
                              {
                                x: 244.60526315789474,
                                y: 150.81436000000002,
                                context: 11,
                                y1: 228.46268000000003
                              },
                              {
                                x: 333.5526315789474,
                                y: 123.58,
                                context: 15,
                                y1: 182.45752
                              },
                              {
                                x: 422.5,
                                y: 114.08772,
                                context: 19,
                                y1: 200.91436
                              },
                              {
                                x: 511.4473684210526,
                                y: 91.93683999999999,
                                context: 23,
                                y1: 174.24111999999997
                              },
                              {
                                x: 600.3947368421053,
                                y: 70.85476,
                                context: 27,
                                y1: 139.93932
                              },
                              {
                                x: 689.3421052631578,
                                y: 42.611720000000005,
                                context: 31,
                                y1: 196.23835999999997
                              },
                              {
                                x: 778.2894736842105,
                                y: 23.206319999999995,
                                context: 35,
                                y1: 98.42979999999999
                              }
                            ],
                            segments: null,
                            visible: true,
                            lineWidth: 2,
                            lineCap: 'round',
                            lineJoin: 'round',
                            fillOpacity: 0.2,
                            fill: '#3CC780',
                            stroke: ['#3CC780', false, false, false],
                            connectedType: 'none',
                            x: 0,
                            y: 0,
                            x1: 0,
                            pickable: true
                          },
                          _uid: 227,
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
                      _uid: 186,
                      type: 'group',
                      name: 'point_10',
                      children: [
                        {
                          attribute: {
                            visible: true,
                            size: 8,
                            symbolType: 'circle',
                            lineWidth: 1,
                            stroke: '#202226',
                            fillOpacity: 1,
                            fill: '#1664FF',
                            x: 66.71052631578947,
                            y: 305.75028000000003,
                            imageAttrs: {
                              fill: '#1664FF'
                            },
                            pickable: true
                          },
                          _uid: 187,
                          type: 'symbol',
                          children: []
                        },
                        {
                          attribute: {
                            visible: true,
                            size: 8,
                            symbolType: 'circle',
                            lineWidth: 1,
                            stroke: '#202226',
                            fillOpacity: 1,
                            fill: '#1AC6FF',
                            x: 66.71052631578947,
                            y: 276.5186,
                            imageAttrs: {
                              fill: '#1AC6FF'
                            },
                            pickable: true
                          },
                          _uid: 188,
                          type: 'symbol',
                          children: []
                        },
                        {
                          attribute: {
                            visible: true,
                            size: 8,
                            symbolType: 'circle',
                            lineWidth: 1,
                            stroke: '#202226',
                            fillOpacity: 1,
                            fill: '#FF8A00',
                            x: 66.71052631578947,
                            y: 256.11788,
                            imageAttrs: {
                              fill: '#FF8A00'
                            },
                            pickable: true
                          },
                          _uid: 189,
                          type: 'symbol',
                          children: []
                        },
                        {
                          attribute: {
                            visible: true,
                            size: 8,
                            symbolType: 'circle',
                            lineWidth: 1,
                            stroke: '#202226',
                            fillOpacity: 1,
                            fill: '#3CC780',
                            x: 66.71052631578947,
                            y: 170.52036,
                            imageAttrs: {
                              fill: '#3CC780'
                            },
                            pickable: true
                          },
                          _uid: 190,
                          type: 'symbol',
                          children: []
                        },
                        {
                          attribute: {
                            visible: true,
                            size: 8,
                            symbolType: 'circle',
                            lineWidth: 1,
                            stroke: '#202226',
                            fillOpacity: 1,
                            fill: '#1664FF',
                            x: 155.65789473684208,
                            y: 307.73424,
                            imageAttrs: {
                              fill: '#1664FF'
                            },
                            pickable: true
                          },
                          _uid: 191,
                          type: 'symbol',
                          children: []
                        },
                        {
                          attribute: {
                            visible: true,
                            size: 8,
                            symbolType: 'circle',
                            lineWidth: 1,
                            stroke: '#202226',
                            fillOpacity: 1,
                            fill: '#1AC6FF',
                            x: 155.65789473684208,
                            y: 281.10108,
                            imageAttrs: {
                              fill: '#1AC6FF'
                            },
                            pickable: true
                          },
                          _uid: 192,
                          type: 'symbol',
                          children: []
                        },
                        {
                          attribute: {
                            visible: true,
                            size: 8,
                            symbolType: 'circle',
                            lineWidth: 1,
                            stroke: '#202226',
                            fillOpacity: 1,
                            fill: '#FF8A00',
                            x: 155.65789473684208,
                            y: 247.25352,
                            imageAttrs: {
                              fill: '#FF8A00'
                            },
                            pickable: true
                          },
                          _uid: 193,
                          type: 'symbol',
                          children: []
                        },
                        {
                          attribute: {
                            visible: true,
                            size: 8,
                            symbolType: 'circle',
                            lineWidth: 1,
                            stroke: '#202226',
                            fillOpacity: 1,
                            fill: '#3CC780',
                            x: 155.65789473684208,
                            y: 160.33336,
                            imageAttrs: {
                              fill: '#3CC780'
                            },
                            pickable: true
                          },
                          _uid: 194,
                          type: 'symbol',
                          children: []
                        },
                        {
                          attribute: {
                            visible: true,
                            size: 8,
                            symbolType: 'circle',
                            lineWidth: 1,
                            stroke: '#202226',
                            fillOpacity: 1,
                            fill: '#1664FF',
                            x: 244.60526315789474,
                            y: 299.12372,
                            imageAttrs: {
                              fill: '#1664FF'
                            },
                            pickable: true
                          },
                          _uid: 195,
                          type: 'symbol',
                          children: []
                        },
                        {
                          attribute: {
                            visible: true,
                            size: 8,
                            symbolType: 'circle',
                            lineWidth: 1,
                            stroke: '#202226',
                            fillOpacity: 1,
                            fill: '#1AC6FF',
                            x: 244.60526315789474,
                            y: 275.24940000000004,
                            imageAttrs: {
                              fill: '#1AC6FF'
                            },
                            pickable: true
                          },
                          _uid: 196,
                          type: 'symbol',
                          children: []
                        },
                        {
                          attribute: {
                            visible: true,
                            size: 8,
                            symbolType: 'circle',
                            lineWidth: 1,
                            stroke: '#202226',
                            fillOpacity: 1,
                            fill: '#FF8A00',
                            x: 244.60526315789474,
                            y: 228.46268000000003,
                            imageAttrs: {
                              fill: '#FF8A00'
                            },
                            pickable: true
                          },
                          _uid: 197,
                          type: 'symbol',
                          children: []
                        },
                        {
                          attribute: {
                            visible: true,
                            size: 8,
                            symbolType: 'circle',
                            lineWidth: 1,
                            stroke: '#202226',
                            fillOpacity: 1,
                            fill: '#3CC780',
                            x: 244.60526315789474,
                            y: 150.81436000000002,
                            imageAttrs: {
                              fill: '#3CC780'
                            },
                            pickable: true
                          },
                          _uid: 198,
                          type: 'symbol',
                          children: []
                        },
                        {
                          attribute: {
                            visible: true,
                            size: 8,
                            symbolType: 'circle',
                            lineWidth: 1,
                            stroke: '#202226',
                            fillOpacity: 1,
                            fill: '#1664FF',
                            x: 333.5526315789474,
                            y: 272.16992,
                            imageAttrs: {
                              fill: '#1664FF'
                            },
                            pickable: true
                          },
                          _uid: 199,
                          type: 'symbol',
                          children: []
                        },
                        {
                          attribute: {
                            visible: true,
                            size: 8,
                            symbolType: 'circle',
                            lineWidth: 1,
                            stroke: '#202226',
                            fillOpacity: 1,
                            fill: '#1AC6FF',
                            x: 333.5526315789474,
                            y: 242.93824,
                            imageAttrs: {
                              fill: '#1AC6FF'
                            },
                            pickable: true
                          },
                          _uid: 200,
                          type: 'symbol',
                          children: []
                        },
                        {
                          attribute: {
                            visible: true,
                            size: 8,
                            symbolType: 'circle',
                            lineWidth: 1,
                            stroke: '#202226',
                            fillOpacity: 1,
                            fill: '#FF8A00',
                            x: 333.5526315789474,
                            y: 182.45752,
                            imageAttrs: {
                              fill: '#FF8A00'
                            },
                            pickable: true
                          },
                          _uid: 201,
                          type: 'symbol',
                          children: []
                        },
                        {
                          attribute: {
                            visible: true,
                            size: 8,
                            symbolType: 'circle',
                            lineWidth: 1,
                            stroke: '#202226',
                            fillOpacity: 1,
                            fill: '#3CC780',
                            x: 333.5526315789474,
                            y: 123.58,
                            imageAttrs: {
                              fill: '#3CC780'
                            },
                            pickable: true
                          },
                          _uid: 202,
                          type: 'symbol',
                          children: []
                        },
                        {
                          attribute: {
                            visible: true,
                            size: 8,
                            symbolType: 'circle',
                            lineWidth: 1,
                            stroke: '#202226',
                            fillOpacity: 1,
                            fill: '#1664FF',
                            x: 422.5,
                            y: 311.90256,
                            imageAttrs: {
                              fill: '#1664FF'
                            },
                            pickable: true
                          },
                          _uid: 203,
                          type: 'symbol',
                          children: []
                        },
                        {
                          attribute: {
                            visible: true,
                            size: 8,
                            symbolType: 'circle',
                            lineWidth: 1,
                            stroke: '#202226',
                            fillOpacity: 1,
                            fill: '#1AC6FF',
                            x: 422.5,
                            y: 281.3616,
                            imageAttrs: {
                              fill: '#1AC6FF'
                            },
                            pickable: true
                          },
                          _uid: 204,
                          type: 'symbol',
                          children: []
                        },
                        {
                          attribute: {
                            visible: true,
                            size: 8,
                            symbolType: 'circle',
                            lineWidth: 1,
                            stroke: '#202226',
                            fillOpacity: 1,
                            fill: '#FF8A00',
                            x: 422.5,
                            y: 200.91436,
                            imageAttrs: {
                              fill: '#FF8A00'
                            },
                            pickable: true
                          },
                          _uid: 205,
                          type: 'symbol',
                          children: []
                        },
                        {
                          attribute: {
                            visible: true,
                            size: 8,
                            symbolType: 'circle',
                            lineWidth: 1,
                            stroke: '#202226',
                            fillOpacity: 1,
                            fill: '#3CC780',
                            x: 422.5,
                            y: 114.08772,
                            imageAttrs: {
                              fill: '#3CC780'
                            },
                            pickable: true
                          },
                          _uid: 206,
                          type: 'symbol',
                          children: []
                        },
                        {
                          attribute: {
                            visible: true,
                            size: 8,
                            symbolType: 'circle',
                            lineWidth: 1,
                            stroke: '#202226',
                            fillOpacity: 1,
                            fill: '#1664FF',
                            x: 511.4473684210526,
                            y: 297.71424,
                            imageAttrs: {
                              fill: '#1664FF'
                            },
                            pickable: true
                          },
                          _uid: 207,
                          type: 'symbol',
                          children: []
                        },
                        {
                          attribute: {
                            visible: true,
                            size: 8,
                            symbolType: 'circle',
                            lineWidth: 1,
                            stroke: '#202226',
                            fillOpacity: 1,
                            fill: '#1AC6FF',
                            x: 511.4473684210526,
                            y: 274.88867999999997,
                            imageAttrs: {
                              fill: '#1AC6FF'
                            },
                            pickable: true
                          },
                          _uid: 208,
                          type: 'symbol',
                          children: []
                        },
                        {
                          attribute: {
                            visible: true,
                            size: 8,
                            symbolType: 'circle',
                            lineWidth: 1,
                            stroke: '#202226',
                            fillOpacity: 1,
                            fill: '#FF8A00',
                            x: 511.4473684210526,
                            y: 174.24111999999997,
                            imageAttrs: {
                              fill: '#FF8A00'
                            },
                            pickable: true
                          },
                          _uid: 209,
                          type: 'symbol',
                          children: []
                        },
                        {
                          attribute: {
                            visible: true,
                            size: 8,
                            symbolType: 'circle',
                            lineWidth: 1,
                            stroke: '#202226',
                            fillOpacity: 1,
                            fill: '#3CC780',
                            x: 511.4473684210526,
                            y: 91.93683999999999,
                            imageAttrs: {
                              fill: '#3CC780'
                            },
                            pickable: true
                          },
                          _uid: 210,
                          type: 'symbol',
                          children: []
                        },
                        {
                          attribute: {
                            visible: true,
                            size: 8,
                            symbolType: 'circle',
                            lineWidth: 1,
                            stroke: '#202226',
                            fillOpacity: 1,
                            fill: '#1664FF',
                            x: 600.3947368421053,
                            y: 242.47732000000002,
                            imageAttrs: {
                              fill: '#1664FF'
                            },
                            pickable: true
                          },
                          _uid: 211,
                          type: 'symbol',
                          children: []
                        },
                        {
                          attribute: {
                            visible: true,
                            size: 8,
                            symbolType: 'circle',
                            lineWidth: 1,
                            stroke: '#202226',
                            fillOpacity: 1,
                            fill: '#1AC6FF',
                            x: 600.3947368421053,
                            y: 207.53424,
                            imageAttrs: {
                              fill: '#1AC6FF'
                            },
                            pickable: true
                          },
                          _uid: 212,
                          type: 'symbol',
                          children: []
                        },
                        {
                          attribute: {
                            visible: true,
                            size: 8,
                            symbolType: 'circle',
                            lineWidth: 1,
                            stroke: '#202226',
                            fillOpacity: 1,
                            fill: '#FF8A00',
                            x: 600.3947368421053,
                            y: 139.93932,
                            imageAttrs: {
                              fill: '#FF8A00'
                            },
                            pickable: true
                          },
                          _uid: 213,
                          type: 'symbol',
                          children: []
                        },
                        {
                          attribute: {
                            visible: true,
                            size: 8,
                            symbolType: 'circle',
                            lineWidth: 1,
                            stroke: '#202226',
                            fillOpacity: 1,
                            fill: '#3CC780',
                            x: 600.3947368421053,
                            y: 70.85476,
                            imageAttrs: {
                              fill: '#3CC780'
                            },
                            pickable: true
                          },
                          _uid: 214,
                          type: 'symbol',
                          children: []
                        },
                        {
                          attribute: {
                            visible: true,
                            size: 8,
                            symbolType: 'circle',
                            lineWidth: 1,
                            stroke: '#202226',
                            fillOpacity: 1,
                            fill: '#1664FF',
                            x: 689.3421052631578,
                            y: 307.22656,
                            imageAttrs: {
                              fill: '#1664FF'
                            },
                            pickable: true
                          },
                          _uid: 215,
                          type: 'symbol',
                          children: []
                        },
                        {
                          attribute: {
                            visible: true,
                            size: 8,
                            symbolType: 'circle',
                            lineWidth: 1,
                            stroke: '#202226',
                            fillOpacity: 1,
                            fill: '#1AC6FF',
                            x: 689.3421052631578,
                            y: 276.6856,
                            imageAttrs: {
                              fill: '#1AC6FF'
                            },
                            pickable: true
                          },
                          _uid: 216,
                          type: 'symbol',
                          children: []
                        },
                        {
                          attribute: {
                            visible: true,
                            size: 8,
                            symbolType: 'circle',
                            lineWidth: 1,
                            stroke: '#202226',
                            fillOpacity: 1,
                            fill: '#FF8A00',
                            x: 689.3421052631578,
                            y: 196.23835999999997,
                            imageAttrs: {
                              fill: '#FF8A00'
                            },
                            pickable: true
                          },
                          _uid: 217,
                          type: 'symbol',
                          children: []
                        },
                        {
                          attribute: {
                            visible: true,
                            size: 8,
                            symbolType: 'circle',
                            lineWidth: 1,
                            stroke: '#202226',
                            fillOpacity: 1,
                            fill: '#3CC780',
                            x: 689.3421052631578,
                            y: 42.611720000000005,
                            imageAttrs: {
                              fill: '#3CC780'
                            },
                            pickable: true
                          },
                          _uid: 218,
                          type: 'symbol',
                          children: []
                        },
                        {
                          attribute: {
                            visible: true,
                            size: 8,
                            symbolType: 'circle',
                            lineWidth: 1,
                            stroke: '#202226',
                            fillOpacity: 1,
                            fill: '#1664FF',
                            x: 778.2894736842105,
                            y: 209.00384,
                            imageAttrs: {
                              fill: '#1664FF'
                            },
                            pickable: true
                          },
                          _uid: 219,
                          type: 'symbol',
                          children: []
                        },
                        {
                          attribute: {
                            visible: true,
                            size: 8,
                            symbolType: 'circle',
                            lineWidth: 1,
                            stroke: '#202226',
                            fillOpacity: 1,
                            fill: '#1AC6FF',
                            x: 778.2894736842105,
                            y: 168.02872,
                            imageAttrs: {
                              fill: '#1AC6FF'
                            },
                            pickable: true
                          },
                          _uid: 220,
                          type: 'symbol',
                          children: []
                        },
                        {
                          attribute: {
                            visible: true,
                            size: 8,
                            symbolType: 'circle',
                            lineWidth: 1,
                            stroke: '#202226',
                            fillOpacity: 1,
                            fill: '#FF8A00',
                            x: 778.2894736842105,
                            y: 98.42979999999999,
                            imageAttrs: {
                              fill: '#FF8A00'
                            },
                            pickable: true
                          },
                          _uid: 221,
                          type: 'symbol',
                          children: []
                        },
                        {
                          attribute: {
                            visible: true,
                            size: 8,
                            symbolType: 'circle',
                            lineWidth: 1,
                            stroke: '#202226',
                            fillOpacity: 1,
                            fill: '#3CC780',
                            x: 778.2894736842105,
                            y: 23.206319999999995,
                            imageAttrs: {
                              fill: '#3CC780'
                            },
                            pickable: true
                          },
                          _uid: 222,
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
              _uid: 15,
              type: 'group',
              name: 'axis-bottom_20',
              children: [
                {
                  attribute: {
                    title: {
                      space: 8,
                      padding: 0,
                      textStyle: {
                        fontSize: 12,
                        fill: '#888c93',
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
                      text: 'type',
                      maxWidth: null
                    },
                    label: {
                      visible: true,
                      inside: false,
                      space: 8,
                      padding: 0,
                      style: {
                        fontSize: 12,
                        fill: '#bbbdc3',
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
                        stroke: '#4b4f54',
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
                        stroke: '#4b4f54',
                        strokeOpacity: 1
                      },
                      state: null
                    },
                    line: {
                      visible: true,
                      style: {
                        lineWidth: 1,
                        stroke: '#4b4f54',
                        strokeOpacity: 1
                      },
                      startSymbol: {},
                      endSymbol: {}
                    },
                    x: 68,
                    y: 404,
                    start: {
                      x: 0,
                      y: 0
                    },
                    end: {
                      x: 845,
                      y: 0
                    },
                    items: [
                      [
                        {
                          id: 'Nail polish',
                          label: 'Nail polish',
                          value: 0.07894736842105263,
                          rawValue: 'Nail polish'
                        },
                        {
                          id: 'Eyebrow pencil',
                          label: 'Eyebrow pencil',
                          value: 0.18421052631578944,
                          rawValue: 'Eyebrow pencil'
                        },
                        {
                          id: 'Rouge',
                          label: 'Rouge',
                          value: 0.2894736842105263,
                          rawValue: 'Rouge'
                        },
                        {
                          id: 'Lipstick',
                          label: 'Lipstick',
                          value: 0.3947368421052632,
                          rawValue: 'Lipstick'
                        },
                        {
                          id: 'Eyeshadows',
                          label: 'Eyeshadows',
                          value: 0.5,
                          rawValue: 'Eyeshadows'
                        },
                        {
                          id: 'Eyeliner',
                          label: 'Eyeliner',
                          value: 0.6052631578947368,
                          rawValue: 'Eyeliner'
                        },
                        {
                          id: 'Foundation',
                          label: 'Foundation',
                          value: 0.7105263157894738,
                          rawValue: 'Foundation'
                        },
                        {
                          id: 'Lip gloss',
                          label: 'Lip gloss',
                          value: 0.8157894736842104,
                          rawValue: 'Lip gloss'
                        },
                        {
                          id: 'Mascara',
                          label: 'Mascara',
                          value: 0.9210526315789473,
                          rawValue: 'Mascara'
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
                    verticalLimitSize: 150,
                    verticalMinSize: null
                  },
                  _uid: 16,
                  type: 'group',
                  name: 'axis',
                  children: [
                    {
                      attribute: {
                        x: 0,
                        y: 0,
                        pickable: false
                      },
                      _uid: 127,
                      type: 'group',
                      children: [
                        {
                          attribute: {
                            x: 0,
                            y: 0,
                            zIndex: 1
                          },
                          _uid: 128,
                          type: 'group',
                          name: 'axis-container',
                          children: [
                            {
                              attribute: {
                                visible: true,
                                lineStyle: {
                                  lineWidth: 1,
                                  stroke: '#4b4f54',
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
                                    x: 845,
                                    y: 0
                                  }
                                ]
                              },
                              _uid: 129,
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
                                        x: 845,
                                        y: 0
                                      }
                                    ],
                                    lineWidth: 1,
                                    stroke: '#4b4f54',
                                    strokeOpacity: 1,
                                    fill: false,
                                    closePath: false
                                  },
                                  _uid: 130,
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
                              _uid: 131,
                              type: 'group',
                              name: 'axis-tick-container',
                              children: [
                                {
                                  attribute: {
                                    points: [
                                      {
                                        x: 66.71052631578947,
                                        y: 0
                                      },
                                      {
                                        x: 66.71052631578947,
                                        y: 4
                                      }
                                    ],
                                    lineWidth: 1,
                                    stroke: '#4b4f54',
                                    strokeOpacity: 1
                                  },
                                  _uid: 132,
                                  type: 'line',
                                  name: 'axis-tick',
                                  children: []
                                },
                                {
                                  attribute: {
                                    points: [
                                      {
                                        x: 155.65789473684208,
                                        y: 0
                                      },
                                      {
                                        x: 155.65789473684208,
                                        y: 4
                                      }
                                    ],
                                    lineWidth: 1,
                                    stroke: '#4b4f54',
                                    strokeOpacity: 1
                                  },
                                  _uid: 133,
                                  type: 'line',
                                  name: 'axis-tick',
                                  children: []
                                },
                                {
                                  attribute: {
                                    points: [
                                      {
                                        x: 244.60526315789474,
                                        y: 0
                                      },
                                      {
                                        x: 244.60526315789474,
                                        y: 4
                                      }
                                    ],
                                    lineWidth: 1,
                                    stroke: '#4b4f54',
                                    strokeOpacity: 1
                                  },
                                  _uid: 134,
                                  type: 'line',
                                  name: 'axis-tick',
                                  children: []
                                },
                                {
                                  attribute: {
                                    points: [
                                      {
                                        x: 333.5526315789474,
                                        y: 0
                                      },
                                      {
                                        x: 333.5526315789474,
                                        y: 4
                                      }
                                    ],
                                    lineWidth: 1,
                                    stroke: '#4b4f54',
                                    strokeOpacity: 1
                                  },
                                  _uid: 135,
                                  type: 'line',
                                  name: 'axis-tick',
                                  children: []
                                },
                                {
                                  attribute: {
                                    points: [
                                      {
                                        x: 422.5,
                                        y: 0
                                      },
                                      {
                                        x: 422.5,
                                        y: 4
                                      }
                                    ],
                                    lineWidth: 1,
                                    stroke: '#4b4f54',
                                    strokeOpacity: 1
                                  },
                                  _uid: 136,
                                  type: 'line',
                                  name: 'axis-tick',
                                  children: []
                                },
                                {
                                  attribute: {
                                    points: [
                                      {
                                        x: 511.4473684210526,
                                        y: 0
                                      },
                                      {
                                        x: 511.4473684210526,
                                        y: 4
                                      }
                                    ],
                                    lineWidth: 1,
                                    stroke: '#4b4f54',
                                    strokeOpacity: 1
                                  },
                                  _uid: 137,
                                  type: 'line',
                                  name: 'axis-tick',
                                  children: []
                                },
                                {
                                  attribute: {
                                    points: [
                                      {
                                        x: 600.3947368421053,
                                        y: 0
                                      },
                                      {
                                        x: 600.3947368421053,
                                        y: 4
                                      }
                                    ],
                                    lineWidth: 1,
                                    stroke: '#4b4f54',
                                    strokeOpacity: 1
                                  },
                                  _uid: 138,
                                  type: 'line',
                                  name: 'axis-tick',
                                  children: []
                                },
                                {
                                  attribute: {
                                    points: [
                                      {
                                        x: 689.3421052631578,
                                        y: 0
                                      },
                                      {
                                        x: 689.3421052631578,
                                        y: 4
                                      }
                                    ],
                                    lineWidth: 1,
                                    stroke: '#4b4f54',
                                    strokeOpacity: 1
                                  },
                                  _uid: 139,
                                  type: 'line',
                                  name: 'axis-tick',
                                  children: []
                                },
                                {
                                  attribute: {
                                    points: [
                                      {
                                        x: 778.2894736842105,
                                        y: 0
                                      },
                                      {
                                        x: 778.2894736842105,
                                        y: 4
                                      }
                                    ],
                                    lineWidth: 1,
                                    stroke: '#4b4f54',
                                    strokeOpacity: 1
                                  },
                                  _uid: 140,
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
                              _uid: 141,
                              type: 'group',
                              name: 'axis-label-container',
                              children: [
                                {
                                  attribute: {
                                    x: 0,
                                    y: 0,
                                    pickable: false
                                  },
                                  _uid: 142,
                                  type: 'group',
                                  name: 'axis-label-container-layer-0',
                                  children: [
                                    {
                                      attribute: {
                                        x: 66.71052631578947,
                                        y: 12,
                                        text: 'Nail polish',
                                        lineHeight: 12,
                                        textAlign: 'center',
                                        textBaseline: 'top',
                                        fontSize: 12,
                                        fill: '#bbbdc3',
                                        fontWeight: 'normal',
                                        fillOpacity: 1
                                      },
                                      _uid: 143,
                                      type: 'text',
                                      name: 'axis-label',
                                      children: []
                                    },
                                    {
                                      attribute: {
                                        x: 155.65789473684208,
                                        y: 12,
                                        text: 'Eyebrow pencil',
                                        lineHeight: 12,
                                        textAlign: 'center',
                                        textBaseline: 'top',
                                        fontSize: 12,
                                        fill: '#bbbdc3',
                                        fontWeight: 'normal',
                                        fillOpacity: 1
                                      },
                                      _uid: 144,
                                      type: 'text',
                                      name: 'axis-label',
                                      children: []
                                    },
                                    {
                                      attribute: {
                                        x: 244.60526315789474,
                                        y: 12,
                                        text: 'Rouge',
                                        lineHeight: 12,
                                        textAlign: 'center',
                                        textBaseline: 'top',
                                        fontSize: 12,
                                        fill: '#bbbdc3',
                                        fontWeight: 'normal',
                                        fillOpacity: 1
                                      },
                                      _uid: 145,
                                      type: 'text',
                                      name: 'axis-label',
                                      children: []
                                    },
                                    {
                                      attribute: {
                                        x: 333.5526315789474,
                                        y: 12,
                                        text: 'Lipstick',
                                        lineHeight: 12,
                                        textAlign: 'center',
                                        textBaseline: 'top',
                                        fontSize: 12,
                                        fill: '#bbbdc3',
                                        fontWeight: 'normal',
                                        fillOpacity: 1
                                      },
                                      _uid: 146,
                                      type: 'text',
                                      name: 'axis-label',
                                      children: []
                                    },
                                    {
                                      attribute: {
                                        x: 422.5,
                                        y: 12,
                                        text: 'Eyeshadows',
                                        lineHeight: 12,
                                        textAlign: 'center',
                                        textBaseline: 'top',
                                        fontSize: 12,
                                        fill: '#bbbdc3',
                                        fontWeight: 'normal',
                                        fillOpacity: 1
                                      },
                                      _uid: 147,
                                      type: 'text',
                                      name: 'axis-label',
                                      children: []
                                    },
                                    {
                                      attribute: {
                                        x: 511.4473684210526,
                                        y: 12,
                                        text: 'Eyeliner',
                                        lineHeight: 12,
                                        textAlign: 'center',
                                        textBaseline: 'top',
                                        fontSize: 12,
                                        fill: '#bbbdc3',
                                        fontWeight: 'normal',
                                        fillOpacity: 1
                                      },
                                      _uid: 148,
                                      type: 'text',
                                      name: 'axis-label',
                                      children: []
                                    },
                                    {
                                      attribute: {
                                        x: 600.3947368421053,
                                        y: 12,
                                        text: 'Foundation',
                                        lineHeight: 12,
                                        textAlign: 'center',
                                        textBaseline: 'top',
                                        fontSize: 12,
                                        fill: '#bbbdc3',
                                        fontWeight: 'normal',
                                        fillOpacity: 1
                                      },
                                      _uid: 149,
                                      type: 'text',
                                      name: 'axis-label',
                                      children: []
                                    },
                                    {
                                      attribute: {
                                        x: 689.3421052631578,
                                        y: 12,
                                        text: 'Lip gloss',
                                        lineHeight: 12,
                                        textAlign: 'center',
                                        textBaseline: 'top',
                                        fontSize: 12,
                                        fill: '#bbbdc3',
                                        fontWeight: 'normal',
                                        fillOpacity: 1
                                      },
                                      _uid: 150,
                                      type: 'text',
                                      name: 'axis-label',
                                      children: []
                                    },
                                    {
                                      attribute: {
                                        x: 778.2894736842105,
                                        y: 12,
                                        text: 'Mascara',
                                        lineHeight: 12,
                                        textAlign: 'center',
                                        textBaseline: 'top',
                                        fontSize: 12,
                                        fill: '#bbbdc3',
                                        fontWeight: 'normal',
                                        fillOpacity: 1
                                      },
                                      _uid: 151,
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
              _uid: 25,
              type: 'group',
              name: 'axis-left_23',
              children: [
                {
                  attribute: {
                    title: {
                      space: 12,
                      padding: 0,
                      textStyle: {
                        fontSize: 12,
                        fill: '#888c93',
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
                        fill: '#bbbdc3',
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
                        stroke: '#4b4f54',
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
                        stroke: '#4b4f54',
                        strokeOpacity: 1
                      },
                      state: null
                    },
                    line: {
                      visible: false,
                      style: {
                        lineWidth: 1,
                        stroke: '#4b4f54',
                        strokeOpacity: 1
                      },
                      startSymbol: {},
                      endSymbol: {}
                    },
                    x: 68,
                    y: 70,
                    start: {
                      x: 0,
                      y: 0
                    },
                    end: {
                      x: 0,
                      y: 334
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
                          id: 10000,
                          label: 10000,
                          value: 0.7999999999999999,
                          rawValue: 10000
                        },
                        {
                          id: 20000,
                          label: 20000,
                          value: 0.6,
                          rawValue: 20000
                        },
                        {
                          id: 30000,
                          label: 30000,
                          value: 0.39999999999999997,
                          rawValue: 30000
                        },
                        {
                          id: 40000,
                          label: 40000,
                          value: 0.19999999999999996,
                          rawValue: 40000
                        },
                        {
                          id: 50000,
                          label: 50000,
                          value: 0,
                          rawValue: 50000
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
                    verticalLimitSize: 294.3,
                    verticalMinSize: null
                  },
                  _uid: 26,
                  type: 'group',
                  name: 'axis',
                  children: [
                    {
                      attribute: {
                        x: 0,
                        y: 0,
                        pickable: false
                      },
                      _uid: 152,
                      type: 'group',
                      children: [
                        {
                          attribute: {
                            x: 0,
                            y: 0,
                            zIndex: 1
                          },
                          _uid: 153,
                          type: 'group',
                          name: 'axis-container',
                          children: [
                            {
                              attribute: {
                                x: 0,
                                y: 0,
                                pickable: false
                              },
                              _uid: 154,
                              type: 'group',
                              name: 'axis-label-container',
                              children: [
                                {
                                  attribute: {
                                    x: 0,
                                    y: 0,
                                    pickable: false
                                  },
                                  _uid: 155,
                                  type: 'group',
                                  name: 'axis-label-container-layer-0',
                                  children: [
                                    {
                                      attribute: {
                                        x: -12,
                                        y: 334,
                                        text: 0,
                                        lineHeight: 12,
                                        textAlign: 'end',
                                        textBaseline: 'middle',
                                        fontSize: 12,
                                        fill: '#bbbdc3',
                                        fontWeight: 'normal',
                                        fillOpacity: 1
                                      },
                                      _uid: 156,
                                      type: 'text',
                                      name: 'axis-label',
                                      children: []
                                    },
                                    {
                                      attribute: {
                                        x: -12,
                                        y: 267.2,
                                        text: 10000,
                                        lineHeight: 12,
                                        textAlign: 'end',
                                        textBaseline: 'middle',
                                        fontSize: 12,
                                        fill: '#bbbdc3',
                                        fontWeight: 'normal',
                                        fillOpacity: 1
                                      },
                                      _uid: 157,
                                      type: 'text',
                                      name: 'axis-label',
                                      children: []
                                    },
                                    {
                                      attribute: {
                                        x: -12,
                                        y: 200.4,
                                        text: 20000,
                                        lineHeight: 12,
                                        textAlign: 'end',
                                        textBaseline: 'middle',
                                        fontSize: 12,
                                        fill: '#bbbdc3',
                                        fontWeight: 'normal',
                                        fillOpacity: 1
                                      },
                                      _uid: 158,
                                      type: 'text',
                                      name: 'axis-label',
                                      children: []
                                    },
                                    {
                                      attribute: {
                                        x: -12,
                                        y: 133.6,
                                        text: 30000,
                                        lineHeight: 12,
                                        textAlign: 'end',
                                        textBaseline: 'middle',
                                        fontSize: 12,
                                        fill: '#bbbdc3',
                                        fontWeight: 'normal',
                                        fillOpacity: 1
                                      },
                                      _uid: 159,
                                      type: 'text',
                                      name: 'axis-label',
                                      children: []
                                    },
                                    {
                                      attribute: {
                                        x: -12,
                                        y: 66.79999999999998,
                                        text: 40000,
                                        lineHeight: 12,
                                        textAlign: 'end',
                                        textBaseline: 'middle',
                                        fontSize: 12,
                                        fill: '#bbbdc3',
                                        fontWeight: 'normal',
                                        fillOpacity: 1
                                      },
                                      _uid: 160,
                                      type: 'text',
                                      name: 'axis-label',
                                      children: []
                                    },
                                    {
                                      attribute: {
                                        x: -12,
                                        y: 0,
                                        text: 50000,
                                        lineHeight: 12,
                                        textAlign: 'end',
                                        textBaseline: 'middle',
                                        fontSize: 12,
                                        fill: '#bbbdc3',
                                        fontWeight: 'normal',
                                        fillOpacity: 1
                                      },
                                      _uid: 161,
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
              _uid: 35,
              type: 'group',
              name: 'axis-left-grid_24',
              children: [
                {
                  attribute: {
                    style: {
                      lineWidth: 1,
                      stroke: '#404349',
                      strokeOpacity: 1,
                      lineDash: []
                    },
                    subGrid: {
                      visible: false,
                      style: {
                        lineWidth: 1,
                        stroke: '#404349',
                        strokeOpacity: 1,
                        lineDash: [4, 4]
                      },
                      type: 'line'
                    },
                    visible: true,
                    x: 68,
                    y: 70,
                    pickable: true,
                    type: 'line',
                    start: {
                      x: 0,
                      y: 0
                    },
                    end: {
                      x: 0,
                      y: 334
                    },
                    items: [
                      {
                        id: 0,
                        label: 0,
                        value: 1,
                        rawValue: 0
                      },
                      {
                        id: 10000,
                        label: 10000,
                        value: 0.7999999999999999,
                        rawValue: 10000
                      },
                      {
                        id: 20000,
                        label: 20000,
                        value: 0.6,
                        rawValue: 20000
                      },
                      {
                        id: 30000,
                        label: 30000,
                        value: 0.39999999999999997,
                        rawValue: 30000
                      },
                      {
                        id: 40000,
                        label: 40000,
                        value: 0.19999999999999996,
                        rawValue: 40000
                      },
                      {
                        id: 50000,
                        label: 50000,
                        value: 0,
                        rawValue: 50000
                      }
                    ],
                    verticalFactor: 1,
                    depth: 0,
                    length: 845
                  },
                  _uid: 36,
                  type: 'group',
                  name: 'axis-grid',
                  children: [
                    {
                      attribute: {
                        x: 0,
                        y: 0,
                        pickable: false
                      },
                      _uid: 162,
                      type: 'group',
                      children: [
                        {
                          attribute: {
                            path: 'M0,334L845,334',
                            z: 0,
                            lineWidth: 1,
                            stroke: '#404349',
                            strokeOpacity: 1,
                            lineDash: []
                          },
                          _uid: 163,
                          type: 'path',
                          name: 'axis-grid-line',
                          children: []
                        },
                        {
                          attribute: {
                            path: 'M0,267.2L845,267.2',
                            z: 0,
                            lineWidth: 1,
                            stroke: '#404349',
                            strokeOpacity: 1,
                            lineDash: []
                          },
                          _uid: 164,
                          type: 'path',
                          name: 'axis-grid-line',
                          children: []
                        },
                        {
                          attribute: {
                            path: 'M0,200.4L845,200.4',
                            z: 0,
                            lineWidth: 1,
                            stroke: '#404349',
                            strokeOpacity: 1,
                            lineDash: []
                          },
                          _uid: 165,
                          type: 'path',
                          name: 'axis-grid-line',
                          children: []
                        },
                        {
                          attribute: {
                            path: 'M0,133.6L845,133.6',
                            z: 0,
                            lineWidth: 1,
                            stroke: '#404349',
                            strokeOpacity: 1,
                            lineDash: []
                          },
                          _uid: 166,
                          type: 'path',
                          name: 'axis-grid-line',
                          children: []
                        },
                        {
                          attribute: {
                            path: 'M0,66.79999999999998L845,66.79999999999998',
                            z: 0,
                            lineWidth: 1,
                            stroke: '#404349',
                            strokeOpacity: 1,
                            lineDash: []
                          },
                          _uid: 167,
                          type: 'path',
                          name: 'axis-grid-line',
                          children: []
                        },
                        {
                          attribute: {
                            path: 'M0,0L845,0',
                            z: 0,
                            lineWidth: 1,
                            stroke: '#404349',
                            strokeOpacity: 1,
                            lineDash: []
                          },
                          _uid: 168,
                          type: 'path',
                          name: 'axis-grid-line',
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
              _uid: 39,
              type: 'group',
              name: 'axis-right_27',
              children: [
                {
                  attribute: {
                    title: {
                      space: 12,
                      padding: 0,
                      textStyle: {
                        fontSize: 12,
                        fill: '#888c93',
                        fontWeight: 'normal',
                        fillOpacity: 1,
                        textAlign: 'center',
                        textBaseline: 'bottom',
                        lineHeight: 15.600000000000001
                      },
                      autoRotate: false,
                      angle: 1.5707963267948966,
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
                        fill: '#bbbdc3',
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
                        stroke: '#4b4f54',
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
                        stroke: '#4b4f54',
                        strokeOpacity: 1
                      },
                      state: null
                    },
                    line: {
                      visible: false,
                      style: {
                        lineWidth: 1,
                        stroke: '#4b4f54',
                        strokeOpacity: 1
                      },
                      startSymbol: {},
                      endSymbol: {}
                    },
                    x: 913,
                    y: 70,
                    start: {
                      x: 0,
                      y: 0
                    },
                    end: {
                      x: 0,
                      y: 334
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
                          id: 10000,
                          label: 10000,
                          value: 0.7999999999999999,
                          rawValue: 10000
                        },
                        {
                          id: 20000,
                          label: 20000,
                          value: 0.6,
                          rawValue: 20000
                        },
                        {
                          id: 30000,
                          label: 30000,
                          value: 0.39999999999999997,
                          rawValue: 30000
                        },
                        {
                          id: 40000,
                          label: 40000,
                          value: 0.19999999999999996,
                          rawValue: 40000
                        },
                        {
                          id: 50000,
                          label: 50000,
                          value: 0,
                          rawValue: 50000
                        }
                      ]
                    ],
                    visible: true,
                    pickable: true,
                    orient: 'right',
                    panel: {
                      state: null
                    },
                    verticalFactor: -1,
                    verticalLimitSize: 294.3,
                    verticalMinSize: null
                  },
                  _uid: 40,
                  type: 'group',
                  name: 'axis',
                  children: [
                    {
                      attribute: {
                        x: 0,
                        y: 0,
                        pickable: false
                      },
                      _uid: 169,
                      type: 'group',
                      children: [
                        {
                          attribute: {
                            x: 0,
                            y: 0,
                            zIndex: 1
                          },
                          _uid: 170,
                          type: 'group',
                          name: 'axis-container',
                          children: [
                            {
                              attribute: {
                                x: 0,
                                y: 0,
                                pickable: false
                              },
                              _uid: 171,
                              type: 'group',
                              name: 'axis-label-container',
                              children: [
                                {
                                  attribute: {
                                    x: 0,
                                    y: 0,
                                    pickable: false
                                  },
                                  _uid: 172,
                                  type: 'group',
                                  name: 'axis-label-container-layer-0',
                                  children: [
                                    {
                                      attribute: {
                                        x: 12,
                                        y: 334,
                                        text: 0,
                                        lineHeight: 12,
                                        textAlign: 'start',
                                        textBaseline: 'middle',
                                        fontSize: 12,
                                        fill: '#bbbdc3',
                                        fontWeight: 'normal',
                                        fillOpacity: 1
                                      },
                                      _uid: 173,
                                      type: 'text',
                                      name: 'axis-label',
                                      children: []
                                    },
                                    {
                                      attribute: {
                                        x: 12,
                                        y: 267.2,
                                        text: 10000,
                                        lineHeight: 12,
                                        textAlign: 'start',
                                        textBaseline: 'middle',
                                        fontSize: 12,
                                        fill: '#bbbdc3',
                                        fontWeight: 'normal',
                                        fillOpacity: 1
                                      },
                                      _uid: 174,
                                      type: 'text',
                                      name: 'axis-label',
                                      children: []
                                    },
                                    {
                                      attribute: {
                                        x: 12,
                                        y: 200.4,
                                        text: 20000,
                                        lineHeight: 12,
                                        textAlign: 'start',
                                        textBaseline: 'middle',
                                        fontSize: 12,
                                        fill: '#bbbdc3',
                                        fontWeight: 'normal',
                                        fillOpacity: 1
                                      },
                                      _uid: 175,
                                      type: 'text',
                                      name: 'axis-label',
                                      children: []
                                    },
                                    {
                                      attribute: {
                                        x: 12,
                                        y: 133.6,
                                        text: 30000,
                                        lineHeight: 12,
                                        textAlign: 'start',
                                        textBaseline: 'middle',
                                        fontSize: 12,
                                        fill: '#bbbdc3',
                                        fontWeight: 'normal',
                                        fillOpacity: 1
                                      },
                                      _uid: 176,
                                      type: 'text',
                                      name: 'axis-label',
                                      children: []
                                    },
                                    {
                                      attribute: {
                                        x: 12,
                                        y: 66.79999999999998,
                                        text: 40000,
                                        lineHeight: 12,
                                        textAlign: 'start',
                                        textBaseline: 'middle',
                                        fontSize: 12,
                                        fill: '#bbbdc3',
                                        fontWeight: 'normal',
                                        fillOpacity: 1
                                      },
                                      _uid: 177,
                                      type: 'text',
                                      name: 'axis-label',
                                      children: []
                                    },
                                    {
                                      attribute: {
                                        x: 12,
                                        y: 0,
                                        text: 50000,
                                        lineHeight: 12,
                                        textAlign: 'start',
                                        textBaseline: 'middle',
                                        fontSize: 12,
                                        fill: '#bbbdc3',
                                        fontWeight: 'normal',
                                        fillOpacity: 1
                                      },
                                      _uid: 178,
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
              _uid: 49,
              type: 'group',
              name: 'axis-right-grid_28',
              children: [
                {
                  attribute: {
                    style: {
                      lineWidth: 1,
                      stroke: '#404349',
                      strokeOpacity: 1,
                      lineDash: []
                    },
                    subGrid: {
                      visible: false,
                      style: {
                        lineWidth: 1,
                        stroke: '#404349',
                        strokeOpacity: 1,
                        lineDash: [4, 4]
                      },
                      type: 'line'
                    },
                    visible: true,
                    x: 913,
                    y: 70,
                    pickable: true,
                    type: 'line',
                    start: {
                      x: 0,
                      y: 0
                    },
                    end: {
                      x: 0,
                      y: 334
                    },
                    items: [
                      {
                        id: 0,
                        label: 0,
                        value: 1,
                        rawValue: 0
                      },
                      {
                        id: 10000,
                        label: 10000,
                        value: 0.7999999999999999,
                        rawValue: 10000
                      },
                      {
                        id: 20000,
                        label: 20000,
                        value: 0.6,
                        rawValue: 20000
                      },
                      {
                        id: 30000,
                        label: 30000,
                        value: 0.39999999999999997,
                        rawValue: 30000
                      },
                      {
                        id: 40000,
                        label: 40000,
                        value: 0.19999999999999996,
                        rawValue: 40000
                      },
                      {
                        id: 50000,
                        label: 50000,
                        value: 0,
                        rawValue: 50000
                      }
                    ],
                    verticalFactor: -1,
                    depth: 0,
                    length: 845
                  },
                  _uid: 50,
                  type: 'group',
                  name: 'axis-grid',
                  children: [
                    {
                      attribute: {
                        x: 0,
                        y: 0,
                        pickable: false
                      },
                      _uid: 179,
                      type: 'group',
                      children: [
                        {
                          attribute: {
                            path: 'M0,334L-845,334',
                            z: 0,
                            lineWidth: 1,
                            stroke: '#404349',
                            strokeOpacity: 1,
                            lineDash: []
                          },
                          _uid: 180,
                          type: 'path',
                          name: 'axis-grid-line',
                          children: []
                        },
                        {
                          attribute: {
                            path: 'M0,267.2L-845,267.2',
                            z: 0,
                            lineWidth: 1,
                            stroke: '#404349',
                            strokeOpacity: 1,
                            lineDash: []
                          },
                          _uid: 181,
                          type: 'path',
                          name: 'axis-grid-line',
                          children: []
                        },
                        {
                          attribute: {
                            path: 'M0,200.4L-845,200.4',
                            z: 0,
                            lineWidth: 1,
                            stroke: '#404349',
                            strokeOpacity: 1,
                            lineDash: []
                          },
                          _uid: 182,
                          type: 'path',
                          name: 'axis-grid-line',
                          children: []
                        },
                        {
                          attribute: {
                            path: 'M0,133.6L-845,133.6',
                            z: 0,
                            lineWidth: 1,
                            stroke: '#404349',
                            strokeOpacity: 1,
                            lineDash: []
                          },
                          _uid: 183,
                          type: 'path',
                          name: 'axis-grid-line',
                          children: []
                        },
                        {
                          attribute: {
                            path: 'M0,66.79999999999998L-845,66.79999999999998',
                            z: 0,
                            lineWidth: 1,
                            stroke: '#404349',
                            strokeOpacity: 1,
                            lineDash: []
                          },
                          _uid: 184,
                          type: 'path',
                          name: 'axis-grid-line',
                          children: []
                        },
                        {
                          attribute: {
                            path: 'M0,0L-845,0',
                            z: 0,
                            lineWidth: 1,
                            stroke: '#404349',
                            strokeOpacity: 1,
                            lineDash: []
                          },
                          _uid: 185,
                          type: 'path',
                          name: 'axis-grid-line',
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
                textStyle: {
                  ellipsis: '...',
                  fill: '#fdfdfd',
                  fontSize: 16,
                  fontWeight: 'bold',
                  textAlign: 'left',
                  textBaseline: 'top',
                  width: 941,
                  lineHeight: 24
                },
                subtextStyle: {
                  ellipsis: '...',
                  fill: '#888c93',
                  fontSize: 14,
                  fontWeight: 'normal',
                  textAlign: 'left',
                  textBaseline: 'top',
                  width: 941,
                  lineHeight: 21
                },
                text: 'Stacked area chart of cosmetic products sales',
                subtext: '',
                x: 20,
                y: 24,
                width: 941,
                align: 'left',
                verticalAlign: 'top'
              },
              _uid: 55,
              type: 'group',
              name: 'title',
              children: [
                {
                  attribute: {
                    x: 0,
                    y: 0,
                    zIndex: 1,
                    width: 941,
                    height: 26
                  },
                  _uid: 56,
                  type: 'group',
                  name: 'title-container',
                  children: [
                    {
                      attribute: {
                        text: ['Stacked area chart of cosmetic products sales'],
                        ellipsis: '...',
                        fill: '#fdfdfd',
                        fontSize: 16,
                        fontWeight: 'bold',
                        textAlign: 'left',
                        textBaseline: 'top',
                        width: 941,
                        lineHeight: 24,
                        maxLineWidth: 941,
                        x: 0,
                        y: 0
                      },
                      _uid: 57,
                      type: 'text',
                      name: 'mainTitle',
                      children: []
                    },
                    {
                      attribute: {
                        text: [''],
                        ellipsis: '...',
                        fill: '#888c93',
                        fontSize: 14,
                        fontWeight: 'normal',
                        textAlign: 'left',
                        textBaseline: 'top',
                        width: 941,
                        lineHeight: 21,
                        maxLineWidth: 941,
                        x: 0,
                        y: 26
                      },
                      _uid: 58,
                      type: 'text',
                      name: 'subTitle',
                      children: []
                    }
                  ]
                }
              ]
            },
            {
              attribute: {
                layout: 'horizontal',
                title: {
                  align: 'start',
                  space: 12,
                  textStyle: {
                    fontSize: 12,
                    fontWeight: 'bold',
                    fill: '#2C3542'
                  }
                },
                item: {
                  spaceCol: 10,
                  spaceRow: 6,
                  shape: {
                    space: 6,
                    style: {
                      size: 10,
                      cursor: 'pointer',
                      lineWidth: 0,
                      fillOpacity: 1,
                      opacity: 1
                    },
                    state: {
                      selectedHover: {
                        opacity: 0.85
                      },
                      unSelected: {
                        opacity: 1,
                        fillOpacity: 0.2
                      }
                    }
                  },
                  label: {
                    space: 6,
                    style: {
                      fontSize: 12,
                      fill: '#888c93',
                      cursor: 'pointer',
                      lineHeight: 15.600000000000001,
                      opacity: 1
                    },
                    state: {
                      selectedHover: {
                        opacity: 0.85
                      },
                      unSelected: {
                        fill: '#55595f',
                        opacity: 1
                      }
                    }
                  },
                  value: {
                    alignRight: false,
                    style: {
                      fontSize: 12,
                      fill: '#ccc',
                      cursor: 'pointer'
                    },
                    state: {
                      selectedHover: {
                        opacity: 0.85
                      },
                      unSelected: {
                        fill: '#D8D8D8'
                      }
                    }
                  },
                  background: {
                    style: {
                      cursor: 'pointer'
                    },
                    state: {
                      selectedHover: {
                        fill: '#404349'
                      },
                      unSelectedHover: {
                        fill: '#404349'
                      }
                    }
                  },
                  focus: false,
                  focusIconStyle: {
                    size: 10,
                    symbolType:
                      'M8 1C11.866 1 15 4.13401 15 8C15 11.866 11.866 15 8 15C4.13401 15 1 11.866 1 8C1 4.13401 4.13401 1 8 1ZM8.75044 2.55077L8.75 3.75H7.25L7.25006 2.5507C4.81247 2.88304 2.88304 4.81247 2.5507 7.25006L3.75 7.25V8.75L2.55077 8.75044C2.8833 11.1878 4.81264 13.117 7.25006 13.4493L7.25 12.25H8.75L8.75044 13.4492C11.1876 13.1167 13.1167 11.1876 13.4492 8.75044L12.25 8.75V7.25L13.4493 7.25006C13.117 4.81264 11.1878 2.8833 8.75044 2.55077ZM8 5.5C9.38071 5.5 10.5 6.61929 10.5 8C10.5 9.38071 9.38071 10.5 8 10.5C6.61929 10.5 5.5 9.38071 5.5 8C5.5 6.61929 6.61929 5.5 8 5.5ZM8 7C7.44772 7 7 7.44772 7 8C7 8.55228 7.44772 9 8 9C8.55228 9 9 8.55228 9 8C9 7.44772 8.55228 7 8 7Z',
                    fill: '#333',
                    cursor: 'pointer'
                  },
                  visible: true,
                  padding: {
                    right: 2,
                    bottom: 2,
                    left: 2,
                    top: 2
                  }
                },
                autoPage: true,
                pager: {
                  space: 12,
                  handler: {
                    style: {
                      size: 10
                    },
                    space: 4
                  }
                },
                hover: true,
                select: true,
                selectMode: 'multiple',
                allowAllCanceled: false,
                items: [
                  {
                    label: 'Africa',
                    shape: {
                      fill: '#1664FF',
                      symbolType: 'square',
                      stroke: ['#1664FF', false, false, false],
                      fillOpacity: 0.2,
                      strokeOpacity: 1,
                      opacity: 1,
                      texture: null,
                      texturePadding: null,
                      textureSize: null,
                      textureColor: null,
                      innerBorder: null,
                      outerBorder: null
                    },
                    id: 'Africa',
                    index: 0
                  },
                  {
                    label: 'EU',
                    shape: {
                      fill: '#1AC6FF',
                      symbolType: 'square',
                      stroke: ['#1AC6FF', false, false, false],
                      fillOpacity: 0.2,
                      strokeOpacity: 1,
                      opacity: 1,
                      texture: null,
                      texturePadding: null,
                      textureSize: null,
                      textureColor: null,
                      innerBorder: null,
                      outerBorder: null
                    },
                    id: 'EU',
                    index: 1
                  },
                  {
                    label: 'China',
                    shape: {
                      fill: '#FF8A00',
                      symbolType: 'square',
                      stroke: ['#FF8A00', false, false, false],
                      fillOpacity: 0.2,
                      strokeOpacity: 1,
                      opacity: 1,
                      texture: null,
                      texturePadding: null,
                      textureSize: null,
                      textureColor: null,
                      innerBorder: null,
                      outerBorder: null
                    },
                    id: 'China',
                    index: 2
                  },
                  {
                    label: 'USA',
                    shape: {
                      fill: '#3CC780',
                      symbolType: 'square',
                      stroke: ['#3CC780', false, false, false],
                      fillOpacity: 0.2,
                      strokeOpacity: 1,
                      opacity: 1,
                      texture: null,
                      texturePadding: null,
                      textureSize: null,
                      textureColor: null,
                      innerBorder: null,
                      outerBorder: null
                    },
                    id: 'USA',
                    index: 3
                  }
                ],
                zIndex: 500,
                maxWidth: 893,
                maxHeight: 394,
                defaultSelected: ['Africa', 'EU', 'China', 'USA'],
                width: 58.083953857421875,
                height: 27.400000000000002,
                dx: 414.95802307128906,
                dy: 0,
                x: 44,
                y: 444
              },
              _uid: 59,
              type: 'group',
              name: 'legend',
              children: [
                {
                  attribute: {
                    x: 0,
                    y: 0,
                    pickable: true,
                    childrenPickable: true
                  },
                  _uid: 60,
                  type: 'group',
                  name: 'innerView',
                  children: [
                    {
                      attribute: {
                        x: 0,
                        y: 0
                      },
                      _uid: 61,
                      type: 'group',
                      children: [
                        {
                          attribute: {
                            x: 0,
                            y: 0,
                            cursor: 'pointer',
                            width: 53.083953857421875,
                            height: 19.6
                          },
                          _uid: 62,
                          type: 'group',
                          name: 'legendItem',
                          children: [
                            {
                              attribute: {
                                x: 7,
                                y: 9.8,
                                pickable: false
                              },
                              _uid: 63,
                              type: 'group',
                              children: [
                                {
                                  attribute: {
                                    x: 0,
                                    y: 0,
                                    symbolType: 'square',
                                    strokeBoundsBuffer: 0,
                                    fill: '#1664FF',
                                    stroke: ['#1664FF', false, false, false],
                                    fillOpacity: 1,
                                    strokeOpacity: 1,
                                    opacity: 1,
                                    texture: null,
                                    texturePadding: null,
                                    textureSize: null,
                                    textureColor: null,
                                    innerBorder: null,
                                    outerBorder: null,
                                    size: 10,
                                    cursor: 'pointer',
                                    lineWidth: 0
                                  },
                                  _uid: 64,
                                  type: 'symbol',
                                  name: 'legendItemShape',
                                  children: []
                                },
                                {
                                  attribute: {
                                    x: 11,
                                    y: 0,
                                    textAlign: 'start',
                                    textBaseline: 'middle',
                                    lineHeight: 15.600000000000001,
                                    fontSize: 12,
                                    fill: '#888c93',
                                    cursor: 'pointer',
                                    opacity: 1,
                                    text: 'Africa'
                                  },
                                  _uid: 65,
                                  type: 'text',
                                  name: 'legendItemLabel',
                                  children: []
                                }
                              ]
                            }
                          ]
                        },
                        {
                          attribute: {
                            x: 63.083953857421875,
                            y: 0,
                            cursor: 'pointer',
                            width: 36.21199035644531,
                            height: 19.6
                          },
                          _uid: 66,
                          type: 'group',
                          name: 'legendItem',
                          children: [
                            {
                              attribute: {
                                x: 7,
                                y: 9.8,
                                pickable: false
                              },
                              _uid: 67,
                              type: 'group',
                              children: [
                                {
                                  attribute: {
                                    x: 0,
                                    y: 0,
                                    symbolType: 'square',
                                    strokeBoundsBuffer: 0,
                                    fill: '#1AC6FF',
                                    stroke: ['#1AC6FF', false, false, false],
                                    fillOpacity: 1,
                                    strokeOpacity: 1,
                                    opacity: 1,
                                    texture: null,
                                    texturePadding: null,
                                    textureSize: null,
                                    textureColor: null,
                                    innerBorder: null,
                                    outerBorder: null,
                                    size: 10,
                                    cursor: 'pointer',
                                    lineWidth: 0
                                  },
                                  _uid: 68,
                                  type: 'symbol',
                                  name: 'legendItemShape',
                                  children: []
                                },
                                {
                                  attribute: {
                                    x: 11,
                                    y: 0,
                                    textAlign: 'start',
                                    textBaseline: 'middle',
                                    lineHeight: 15.600000000000001,
                                    fontSize: 12,
                                    fill: '#888c93',
                                    cursor: 'pointer',
                                    opacity: 1,
                                    text: 'EU'
                                  },
                                  _uid: 69,
                                  type: 'text',
                                  name: 'legendItemLabel',
                                  children: []
                                }
                              ]
                            }
                          ]
                        },
                        {
                          attribute: {
                            x: 109.29594421386719,
                            y: 0,
                            cursor: 'pointer',
                            width: 51.895965576171875,
                            height: 19.6
                          },
                          _uid: 70,
                          type: 'group',
                          name: 'legendItem',
                          children: [
                            {
                              attribute: {
                                x: 7,
                                y: 9.8,
                                pickable: false
                              },
                              _uid: 71,
                              type: 'group',
                              children: [
                                {
                                  attribute: {
                                    x: 0,
                                    y: 0,
                                    symbolType: 'square',
                                    strokeBoundsBuffer: 0,
                                    fill: '#FF8A00',
                                    stroke: ['#FF8A00', false, false, false],
                                    fillOpacity: 1,
                                    strokeOpacity: 1,
                                    opacity: 1,
                                    texture: null,
                                    texturePadding: null,
                                    textureSize: null,
                                    textureColor: null,
                                    innerBorder: null,
                                    outerBorder: null,
                                    size: 10,
                                    cursor: 'pointer',
                                    lineWidth: 0
                                  },
                                  _uid: 72,
                                  type: 'symbol',
                                  name: 'legendItemShape',
                                  children: []
                                },
                                {
                                  attribute: {
                                    x: 11,
                                    y: 0,
                                    textAlign: 'start',
                                    textBaseline: 'middle',
                                    lineHeight: 15.600000000000001,
                                    fontSize: 12,
                                    fill: '#888c93',
                                    cursor: 'pointer',
                                    opacity: 1,
                                    text: 'China'
                                  },
                                  _uid: 73,
                                  type: 'text',
                                  name: 'legendItemLabel',
                                  children: []
                                }
                              ]
                            }
                          ]
                        },
                        {
                          attribute: {
                            x: 171.19190979003906,
                            y: 0,
                            cursor: 'pointer',
                            width: 44.035980224609375,
                            height: 19.6
                          },
                          _uid: 74,
                          type: 'group',
                          name: 'legendItem',
                          children: [
                            {
                              attribute: {
                                x: 7,
                                y: 9.8,
                                pickable: false
                              },
                              _uid: 75,
                              type: 'group',
                              children: [
                                {
                                  attribute: {
                                    x: 0,
                                    y: 0,
                                    symbolType: 'square',
                                    strokeBoundsBuffer: 0,
                                    fill: '#3CC780',
                                    stroke: ['#3CC780', false, false, false],
                                    fillOpacity: 1,
                                    strokeOpacity: 1,
                                    opacity: 1,
                                    texture: null,
                                    texturePadding: null,
                                    textureSize: null,
                                    textureColor: null,
                                    innerBorder: null,
                                    outerBorder: null,
                                    size: 10,
                                    cursor: 'pointer',
                                    lineWidth: 0
                                  },
                                  _uid: 76,
                                  type: 'symbol',
                                  name: 'legendItemShape',
                                  children: []
                                },
                                {
                                  attribute: {
                                    x: 11,
                                    y: 0,
                                    textAlign: 'start',
                                    textBaseline: 'middle',
                                    lineHeight: 15.600000000000001,
                                    fontSize: 12,
                                    fill: '#888c93',
                                    cursor: 'pointer',
                                    opacity: 1,
                                    text: 'USA'
                                  },
                                  _uid: 77,
                                  type: 'text',
                                  name: 'legendItemLabel',
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
            },
            {
              attribute: {
                direction: 'horizontal',
                round: true,
                sliderSize: 20,
                sliderStyle: {
                  fill: '#ffffff',
                  fillOpacity: 0.5
                },
                railStyle: {
                  fill: 'rgba(0, 0, 0, .0)'
                },
                padding: 2,
                scrollRange: [0, 1],
                zIndex: 500,
                x: 68,
                y: 428,
                width: 845,
                height: 0,
                range: [0, 1]
              },
              _uid: 123,
              type: 'group',
              name: 'scrollbar',
              children: [
                {
                  attribute: {},
                  _uid: 124,
                  type: 'group',
                  name: 'scrollbar-container',
                  children: [
                    {
                      attribute: {
                        x: 0,
                        y: 0,
                        width: 845,
                        height: 0,
                        fill: 'rgba(0, 0, 0, .0)'
                      },
                      _uid: 125,
                      type: 'rect',
                      name: 'scrollbar-rail',
                      children: []
                    },
                    {
                      attribute: {
                        x: 2,
                        y: 2,
                        width: 841,
                        height: -4,
                        cornerRadius: -4,
                        fill: '#ffffff',
                        fillOpacity: 0.5,
                        boundsPadding: [2, 2, 2, 2],
                        pickMode: 'imprecise'
                      },
                      _uid: 126,
                      type: 'rect',
                      name: 'slider',
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
