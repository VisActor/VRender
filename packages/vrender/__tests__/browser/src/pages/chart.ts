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
  _uid: 2,
  type: 'group',
  children: [
    {
      attribute: {},
      _uid: 6,
      type: 'group',
      children: [
        {
          attribute: {
            x: 0,
            y: 0,
            width: 1135,
            height: 500,
            sizeAttrs: {
              x: 0,
              y: 0,
              width: 1135,
              height: 500
            }
          },
          _uid: 9,
          type: 'group',
          name: 'root',
          children: [
            {
              attribute: {
                visible: true,
                clip: false,
                x: 0,
                y: 30,
                width: 1135,
                height: 392,
                sizeAttrs: {
                  x: 0,
                  y: 30,
                  width: 1135,
                  height: 392
                },
                pickable: false,
                zIndex: 450
              },
              _uid: 10,
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
                  _uid: 11,
                  type: 'group',
                  name: 'seriesGroup_funnel3d_5_8',
                  children: [
                    {
                      attribute: {
                        pickable: false,
                        zIndex: 300
                      },
                      _uid: 41,
                      type: 'group',
                      name: 'funnel3d_9',
                      children: [
                        {
                          attribute: {
                            x: 0,
                            y: 0,
                            stroke: false,
                            visible: true,
                            points: [
                              {
                                x: 367.5,
                                y: 0
                              },
                              {
                                x: 767.5,
                                y: 0
                              },
                              {
                                x: 732.5,
                                y: 78.4
                              },
                              {
                                x: 402.5,
                                y: 78.4
                              }
                            ],
                            fill: '#1664FF',
                            z: 0,
                            pickable: true
                          },
                          _uid: 42,
                          type: 'pyramid3d',
                          children: []
                        },
                        {
                          attribute: {
                            x: 0,
                            y: 0,
                            stroke: false,
                            visible: true,
                            points: [
                              {
                                x: 402.5,
                                y: 78.4
                              },
                              {
                                x: 732.5,
                                y: 78.4
                              },
                              {
                                x: 697.5,
                                y: 156.8
                              },
                              {
                                x: 437.5,
                                y: 156.8
                              }
                            ],
                            fill: '#1AC6FF',
                            z: 35,
                            pickable: true
                          },
                          _uid: 43,
                          type: 'pyramid3d',
                          children: []
                        },
                        {
                          attribute: {
                            x: 0,
                            y: 0,
                            stroke: false,
                            visible: true,
                            points: [
                              {
                                x: 437.5,
                                y: 156.8
                              },
                              {
                                x: 697.5,
                                y: 156.8
                              },
                              {
                                x: 662.5,
                                y: 235.2
                              },
                              {
                                x: 472.5,
                                y: 235.2
                              }
                            ],
                            fill: '#FF8A00',
                            z: 70,
                            pickable: true
                          },
                          _uid: 44,
                          type: 'pyramid3d',
                          children: []
                        },
                        {
                          attribute: {
                            x: 0,
                            y: 0,
                            stroke: false,
                            visible: true,
                            points: [
                              {
                                x: 472.5,
                                y: 235.20000000000005
                              },
                              {
                                x: 662.5,
                                y: 235.20000000000005
                              },
                              {
                                x: 627.5,
                                y: 313.6
                              },
                              {
                                x: 507.5,
                                y: 313.6
                              }
                            ],
                            fill: '#3CC780',
                            z: 105,
                            pickable: true
                          },
                          _uid: 45,
                          type: 'pyramid3d',
                          children: []
                        },
                        {
                          attribute: {
                            x: 0,
                            y: 0,
                            stroke: false,
                            visible: true,
                            points: [
                              {
                                x: 507.5,
                                y: 313.6
                              },
                              {
                                x: 627.5,
                                y: 313.6
                              },
                              {
                                x: 592.5,
                                y: 392
                              },
                              {
                                x: 542.5,
                                y: 392
                              }
                            ],
                            fill: '#7442D4',
                            z: 140,
                            pickable: true
                          },
                          _uid: 46,
                          type: 'pyramid3d',
                          children: []
                        }
                      ]
                    },
                    {
                      attribute: {
                        pickable: false,
                        zIndex: 300
                      },
                      _uid: 35,
                      type: 'group',
                      name: 'label_11',
                      children: [
                        {
                          attribute: {
                            visible: true,
                            angle: 0,
                            textAlign: 'center',
                            lineWidth: 2,
                            fontSize: 14,
                            fontWeight: 'normal',
                            fillOpacity: 1,
                            fill: 'white',
                            textBaseline: 'middle',
                            x: 567.5,
                            y: 39.2,
                            text: 'Step1 100',
                            limit: 400,
                            stroke: '#1664FF',
                            z: 0,
                            limitAttrs: {
                              text: 'Step1 100',
                              limit: 400
                            },
                            maxLineWidth: 400,
                            pickable: true,
                            opacity: 1,
                            strokeOpacity: 1
                          },
                          _uid: 36,
                          type: 'text',
                          children: []
                        },
                        {
                          attribute: {
                            visible: true,
                            angle: 0,
                            textAlign: 'center',
                            lineWidth: 2,
                            fontSize: 14,
                            fontWeight: 'normal',
                            fillOpacity: 1,
                            fill: 'white',
                            textBaseline: 'middle',
                            x: 567.5,
                            y: 117.60000000000001,
                            text: 'Step2 80',
                            limit: 400,
                            stroke: '#1AC6FF',
                            z: 35,
                            limitAttrs: {
                              text: 'Step2 80',
                              limit: 400
                            },
                            maxLineWidth: 400,
                            pickable: true,
                            opacity: 1,
                            strokeOpacity: 1
                          },
                          _uid: 37,
                          type: 'text',
                          children: []
                        },
                        {
                          attribute: {
                            visible: true,
                            angle: 0,
                            textAlign: 'center',
                            lineWidth: 2,
                            fontSize: 14,
                            fontWeight: 'normal',
                            fillOpacity: 1,
                            fill: 'white',
                            textBaseline: 'middle',
                            x: 567.5,
                            y: 196,
                            text: 'Step3 60',
                            limit: 400,
                            stroke: '#FF8A00',
                            z: 70,
                            limitAttrs: {
                              text: 'Step3 60',
                              limit: 400
                            },
                            maxLineWidth: 400,
                            pickable: true,
                            opacity: 1,
                            strokeOpacity: 1
                          },
                          _uid: 38,
                          type: 'text',
                          children: []
                        },
                        {
                          attribute: {
                            visible: true,
                            angle: 0,
                            textAlign: 'center',
                            lineWidth: 2,
                            fontSize: 14,
                            fontWeight: 'normal',
                            fillOpacity: 1,
                            fill: 'white',
                            textBaseline: 'middle',
                            x: 567.5,
                            y: 274.40000000000003,
                            text: 'Step4 40',
                            limit: 400,
                            stroke: '#3CC780',
                            z: 105,
                            limitAttrs: {
                              text: 'Step4 40',
                              limit: 400
                            },
                            maxLineWidth: 400,
                            pickable: true,
                            opacity: 1,
                            strokeOpacity: 1
                          },
                          _uid: 39,
                          type: 'text',
                          children: []
                        },
                        {
                          attribute: {
                            visible: true,
                            angle: 0,
                            textAlign: 'center',
                            lineWidth: 2,
                            fontSize: 14,
                            fontWeight: 'normal',
                            fillOpacity: 1,
                            fill: 'white',
                            textBaseline: 'middle',
                            x: 567.5,
                            y: 352.8,
                            text: 'Step5 20',
                            limit: 400,
                            stroke: '#7442D4',
                            z: 140,
                            limitAttrs: {
                              text: 'Step5 20',
                              limit: 400
                            },
                            maxLineWidth: 400,
                            pickable: true,
                            opacity: 1,
                            strokeOpacity: 1
                          },
                          _uid: 40,
                          type: 'text',
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
                  spaceRow: 10,
                  shape: {
                    space: 4,
                    style: {
                      size: 10,
                      cursor: 'pointer'
                    },
                    state: {
                      selectedHover: {
                        opacity: 0.85
                      },
                      unSelected: {
                        fill: '#D8D8D8',
                        fillOpacity: 0.5
                      }
                    }
                  },
                  label: {
                    space: 4,
                    style: {
                      fontSize: 14,
                      fill: '#89909D',
                      cursor: 'pointer'
                    },
                    state: {
                      selectedHover: {
                        opacity: 0.85
                      },
                      unSelected: {
                        fill: '#D8D8D8',
                        fillOpacity: 0.5
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
                        fill: 'gray',
                        fillOpacity: 0.7
                      },
                      unSelectedHover: {
                        fill: 'gray',
                        fillOpacity: 0.2
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
                  padding: 2
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
                    label: 'Step1',
                    shape: {
                      fill: '#1664FF',
                      symbolType: 'square',
                      stroke: false,
                      fillOpacity: 1,
                      strokeOpacity: 1,
                      opacity: 1,
                      texture: null,
                      texturePadding: null,
                      textureSize: null,
                      textureColor: null,
                      innerBorder: null,
                      outerBorder: null
                    },
                    id: 'Step1',
                    index: 0
                  },
                  {
                    label: 'Step2',
                    shape: {
                      fill: '#1AC6FF',
                      symbolType: 'square',
                      stroke: false,
                      fillOpacity: 1,
                      strokeOpacity: 1,
                      opacity: 1,
                      texture: null,
                      texturePadding: null,
                      textureSize: null,
                      textureColor: null,
                      innerBorder: null,
                      outerBorder: null
                    },
                    id: 'Step2',
                    index: 1
                  },
                  {
                    label: 'Step3',
                    shape: {
                      fill: '#FF8A00',
                      symbolType: 'square',
                      stroke: false,
                      fillOpacity: 1,
                      strokeOpacity: 1,
                      opacity: 1,
                      texture: null,
                      texturePadding: null,
                      textureSize: null,
                      textureColor: null,
                      innerBorder: null,
                      outerBorder: null
                    },
                    id: 'Step3',
                    index: 2
                  },
                  {
                    label: 'Step4',
                    shape: {
                      fill: '#3CC780',
                      symbolType: 'square',
                      stroke: false,
                      fillOpacity: 1,
                      strokeOpacity: 1,
                      opacity: 1,
                      texture: null,
                      texturePadding: null,
                      textureSize: null,
                      textureColor: null,
                      innerBorder: null,
                      outerBorder: null
                    },
                    id: 'Step4',
                    index: 3
                  },
                  {
                    label: 'Step5',
                    shape: {
                      fill: '#7442D4',
                      symbolType: 'square',
                      stroke: false,
                      fillOpacity: 1,
                      strokeOpacity: 1,
                      opacity: 1,
                      texture: null,
                      texturePadding: null,
                      textureSize: null,
                      textureColor: null,
                      innerBorder: null,
                      outerBorder: null
                    },
                    id: 'Step5',
                    index: 4
                  }
                ],
                zIndex: 500,
                maxWidth: 1075,
                maxHeight: 410,
                defaultSelected: ['Step1', 'Step2', 'Step3', 'Step4', 'Step5'],
                width: 318.1737823486328,
                height: 18,
                dx: 378.4131088256836,
                dy: 0,
                x: 30,
                y: 452
              },
              _uid: 12,
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
                  _uid: 13,
                  type: 'group',
                  name: 'innerView',
                  children: [
                    {
                      attribute: {
                        x: 0,
                        y: 0
                      },
                      _uid: 14,
                      type: 'group',
                      children: [
                        {
                          attribute: {
                            x: 0,
                            y: 0,
                            cursor: 'pointer',
                            width: 53.40596008300781,
                            height: 18
                          },
                          _uid: 15,
                          type: 'group',
                          name: 'legendItem',
                          children: [
                            {
                              attribute: {
                                x: 7,
                                y: 9,
                                pickable: false
                              },
                              _uid: 16,
                              type: 'group',
                              children: [
                                {
                                  attribute: {
                                    x: 0,
                                    y: 0,
                                    symbolType: 'square',
                                    strokeBoundsBuffer: 0,
                                    fill: '#1664FF',
                                    stroke: false,
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
                                    cursor: 'pointer'
                                  },
                                  _uid: 17,
                                  type: 'symbol',
                                  name: 'legendItemShape',
                                  children: []
                                },
                                {
                                  attribute: {
                                    x: 9,
                                    y: 0,
                                    textAlign: 'start',
                                    textBaseline: 'middle',
                                    lineHeight: 14,
                                    fontSize: 14,
                                    fill: '#89909D',
                                    cursor: 'pointer',
                                    text: 'Step1'
                                  },
                                  _uid: 18,
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
                            x: 63.40596008300781,
                            y: 0,
                            cursor: 'pointer',
                            width: 56.19195556640625,
                            height: 18
                          },
                          _uid: 19,
                          type: 'group',
                          name: 'legendItem',
                          children: [
                            {
                              attribute: {
                                x: 7,
                                y: 9,
                                pickable: false
                              },
                              _uid: 20,
                              type: 'group',
                              children: [
                                {
                                  attribute: {
                                    x: 0,
                                    y: 0,
                                    symbolType: 'square',
                                    strokeBoundsBuffer: 0,
                                    fill: '#1AC6FF',
                                    stroke: false,
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
                                    cursor: 'pointer'
                                  },
                                  _uid: 21,
                                  type: 'symbol',
                                  name: 'legendItemShape',
                                  children: []
                                },
                                {
                                  attribute: {
                                    x: 9,
                                    y: 0,
                                    textAlign: 'start',
                                    textBaseline: 'middle',
                                    lineHeight: 14,
                                    fontSize: 14,
                                    fill: '#89909D',
                                    cursor: 'pointer',
                                    text: 'Step2'
                                  },
                                  _uid: 22,
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
                            x: 129.59791564941406,
                            y: 0,
                            cursor: 'pointer',
                            width: 56.19195556640625,
                            height: 18
                          },
                          _uid: 23,
                          type: 'group',
                          name: 'legendItem',
                          children: [
                            {
                              attribute: {
                                x: 7,
                                y: 9,
                                pickable: false
                              },
                              _uid: 24,
                              type: 'group',
                              children: [
                                {
                                  attribute: {
                                    x: 0,
                                    y: 0,
                                    symbolType: 'square',
                                    strokeBoundsBuffer: 0,
                                    fill: '#FF8A00',
                                    stroke: false,
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
                                    cursor: 'pointer'
                                  },
                                  _uid: 25,
                                  type: 'symbol',
                                  name: 'legendItemShape',
                                  children: []
                                },
                                {
                                  attribute: {
                                    x: 9,
                                    y: 0,
                                    textAlign: 'start',
                                    textBaseline: 'middle',
                                    lineHeight: 14,
                                    fontSize: 14,
                                    fill: '#89909D',
                                    cursor: 'pointer',
                                    text: 'Step3'
                                  },
                                  _uid: 26,
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
                            x: 195.7898712158203,
                            y: 0,
                            cursor: 'pointer',
                            width: 56.19195556640625,
                            height: 18
                          },
                          _uid: 27,
                          type: 'group',
                          name: 'legendItem',
                          children: [
                            {
                              attribute: {
                                x: 7,
                                y: 9,
                                pickable: false
                              },
                              _uid: 28,
                              type: 'group',
                              children: [
                                {
                                  attribute: {
                                    x: 0,
                                    y: 0,
                                    symbolType: 'square',
                                    strokeBoundsBuffer: 0,
                                    fill: '#3CC780',
                                    stroke: false,
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
                                    cursor: 'pointer'
                                  },
                                  _uid: 29,
                                  type: 'symbol',
                                  name: 'legendItemShape',
                                  children: []
                                },
                                {
                                  attribute: {
                                    x: 9,
                                    y: 0,
                                    textAlign: 'start',
                                    textBaseline: 'middle',
                                    lineHeight: 14,
                                    fontSize: 14,
                                    fill: '#89909D',
                                    cursor: 'pointer',
                                    text: 'Step4'
                                  },
                                  _uid: 30,
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
                            x: 261.98182678222656,
                            y: 0,
                            cursor: 'pointer',
                            width: 56.19195556640625,
                            height: 18
                          },
                          _uid: 31,
                          type: 'group',
                          name: 'legendItem',
                          children: [
                            {
                              attribute: {
                                x: 7,
                                y: 9,
                                pickable: false
                              },
                              _uid: 32,
                              type: 'group',
                              children: [
                                {
                                  attribute: {
                                    x: 0,
                                    y: 0,
                                    symbolType: 'square',
                                    strokeBoundsBuffer: 0,
                                    fill: '#7442D4',
                                    stroke: false,
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
                                    cursor: 'pointer'
                                  },
                                  _uid: 33,
                                  type: 'symbol',
                                  name: 'legendItemShape',
                                  children: []
                                },
                                {
                                  attribute: {
                                    x: 9,
                                    y: 0,
                                    textAlign: 'start',
                                    textBaseline: 'middle',
                                    lineHeight: 14,
                                    fontSize: 14,
                                    fill: '#89909D',
                                    cursor: 'pointer',
                                    text: 'Step5'
                                  },
                                  _uid: 34,
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
