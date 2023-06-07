import { ILine, ISymbol, Stage, Symbol } from '@visactor/vrender';
import { createRenderer, _add } from '../../util/render';
import { LineLabel, SymbolLabel } from '../../../src';

const symbolGenerator = () => {
  const spec: any = {
    attribute: {
      x: 0,
      y: 0,
      width: 1094,
      height: 500,
      pickable: true,
      zIndex: 0
    },
    id: 198,
    type: 'group',
    name: 'root',
    children: [
      {
        attribute: {
          visible: true,
          x: 45.76799011230469,
          y: 12,
          clip: false,
          width: 1036.2320098876953,
          height: 435,
          pickable: false,
          zIndex: 450
        },
        id: 199,
        type: 'group',
        name: 'regionGroup_6',
        children: [
          {
            attribute: {
              pickable: false,
              zIndex: 300
            },
            id: 200,
            type: 'group',
            name: 'line_9',
            children: [
              {
                attribute: {
                  visible: true,
                  lineWidth: 1,
                  stroke: true,
                  strokeColor: '#6690F2',
                  points: [
                    {
                      x: 16.80376232250319,
                      y: 37.39987869320076
                    },
                    {
                      x: 72.81630339751375,
                      y: 54.258412885629205
                    },
                    {
                      x: 128.8288444725243,
                      y: 45.32572466869518
                    },
                    {
                      x: 184.84138554753486,
                      y: 40.174224781068304
                    },
                    {
                      x: 240.85392662254543,
                      y: 33.951306311991935
                    },
                    {
                      x: 296.866467697556,
                      y: 36.16264715266333
                    },
                    {
                      x: 352.8790087725665,
                      y: 37.86994576560465
                    },
                    {
                      x: 408.8915498475771,
                      y: 38.60057281481931
                    },
                    {
                      x: 464.90409092258767,
                      y: 54.45319909934279
                    },
                    {
                      x: 520.9166319975982,
                      y: 37.22205811873503
                    },
                    {
                      x: 576.9291730726088,
                      y: 43.33410972873424
                    },
                    {
                      x: 632.9417141476193,
                      y: 43.41750864263618
                    },
                    {
                      x: 688.9542552226299,
                      y: 44.643399223788535
                    },
                    {
                      x: 744.9667962976405,
                      y: 36.48159528883226
                    },
                    {
                      x: 800.979337372651,
                      y: 34.62028035244824
                    },
                    {
                      x: 856.9918784476616,
                      y: 31.73169764549956
                    },
                    {
                      x: 913.0044195226722,
                      y: 38.05568715953296
                    }
                  ],
                  segments: null,
                  pickable: true,
                  zIndex: 300,
                  clipRange: 1
                },
                id: 493,
                type: 'line',
                children: []
              },
              {
                attribute: {
                  visible: true,
                  lineWidth: 1,
                  stroke: true,
                  strokeColor: '#70D6A3',
                  points: [
                    {
                      x: 969.0169605976827,
                      y: 435
                    },
                    {
                      x: 969.0169605976827,
                      y: 435
                    },
                    {
                      x: 969.0169605976827,
                      y: 435
                    },
                    {
                      x: 969.0169605976827,
                      y: 435
                    }
                  ],
                  segments: null,
                  pickable: true,
                  zIndex: 300,
                  clipRange: 1
                },
                id: 494,
                type: 'line',
                children: []
              }
            ]
          },
          {
            attribute: {
              pickable: false,
              zIndex: 300
            },
            id: 201,
            type: 'group',
            name: 'point_10',
            children: [
              {
                attribute: {
                  size: 10,
                  symbolType: 'circle',
                  fillOpacity: 0,
                  visible: true,
                  x: 16.80376232250319,
                  y: 37.39987869320076,
                  fill: true,
                  fillColor: '#6690F2',
                  pickable: true,
                  zIndex: 300,
                  scaleX: 1,
                  scaleY: 1
                },
                id: 495,
                type: 'symbol',
                children: []
              },
              {
                attribute: {
                  size: 10,
                  symbolType: 'circle',
                  fillOpacity: 0,
                  visible: true,
                  x: 72.81630339751375,
                  y: 54.258412885629205,
                  fill: true,
                  fillColor: '#6690F2',
                  pickable: true,
                  zIndex: 300,
                  scaleX: 1,
                  scaleY: 1
                },
                id: 496,
                type: 'symbol',
                children: []
              },
              {
                attribute: {
                  size: 10,
                  symbolType: 'circle',
                  fillOpacity: 0,
                  visible: true,
                  x: 128.8288444725243,
                  y: 45.32572466869518,
                  fill: true,
                  fillColor: '#6690F2',
                  pickable: true,
                  zIndex: 300,
                  scaleX: 1,
                  scaleY: 1
                },
                id: 497,
                type: 'symbol',
                children: []
              },
              {
                attribute: {
                  size: 10,
                  symbolType: 'circle',
                  fillOpacity: 0,
                  visible: true,
                  x: 184.84138554753486,
                  y: 40.174224781068304,
                  fill: true,
                  fillColor: '#6690F2',
                  pickable: true,
                  zIndex: 300,
                  scaleX: 1,
                  scaleY: 1
                },
                id: 498,
                type: 'symbol',
                children: []
              },
              {
                attribute: {
                  size: 10,
                  symbolType: 'circle',
                  fillOpacity: 0,
                  visible: true,
                  x: 240.85392662254543,
                  y: 33.951306311991935,
                  fill: true,
                  fillColor: '#6690F2',
                  pickable: true,
                  zIndex: 300,
                  scaleX: 1,
                  scaleY: 1
                },
                id: 499,
                type: 'symbol',
                children: []
              },
              {
                attribute: {
                  size: 10,
                  symbolType: 'circle',
                  fillOpacity: 0,
                  visible: true,
                  x: 296.866467697556,
                  y: 36.16264715266333,
                  fill: true,
                  fillColor: '#6690F2',
                  pickable: true,
                  zIndex: 300,
                  scaleX: 1,
                  scaleY: 1
                },
                id: 500,
                type: 'symbol',
                children: []
              },
              {
                attribute: {
                  size: 10,
                  symbolType: 'circle',
                  fillOpacity: 0,
                  visible: true,
                  x: 352.8790087725665,
                  y: 37.86994576560465,
                  fill: true,
                  fillColor: '#6690F2',
                  pickable: true,
                  zIndex: 300,
                  scaleX: 1,
                  scaleY: 1
                },
                id: 501,
                type: 'symbol',
                children: []
              },
              {
                attribute: {
                  size: 10,
                  symbolType: 'circle',
                  fillOpacity: 0,
                  visible: true,
                  x: 408.8915498475771,
                  y: 38.60057281481931,
                  fill: true,
                  fillColor: '#6690F2',
                  pickable: true,
                  zIndex: 300,
                  scaleX: 1,
                  scaleY: 1
                },
                id: 502,
                type: 'symbol',
                children: []
              },
              {
                attribute: {
                  size: 10,
                  symbolType: 'circle',
                  fillOpacity: 0,
                  visible: true,
                  x: 464.90409092258767,
                  y: 54.45319909934279,
                  fill: true,
                  fillColor: '#6690F2',
                  pickable: true,
                  zIndex: 300,
                  scaleX: 1,
                  scaleY: 1
                },
                id: 503,
                type: 'symbol',
                children: []
              },
              {
                attribute: {
                  size: 10,
                  symbolType: 'circle',
                  fillOpacity: 0,
                  visible: true,
                  x: 520.9166319975982,
                  y: 37.22205811873503,
                  fill: true,
                  fillColor: '#6690F2',
                  pickable: true,
                  zIndex: 300,
                  scaleX: 1,
                  scaleY: 1
                },
                id: 504,
                type: 'symbol',
                children: []
              },
              {
                attribute: {
                  size: 10,
                  symbolType: 'circle',
                  fillOpacity: 0,
                  visible: true,
                  x: 576.9291730726088,
                  y: 43.33410972873424,
                  fill: true,
                  fillColor: '#6690F2',
                  pickable: true,
                  zIndex: 300,
                  scaleX: 1,
                  scaleY: 1
                },
                id: 505,
                type: 'symbol',
                children: []
              },
              {
                attribute: {
                  size: 10,
                  symbolType: 'circle',
                  fillOpacity: 0,
                  visible: true,
                  x: 632.9417141476193,
                  y: 43.41750864263618,
                  fill: true,
                  fillColor: '#6690F2',
                  pickable: true,
                  zIndex: 300,
                  scaleX: 1,
                  scaleY: 1
                },
                id: 506,
                type: 'symbol',
                children: []
              },
              {
                attribute: {
                  size: 10,
                  symbolType: 'circle',
                  fillOpacity: 0,
                  visible: true,
                  x: 688.9542552226299,
                  y: 44.643399223788535,
                  fill: true,
                  fillColor: '#6690F2',
                  pickable: true,
                  zIndex: 300,
                  scaleX: 1,
                  scaleY: 1
                },
                id: 507,
                type: 'symbol',
                children: []
              },
              {
                attribute: {
                  size: 10,
                  symbolType: 'circle',
                  fillOpacity: 0,
                  visible: true,
                  x: 744.9667962976405,
                  y: 36.48159528883226,
                  fill: true,
                  fillColor: '#6690F2',
                  pickable: true,
                  zIndex: 300,
                  scaleX: 1,
                  scaleY: 1
                },
                id: 508,
                type: 'symbol',
                children: []
              },
              {
                attribute: {
                  size: 10,
                  symbolType: 'circle',
                  fillOpacity: 0,
                  visible: true,
                  x: 800.979337372651,
                  y: 34.62028035244824,
                  fill: true,
                  fillColor: '#6690F2',
                  pickable: true,
                  zIndex: 300,
                  scaleX: 1,
                  scaleY: 1
                },
                id: 509,
                type: 'symbol',
                children: []
              },
              {
                attribute: {
                  size: 10,
                  symbolType: 'circle',
                  fillOpacity: 0,
                  visible: true,
                  x: 856.9918784476616,
                  y: 31.73169764549956,
                  fill: true,
                  fillColor: '#6690F2',
                  pickable: true,
                  zIndex: 300,
                  scaleX: 1,
                  scaleY: 1
                },
                id: 510,
                type: 'symbol',
                children: []
              },
              {
                attribute: {
                  size: 10,
                  symbolType: 'circle',
                  fillOpacity: 0,
                  visible: true,
                  x: 913.0044195226722,
                  y: 38.05568715953296,
                  fill: true,
                  fillColor: '#6690F2',
                  pickable: true,
                  zIndex: 300,
                  scaleX: 1,
                  scaleY: 1
                },
                id: 511,
                type: 'symbol',
                children: []
              },
              {
                attribute: {
                  size: 10,
                  symbolType: 'circle',
                  fillOpacity: 0,
                  visible: true,
                  x: 969.0169605976827,
                  y: 435,
                  fill: true,
                  fillColor: '#70D6A3',
                  pickable: true,
                  zIndex: 300,
                  scaleX: 1,
                  scaleY: 1
                },
                id: 512,
                type: 'symbol',
                children: []
              },
              {
                attribute: {
                  size: 10,
                  symbolType: 'circle',
                  fillOpacity: 0,
                  visible: true,
                  x: 969.0169605976827,
                  y: 435,
                  fill: true,
                  fillColor: '#70D6A3',
                  pickable: true,
                  zIndex: 300,
                  scaleX: 1,
                  scaleY: 1
                },
                id: 513,
                type: 'symbol',
                children: []
              },
              {
                attribute: {
                  size: 10,
                  symbolType: 'circle',
                  fillOpacity: 0,
                  visible: true,
                  x: 969.0169605976827,
                  y: 435,
                  fill: true,
                  fillColor: '#70D6A3',
                  pickable: true,
                  zIndex: 300,
                  scaleX: 1,
                  scaleY: 1
                },
                id: 514,
                type: 'symbol',
                children: []
              },
              {
                attribute: {
                  size: 10,
                  symbolType: 'circle',
                  fillOpacity: 0,
                  visible: true,
                  x: 969.0169605976827,
                  y: 435,
                  fill: true,
                  fillColor: '#70D6A3',
                  pickable: true,
                  zIndex: 300,
                  scaleX: 1,
                  scaleY: 1
                },
                id: 515,
                type: 'symbol',
                children: []
              }
            ]
          }
        ]
      },
      {
        attribute: {
          visible: true,
          x: 45.76799011230469,
          y: 12,
          clip: false,
          pickable: false,
          zIndex: 400
        },
        id: 202,
        type: 'group',
        name: 'axisGroup_17',
        children: [
          {
            attribute: {
              pickable: false,
              zIndex: 300
            },
            id: 203,
            type: 'group',
            name: 'axisTick_18',
            children: [
              {
                attribute: {
                  visible: true,
                  points: [
                    {
                      x: 0,
                      y: 435
                    },
                    {
                      x: -4,
                      y: 435
                    }
                  ],
                  lineWidth: 1,
                  stroke: true,
                  strokeColor: '#D8DCE3',
                  strokeOpacity: 1,
                  pickable: true,
                  zIndex: 300
                },
                id: 204,
                type: 'line',
                children: []
              },
              {
                attribute: {
                  visible: true,
                  points: [
                    {
                      x: 0,
                      y: 401.53846153846155
                    },
                    {
                      x: -4,
                      y: 401.53846153846155
                    }
                  ],
                  lineWidth: 1,
                  stroke: true,
                  strokeColor: '#D8DCE3',
                  strokeOpacity: 1,
                  pickable: true,
                  zIndex: 300
                },
                id: 205,
                type: 'line',
                children: []
              },
              {
                attribute: {
                  visible: true,
                  points: [
                    {
                      x: 0,
                      y: 368.0769230769231
                    },
                    {
                      x: -4,
                      y: 368.0769230769231
                    }
                  ],
                  lineWidth: 1,
                  stroke: true,
                  strokeColor: '#D8DCE3',
                  strokeOpacity: 1,
                  pickable: true,
                  zIndex: 300
                },
                id: 206,
                type: 'line',
                children: []
              },
              {
                attribute: {
                  visible: true,
                  points: [
                    {
                      x: 0,
                      y: 334.61538461538464
                    },
                    {
                      x: -4,
                      y: 334.61538461538464
                    }
                  ],
                  lineWidth: 1,
                  stroke: true,
                  strokeColor: '#D8DCE3',
                  strokeOpacity: 1,
                  pickable: true,
                  zIndex: 300
                },
                id: 207,
                type: 'line',
                children: []
              },
              {
                attribute: {
                  visible: true,
                  points: [
                    {
                      x: 0,
                      y: 301.15384615384613
                    },
                    {
                      x: -4,
                      y: 301.15384615384613
                    }
                  ],
                  lineWidth: 1,
                  stroke: true,
                  strokeColor: '#D8DCE3',
                  strokeOpacity: 1,
                  pickable: true,
                  zIndex: 300
                },
                id: 208,
                type: 'line',
                children: []
              },
              {
                attribute: {
                  visible: true,
                  points: [
                    {
                      x: 0,
                      y: 267.6923076923077
                    },
                    {
                      x: -4,
                      y: 267.6923076923077
                    }
                  ],
                  lineWidth: 1,
                  stroke: true,
                  strokeColor: '#D8DCE3',
                  strokeOpacity: 1,
                  pickable: true,
                  zIndex: 300
                },
                id: 209,
                type: 'line',
                children: []
              },
              {
                attribute: {
                  visible: true,
                  points: [
                    {
                      x: 0,
                      y: 234.23076923076925
                    },
                    {
                      x: -4,
                      y: 234.23076923076925
                    }
                  ],
                  lineWidth: 1,
                  stroke: true,
                  strokeColor: '#D8DCE3',
                  strokeOpacity: 1,
                  pickable: true,
                  zIndex: 300
                },
                id: 210,
                type: 'line',
                children: []
              },
              {
                attribute: {
                  visible: true,
                  points: [
                    {
                      x: 0,
                      y: 200.76923076923077
                    },
                    {
                      x: -4,
                      y: 200.76923076923077
                    }
                  ],
                  lineWidth: 1,
                  stroke: true,
                  strokeColor: '#D8DCE3',
                  strokeOpacity: 1,
                  pickable: true,
                  zIndex: 300
                },
                id: 211,
                type: 'line',
                children: []
              },
              {
                attribute: {
                  visible: true,
                  points: [
                    {
                      x: 0,
                      y: 167.3076923076923
                    },
                    {
                      x: -4,
                      y: 167.3076923076923
                    }
                  ],
                  lineWidth: 1,
                  stroke: true,
                  strokeColor: '#D8DCE3',
                  strokeOpacity: 1,
                  pickable: true,
                  zIndex: 300
                },
                id: 212,
                type: 'line',
                children: []
              },
              {
                attribute: {
                  visible: true,
                  points: [
                    {
                      x: 0,
                      y: 133.84615384615384
                    },
                    {
                      x: -4,
                      y: 133.84615384615384
                    }
                  ],
                  lineWidth: 1,
                  stroke: true,
                  strokeColor: '#D8DCE3',
                  strokeOpacity: 1,
                  pickable: true,
                  zIndex: 300
                },
                id: 213,
                type: 'line',
                children: []
              },
              {
                attribute: {
                  visible: true,
                  points: [
                    {
                      x: 0,
                      y: 100.38461538461542
                    },
                    {
                      x: -4,
                      y: 100.38461538461542
                    }
                  ],
                  lineWidth: 1,
                  stroke: true,
                  strokeColor: '#D8DCE3',
                  strokeOpacity: 1,
                  pickable: true,
                  zIndex: 300
                },
                id: 214,
                type: 'line',
                children: []
              },
              {
                attribute: {
                  visible: true,
                  points: [
                    {
                      x: 0,
                      y: 66.92307692307692
                    },
                    {
                      x: -4,
                      y: 66.92307692307692
                    }
                  ],
                  lineWidth: 1,
                  stroke: true,
                  strokeColor: '#D8DCE3',
                  strokeOpacity: 1,
                  pickable: true,
                  zIndex: 300
                },
                id: 215,
                type: 'line',
                children: []
              },
              {
                attribute: {
                  visible: true,
                  points: [
                    {
                      x: 0,
                      y: 33.46153846153849
                    },
                    {
                      x: -4,
                      y: 33.46153846153849
                    }
                  ],
                  lineWidth: 1,
                  stroke: true,
                  strokeColor: '#D8DCE3',
                  strokeOpacity: 1,
                  pickable: true,
                  zIndex: 300
                },
                id: 216,
                type: 'line',
                children: []
              },
              {
                attribute: {
                  visible: true,
                  points: [
                    {
                      x: 0,
                      y: 0
                    },
                    {
                      x: -4,
                      y: 0
                    }
                  ],
                  lineWidth: 1,
                  stroke: true,
                  strokeColor: '#D8DCE3',
                  strokeOpacity: 1,
                  pickable: true,
                  zIndex: 300
                },
                id: 217,
                type: 'line',
                children: []
              }
            ]
          },
          {
            attribute: {
              pickable: false,
              zIndex: 300
            },
            id: 218,
            type: 'group',
            name: 'axisDomain_19',
            children: [
              {
                attribute: {
                  visible: true,
                  points: [
                    {
                      x: 0,
                      y: 0
                    },
                    {
                      x: 0,
                      y: 435
                    }
                  ],
                  lineWidth: 1,
                  stroke: true,
                  strokeColor: '#dfdfdf',
                  strokeOpacity: 1,
                  pickable: true,
                  zIndex: 300
                },
                id: 219,
                type: 'line',
                children: []
              }
            ]
          },
          {
            attribute: {
              pickable: false,
              zIndex: 300
            },
            id: 220,
            type: 'group',
            name: 'axisLabel_20',
            children: [
              {
                attribute: {
                  visible: true,
                  x: -8,
                  y: 435,
                  angle: 0,
                  textAlign: 'right',
                  textBaseline: 'middle',
                  fontSize: 12,
                  fill: true,
                  fillColor: '#6F6F6F',
                  fontWeight: 'normal',
                  fillOpacity: 0,
                  text: 0,
                  pickable: true,
                  zIndex: 300,
                  strokeOpacity: 1
                },
                id: 221,
                type: 'text',
                children: []
              },
              {
                attribute: {
                  visible: true,
                  x: -8,
                  y: 401.53846153846155,
                  angle: 0,
                  textAlign: 'right',
                  textBaseline: 'middle',
                  fontSize: 12,
                  fill: true,
                  fillColor: '#6F6F6F',
                  fontWeight: 'normal',
                  fillOpacity: 0,
                  text: 0.05,
                  pickable: true,
                  zIndex: 300,
                  strokeOpacity: 1
                },
                id: 222,
                type: 'text',
                children: []
              },
              {
                attribute: {
                  visible: true,
                  x: -8,
                  y: 368.0769230769231,
                  angle: 0,
                  textAlign: 'right',
                  textBaseline: 'middle',
                  fontSize: 12,
                  fill: true,
                  fillColor: '#6F6F6F',
                  fontWeight: 'normal',
                  fillOpacity: 0,
                  text: 0.1,
                  pickable: true,
                  zIndex: 300,
                  strokeOpacity: 1
                },
                id: 223,
                type: 'text',
                children: []
              },
              {
                attribute: {
                  visible: true,
                  x: -8,
                  y: 334.61538461538464,
                  angle: 0,
                  textAlign: 'right',
                  textBaseline: 'middle',
                  fontSize: 12,
                  fill: true,
                  fillColor: '#6F6F6F',
                  fontWeight: 'normal',
                  fillOpacity: 0,
                  text: 0.15,
                  pickable: true,
                  zIndex: 300,
                  strokeOpacity: 1
                },
                id: 224,
                type: 'text',
                children: []
              },
              {
                attribute: {
                  visible: true,
                  x: -8,
                  y: 301.15384615384613,
                  angle: 0,
                  textAlign: 'right',
                  textBaseline: 'middle',
                  fontSize: 12,
                  fill: true,
                  fillColor: '#6F6F6F',
                  fontWeight: 'normal',
                  fillOpacity: 0,
                  text: 0.2,
                  pickable: true,
                  zIndex: 300,
                  strokeOpacity: 1
                },
                id: 225,
                type: 'text',
                children: []
              },
              {
                attribute: {
                  visible: true,
                  x: -8,
                  y: 267.6923076923077,
                  angle: 0,
                  textAlign: 'right',
                  textBaseline: 'middle',
                  fontSize: 12,
                  fill: true,
                  fillColor: '#6F6F6F',
                  fontWeight: 'normal',
                  fillOpacity: 0,
                  text: 0.25,
                  pickable: true,
                  zIndex: 300,
                  strokeOpacity: 1
                },
                id: 226,
                type: 'text',
                children: []
              },
              {
                attribute: {
                  visible: true,
                  x: -8,
                  y: 234.23076923076925,
                  angle: 0,
                  textAlign: 'right',
                  textBaseline: 'middle',
                  fontSize: 12,
                  fill: true,
                  fillColor: '#6F6F6F',
                  fontWeight: 'normal',
                  fillOpacity: 0,
                  text: 0.3,
                  pickable: true,
                  zIndex: 300,
                  strokeOpacity: 1
                },
                id: 227,
                type: 'text',
                children: []
              },
              {
                attribute: {
                  visible: true,
                  x: -8,
                  y: 200.76923076923077,
                  angle: 0,
                  textAlign: 'right',
                  textBaseline: 'middle',
                  fontSize: 12,
                  fill: true,
                  fillColor: '#6F6F6F',
                  fontWeight: 'normal',
                  fillOpacity: 0,
                  text: 0.35,
                  pickable: true,
                  zIndex: 300,
                  strokeOpacity: 1
                },
                id: 228,
                type: 'text',
                children: []
              },
              {
                attribute: {
                  visible: true,
                  x: -8,
                  y: 167.3076923076923,
                  angle: 0,
                  textAlign: 'right',
                  textBaseline: 'middle',
                  fontSize: 12,
                  fill: true,
                  fillColor: '#6F6F6F',
                  fontWeight: 'normal',
                  fillOpacity: 0,
                  text: 0.4,
                  pickable: true,
                  zIndex: 300,
                  strokeOpacity: 1
                },
                id: 229,
                type: 'text',
                children: []
              },
              {
                attribute: {
                  visible: true,
                  x: -8,
                  y: 133.84615384615384,
                  angle: 0,
                  textAlign: 'right',
                  textBaseline: 'middle',
                  fontSize: 12,
                  fill: true,
                  fillColor: '#6F6F6F',
                  fontWeight: 'normal',
                  fillOpacity: 0,
                  text: 0.45,
                  pickable: true,
                  zIndex: 300,
                  strokeOpacity: 1
                },
                id: 230,
                type: 'text',
                children: []
              },
              {
                attribute: {
                  visible: true,
                  x: -8,
                  y: 100.38461538461542,
                  angle: 0,
                  textAlign: 'right',
                  textBaseline: 'middle',
                  fontSize: 12,
                  fill: true,
                  fillColor: '#6F6F6F',
                  fontWeight: 'normal',
                  fillOpacity: 0,
                  text: 0.5,
                  pickable: true,
                  zIndex: 300,
                  strokeOpacity: 1
                },
                id: 231,
                type: 'text',
                children: []
              },
              {
                attribute: {
                  visible: true,
                  x: -8,
                  y: 66.92307692307692,
                  angle: 0,
                  textAlign: 'right',
                  textBaseline: 'middle',
                  fontSize: 12,
                  fill: true,
                  fillColor: '#6F6F6F',
                  fontWeight: 'normal',
                  fillOpacity: 0,
                  text: 0.55,
                  pickable: true,
                  zIndex: 300,
                  strokeOpacity: 1
                },
                id: 232,
                type: 'text',
                children: []
              },
              {
                attribute: {
                  visible: true,
                  x: -8,
                  y: 33.46153846153849,
                  angle: 0,
                  textAlign: 'right',
                  textBaseline: 'middle',
                  fontSize: 12,
                  fill: true,
                  fillColor: '#6F6F6F',
                  fontWeight: 'normal',
                  fillOpacity: 0,
                  text: 0.6,
                  pickable: true,
                  zIndex: 300,
                  strokeOpacity: 1
                },
                id: 233,
                type: 'text',
                children: []
              },
              {
                attribute: {
                  visible: true,
                  x: -8,
                  y: 0,
                  angle: 0,
                  textAlign: 'right',
                  textBaseline: 'middle',
                  fontSize: 12,
                  fill: true,
                  fillColor: '#6F6F6F',
                  fontWeight: 'normal',
                  fillOpacity: 0,
                  text: 0.65,
                  pickable: true,
                  zIndex: 300,
                  strokeOpacity: 1
                },
                id: 234,
                type: 'text',
                children: []
              }
            ]
          }
        ]
      },
      {
        attribute: {
          visible: true,
          x: 45.76799011230469,
          y: 12,
          clip: false,
          pickable: false,
          zIndex: 100
        },
        id: 235,
        type: 'group',
        name: 'axisGrid_21',
        children: [
          {
            attribute: {
              pickable: false,
              zIndex: 300
            },
            id: 236,
            type: 'group',
            name: 'axisGrid_22',
            children: [
              {
                attribute: {
                  visible: true,
                  points: [
                    {
                      x: 0,
                      y: 435
                    },
                    {
                      x: 1036.2320098876953,
                      y: 435
                    }
                  ],
                  lineWidth: 1,
                  stroke: true,
                  strokeColor: '#dfdfdf',
                  strokeOpacity: 1,
                  lineDash: [4, 4],
                  pickable: true,
                  zIndex: 300
                },
                id: 237,
                type: 'line',
                children: []
              },
              {
                attribute: {
                  visible: true,
                  points: [
                    {
                      x: 0,
                      y: 401.53846153846155
                    },
                    {
                      x: 1036.2320098876953,
                      y: 401.53846153846155
                    }
                  ],
                  lineWidth: 1,
                  stroke: true,
                  strokeColor: '#dfdfdf',
                  strokeOpacity: 1,
                  lineDash: [4, 4],
                  pickable: true,
                  zIndex: 300
                },
                id: 238,
                type: 'line',
                children: []
              },
              {
                attribute: {
                  visible: true,
                  points: [
                    {
                      x: 0,
                      y: 368.0769230769231
                    },
                    {
                      x: 1036.2320098876953,
                      y: 368.0769230769231
                    }
                  ],
                  lineWidth: 1,
                  stroke: true,
                  strokeColor: '#dfdfdf',
                  strokeOpacity: 1,
                  lineDash: [4, 4],
                  pickable: true,
                  zIndex: 300
                },
                id: 239,
                type: 'line',
                children: []
              },
              {
                attribute: {
                  visible: true,
                  points: [
                    {
                      x: 0,
                      y: 334.61538461538464
                    },
                    {
                      x: 1036.2320098876953,
                      y: 334.61538461538464
                    }
                  ],
                  lineWidth: 1,
                  stroke: true,
                  strokeColor: '#dfdfdf',
                  strokeOpacity: 1,
                  lineDash: [4, 4],
                  pickable: true,
                  zIndex: 300
                },
                id: 240,
                type: 'line',
                children: []
              },
              {
                attribute: {
                  visible: true,
                  points: [
                    {
                      x: 0,
                      y: 301.15384615384613
                    },
                    {
                      x: 1036.2320098876953,
                      y: 301.15384615384613
                    }
                  ],
                  lineWidth: 1,
                  stroke: true,
                  strokeColor: '#dfdfdf',
                  strokeOpacity: 1,
                  lineDash: [4, 4],
                  pickable: true,
                  zIndex: 300
                },
                id: 241,
                type: 'line',
                children: []
              },
              {
                attribute: {
                  visible: true,
                  points: [
                    {
                      x: 0,
                      y: 267.6923076923077
                    },
                    {
                      x: 1036.2320098876953,
                      y: 267.6923076923077
                    }
                  ],
                  lineWidth: 1,
                  stroke: true,
                  strokeColor: '#dfdfdf',
                  strokeOpacity: 1,
                  lineDash: [4, 4],
                  pickable: true,
                  zIndex: 300
                },
                id: 242,
                type: 'line',
                children: []
              },
              {
                attribute: {
                  visible: true,
                  points: [
                    {
                      x: 0,
                      y: 234.23076923076925
                    },
                    {
                      x: 1036.2320098876953,
                      y: 234.23076923076925
                    }
                  ],
                  lineWidth: 1,
                  stroke: true,
                  strokeColor: '#dfdfdf',
                  strokeOpacity: 1,
                  lineDash: [4, 4],
                  pickable: true,
                  zIndex: 300
                },
                id: 243,
                type: 'line',
                children: []
              },
              {
                attribute: {
                  visible: true,
                  points: [
                    {
                      x: 0,
                      y: 200.76923076923077
                    },
                    {
                      x: 1036.2320098876953,
                      y: 200.76923076923077
                    }
                  ],
                  lineWidth: 1,
                  stroke: true,
                  strokeColor: '#dfdfdf',
                  strokeOpacity: 1,
                  lineDash: [4, 4],
                  pickable: true,
                  zIndex: 300
                },
                id: 244,
                type: 'line',
                children: []
              },
              {
                attribute: {
                  visible: true,
                  points: [
                    {
                      x: 0,
                      y: 167.3076923076923
                    },
                    {
                      x: 1036.2320098876953,
                      y: 167.3076923076923
                    }
                  ],
                  lineWidth: 1,
                  stroke: true,
                  strokeColor: '#dfdfdf',
                  strokeOpacity: 1,
                  lineDash: [4, 4],
                  pickable: true,
                  zIndex: 300
                },
                id: 245,
                type: 'line',
                children: []
              },
              {
                attribute: {
                  visible: true,
                  points: [
                    {
                      x: 0,
                      y: 133.84615384615384
                    },
                    {
                      x: 1036.2320098876953,
                      y: 133.84615384615384
                    }
                  ],
                  lineWidth: 1,
                  stroke: true,
                  strokeColor: '#dfdfdf',
                  strokeOpacity: 1,
                  lineDash: [4, 4],
                  pickable: true,
                  zIndex: 300
                },
                id: 246,
                type: 'line',
                children: []
              },
              {
                attribute: {
                  visible: true,
                  points: [
                    {
                      x: 0,
                      y: 100.38461538461542
                    },
                    {
                      x: 1036.2320098876953,
                      y: 100.38461538461542
                    }
                  ],
                  lineWidth: 1,
                  stroke: true,
                  strokeColor: '#dfdfdf',
                  strokeOpacity: 1,
                  lineDash: [4, 4],
                  pickable: true,
                  zIndex: 300
                },
                id: 247,
                type: 'line',
                children: []
              },
              {
                attribute: {
                  visible: true,
                  points: [
                    {
                      x: 0,
                      y: 66.92307692307692
                    },
                    {
                      x: 1036.2320098876953,
                      y: 66.92307692307692
                    }
                  ],
                  lineWidth: 1,
                  stroke: true,
                  strokeColor: '#dfdfdf',
                  strokeOpacity: 1,
                  lineDash: [4, 4],
                  pickable: true,
                  zIndex: 300
                },
                id: 248,
                type: 'line',
                children: []
              },
              {
                attribute: {
                  visible: true,
                  points: [
                    {
                      x: 0,
                      y: 33.46153846153849
                    },
                    {
                      x: 1036.2320098876953,
                      y: 33.46153846153849
                    }
                  ],
                  lineWidth: 1,
                  stroke: true,
                  strokeColor: '#dfdfdf',
                  strokeOpacity: 1,
                  lineDash: [4, 4],
                  pickable: true,
                  zIndex: 300
                },
                id: 249,
                type: 'line',
                children: []
              },
              {
                attribute: {
                  visible: true,
                  points: [
                    {
                      x: 0,
                      y: 0
                    },
                    {
                      x: 1036.2320098876953,
                      y: 0
                    }
                  ],
                  lineWidth: 1,
                  stroke: true,
                  strokeColor: '#dfdfdf',
                  strokeOpacity: 1,
                  lineDash: [4, 4],
                  pickable: true,
                  zIndex: 300
                },
                id: 250,
                type: 'line',
                children: []
              }
            ]
          }
        ]
      },
      {
        attribute: {
          visible: true,
          x: 45.76799011230469,
          y: 447,
          clip: false,
          pickable: false,
          zIndex: 400
        },
        id: 251,
        type: 'group',
        name: 'axisGroup_24',
        children: [
          {
            attribute: {
              pickable: false,
              zIndex: 300
            },
            id: 252,
            type: 'group',
            name: 'axisTick_25',
            children: [
              {
                attribute: {
                  visible: true,
                  points: [
                    {
                      x: 42.009405806257945,
                      y: 0
                    },
                    {
                      x: 42.009405806257945,
                      y: 4
                    }
                  ],
                  lineWidth: 1,
                  stroke: true,
                  strokeColor: '#D8DCE3',
                  strokeOpacity: 1,
                  pickable: true,
                  zIndex: 300
                },
                id: 253,
                type: 'line',
                children: []
              },
              {
                attribute: {
                  visible: true,
                  points: [
                    {
                      x: 98.0219468812685,
                      y: 0
                    },
                    {
                      x: 98.0219468812685,
                      y: 4
                    }
                  ],
                  lineWidth: 1,
                  stroke: true,
                  strokeColor: '#D8DCE3',
                  strokeOpacity: 1,
                  pickable: true,
                  zIndex: 300
                },
                id: 270,
                type: 'line',
                children: []
              },
              {
                attribute: {
                  visible: true,
                  points: [
                    {
                      x: 154.03448795627907,
                      y: 0
                    },
                    {
                      x: 154.03448795627907,
                      y: 4
                    }
                  ],
                  lineWidth: 1,
                  stroke: true,
                  strokeColor: '#D8DCE3',
                  strokeOpacity: 1,
                  pickable: true,
                  zIndex: 300
                },
                id: 271,
                type: 'line',
                children: []
              },
              {
                attribute: {
                  visible: true,
                  points: [
                    {
                      x: 210.0470290312896,
                      y: 0
                    },
                    {
                      x: 210.0470290312896,
                      y: 4
                    }
                  ],
                  lineWidth: 1,
                  stroke: true,
                  strokeColor: '#D8DCE3',
                  strokeOpacity: 1,
                  pickable: true,
                  zIndex: 300
                },
                id: 272,
                type: 'line',
                children: []
              },
              {
                attribute: {
                  visible: true,
                  points: [
                    {
                      x: 266.05957010630016,
                      y: 0
                    },
                    {
                      x: 266.05957010630016,
                      y: 4
                    }
                  ],
                  lineWidth: 1,
                  stroke: true,
                  strokeColor: '#D8DCE3',
                  strokeOpacity: 1,
                  pickable: true,
                  zIndex: 300
                },
                id: 273,
                type: 'line',
                children: []
              },
              {
                attribute: {
                  visible: true,
                  points: [
                    {
                      x: 322.07211118131073,
                      y: 0
                    },
                    {
                      x: 322.07211118131073,
                      y: 4
                    }
                  ],
                  lineWidth: 1,
                  stroke: true,
                  strokeColor: '#D8DCE3',
                  strokeOpacity: 1,
                  pickable: true,
                  zIndex: 300
                },
                id: 274,
                type: 'line',
                children: []
              },
              {
                attribute: {
                  visible: true,
                  points: [
                    {
                      x: 378.08465225632125,
                      y: 0
                    },
                    {
                      x: 378.08465225632125,
                      y: 4
                    }
                  ],
                  lineWidth: 1,
                  stroke: true,
                  strokeColor: '#D8DCE3',
                  strokeOpacity: 1,
                  pickable: true,
                  zIndex: 300
                },
                id: 275,
                type: 'line',
                children: []
              },
              {
                attribute: {
                  visible: true,
                  points: [
                    {
                      x: 434.0971933313318,
                      y: 0
                    },
                    {
                      x: 434.0971933313318,
                      y: 4
                    }
                  ],
                  lineWidth: 1,
                  stroke: true,
                  strokeColor: '#D8DCE3',
                  strokeOpacity: 1,
                  pickable: true,
                  zIndex: 300
                },
                id: 276,
                type: 'line',
                children: []
              },
              {
                attribute: {
                  visible: true,
                  points: [
                    {
                      x: 490.1097344063424,
                      y: 0
                    },
                    {
                      x: 490.1097344063424,
                      y: 4
                    }
                  ],
                  lineWidth: 1,
                  stroke: true,
                  strokeColor: '#D8DCE3',
                  strokeOpacity: 1,
                  pickable: true,
                  zIndex: 300
                },
                id: 277,
                type: 'line',
                children: []
              },
              {
                attribute: {
                  visible: true,
                  points: [
                    {
                      x: 546.122275481353,
                      y: 0
                    },
                    {
                      x: 546.122275481353,
                      y: 4
                    }
                  ],
                  lineWidth: 1,
                  stroke: true,
                  strokeColor: '#D8DCE3',
                  strokeOpacity: 1,
                  pickable: true,
                  zIndex: 300
                },
                id: 278,
                type: 'line',
                children: []
              },
              {
                attribute: {
                  visible: true,
                  points: [
                    {
                      x: 602.1348165563636,
                      y: 0
                    },
                    {
                      x: 602.1348165563636,
                      y: 4
                    }
                  ],
                  lineWidth: 1,
                  stroke: true,
                  strokeColor: '#D8DCE3',
                  strokeOpacity: 1,
                  pickable: true,
                  zIndex: 300
                },
                id: 279,
                type: 'line',
                children: []
              },
              {
                attribute: {
                  visible: true,
                  points: [
                    {
                      x: 658.1473576313741,
                      y: 0
                    },
                    {
                      x: 658.1473576313741,
                      y: 4
                    }
                  ],
                  lineWidth: 1,
                  stroke: true,
                  strokeColor: '#D8DCE3',
                  strokeOpacity: 1,
                  pickable: true,
                  zIndex: 300
                },
                id: 280,
                type: 'line',
                children: []
              },
              {
                attribute: {
                  visible: true,
                  points: [
                    {
                      x: 714.1598987063846,
                      y: 0
                    },
                    {
                      x: 714.1598987063846,
                      y: 4
                    }
                  ],
                  lineWidth: 1,
                  stroke: true,
                  strokeColor: '#D8DCE3',
                  strokeOpacity: 1,
                  pickable: true,
                  zIndex: 300
                },
                id: 281,
                type: 'line',
                children: []
              },
              {
                attribute: {
                  visible: true,
                  points: [
                    {
                      x: 770.1724397813953,
                      y: 0
                    },
                    {
                      x: 770.1724397813953,
                      y: 4
                    }
                  ],
                  lineWidth: 1,
                  stroke: true,
                  strokeColor: '#D8DCE3',
                  strokeOpacity: 1,
                  pickable: true,
                  zIndex: 300
                },
                id: 282,
                type: 'line',
                children: []
              },
              {
                attribute: {
                  visible: true,
                  points: [
                    {
                      x: 826.1849808564058,
                      y: 0
                    },
                    {
                      x: 826.1849808564058,
                      y: 4
                    }
                  ],
                  lineWidth: 1,
                  stroke: true,
                  strokeColor: '#D8DCE3',
                  strokeOpacity: 1,
                  pickable: true,
                  zIndex: 300
                },
                id: 283,
                type: 'line',
                children: []
              },
              {
                attribute: {
                  visible: true,
                  points: [
                    {
                      x: 882.1975219314164,
                      y: 0
                    },
                    {
                      x: 882.1975219314164,
                      y: 4
                    }
                  ],
                  lineWidth: 1,
                  stroke: true,
                  strokeColor: '#D8DCE3',
                  strokeOpacity: 1,
                  pickable: true,
                  zIndex: 300
                },
                id: 284,
                type: 'line',
                children: []
              },
              {
                attribute: {
                  visible: true,
                  points: [
                    {
                      x: 938.2100630064269,
                      y: 0
                    },
                    {
                      x: 938.2100630064269,
                      y: 4
                    }
                  ],
                  lineWidth: 1,
                  stroke: true,
                  strokeColor: '#D8DCE3',
                  strokeOpacity: 1,
                  pickable: true,
                  zIndex: 300
                },
                id: 285,
                type: 'line',
                children: []
              },
              {
                attribute: {
                  visible: true,
                  points: [
                    {
                      x: 994.2226040814375,
                      y: 0
                    },
                    {
                      x: 994.2226040814375,
                      y: 4
                    }
                  ],
                  lineWidth: 1,
                  stroke: true,
                  strokeColor: '#D8DCE3',
                  strokeOpacity: 1,
                  pickable: true,
                  zIndex: 300
                },
                id: 286,
                type: 'line',
                children: []
              }
            ]
          },
          {
            attribute: {
              pickable: false,
              zIndex: 300
            },
            id: 254,
            type: 'group',
            name: 'axisDomain_26',
            children: [
              {
                attribute: {
                  visible: true,
                  points: [
                    {
                      x: 0,
                      y: 0
                    },
                    {
                      x: 1036.2320098876953,
                      y: 0
                    }
                  ],
                  lineWidth: 1,
                  stroke: true,
                  strokeColor: '#dfdfdf',
                  strokeOpacity: 1,
                  pickable: true,
                  zIndex: 300
                },
                id: 255,
                type: 'line',
                children: []
              }
            ]
          },
          {
            attribute: {
              pickable: false,
              zIndex: 300
            },
            id: 256,
            type: 'group',
            name: 'axisLabel_27',
            children: [
              {
                attribute: {
                  visible: true,
                  x: 42.009405806257945,
                  y: 8,
                  angle: 0,
                  textAlign: 'center',
                  textBaseline: 'top',
                  fontSize: 12,
                  fill: true,
                  fillColor: '#6F6F6F',
                  fontWeight: 'normal',
                  fillOpacity: 0,
                  text: '3/19',
                  pickable: true,
                  zIndex: 300,
                  strokeOpacity: 1
                },
                id: 257,
                type: 'text',
                children: []
              },
              {
                attribute: {
                  visible: true,
                  x: 98.0219468812685,
                  y: 8,
                  angle: 0,
                  textAlign: 'center',
                  textBaseline: 'top',
                  fontSize: 12,
                  fill: true,
                  fillColor: '#6F6F6F',
                  fontWeight: 'normal',
                  fillOpacity: 0,
                  text: '3/20',
                  pickable: true,
                  zIndex: 300,
                  strokeOpacity: 1
                },
                id: 287,
                type: 'text',
                children: []
              },
              {
                attribute: {
                  visible: true,
                  x: 154.03448795627907,
                  y: 8,
                  angle: 0,
                  textAlign: 'center',
                  textBaseline: 'top',
                  fontSize: 12,
                  fill: true,
                  fillColor: '#6F6F6F',
                  fontWeight: 'normal',
                  fillOpacity: 0,
                  text: '3/21',
                  pickable: true,
                  zIndex: 300,
                  strokeOpacity: 1
                },
                id: 288,
                type: 'text',
                children: []
              },
              {
                attribute: {
                  visible: true,
                  x: 210.0470290312896,
                  y: 8,
                  angle: 0,
                  textAlign: 'center',
                  textBaseline: 'top',
                  fontSize: 12,
                  fill: true,
                  fillColor: '#6F6F6F',
                  fontWeight: 'normal',
                  fillOpacity: 0,
                  text: '3/22',
                  pickable: true,
                  zIndex: 300,
                  strokeOpacity: 1
                },
                id: 289,
                type: 'text',
                children: []
              },
              {
                attribute: {
                  visible: true,
                  x: 266.05957010630016,
                  y: 8,
                  angle: 0,
                  textAlign: 'center',
                  textBaseline: 'top',
                  fontSize: 12,
                  fill: true,
                  fillColor: '#6F6F6F',
                  fontWeight: 'normal',
                  fillOpacity: 0,
                  text: '3/23',
                  pickable: true,
                  zIndex: 300,
                  strokeOpacity: 1
                },
                id: 290,
                type: 'text',
                children: []
              },
              {
                attribute: {
                  visible: true,
                  x: 322.07211118131073,
                  y: 8,
                  angle: 0,
                  textAlign: 'center',
                  textBaseline: 'top',
                  fontSize: 12,
                  fill: true,
                  fillColor: '#6F6F6F',
                  fontWeight: 'normal',
                  fillOpacity: 0,
                  text: '3/24',
                  pickable: true,
                  zIndex: 300,
                  strokeOpacity: 1
                },
                id: 291,
                type: 'text',
                children: []
              },
              {
                attribute: {
                  visible: true,
                  x: 378.08465225632125,
                  y: 8,
                  angle: 0,
                  textAlign: 'center',
                  textBaseline: 'top',
                  fontSize: 12,
                  fill: true,
                  fillColor: '#6F6F6F',
                  fontWeight: 'normal',
                  fillOpacity: 0,
                  text: '3/25',
                  pickable: true,
                  zIndex: 300,
                  strokeOpacity: 1
                },
                id: 292,
                type: 'text',
                children: []
              },
              {
                attribute: {
                  visible: true,
                  x: 434.0971933313318,
                  y: 8,
                  angle: 0,
                  textAlign: 'center',
                  textBaseline: 'top',
                  fontSize: 12,
                  fill: true,
                  fillColor: '#6F6F6F',
                  fontWeight: 'normal',
                  fillOpacity: 0,
                  text: '3/26',
                  pickable: true,
                  zIndex: 300,
                  strokeOpacity: 1
                },
                id: 293,
                type: 'text',
                children: []
              },
              {
                attribute: {
                  visible: true,
                  x: 490.1097344063424,
                  y: 8,
                  angle: 0,
                  textAlign: 'center',
                  textBaseline: 'top',
                  fontSize: 12,
                  fill: true,
                  fillColor: '#6F6F6F',
                  fontWeight: 'normal',
                  fillOpacity: 0,
                  text: '3/27',
                  pickable: true,
                  zIndex: 300,
                  strokeOpacity: 1
                },
                id: 294,
                type: 'text',
                children: []
              },
              {
                attribute: {
                  visible: true,
                  x: 546.122275481353,
                  y: 8,
                  angle: 0,
                  textAlign: 'center',
                  textBaseline: 'top',
                  fontSize: 12,
                  fill: true,
                  fillColor: '#6F6F6F',
                  fontWeight: 'normal',
                  fillOpacity: 0,
                  text: '3/28',
                  pickable: true,
                  zIndex: 300,
                  strokeOpacity: 1
                },
                id: 295,
                type: 'text',
                children: []
              },
              {
                attribute: {
                  visible: true,
                  x: 602.1348165563636,
                  y: 8,
                  angle: 0,
                  textAlign: 'center',
                  textBaseline: 'top',
                  fontSize: 12,
                  fill: true,
                  fillColor: '#6F6F6F',
                  fontWeight: 'normal',
                  fillOpacity: 0,
                  text: '3/29',
                  pickable: true,
                  zIndex: 300,
                  strokeOpacity: 1
                },
                id: 296,
                type: 'text',
                children: []
              },
              {
                attribute: {
                  visible: true,
                  x: 658.1473576313741,
                  y: 8,
                  angle: 0,
                  textAlign: 'center',
                  textBaseline: 'top',
                  fontSize: 12,
                  fill: true,
                  fillColor: '#6F6F6F',
                  fontWeight: 'normal',
                  fillOpacity: 0,
                  text: '3/30',
                  pickable: true,
                  zIndex: 300,
                  strokeOpacity: 1
                },
                id: 297,
                type: 'text',
                children: []
              },
              {
                attribute: {
                  visible: true,
                  x: 714.1598987063846,
                  y: 8,
                  angle: 0,
                  textAlign: 'center',
                  textBaseline: 'top',
                  fontSize: 12,
                  fill: true,
                  fillColor: '#6F6F6F',
                  fontWeight: 'normal',
                  fillOpacity: 0,
                  text: '3/31',
                  pickable: true,
                  zIndex: 300,
                  strokeOpacity: 1
                },
                id: 298,
                type: 'text',
                children: []
              },
              {
                attribute: {
                  visible: true,
                  x: 770.1724397813953,
                  y: 8,
                  angle: 0,
                  textAlign: 'center',
                  textBaseline: 'top',
                  fontSize: 12,
                  fill: true,
                  fillColor: '#6F6F6F',
                  fontWeight: 'normal',
                  fillOpacity: 0,
                  text: '4/1',
                  pickable: true,
                  zIndex: 300,
                  strokeOpacity: 1
                },
                id: 299,
                type: 'text',
                children: []
              },
              {
                attribute: {
                  visible: true,
                  x: 826.1849808564058,
                  y: 8,
                  angle: 0,
                  textAlign: 'center',
                  textBaseline: 'top',
                  fontSize: 12,
                  fill: true,
                  fillColor: '#6F6F6F',
                  fontWeight: 'normal',
                  fillOpacity: 0,
                  text: '4/2',
                  pickable: true,
                  zIndex: 300,
                  strokeOpacity: 1
                },
                id: 300,
                type: 'text',
                children: []
              },
              {
                attribute: {
                  visible: true,
                  x: 882.1975219314164,
                  y: 8,
                  angle: 0,
                  textAlign: 'center',
                  textBaseline: 'top',
                  fontSize: 12,
                  fill: true,
                  fillColor: '#6F6F6F',
                  fontWeight: 'normal',
                  fillOpacity: 0,
                  text: '4/3',
                  pickable: true,
                  zIndex: 300,
                  strokeOpacity: 1
                },
                id: 301,
                type: 'text',
                children: []
              },
              {
                attribute: {
                  visible: true,
                  x: 938.2100630064269,
                  y: 8,
                  angle: 0,
                  textAlign: 'center',
                  textBaseline: 'top',
                  fontSize: 12,
                  fill: true,
                  fillColor: '#6F6F6F',
                  fontWeight: 'normal',
                  fillOpacity: 0,
                  text: '4/4',
                  pickable: true,
                  zIndex: 300,
                  strokeOpacity: 1
                },
                id: 302,
                type: 'text',
                children: []
              },
              {
                attribute: {
                  visible: true,
                  x: 994.2226040814375,
                  y: 8,
                  angle: 0,
                  textAlign: 'center',
                  textBaseline: 'top',
                  fontSize: 12,
                  fill: true,
                  fillColor: '#6F6F6F',
                  fontWeight: 'normal',
                  fillOpacity: 0,
                  text: '',
                  pickable: true,
                  zIndex: 300,
                  strokeOpacity: 1
                },
                id: 303,
                type: 'text',
                children: []
              }
            ]
          }
        ]
      },
      {
        attribute: {
          visible: true,
          x: 45.76799011230469,
          y: 447,
          clip: false,
          pickable: false,
          zIndex: 100
        },
        id: 258,
        type: 'group',
        name: 'axisGrid_28',
        children: []
      },
      {
        attribute: {
          visible: true,
          x: 12,
          y: 470,
          clip: false,
          pickable: false,
          zIndex: 500
        },
        id: 259,
        type: 'group',
        name: 'legendGroup_32',
        children: [
          {
            attribute: {
              visible: true,
              x: 535,
              y: 0,
              clip: false,
              pickable: false,
              zIndex: 300
            },
            id: 260,
            type: 'group',
            name: 'item_33',
            children: [
              {
                attribute: {
                  pickable: false,
                  zIndex: 300
                },
                id: 261,
                type: 'group',
                name: 'background_34',
                children: [
                  {
                    attribute: {
                      visible: true,
                      x: 0,
                      y: 0,
                      fill: true,
                      fillColor: 'gray',
                      fillOpacity: 0,
                      pickable: true,
                      zIndex: 300,
                      width: 70,
                      height: 18,
                      dx: 0,
                      dy: 0
                    },
                    id: 262,
                    type: 'rect',
                    children: []
                  },
                  {
                    attribute: {
                      visible: true,
                      x: 0,
                      y: 0,
                      fill: true,
                      fillColor: 'gray',
                      fillOpacity: 0,
                      pickable: true,
                      zIndex: 300,
                      width: null,
                      height: 15,
                      dx: 80,
                      dy: 0
                    },
                    id: 263,
                    type: 'rect',
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

  return spec;
};

function createContent(stage: Stage) {
  const symbolSpec = symbolGenerator();
  const symbolGroup = _add(stage.defaultLayer, symbolSpec);
  const symbolGraphic = stage.defaultLayer.findAll(node => node.type === 'symbol', true) as ISymbol[];
  const lineGraphic = stage.defaultLayer.findAll(node => node.type === 'line', true) as ILine[];

  const symbolLabel = new SymbolLabel({
    baseMarkGroupName: 'point_10',
    data: [
      {
        text: '0.59',
        // x: 100,
        // y: 100,
        data: {
          type: 'Next Day'
        },
        fillColor: '#6690F2',
        angle: 0,
        textBaseline: 'middle',
        fontFamily:
          'PingFang SC,Microsoft Yahei,system-ui,-apple-system,segoe ui,Roboto,Helvetica,Arial,sans-serif, apple color emoji,segoe ui emoji,segoe ui symbol',
        textAlign: 'center'
      },
      {
        text: '0.57',
        data: {
          x: '3/20',
          type: 'Next Day',
          y: '0.568924210630669'
        },
        fillColor: '#6690F2',
        angle: 0,
        textBaseline: 'middle',
        fontFamily:
          'PingFang SC,Microsoft Yahei,system-ui,-apple-system,segoe ui,Roboto,Helvetica,Arial,sans-serif, apple color emoji,segoe ui emoji,segoe ui symbol',
        textAlign: 'center'
      },
      {
        text: '0.58',
        data: {
          x: '3/21',
          type: 'Next Day',
          y: '0.582271905667467'
        },
        fillColor: '#6690F2',
        angle: 0,
        textBaseline: 'middle',
        fontFamily:
          'PingFang SC,Microsoft Yahei,system-ui,-apple-system,segoe ui,Roboto,Helvetica,Arial,sans-serif, apple color emoji,segoe ui emoji,segoe ui symbol',
        textAlign: 'center'
      },
      {
        text: '0.59',
        data: {
          x: '3/22',
          type: 'Next Day',
          y: '0.589969549177714'
        },
        fillColor: '#6690F2',
        angle: 0,
        textBaseline: 'middle',
        fontFamily:
          'PingFang SC,Microsoft Yahei,system-ui,-apple-system,segoe ui,Roboto,Helvetica,Arial,sans-serif, apple color emoji,segoe ui emoji,segoe ui symbol',
        textAlign: 'center'
      },
      {
        text: '0.60',
        data: {
          x: '3/23',
          type: 'Next Day',
          y: '0.5992681629820811'
        },
        fillColor: '#6690F2',
        angle: 0,
        textBaseline: 'middle',
        fontFamily:
          'PingFang SC,Microsoft Yahei,system-ui,-apple-system,segoe ui,Roboto,Helvetica,Arial,sans-serif, apple color emoji,segoe ui emoji,segoe ui symbol',
        textAlign: 'center'
      },
      {
        text: '0.60',
        data: {
          x: '3/24',
          type: 'Next Day',
          y: '0.5959638605764801'
        },
        fillColor: '#6690F2',
        angle: 0,
        textBaseline: 'middle',
        fontFamily:
          'PingFang SC,Microsoft Yahei,system-ui,-apple-system,segoe ui,Roboto,Helvetica,Arial,sans-serif, apple color emoji,segoe ui emoji,segoe ui symbol',
        textAlign: 'center'
      },
      {
        text: '0.59',
        data: {
          x: '3/25',
          type: 'Next Day',
          y: '0.5934127247180621'
        },
        fillColor: '#6690F2',
        angle: 0,
        textBaseline: 'middle',
        fontFamily:
          'PingFang SC,Microsoft Yahei,system-ui,-apple-system,segoe ui,Roboto,Helvetica,Arial,sans-serif, apple color emoji,segoe ui emoji,segoe ui symbol',
        textAlign: 'center'
      },
      {
        text: '0.59',
        data: {
          x: '3/26',
          type: 'Next Day',
          y: '0.59232098315027'
        },
        fillColor: '#6690F2',
        angle: 0,
        textBaseline: 'middle',
        fontFamily:
          'PingFang SC,Microsoft Yahei,system-ui,-apple-system,segoe ui,Roboto,Helvetica,Arial,sans-serif, apple color emoji,segoe ui emoji,segoe ui symbol',
        textAlign: 'center'
      },
      {
        text: '0.57',
        data: {
          x: '3/27',
          type: 'Next Day',
          y: '0.568633150771097'
        },
        fillColor: '#6690F2',
        angle: 0,
        textBaseline: 'middle',
        fontFamily:
          'PingFang SC,Microsoft Yahei,system-ui,-apple-system,segoe ui,Roboto,Helvetica,Arial,sans-serif, apple color emoji,segoe ui emoji,segoe ui symbol',
        textAlign: 'center'
      },
      {
        text: '0.59',
        data: {
          x: '3/28',
          type: 'Next Day',
          y: '0.5943808326961431'
        },
        fillColor: '#6690F2',
        angle: 0,
        textBaseline: 'middle',
        fontFamily:
          'PingFang SC,Microsoft Yahei,system-ui,-apple-system,segoe ui,Roboto,Helvetica,Arial,sans-serif, apple color emoji,segoe ui emoji,segoe ui symbol',
        textAlign: 'center'
      },
      {
        text: '0.59',
        data: {
          x: '3/29',
          type: 'Next Day',
          y: '0.585247882014535'
        },
        fillColor: '#6690F2',
        angle: 0,
        textBaseline: 'middle',
        fontFamily:
          'PingFang SC,Microsoft Yahei,system-ui,-apple-system,segoe ui,Roboto,Helvetica,Arial,sans-serif, apple color emoji,segoe ui emoji,segoe ui symbol',
        textAlign: 'center'
      },
      {
        text: '0.59',
        data: {
          x: '3/30',
          type: 'Next Day',
          y: '0.585123262947785'
        },
        fillColor: '#6690F2',
        angle: 0,
        textBaseline: 'middle',
        fontFamily:
          'PingFang SC,Microsoft Yahei,system-ui,-apple-system,segoe ui,Roboto,Helvetica,Arial,sans-serif, apple color emoji,segoe ui emoji,segoe ui symbol',
        textAlign: 'center'
      },
      {
        text: '0.58',
        data: {
          x: '3/31',
          type: 'Next Day',
          y: '0.5832914724242241'
        },
        fillColor: '#6690F2',
        angle: 0,
        textBaseline: 'middle',
        fontFamily:
          'PingFang SC,Microsoft Yahei,system-ui,-apple-system,segoe ui,Roboto,Helvetica,Arial,sans-serif, apple color emoji,segoe ui emoji,segoe ui symbol',
        textAlign: 'center'
      },
      {
        text: '0.60',
        data: {
          x: '4/1',
          type: 'Next Day',
          y: '0.595487271407492'
        },
        fillColor: '#6690F2',
        angle: 0,
        textBaseline: 'middle',
        fontFamily:
          'PingFang SC,Microsoft Yahei,system-ui,-apple-system,segoe ui,Roboto,Helvetica,Arial,sans-serif, apple color emoji,segoe ui emoji,segoe ui symbol',
        textAlign: 'center'
      },
      {
        text: '0.60',
        data: {
          x: '4/2',
          type: 'Next Day',
          y: '0.59826854659979'
        },
        fillColor: '#6690F2',
        angle: 0,
        textBaseline: 'middle',
        fontFamily:
          'PingFang SC,Microsoft Yahei,system-ui,-apple-system,segoe ui,Roboto,Helvetica,Arial,sans-serif, apple color emoji,segoe ui emoji,segoe ui symbol',
        textAlign: 'center'
      },
      {
        text: '0.60',
        data: {
          x: '4/3',
          type: 'Next Day',
          y: '0.6025848196101731'
        },
        fillColor: '#6690F2',
        angle: 0,
        textBaseline: 'middle',
        fontFamily:
          'PingFang SC,Microsoft Yahei,system-ui,-apple-system,segoe ui,Roboto,Helvetica,Arial,sans-serif, apple color emoji,segoe ui emoji,segoe ui symbol',
        textAlign: 'center'
      },
      {
        text: '0.59',
        data: {
          x: '4/4',
          type: 'Next Day',
          y: '0.5931351801064451'
        },
        fillColor: '#6690F2',
        angle: 0,
        textBaseline: 'middle',
        fontFamily:
          'PingFang SC,Microsoft Yahei,system-ui,-apple-system,segoe ui,Roboto,Helvetica,Arial,sans-serif, apple color emoji,segoe ui emoji,segoe ui symbol',
        textAlign: 'center'
      },
      {
        text: '0.00',
        data: {
          x: '',
          type: '',
          y: ''
        },
        fillColor: '#70D6A3',
        angle: 0,
        textBaseline: 'middle',
        fontFamily:
          'PingFang SC,Microsoft Yahei,system-ui,-apple-system,segoe ui,Roboto,Helvetica,Arial,sans-serif, apple color emoji,segoe ui emoji,segoe ui symbol',
        textAlign: 'center'
      },
      {
        text: '0.00',
        data: {
          x: '',
          type: '',
          y: ''
        },
        fillColor: '#70D6A3',
        angle: 0,
        textBaseline: 'middle',
        fontFamily:
          'PingFang SC,Microsoft Yahei,system-ui,-apple-system,segoe ui,Roboto,Helvetica,Arial,sans-serif, apple color emoji,segoe ui emoji,segoe ui symbol',
        textAlign: 'center'
      }
    ],
    type: 'symbol',
    animation: {
      // mode: 'after'
    },
    overlap: {
      enable: false,
      avoidBaseMark: true,
      size: {
        width: 1036.2320098876953,
        height: 435
      },
      strategy: [
        {
          type: 'position'
        }
      ]
    },

    zIndex: 301
  });
  symbolLabel.setLocation({ x: 45.76799011230469, y: 12 });
  const lineLabel = new LineLabel({
    baseMarkGroupName: 'line_9',
    data: [
      {
        text: '这是一个折线',
        fillColor: '#6690F2',
        angle: 0,
        textBaseline: 'middle',
        fontFamily:
          'PingFang SC,Microsoft Yahei,system-ui,-apple-system,segoe ui,Roboto,Helvetica,Arial,sans-serif, apple color emoji,segoe ui emoji,segoe ui symbol',
        textAlign: 'center'
      }
    ],
    animation: {
      mode: 'after'
    },
    position: 'end',
    type: 'line',
    overlap: {
      // enable: false,
      avoidBaseMark: true,
      size: {
        width: 1036.2320098876953,
        height: 435
      }
    },
    zIndex: 302
  });
  // lineLabel.afterOverlap = (bitmap: any) => {
  //   stage.setAfterRender(() => {
  //     const dpr = stage.dpr;
  //     const imageData = bitmap.toImageData(stage.window.getContext().getContext(), 45.76799011230469, 12, dpr);
  //     const layoutCanvas = document.getElementById('layout') as HTMLCanvasElement;
  //     const chartCanvas = document.getElementById('main') as HTMLCanvasElement;
  //     layoutCanvas.getContext('2d')?.putImageData(imageData, 45.76799011230469, 12);
  //     layoutCanvas.style.top = `${chartCanvas.getBoundingClientRect().y}px`;
  //     layoutCanvas.style.left = `${chartCanvas.getBoundingClientRect().x}px`;
  //     layoutCanvas.style.visibility = `visible`;
  //   });
  // };
  stage.defaultLayer.add(lineLabel);
  stage.defaultLayer.add(symbolLabel);
  symbolGraphic.forEach((symbol, index) => {
    symbol
      .animate()
      .wait(index * 100 + 100 * index) // 500 duration + 200 for label animation
      .to({ fillOpacity: 1 }, 100, 'linear');
  });

  lineGraphic.forEach(line => {
    line.setAttributes({ clipRange: 0 });
    line.animate().to({ clipRange: 1 }, 16 * 100 * 2, 'linear');
  });

  lineLabel.setLocation({ x: 45.76799011230469, y: 12 });
  return { symbol: symbolGroup, label: symbolLabel };
}

const stage = createRenderer('main', {
  width: 1094,
  height: 500,
  viewBox: {
    x1: 0,
    y1: 0,
    x2: 1094,
    y2: 500
  }
});
createContent(stage);
stage.render();
