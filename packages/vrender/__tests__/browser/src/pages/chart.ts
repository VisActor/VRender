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
  _uid: 267,
  type: 'group',
  children: [
    {
      attribute: {},
      _uid: 271,
      type: 'group',
      children: [
        {
          attribute: {
            x: 0,
            y: 0,
            width: 500,
            height: 500,
            sizeAttrs: {
              x: 0,
              y: 0,
              width: 500,
              height: 500
            }
          },
          _uid: 276,
          type: 'group',
          name: 'root',
          children: [
            {
              attribute: {
                pickable: false,
                zIndex: 0
              },
              _uid: 277,
              type: 'group',
              name: 'VGRAMMAR_MARK_8',
              children: [
                {
                  attribute: {
                    title: {
                      space: 4,
                      padding: [0, 0, 0, 0],
                      textStyle: {
                        fontSize: 12,
                        fill: '#333333',
                        fontWeight: 'normal',
                        fillOpacity: 1
                      },
                      text: 'theta'
                    },
                    label: {
                      visible: true,
                      inside: false,
                      space: 4,
                      padding: 0,
                      style: {
                        fontSize: 12,
                        fill: '#6F6F6F',
                        fontWeight: 'normal',
                        fillOpacity: 1
                      }
                    },
                    tick: {
                      visible: true,
                      inside: false,
                      alignWithLabel: true,
                      length: 4,
                      style: {
                        lineWidth: 1,
                        stroke: '#D9DDE4',
                        strokeOpacity: 1
                      }
                    },
                    subTick: {
                      visible: false,
                      inside: false,
                      count: 4,
                      length: 2,
                      style: {
                        lineWidth: 1,
                        stroke: '#D9DDE4',
                        strokeOpacity: 1
                      }
                    },
                    line: {
                      visible: true,
                      style: {
                        lineWidth: 1,
                        stroke: '#D9DDE4',
                        strokeOpacity: 1
                      }
                    },
                    x: 0,
                    y: 0,
                    start: {
                      x: 0,
                      y: 0
                    },
                    end: {
                      x: 0,
                      y: 0
                    },
                    items: [
                      [
                        {
                          id: 0,
                          label: 'test0',
                          value: 0.08333333333333338,
                          rawValue: 'test0'
                        },
                        {
                          id: 1,
                          label: 'test1',
                          value: 0.25000000000000006,
                          rawValue: 'test1'
                        },
                        {
                          id: 2,
                          label: 'test2',
                          value: 0.4166666666666667,
                          rawValue: 'test2'
                        },
                        {
                          id: 3,
                          label: 'test3',
                          value: 0.5833333333333334,
                          rawValue: 'test3'
                        },
                        {
                          id: 4,
                          label: 'test4',
                          value: 0.75,
                          rawValue: 'test4'
                        },
                        {
                          id: 5,
                          label: 'test5',
                          value: 0.9166666666666666,
                          rawValue: 'test5'
                        }
                      ]
                    ],
                    startAngle: 0,
                    endAngle: 6.283185307179586,
                    radius: 210,
                    innerRadius: 0,
                    center: {
                      x: 250,
                      y: 250
                    },
                    grid: {
                      visible: true
                    }
                  },
                  _uid: 278,
                  type: 'group',
                  name: 'axis',
                  children: [
                    {
                      attribute: {
                        x: 0,
                        y: 0,
                        pickable: false
                      },
                      _uid: 297,
                      type: 'group',
                      children: [
                        {
                          attribute: {
                            x: 0,
                            y: 0,
                            zIndex: 1
                          },
                          _uid: 298,
                          type: 'group',
                          name: 'axis-container',
                          children: [
                            {
                              attribute: {
                                x: 250,
                                y: 250,
                                startAngle: 0,
                                endAngle: 6.283185307179586,
                                radius: 210,
                                innerRadius: 0,
                                lineWidth: 1,
                                stroke: '#D9DDE4',
                                strokeOpacity: 1
                              },
                              _uid: 299,
                              type: 'circle',
                              name: 'axis-line',
                              children: []
                            },
                            {
                              attribute: {
                                x: 0,
                                y: 0,
                                pickable: false
                              },
                              _uid: 300,
                              type: 'group',
                              name: 'axis-tick-container',
                              children: [
                                {
                                  attribute: {
                                    points: [
                                      {
                                        x: 431.8653347947321,
                                        y: 355.00000000000006
                                      },
                                      {
                                        x: 435.32943640986986,
                                        y: 357.00000000000006
                                      }
                                    ],
                                    lineWidth: 1,
                                    stroke: '#D9DDE4',
                                    strokeOpacity: 1
                                  },
                                  _uid: 301,
                                  type: 'line',
                                  name: 'axis-tick',
                                  children: []
                                },
                                {
                                  attribute: {
                                    points: [
                                      {
                                        x: 249.99999999999991,
                                        y: 460
                                      },
                                      {
                                        x: 249.99999999999991,
                                        y: 464
                                      }
                                    ],
                                    lineWidth: 1,
                                    stroke: '#D9DDE4',
                                    strokeOpacity: 1
                                  },
                                  _uid: 302,
                                  type: 'line',
                                  name: 'axis-tick',
                                  children: []
                                },
                                {
                                  attribute: {
                                    points: [
                                      {
                                        x: 68.13466520526788,
                                        y: 355
                                      },
                                      {
                                        x: 64.67056359013013,
                                        y: 357
                                      }
                                    ],
                                    lineWidth: 1,
                                    stroke: '#D9DDE4',
                                    strokeOpacity: 1
                                  },
                                  _uid: 303,
                                  type: 'line',
                                  name: 'axis-tick',
                                  children: []
                                },
                                {
                                  attribute: {
                                    points: [
                                      {
                                        x: 68.13466520526791,
                                        y: 144.99999999999997
                                      },
                                      {
                                        x: 64.67056359013016,
                                        y: 142.99999999999997
                                      }
                                    ],
                                    lineWidth: 1,
                                    stroke: '#D9DDE4',
                                    strokeOpacity: 1
                                  },
                                  _uid: 304,
                                  type: 'line',
                                  name: 'axis-tick',
                                  children: []
                                },
                                {
                                  attribute: {
                                    points: [
                                      {
                                        x: 249.99999999999997,
                                        y: 40
                                      },
                                      {
                                        x: 249.99999999999997,
                                        y: 36
                                      }
                                    ],
                                    lineWidth: 1,
                                    stroke: '#D9DDE4',
                                    strokeOpacity: 1
                                  },
                                  _uid: 305,
                                  type: 'line',
                                  name: 'axis-tick',
                                  children: []
                                },
                                {
                                  attribute: {
                                    points: [
                                      {
                                        x: 431.86533479473206,
                                        y: 144.9999999999999
                                      },
                                      {
                                        x: 435.3294364098698,
                                        y: 142.9999999999999
                                      }
                                    ],
                                    lineWidth: 1,
                                    stroke: '#D9DDE4',
                                    strokeOpacity: 1
                                  },
                                  _uid: 306,
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
                              _uid: 307,
                              type: 'group',
                              name: 'axis-label-container',
                              children: [
                                {
                                  attribute: {
                                    x: 0,
                                    y: 0,
                                    pickable: false
                                  },
                                  _uid: 308,
                                  type: 'group',
                                  name: 'axis-label-container-layer-0',
                                  children: [
                                    {
                                      attribute: {
                                        x: 438.79353802500765,
                                        y: 359.00000000000006,
                                        text: 'test0',
                                        lineHeight: 12,
                                        textAlign: 'start',
                                        textBaseline: 'middle',
                                        fontSize: 12,
                                        fill: '#6F6F6F',
                                        fontWeight: 'normal',
                                        fillOpacity: 1
                                      },
                                      _uid: 309,
                                      type: 'text',
                                      name: 'axis-label',
                                      children: []
                                    },
                                    {
                                      attribute: {
                                        x: 249.99999999999991,
                                        y: 468,
                                        text: 'test1',
                                        lineHeight: 12,
                                        textAlign: 'center',
                                        textBaseline: 'top',
                                        fontSize: 12,
                                        fill: '#6F6F6F',
                                        fontWeight: 'normal',
                                        fillOpacity: 1
                                      },
                                      _uid: 310,
                                      type: 'text',
                                      name: 'axis-label',
                                      children: []
                                    },
                                    {
                                      attribute: {
                                        x: 61.20646197499237,
                                        y: 359,
                                        text: 'test2',
                                        lineHeight: 12,
                                        textAlign: 'end',
                                        textBaseline: 'middle',
                                        fontSize: 12,
                                        fill: '#6F6F6F',
                                        fontWeight: 'normal',
                                        fillOpacity: 1
                                      },
                                      _uid: 311,
                                      type: 'text',
                                      name: 'axis-label',
                                      children: []
                                    },
                                    {
                                      attribute: {
                                        x: 61.2064619749924,
                                        y: 140.99999999999997,
                                        text: 'test3',
                                        lineHeight: 12,
                                        textAlign: 'end',
                                        textBaseline: 'middle',
                                        fontSize: 12,
                                        fill: '#6F6F6F',
                                        fontWeight: 'normal',
                                        fillOpacity: 1
                                      },
                                      _uid: 312,
                                      type: 'text',
                                      name: 'axis-label',
                                      children: []
                                    },
                                    {
                                      attribute: {
                                        x: 249.99999999999997,
                                        y: 32,
                                        text: 'test4',
                                        lineHeight: 12,
                                        textAlign: 'center',
                                        textBaseline: 'bottom',
                                        fontSize: 12,
                                        fill: '#6F6F6F',
                                        fontWeight: 'normal',
                                        fillOpacity: 1
                                      },
                                      _uid: 313,
                                      type: 'text',
                                      name: 'axis-label',
                                      children: []
                                    },
                                    {
                                      attribute: {
                                        x: 438.7935380250076,
                                        y: 140.9999999999999,
                                        text: 'test5',
                                        lineHeight: 12,
                                        textAlign: 'start',
                                        textBaseline: 'middle',
                                        fontSize: 12,
                                        fill: '#6F6F6F',
                                        fontWeight: 'normal',
                                        fillOpacity: 1
                                      },
                                      _uid: 314,
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
                zIndex: 0
              },
              _uid: 315,
              type: 'group',
              name: 'VGRAMMAR_MARK_9',
              children: [
                {
                  attribute: {
                    title: {
                      space: 4,
                      padding: 0,
                      textStyle: {
                        fontSize: 12,
                        fill: '#333333',
                        fontWeight: 'normal',
                        fillOpacity: 1
                      }
                    },
                    label: {
                      visible: true,
                      inside: false,
                      space: 4,
                      padding: 0,
                      style: {
                        fontSize: 12,
                        fill: '#89909d',
                        fontWeight: 'normal',
                        fillOpacity: 1
                      }
                    },
                    tick: {
                      visible: true,
                      inside: false,
                      alignWithLabel: true,
                      length: 4,
                      style: {
                        lineWidth: 1,
                        stroke: '#D9DDE4',
                        strokeOpacity: 1
                      }
                    },
                    subTick: {
                      visible: false,
                      inside: false,
                      count: 4,
                      length: 2,
                      style: {
                        lineWidth: 1,
                        stroke: '#D9DDE4',
                        strokeOpacity: 1
                      }
                    },
                    line: {
                      visible: true,
                      style: {
                        lineWidth: 1,
                        stroke: '#D9DDE4',
                        strokeOpacity: 1
                      }
                    },
                    x: 250,
                    y: 250,
                    start: {
                      x: 0,
                      y: 0
                    },
                    end: {
                      x: 210,
                      y: 0
                    },
                    items: [
                      [
                        {
                          id: 0,
                          label: -1000,
                          value: 0,
                          rawValue: -1000
                        },
                        {
                          id: 1,
                          label: -500,
                          value: 0.16666666666666666,
                          rawValue: -500
                        },
                        {
                          id: 2,
                          label: 0,
                          value: 0.3333333333333333,
                          rawValue: 0
                        },
                        {
                          id: 3,
                          label: 500,
                          value: 0.5,
                          rawValue: 500
                        },
                        {
                          id: 4,
                          label: 1000,
                          value: 0.6666666666666666,
                          rawValue: 1000
                        },
                        {
                          id: 5,
                          label: 1500,
                          value: 0.8333333333333334,
                          rawValue: 1500
                        },
                        {
                          id: 6,
                          label: 2000,
                          value: 1,
                          rawValue: 2000
                        }
                      ]
                    ],
                    grid: {
                      visible: true,
                      center: {
                        x: 0,
                        y: 0
                      },
                      type: 'circle',
                      closed: true,
                      sides: 10
                    }
                  },
                  _uid: 316,
                  type: 'group',
                  name: 'axis',
                  children: [
                    {
                      attribute: {
                        x: 0,
                        y: 0,
                        pickable: false
                      },
                      _uid: 338,
                      type: 'group',
                      children: [
                        {
                          attribute: {
                            x: 0,
                            y: 0,
                            zIndex: 1
                          },
                          _uid: 339,
                          type: 'group',
                          name: 'axis-container',
                          children: [
                            {
                              attribute: {
                                visible: true,
                                lineStyle: {
                                  lineWidth: 1,
                                  stroke: '#D9DDE4',
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
                                    x: 210,
                                    y: 0
                                  }
                                ]
                              },
                              _uid: 340,
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
                                        x: 210,
                                        y: 0
                                      }
                                    ],
                                    lineWidth: 1,
                                    stroke: '#D9DDE4',
                                    strokeOpacity: 1,
                                    fill: false
                                  },
                                  _uid: 341,
                                  type: 'line',
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
                              _uid: 342,
                              type: 'group',
                              name: 'axis-tick-container',
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
                                        y: 4
                                      }
                                    ],
                                    lineWidth: 1,
                                    stroke: '#D9DDE4',
                                    strokeOpacity: 1
                                  },
                                  _uid: 343,
                                  type: 'line',
                                  name: 'axis-tick',
                                  children: []
                                },
                                {
                                  attribute: {
                                    points: [
                                      {
                                        x: 35,
                                        y: 0
                                      },
                                      {
                                        x: 35,
                                        y: 4
                                      }
                                    ],
                                    lineWidth: 1,
                                    stroke: '#D9DDE4',
                                    strokeOpacity: 1
                                  },
                                  _uid: 344,
                                  type: 'line',
                                  name: 'axis-tick',
                                  children: []
                                },
                                {
                                  attribute: {
                                    points: [
                                      {
                                        x: 70,
                                        y: 0
                                      },
                                      {
                                        x: 70,
                                        y: 4
                                      }
                                    ],
                                    lineWidth: 1,
                                    stroke: '#D9DDE4',
                                    strokeOpacity: 1
                                  },
                                  _uid: 345,
                                  type: 'line',
                                  name: 'axis-tick',
                                  children: []
                                },
                                {
                                  attribute: {
                                    points: [
                                      {
                                        x: 105,
                                        y: 0
                                      },
                                      {
                                        x: 105,
                                        y: 4
                                      }
                                    ],
                                    lineWidth: 1,
                                    stroke: '#D9DDE4',
                                    strokeOpacity: 1
                                  },
                                  _uid: 346,
                                  type: 'line',
                                  name: 'axis-tick',
                                  children: []
                                },
                                {
                                  attribute: {
                                    points: [
                                      {
                                        x: 140,
                                        y: 0
                                      },
                                      {
                                        x: 140,
                                        y: 4
                                      }
                                    ],
                                    lineWidth: 1,
                                    stroke: '#D9DDE4',
                                    strokeOpacity: 1
                                  },
                                  _uid: 347,
                                  type: 'line',
                                  name: 'axis-tick',
                                  children: []
                                },
                                {
                                  attribute: {
                                    points: [
                                      {
                                        x: 175,
                                        y: 0
                                      },
                                      {
                                        x: 175,
                                        y: 4
                                      }
                                    ],
                                    lineWidth: 1,
                                    stroke: '#D9DDE4',
                                    strokeOpacity: 1
                                  },
                                  _uid: 348,
                                  type: 'line',
                                  name: 'axis-tick',
                                  children: []
                                },
                                {
                                  attribute: {
                                    points: [
                                      {
                                        x: 210,
                                        y: 0
                                      },
                                      {
                                        x: 210,
                                        y: 4
                                      }
                                    ],
                                    lineWidth: 1,
                                    stroke: '#D9DDE4',
                                    strokeOpacity: 1
                                  },
                                  _uid: 349,
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
                              _uid: 350,
                              type: 'group',
                              name: 'axis-label-container',
                              children: [
                                {
                                  attribute: {
                                    x: 0,
                                    y: 0,
                                    pickable: false
                                  },
                                  _uid: 351,
                                  type: 'group',
                                  name: 'axis-label-container-layer-0',
                                  children: [
                                    {
                                      attribute: {
                                        x: 0,
                                        y: 8,
                                        text: -1000,
                                        lineHeight: 12,
                                        textAlign: 'center',
                                        textBaseline: 'top',
                                        fontSize: 12,
                                        fill: '#89909d',
                                        fontWeight: 'normal',
                                        fillOpacity: 1
                                      },
                                      _uid: 352,
                                      type: 'text',
                                      name: 'axis-label',
                                      children: []
                                    },
                                    {
                                      attribute: {
                                        x: 35,
                                        y: 8,
                                        text: -500,
                                        lineHeight: 12,
                                        textAlign: 'center',
                                        textBaseline: 'top',
                                        fontSize: 12,
                                        fill: '#89909d',
                                        fontWeight: 'normal',
                                        fillOpacity: 1
                                      },
                                      _uid: 353,
                                      type: 'text',
                                      name: 'axis-label',
                                      children: []
                                    },
                                    {
                                      attribute: {
                                        x: 70,
                                        y: 8,
                                        text: 0,
                                        lineHeight: 12,
                                        textAlign: 'center',
                                        textBaseline: 'top',
                                        fontSize: 12,
                                        fill: '#89909d',
                                        fontWeight: 'normal',
                                        fillOpacity: 1
                                      },
                                      _uid: 354,
                                      type: 'text',
                                      name: 'axis-label',
                                      children: []
                                    },
                                    {
                                      attribute: {
                                        x: 105,
                                        y: 8,
                                        text: 500,
                                        lineHeight: 12,
                                        textAlign: 'center',
                                        textBaseline: 'top',
                                        fontSize: 12,
                                        fill: '#89909d',
                                        fontWeight: 'normal',
                                        fillOpacity: 1
                                      },
                                      _uid: 355,
                                      type: 'text',
                                      name: 'axis-label',
                                      children: []
                                    },
                                    {
                                      attribute: {
                                        x: 140,
                                        y: 8,
                                        text: 1000,
                                        lineHeight: 12,
                                        textAlign: 'center',
                                        textBaseline: 'top',
                                        fontSize: 12,
                                        fill: '#89909d',
                                        fontWeight: 'normal',
                                        fillOpacity: 1
                                      },
                                      _uid: 356,
                                      type: 'text',
                                      name: 'axis-label',
                                      children: []
                                    },
                                    {
                                      attribute: {
                                        x: 175,
                                        y: 8,
                                        text: 1500,
                                        lineHeight: 12,
                                        textAlign: 'center',
                                        textBaseline: 'top',
                                        fontSize: 12,
                                        fill: '#89909d',
                                        fontWeight: 'normal',
                                        fillOpacity: 1
                                      },
                                      _uid: 357,
                                      type: 'text',
                                      name: 'axis-label',
                                      children: []
                                    },
                                    {
                                      attribute: {
                                        x: 210,
                                        y: 8,
                                        text: 2000,
                                        lineHeight: 12,
                                        textAlign: 'center',
                                        textBaseline: 'top',
                                        fontSize: 12,
                                        fill: '#89909d',
                                        fontWeight: 'normal',
                                        fillOpacity: 1
                                      },
                                      _uid: 358,
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
                zIndex: 0
              },
              _uid: 359,
              type: 'group',
              name: 'VGRAMMAR_MARK_10',
              children: [
                {
                  attribute: {
                    sectorStyle: {
                      fill: '#b2bacf',
                      opacity: 0.2
                    },
                    start: {
                      x: 0,
                      y: 0
                    },
                    end: {
                      x: 0,
                      y: 0
                    }
                  },
                  _uid: 360,
                  type: 'group',
                  name: 'crosshair',
                  children: [
                    {
                      attribute: {
                        innerRadius: 0,
                        fill: '#b2bacf',
                        opacity: 0.2
                      },
                      _uid: 361,
                      type: 'arc',
                      name: 'crosshair-sector',
                      children: []
                    }
                  ]
                }
              ]
            },
            {
              attribute: {
                pickable: false,
                zIndex: 0
              },
              _uid: 362,
              type: 'group',
              name: 'VGRAMMAR_MARK_11',
              children: [
                {
                  attribute: {
                    y: 250,
                    angle: 0.5235987755982991,
                    anchor: [250, 250],
                    max: 432,
                    q3: 404,
                    median: 376,
                    q1: 369,
                    min: 355,
                    boxHeight: 30,
                    ruleHeight: 20,
                    stroke: 'black',
                    fill: '#6690F2',
                    opacity: 1
                  },
                  _uid: 363,
                  type: 'glyph',
                  children: []
                },
                {
                  attribute: {
                    y: 250,
                    angle: 1.5707963267948968,
                    anchor: [250, 250],
                    max: 453,
                    q3: 390,
                    median: 348,
                    q1: 341,
                    min: 327,
                    boxHeight: 30,
                    ruleHeight: 20,
                    stroke: 'black',
                    fill: '#70D6A3',
                    opacity: 1
                  },
                  _uid: 369,
                  type: 'glyph',
                  children: []
                },
                {
                  attribute: {
                    y: 250,
                    angle: 2.6179938779914944,
                    anchor: [250, 250],
                    max: 411,
                    q3: 404,
                    median: 334,
                    q1: 313,
                    min: 285,
                    boxHeight: 30,
                    ruleHeight: 20,
                    stroke: 'black',
                    fill: '#B4E6E2',
                    opacity: 1
                  },
                  _uid: 375,
                  type: 'glyph',
                  children: []
                },
                {
                  attribute: {
                    y: 250,
                    angle: 3.6651914291880923,
                    anchor: [250, 250],
                    max: 418,
                    q3: 390,
                    median: 383,
                    q1: 376,
                    min: 355,
                    boxHeight: 30,
                    ruleHeight: 20,
                    stroke: 'black',
                    fill: '#63B5FC',
                    opacity: 1
                  },
                  _uid: 381,
                  type: 'glyph',
                  children: []
                },
                {
                  attribute: {
                    y: 250,
                    angle: 4.71238898038469,
                    anchor: [250, 250],
                    max: 404,
                    q3: 355,
                    median: 348,
                    q1: 313,
                    min: 292,
                    boxHeight: 30,
                    ruleHeight: 20,
                    stroke: 'black',
                    fill: '#FF8F62',
                    opacity: 1
                  },
                  _uid: 387,
                  type: 'glyph',
                  children: []
                },
                {
                  attribute: {
                    y: 250,
                    angle: 5.759586531581287,
                    anchor: [250, 250],
                    max: 418,
                    q3: 390,
                    median: 383,
                    q1: 369,
                    min: 341,
                    boxHeight: 30,
                    ruleHeight: 20,
                    stroke: 'black',
                    fill: '#FFDC83',
                    opacity: 1
                  },
                  _uid: 393,
                  type: 'glyph',
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
    s.addEventListener('mouseenter', () => {
      s.setAttribute('fill', 'red');
    });
    console.log(s);
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
    disableDirtyBounds: true,
    canvasControled: true,
    autoRender: true
  });

  const layer = stage.at(0);

  json.children[0].children.forEach(item => {
    _add(layer, item);
  });
  stage.set3dOptions({
    alpha: 0,
    // beta: 0,
    enable: true
  });

  stage.children[0].children[0].setMode('3d');

  const group = stage.defaultLayer.getChildren()[0] as IGroup;
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

  stage.render(undefined, {});

  const button = document.createElement('button');
  button.innerHTML = 'click';
  document.body.appendChild(button);
  button.addEventListener('click', () => {
    stage.getElementsByType('rect').forEach(r => {
      r.setAttribute('fill', 'red');
    });
    stage.render(undefined, {});
  });

  stage.enableView3dTransform();
};
