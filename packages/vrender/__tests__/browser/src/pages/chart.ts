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
  attribute: {},
  _uid: 1237,
  type: 'group',
  children: [
    {
      attribute: {},
      _uid: 1240,
      type: 'group',
      children: [
        {
          attribute: {
            pickable: false,
            stroke: '#E1E4E8',
            fill: false,
            lineWidth: 1,
            lineDash: [],
            lineCap: 'square',
            x: 0.5,
            y: 0.5,
            width: 761,
            height: 161
          },
          _uid: 1340,
          type: 'rect',
          name: 'table-border-rect',
          children: []
        },
        {
          attribute: {
            x: 1,
            y: 1,
            width: 760,
            height: 160,
            clip: true,
            pickable: false
          },
          _uid: 1244,
          type: 'group',
          children: [
            {
              attribute: {
                x: 0,
                y: 80,
                width: 760,
                height: 80,
                clip: false,
                pickable: false
              },
              _uid: 1248,
              type: 'group',
              children: [
                {
                  attribute: {
                    x: 0,
                    y: 0,
                    width: 80,
                    height: 0,
                    clip: false,
                    pickable: false
                  },
                  _uid: 1297,
                  type: 'group',
                  children: [
                    {
                      attribute: {
                        x: 0,
                        y: 0,
                        width: 80,
                        height: 80,
                        lineWidth: 1,
                        fill: '#FAF9FB',
                        stroke: '#E1E4E8',
                        lineCap: 'square',
                        clip: true
                      },
                      _uid: 1298,
                      type: 'group',
                      children: [
                        {
                          attribute: {
                            fontFamily: 'Arial,sans-serif',
                            fontSize: 14,
                            fontWeight: null,
                            fill: '#000',
                            textAlign: 'left',
                            textBaseline: 'top',
                            lineHeight: 14,
                            ellipsis: '...',
                            text: '1',
                            maxLineWidth: 48,
                            autoWrapText: false,
                            wordBreak: 'break-word',
                            heightLimit: 60,
                            pickable: false,
                            dx: 0,
                            whiteSpace: 'no-wrap',
                            x: 16,
                            y: 33
                          },
                          _uid: 1299,
                          type: 'text',
                          name: 'text',
                          children: []
                        }
                      ]
                    }
                  ]
                },
                {
                  attribute: {
                    x: 80,
                    y: 0,
                    width: 260,
                    height: 0,
                    clip: false,
                    pickable: false
                  },
                  _uid: 1300,
                  type: 'group',
                  children: [
                    {
                      attribute: {
                        x: 0,
                        y: 0,
                        width: 260,
                        height: 80,
                        lineWidth: 1,
                        fill: '#FAF9FB',
                        stroke: '#E1E4E8',
                        lineCap: 'square',
                        clip: true
                      },
                      _uid: 1313,
                      type: 'group',
                      children: [
                        {
                          attribute: {
                            height: 80,
                            width: 260,
                            display: 'flex',
                            flexDirection: 'row',
                            clip: true,
                            boundsPadding: [0, 0, 0, 0]
                          },
                          _uid: 1301,
                          type: 'group',
                          name: 'custom-container',
                          children: [
                            {
                              attribute: {
                                height: 80,
                                width: 60,
                                showBounds: false,
                                direction: 'column',
                                alignContent: 'center',
                                justifyContent: 'space-around',
                                flexDirection: 'column',
                                display: 'flex',
                                clip: true,
                                boundsPadding: [0, 0, 0, 0],
                                x: 0,
                                y: 0
                              },
                              _uid: 1302,
                              type: 'group',
                              children: [
                                {
                                  attribute: {
                                    id: 'icon0',
                                    width: 50,
                                    height: 50,
                                    src: 'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VTable/custom-render/flower.jpg',
                                    shape: 'circle',
                                    marginLeft: 10,
                                    image:
                                      'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VTable/custom-render/flower.jpg',
                                    cornerRadius: 25,
                                    boundsPadding: [0, 0, 0, 10],
                                    y: 15,
                                    x: 20
                                  },
                                  _uid: 1303,
                                  type: 'image',
                                  children: []
                                }
                              ]
                            },
                            {
                              attribute: {
                                height: 80,
                                width: 200,
                                showBounds: false,
                                direction: 'column',
                                flexDirection: 'column',
                                display: 'flex',
                                clip: true,
                                boundsPadding: [0, 0, 0, 0],
                                x: 60,
                                y: 0
                              },
                              _uid: 1304,
                              type: 'group',
                              children: [
                                {
                                  attribute: {
                                    height: 40,
                                    width: 200,
                                    showBounds: false,
                                    alignItems: 'flex-end',
                                    display: 'flex',
                                    flexDirection: 'row',
                                    clip: true,
                                    boundsPadding: [0, 0, 0, 0],
                                    y: 0,
                                    x: 0
                                  },
                                  _uid: 1305,
                                  type: 'group',
                                  children: [
                                    {
                                      attribute: {
                                        text: '虚拟主播小花',
                                        fontSize: 13,
                                        fontFamily: 'sans-serif',
                                        fill: 'black',
                                        marginLeft: 10,
                                        textBaseline: 'top',
                                        boundsPadding: [0, 0, 0, 10],
                                        wrap: true,
                                        x: 20,
                                        y: 25
                                      },
                                      _uid: 1307,
                                      type: 'text',
                                      children: []
                                    },
                                    {
                                      attribute: {
                                        id: 'location',
                                        iconName: 'location',
                                        width: 15,
                                        height: 15,
                                        marginLeft: 10,
                                        svg: 'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VTable/location.svg',
                                        image:
                                          'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VTable/location.svg',
                                        boundsPadding: [0, 0, 0, 10],
                                        x: 108,
                                        y: 25
                                      },
                                      _uid: 1308,
                                      type: 'image',
                                      children: []
                                    },
                                    {
                                      attribute: {
                                        text: '梦幻之都',
                                        fontSize: 11,
                                        fontFamily: 'sans-serif',
                                        fill: '#6f7070',
                                        textBaseline: 'top',
                                        boundsPadding: [0, 0, 0, 0],
                                        wrap: true,
                                        x: 113,
                                        y: 29
                                      },
                                      _uid: 1309,
                                      type: 'text',
                                      children: []
                                    }
                                  ]
                                },
                                {
                                  attribute: {
                                    height: 40,
                                    width: 200,
                                    showBounds: false,
                                    alignItems: 'center',
                                    display: 'flex',
                                    flexDirection: 'row',
                                    clip: true,
                                    boundsPadding: [0, 0, 0, 0],
                                    y: null,
                                    x: null
                                  },
                                  _uid: 1306,
                                  type: 'group',
                                  children: [
                                    {
                                      attribute: {
                                        visible: true,
                                        textStyle: {
                                          fontSize: 10,
                                          fill: 'rgb(51, 101, 238)',
                                          textAlign: 'left',
                                          textBaseline: 'top',
                                          fontFamily: 'sans-serif'
                                        },
                                        space: 4,
                                        padding: 5,
                                        shape: {
                                          fill: '#000'
                                        },
                                        text: '游戏',
                                        panel: {
                                          visible: true,
                                          fill: '#f4f4f2',
                                          cornerRadius: 5
                                        },
                                        marginLeft: 10,
                                        boundsPadding: [0, 0, 0, 10],
                                        x: 20,
                                        y: 10
                                      },
                                      _uid: 1310,
                                      type: 'group',
                                      name: 'tag',
                                      children: [
                                        {
                                          attribute: {
                                            x: 5,
                                            y: 5,
                                            zIndex: 1
                                          },
                                          _uid: 1314,
                                          type: 'group',
                                          name: 'tag-content',
                                          children: [
                                            {
                                              attribute: {
                                                text: '游戏',
                                                visible: true,
                                                lineHeight: 10,
                                                fontSize: 10,
                                                fill: 'rgb(51, 101, 238)',
                                                textAlign: 'left',
                                                textBaseline: 'top',
                                                fontFamily: 'sans-serif',
                                                x: 0,
                                                y: 0
                                              },
                                              _uid: 1315,
                                              type: 'text',
                                              name: 'tag-text',
                                              children: []
                                            }
                                          ]
                                        },
                                        {
                                          attribute: {
                                            fill: '#f4f4f2',
                                            cornerRadius: 5,
                                            visible: true,
                                            x: 0,
                                            y: 0,
                                            width: 30,
                                            height: 20
                                          },
                                          _uid: 1316,
                                          type: 'rect',
                                          name: 'tag-panel',
                                          children: []
                                        }
                                      ]
                                    },
                                    {
                                      attribute: {
                                        visible: true,
                                        textStyle: {
                                          fontSize: 10,
                                          fill: 'rgb(51, 101, 238)',
                                          textAlign: 'left',
                                          textBaseline: 'top',
                                          fontFamily: 'sans-serif'
                                        },
                                        space: 4,
                                        padding: 5,
                                        shape: {
                                          fill: '#000'
                                        },
                                        text: '动漫',
                                        panel: {
                                          visible: true,
                                          fill: '#f4f4f2',
                                          cornerRadius: 5
                                        },
                                        marginLeft: 10,
                                        boundsPadding: [0, 0, 0, 10],
                                        x: 60,
                                        y: 10
                                      },
                                      _uid: 1311,
                                      type: 'group',
                                      name: 'tag',
                                      children: [
                                        {
                                          attribute: {
                                            x: 5,
                                            y: 5,
                                            zIndex: 1
                                          },
                                          _uid: 1317,
                                          type: 'group',
                                          name: 'tag-content',
                                          children: [
                                            {
                                              attribute: {
                                                text: '动漫',
                                                visible: true,
                                                lineHeight: 10,
                                                fontSize: 10,
                                                fill: 'rgb(51, 101, 238)',
                                                textAlign: 'left',
                                                textBaseline: 'top',
                                                fontFamily: 'sans-serif',
                                                x: 0,
                                                y: 0
                                              },
                                              _uid: 1318,
                                              type: 'text',
                                              name: 'tag-text',
                                              children: []
                                            }
                                          ]
                                        },
                                        {
                                          attribute: {
                                            fill: '#f4f4f2',
                                            cornerRadius: 5,
                                            visible: true,
                                            x: 0,
                                            y: 0,
                                            width: 30,
                                            height: 20
                                          },
                                          _uid: 1319,
                                          type: 'rect',
                                          name: 'tag-panel',
                                          children: []
                                        }
                                      ]
                                    },
                                    {
                                      attribute: {
                                        visible: true,
                                        textStyle: {
                                          fontSize: 10,
                                          fill: 'rgb(51, 101, 238)',
                                          textAlign: 'left',
                                          textBaseline: 'top',
                                          fontFamily: 'sans-serif'
                                        },
                                        space: 4,
                                        padding: 5,
                                        shape: {
                                          fill: '#000'
                                        },
                                        text: '美食',
                                        panel: {
                                          visible: true,
                                          fill: '#f4f4f2',
                                          cornerRadius: 5
                                        },
                                        marginLeft: 10,
                                        boundsPadding: [0, 0, 0, 10],
                                        x: 100,
                                        y: 10
                                      },
                                      _uid: 1312,
                                      type: 'group',
                                      name: 'tag',
                                      children: [
                                        {
                                          attribute: {
                                            x: 5,
                                            y: 5,
                                            zIndex: 1
                                          },
                                          _uid: 1320,
                                          type: 'group',
                                          name: 'tag-content',
                                          children: [
                                            {
                                              attribute: {
                                                text: '美食',
                                                visible: true,
                                                lineHeight: 10,
                                                fontSize: 10,
                                                fill: 'rgb(51, 101, 238)',
                                                textAlign: 'left',
                                                textBaseline: 'top',
                                                fontFamily: 'sans-serif',
                                                x: 0,
                                                y: 0
                                              },
                                              _uid: 1321,
                                              type: 'text',
                                              name: 'tag-text',
                                              children: []
                                            }
                                          ]
                                        },
                                        {
                                          attribute: {
                                            fill: '#f4f4f2',
                                            cornerRadius: 5,
                                            visible: true,
                                            x: 0,
                                            y: 0,
                                            width: 30,
                                            height: 20
                                          },
                                          _uid: 1322,
                                          type: 'rect',
                                          name: 'tag-panel',
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
                    x: 340,
                    y: 0,
                    width: 80,
                    height: 0,
                    clip: false,
                    pickable: false
                  },
                  _uid: 1323,
                  type: 'group',
                  children: [
                    {
                      attribute: {
                        x: 0,
                        y: 0,
                        width: 80,
                        height: 80,
                        lineWidth: 1,
                        fill: '#FAF9FB',
                        stroke: '#E1E4E8',
                        lineCap: 'square',
                        clip: true
                      },
                      _uid: 1324,
                      type: 'group',
                      children: [
                        {
                          attribute: {
                            fontFamily: 'Arial',
                            fontSize: 12,
                            fontWeight: 'bold',
                            fill: '#000',
                            textAlign: 'left',
                            textBaseline: 'top',
                            lineHeight: 12,
                            ellipsis: '...',
                            text: '400w',
                            maxLineWidth: 48,
                            autoWrapText: false,
                            wordBreak: 'break-word',
                            heightLimit: 60,
                            pickable: false,
                            dx: 0,
                            whiteSpace: 'no-wrap',
                            x: 16,
                            y: 34
                          },
                          _uid: 1325,
                          type: 'text',
                          name: 'text',
                          children: []
                        }
                      ]
                    }
                  ]
                },
                {
                  attribute: {
                    x: 420,
                    y: 0,
                    width: 80,
                    height: 0,
                    clip: false,
                    pickable: false
                  },
                  _uid: 1326,
                  type: 'group',
                  children: [
                    {
                      attribute: {
                        x: 0,
                        y: 0,
                        width: 80,
                        height: 80,
                        lineWidth: 1,
                        fill: '#FAF9FB',
                        stroke: '#E1E4E8',
                        lineCap: 'square',
                        clip: true
                      },
                      _uid: 1327,
                      type: 'group',
                      children: [
                        {
                          attribute: {
                            fontFamily: 'Arial',
                            fontSize: 12,
                            fontWeight: 'bold',
                            fill: '#000',
                            textAlign: 'left',
                            textBaseline: 'top',
                            lineHeight: 12,
                            ellipsis: '...',
                            text: '10',
                            maxLineWidth: 48,
                            autoWrapText: false,
                            wordBreak: 'break-word',
                            heightLimit: 60,
                            pickable: false,
                            dx: 0,
                            whiteSpace: 'no-wrap',
                            x: 16,
                            y: 34
                          },
                          _uid: 1328,
                          type: 'text',
                          name: 'text',
                          children: []
                        }
                      ]
                    }
                  ]
                },
                {
                  attribute: {
                    x: 500,
                    y: 0,
                    width: 80,
                    height: 0,
                    clip: false,
                    pickable: false
                  },
                  _uid: 1329,
                  type: 'group',
                  children: [
                    {
                      attribute: {
                        x: 0,
                        y: 0,
                        width: 80,
                        height: 80,
                        lineWidth: 1,
                        fill: '#FAF9FB',
                        stroke: '#E1E4E8',
                        lineCap: 'square',
                        clip: true
                      },
                      _uid: 1330,
                      type: 'group',
                      children: [
                        {
                          attribute: {
                            fontFamily: 'Arial',
                            fontSize: 12,
                            fontWeight: 'bold',
                            fill: '#000',
                            textAlign: 'left',
                            textBaseline: 'top',
                            lineHeight: 12,
                            ellipsis: '...',
                            text: '400w',
                            maxLineWidth: 48,
                            autoWrapText: false,
                            wordBreak: 'break-word',
                            heightLimit: 60,
                            pickable: false,
                            dx: 0,
                            whiteSpace: 'no-wrap',
                            x: 16,
                            y: 34
                          },
                          _uid: 1331,
                          type: 'text',
                          name: 'text',
                          children: []
                        }
                      ]
                    }
                  ]
                },
                {
                  attribute: {
                    x: 580,
                    y: 0,
                    width: 80,
                    height: 0,
                    clip: false,
                    pickable: false
                  },
                  _uid: 1332,
                  type: 'group',
                  children: [
                    {
                      attribute: {
                        x: 0,
                        y: 0,
                        width: 80,
                        height: 80,
                        lineWidth: 1,
                        fill: '#FAF9FB',
                        stroke: '#E1E4E8',
                        lineCap: 'square',
                        clip: true
                      },
                      _uid: 1333,
                      type: 'group',
                      children: [
                        {
                          attribute: {
                            fontFamily: 'Arial',
                            fontSize: 12,
                            fontWeight: 'bold',
                            fill: '#000',
                            textAlign: 'left',
                            textBaseline: 'top',
                            lineHeight: 12,
                            ellipsis: '...',
                            text: '400w',
                            maxLineWidth: 48,
                            autoWrapText: false,
                            wordBreak: 'break-word',
                            heightLimit: 60,
                            pickable: false,
                            dx: 0,
                            whiteSpace: 'no-wrap',
                            x: 16,
                            y: 34
                          },
                          _uid: 1334,
                          type: 'text',
                          name: 'text',
                          children: []
                        }
                      ]
                    }
                  ]
                },
                {
                  attribute: {
                    x: 660,
                    y: 0,
                    width: 100,
                    height: 0,
                    clip: false,
                    pickable: false
                  },
                  _uid: 1335,
                  type: 'group',
                  children: [
                    {
                      attribute: {
                        x: 0,
                        y: 0,
                        width: 100,
                        height: 80,
                        lineWidth: 1,
                        fill: '#FAF9FB',
                        stroke: '#E1E4E8',
                        lineCap: 'square',
                        clip: true
                      },
                      _uid: 1336,
                      type: 'group',
                      children: [
                        {
                          attribute: {
                            fontFamily: 'Arial,sans-serif',
                            fontSize: 14,
                            fontWeight: null,
                            fill: '#000',
                            textAlign: 'left',
                            textBaseline: 'top',
                            lineHeight: 14,
                            ellipsis: '...',
                            text: '',
                            maxLineWidth: 18,
                            heightLimit: 60,
                            pickable: false,
                            autoWrapText: false,
                            wordBreak: 'break-word',
                            whiteSpace: 'no-wrap',
                            x: 66,
                            y: 40
                          },
                          _uid: 1339,
                          type: 'text',
                          name: 'text',
                          children: []
                        },
                        {
                          attribute: {
                            image: 'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VTable/favorite.svg',
                            width: 20,
                            height: 20,
                            visibleTime: 'always',
                            marginLeft: 0,
                            marginRight: 0,
                            cursor: 'pointer',
                            x: 16,
                            y: 30
                          },
                          _uid: 1337,
                          type: 'image',
                          name: 'favorite',
                          children: []
                        },
                        {
                          attribute: {
                            image: 'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VTable/message.svg',
                            width: 20,
                            height: 20,
                            visibleTime: 'always',
                            marginLeft: 10,
                            marginRight: 0,
                            cursor: 'pointer',
                            x: 46,
                            y: 30
                          },
                          _uid: 1338,
                          type: 'image',
                          name: 'message',
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
                x: 0,
                y: 80,
                width: 0,
                height: 0,
                clip: false,
                pickable: false
              },
              _uid: 1247,
              type: 'group',
              children: []
            },
            {
              attribute: {
                x: 0,
                y: 0,
                width: 0,
                height: 0,
                clip: false,
                pickable: false
              },
              _uid: 1250,
              type: 'group',
              children: []
            },
            {
              attribute: {
                x: 0,
                y: 0,
                width: 760,
                height: 80,
                clip: false,
                pickable: false
              },
              _uid: 1245,
              type: 'group',
              children: [
                {
                  attribute: {
                    x: 0,
                    y: 0,
                    width: 80,
                    height: 0,
                    clip: false,
                    pickable: false
                  },
                  _uid: 1276,
                  type: 'group',
                  children: [
                    {
                      attribute: {
                        x: 0,
                        y: 0,
                        width: 80,
                        height: 80,
                        lineWidth: 1,
                        fill: '#ECF1F5',
                        stroke: '#E1E4E8',
                        lineCap: 'square',
                        clip: true
                      },
                      _uid: 1277,
                      type: 'group',
                      children: [
                        {
                          attribute: {
                            fontFamily: 'Arial,sans-serif',
                            fontSize: 16,
                            fontWeight: 'bold',
                            fill: '#000',
                            textAlign: 'left',
                            textBaseline: 'top',
                            lineHeight: 16,
                            ellipsis: '...',
                            text: '序号',
                            maxLineWidth: 48,
                            autoWrapText: false,
                            wordBreak: 'break-word',
                            heightLimit: 60,
                            pickable: false,
                            dx: 0,
                            whiteSpace: 'no-wrap',
                            x: 16,
                            y: 32
                          },
                          _uid: 1278,
                          type: 'text',
                          name: 'text',
                          children: []
                        }
                      ]
                    }
                  ]
                },
                {
                  attribute: {
                    x: 80,
                    y: 0,
                    width: 260,
                    height: 0,
                    clip: false,
                    pickable: false
                  },
                  _uid: 1279,
                  type: 'group',
                  children: [
                    {
                      attribute: {
                        x: 0,
                        y: 0,
                        width: 260,
                        height: 80,
                        lineWidth: 1,
                        fill: '#ECF1F5',
                        stroke: '#E1E4E8',
                        lineCap: 'square',
                        clip: true
                      },
                      _uid: 1280,
                      type: 'group',
                      children: [
                        {
                          attribute: {
                            fontFamily: 'Arial,sans-serif',
                            fontSize: 16,
                            fontWeight: 'bold',
                            fill: '#000',
                            textAlign: 'left',
                            textBaseline: 'top',
                            lineHeight: 16,
                            ellipsis: '...',
                            text: '主播昵称',
                            maxLineWidth: 228,
                            autoWrapText: false,
                            wordBreak: 'break-word',
                            heightLimit: 60,
                            pickable: false,
                            dx: 0,
                            whiteSpace: 'no-wrap',
                            x: 16,
                            y: 32
                          },
                          _uid: 1281,
                          type: 'text',
                          name: 'text',
                          children: []
                        }
                      ]
                    }
                  ]
                },
                {
                  attribute: {
                    x: 340,
                    y: 0,
                    width: 80,
                    height: 0,
                    clip: false,
                    pickable: false
                  },
                  _uid: 1282,
                  type: 'group',
                  children: [
                    {
                      attribute: {
                        x: 0,
                        y: 0,
                        width: 80,
                        height: 80,
                        lineWidth: 1,
                        fill: '#ECF1F5',
                        stroke: '#E1E4E8',
                        lineCap: 'square',
                        clip: true
                      },
                      _uid: 1283,
                      type: 'group',
                      children: [
                        {
                          attribute: {
                            fontFamily: 'Arial,sans-serif',
                            fontSize: 16,
                            fontWeight: 'bold',
                            fill: '#000',
                            textAlign: 'left',
                            textBaseline: 'top',
                            lineHeight: 16,
                            ellipsis: '...',
                            text: '粉丝数',
                            maxLineWidth: 48,
                            autoWrapText: false,
                            wordBreak: 'break-word',
                            heightLimit: 60,
                            pickable: false,
                            dx: 0,
                            whiteSpace: 'no-wrap',
                            x: 16,
                            y: 32
                          },
                          _uid: 1284,
                          type: 'text',
                          name: 'text',
                          children: []
                        }
                      ]
                    }
                  ]
                },
                {
                  attribute: {
                    x: 420,
                    y: 0,
                    width: 80,
                    height: 0,
                    clip: false,
                    pickable: false
                  },
                  _uid: 1285,
                  type: 'group',
                  children: [
                    {
                      attribute: {
                        x: 0,
                        y: 0,
                        width: 80,
                        height: 80,
                        lineWidth: 1,
                        fill: '#ECF1F5',
                        stroke: '#E1E4E8',
                        lineCap: 'square',
                        clip: true
                      },
                      _uid: 1286,
                      type: 'group',
                      children: [
                        {
                          attribute: {
                            fontFamily: 'Arial,sans-serif',
                            fontSize: 16,
                            fontWeight: 'bold',
                            fill: '#000',
                            textAlign: 'left',
                            textBaseline: 'top',
                            lineHeight: 16,
                            ellipsis: '...',
                            text: '作品数',
                            maxLineWidth: 48,
                            autoWrapText: false,
                            wordBreak: 'break-word',
                            heightLimit: 60,
                            pickable: false,
                            dx: 0,
                            whiteSpace: 'no-wrap',
                            x: 16,
                            y: 32
                          },
                          _uid: 1287,
                          type: 'text',
                          name: 'text',
                          children: []
                        }
                      ]
                    }
                  ]
                },
                {
                  attribute: {
                    x: 500,
                    y: 0,
                    width: 80,
                    height: 0,
                    clip: false,
                    pickable: false
                  },
                  _uid: 1288,
                  type: 'group',
                  children: [
                    {
                      attribute: {
                        x: 0,
                        y: 0,
                        width: 80,
                        height: 80,
                        lineWidth: 1,
                        fill: '#ECF1F5',
                        stroke: '#E1E4E8',
                        lineCap: 'square',
                        clip: true
                      },
                      _uid: 1289,
                      type: 'group',
                      children: [
                        {
                          attribute: {
                            fontFamily: 'Arial,sans-serif',
                            fontSize: 16,
                            fontWeight: 'bold',
                            fill: '#000',
                            textAlign: 'left',
                            textBaseline: 'top',
                            lineHeight: 16,
                            ellipsis: '...',
                            text: '播放量',
                            maxLineWidth: 48,
                            autoWrapText: false,
                            wordBreak: 'break-word',
                            heightLimit: 60,
                            pickable: false,
                            dx: 0,
                            whiteSpace: 'no-wrap',
                            x: 16,
                            y: 32
                          },
                          _uid: 1290,
                          type: 'text',
                          name: 'text',
                          children: []
                        }
                      ]
                    }
                  ]
                },
                {
                  attribute: {
                    x: 580,
                    y: 0,
                    width: 80,
                    height: 0,
                    clip: false,
                    pickable: false
                  },
                  _uid: 1291,
                  type: 'group',
                  children: [
                    {
                      attribute: {
                        x: 0,
                        y: 0,
                        width: 80,
                        height: 80,
                        lineWidth: 1,
                        fill: '#ECF1F5',
                        stroke: '#E1E4E8',
                        lineCap: 'square',
                        clip: true
                      },
                      _uid: 1292,
                      type: 'group',
                      children: [
                        {
                          attribute: {
                            fontFamily: 'Arial,sans-serif',
                            fontSize: 16,
                            fontWeight: 'bold',
                            fill: '#000',
                            textAlign: 'left',
                            textBaseline: 'top',
                            lineHeight: 16,
                            ellipsis: '...',
                            text: '播放量',
                            maxLineWidth: 48,
                            autoWrapText: false,
                            wordBreak: 'break-word',
                            heightLimit: 60,
                            pickable: false,
                            dx: 0,
                            whiteSpace: 'no-wrap',
                            x: 16,
                            y: 32
                          },
                          _uid: 1293,
                          type: 'text',
                          name: 'text',
                          children: []
                        }
                      ]
                    }
                  ]
                },
                {
                  attribute: {
                    x: 660,
                    y: 0,
                    width: 100,
                    height: 0,
                    clip: false,
                    pickable: false
                  },
                  _uid: 1294,
                  type: 'group',
                  children: [
                    {
                      attribute: {
                        x: 0,
                        y: 0,
                        width: 100,
                        height: 80,
                        lineWidth: 1,
                        fill: '#ECF1F5',
                        stroke: '#E1E4E8',
                        lineCap: 'square',
                        clip: true
                      },
                      _uid: 1295,
                      type: 'group',
                      children: [
                        {
                          attribute: {
                            fontFamily: 'Arial,sans-serif',
                            fontSize: 16,
                            fontWeight: 'bold',
                            fill: '#000',
                            textAlign: 'left',
                            textBaseline: 'top',
                            lineHeight: 16,
                            ellipsis: '...',
                            text: '操作',
                            maxLineWidth: 68,
                            autoWrapText: false,
                            wordBreak: 'break-word',
                            heightLimit: 60,
                            pickable: false,
                            dx: 0,
                            whiteSpace: 'no-wrap',
                            x: 16,
                            y: 32
                          },
                          _uid: 1296,
                          type: 'text',
                          name: 'text',
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
                x: 0,
                y: 80,
                width: 760,
                height: 0,
                clip: false,
                pickable: false
              },
              _uid: 1249,
              type: 'group',
              children: []
            },
            {
              attribute: {
                x: 0,
                y: 0,
                width: 0,
                height: 0,
                clip: false,
                pickable: false,
                visible: false
              },
              _uid: 1253,
              type: 'group',
              children: []
            },
            {
              attribute: {
                x: 0,
                y: 0,
                width: 0,
                height: 0,
                clip: false,
                pickable: false,
                visible: false
              },
              _uid: 1252,
              type: 'group',
              children: []
            },
            {
              attribute: {
                x: 0,
                y: 0,
                width: 0,
                height: 0,
                clip: false,
                pickable: false,
                visible: false
              },
              _uid: 1254,
              type: 'group',
              children: []
            },
            {
              attribute: {
                x: 0,
                y: 0,
                width: 0,
                height: 0,
                clip: false,
                pickable: false
              },
              _uid: 1246,
              type: 'group',
              children: []
            },
            {
              attribute: {
                x: 0,
                y: 0,
                width: 0,
                height: 0,
                clip: false,
                pickable: false
              },
              _uid: 1251,
              type: 'group',
              children: [
                {
                  attribute: {
                    visible: false,
                    pickable: false,
                    x: 0,
                    y: 0,
                    width: 3,
                    height: 0,
                    fill: {
                      gradient: 'linear',
                      x0: 0,
                      y0: 0,
                      x1: 1,
                      y1: 0,
                      stops: [
                        {
                          color: 'rgba(225, 228, 232, 0.6)',
                          offset: 0
                        },
                        {
                          color: 'rgba(225, 228, 232, 0.6)',
                          offset: 1
                        }
                      ]
                    }
                  },
                  _uid: 1271,
                  type: 'rect',
                  children: []
                },
                {
                  attribute: {
                    visible: false,
                    pickable: false,
                    stroke: '#D9E2FF',
                    lineWidth: 3,
                    x: 0,
                    y: 0,
                    points: [
                      {
                        x: 0,
                        y: 0
                      },
                      {
                        x: 0,
                        y: 0
                      }
                    ]
                  },
                  _uid: 1264,
                  type: 'line',
                  children: []
                },
                {
                  attribute: {
                    visible: false,
                    pickable: false,
                    stroke: '#416EFF',
                    lineWidth: 1,
                    x: 0,
                    y: 0,
                    points: [
                      {
                        x: 0,
                        y: 0
                      },
                      {
                        x: 0,
                        y: 0
                      }
                    ]
                  },
                  _uid: 1263,
                  type: 'line',
                  children: []
                },
                {
                  attribute: {
                    visible: false,
                    pickable: false,
                    x: 0,
                    y: 0
                  },
                  _uid: 1267,
                  type: 'group',
                  children: [
                    {
                      attribute: {
                        visible: false,
                        pickable: false,
                        fill: '#3073F2',
                        x: 0,
                        y: 0,
                        width: 38,
                        height: 16,
                        cornerRadius: 5,
                        dx: 12,
                        dy: -8
                      },
                      _uid: 1266,
                      type: 'rect',
                      children: []
                    },
                    {
                      attribute: {
                        visible: false,
                        pickable: false,
                        x: 0,
                        y: 0,
                        fontSize: 10,
                        fill: '#FFF',
                        text: '',
                        textBaseline: 'top',
                        dx: 16,
                        dy: -6
                      },
                      _uid: 1265,
                      type: 'text',
                      children: []
                    }
                  ]
                },
                {
                  attribute: {
                    direction: 'horizontal',
                    round: true,
                    sliderSize: 20,
                    sliderStyle: {
                      fill: '#C0C0C0'
                    },
                    railStyle: {
                      fill: 'rgba(0, 0, 0, .0)'
                    },
                    padding: 0,
                    scrollRange: [0, 1],
                    delayType: 'throttle',
                    delayTime: 0,
                    realTime: true,
                    x: -1596,
                    y: -796,
                    width: 0,
                    height: 7,
                    range: [null, null],
                    visible: false
                  },
                  _uid: 1255,
                  type: 'group',
                  name: 'scrollbar',
                  children: [
                    {
                      attribute: {
                        visible: false
                      },
                      _uid: 1256,
                      type: 'group',
                      name: 'scrollbar-container',
                      children: [
                        {
                          attribute: {
                            x: 0,
                            y: 0,
                            width: 0,
                            height: 7,
                            fill: 'rgba(0, 0, 0, .0)',
                            visible: false
                          },
                          _uid: 1257,
                          type: 'rect',
                          name: 'scrollbar-rail',
                          children: []
                        },
                        {
                          attribute: {
                            x: null,
                            y: 0,
                            width: null,
                            height: 7,
                            cornerRadius: 7,
                            fill: '#C0C0C0',
                            boundsPadding: [0, 0, 0, 0],
                            pickMode: 'imprecise',
                            visible: false
                          },
                          _uid: 1258,
                          type: 'rect',
                          name: 'slider',
                          children: []
                        }
                      ]
                    }
                  ]
                },
                {
                  attribute: {
                    direction: 'vertical',
                    round: true,
                    sliderSize: 20,
                    sliderStyle: {
                      fill: '#C0C0C0'
                    },
                    railStyle: {
                      fill: 'rgba(0, 0, 0, .0)'
                    },
                    padding: 0,
                    scrollRange: [0, 1],
                    delayType: 'throttle',
                    delayTime: 0,
                    realTime: true,
                    x: -1596,
                    y: -796,
                    width: 7,
                    height: 0,
                    range: [null, null],
                    visible: false
                  },
                  _uid: 1259,
                  type: 'group',
                  name: 'scrollbar',
                  children: [
                    {
                      attribute: {
                        visible: false
                      },
                      _uid: 1260,
                      type: 'group',
                      name: 'scrollbar-container',
                      children: [
                        {
                          attribute: {
                            x: 0,
                            y: 0,
                            width: 7,
                            height: 0,
                            fill: 'rgba(0, 0, 0, .0)',
                            visible: false
                          },
                          _uid: 1261,
                          type: 'rect',
                          name: 'scrollbar-rail',
                          children: []
                        },
                        {
                          attribute: {
                            x: 0,
                            y: null,
                            width: 7,
                            height: null,
                            cornerRadius: 7,
                            fill: '#C0C0C0',
                            boundsPadding: [0, 0, 0, 0],
                            pickMode: 'imprecise',
                            visible: false
                          },
                          _uid: 1262,
                          type: 'rect',
                          name: 'slider',
                          children: []
                        }
                      ]
                    }
                  ]
                },
                {
                  attribute: {
                    x: 0,
                    y: 0,
                    fill: '#FFF',
                    stroke: '#CCC',
                    cornerRadius: 4,
                    lineWidth: 0.5
                  },
                  _uid: 1272,
                  type: 'group',
                  children: []
                },
                {
                  attribute: {
                    x: -1000,
                    y: -1000,
                    image:
                      '<svg class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="200" height="200"><path d="M810.666667 85.333333c70.688 0 128 57.312 128 128v597.333334c0 70.688-57.312 128-128 128H213.333333c-70.688 0-128-57.312-128-128V213.333333c0-70.688 57.312-128 128-128h597.333334z m0 85.333334H213.333333a42.666667 42.666667 0 0 0-42.613333 40.533333L170.666667 213.333333v597.333334a42.666667 42.666667 0 0 0 40.533333 42.613333L213.333333 853.333333h597.333334a42.666667 42.666667 0 0 0 42.613333-40.533333L853.333333 810.666667V213.333333a42.666667 42.666667 0 0 0-40.533333-42.613333L810.666667 170.666667zM549.333333 288a5.333333 5.333333 0 0 1 5.333334 5.333333V469.333333h176a5.333333 5.333333 0 0 1 5.333333 5.333334v74.666666a5.333333 5.333333 0 0 1-5.333333 5.333334H554.666667v176a5.333333 5.333333 0 0 1-5.333334 5.333333h-74.666666a5.333333 5.333333 0 0 1-5.333334-5.333333V554.666667H293.333333a5.333333 5.333333 0 0 1-5.333333-5.333334v-74.666666a5.333333 5.333333 0 0 1 5.333333-5.333334H469.333333V293.333333a5.333333 5.333333 0 0 1 5.333334-5.333333h74.666666z"></path></svg>',
                    width: 13,
                    height: 13,
                    dx: -6.5,
                    dy: -6.5,
                    visible: false,
                    funcType: 'drillDown',
                    cursor: 'pointer'
                  },
                  _uid: 1273,
                  type: 'image',
                  children: []
                },
                {
                  attribute: {
                    visible: false,
                    pickable: false,
                    x: 0,
                    y: 0,
                    symbolType: 'triangle',
                    fill: 'blue'
                  },
                  _uid: 1268,
                  type: 'symbol',
                  children: []
                },
                {
                  attribute: {
                    visible: false,
                    pickable: false,
                    stroke: 'blue',
                    lineWidth: 2,
                    x: 0,
                    y: 0,
                    points: [
                      {
                        x: 0,
                        y: 0
                      },
                      {
                        x: 0,
                        y: 0
                      }
                    ]
                  },
                  _uid: 1269,
                  type: 'line',
                  children: []
                },
                {
                  attribute: {
                    visible: false,
                    pickable: false,
                    fill: 'rgba(204,204,204,0.3)',
                    x: 0,
                    y: 0,
                    width: 0,
                    height: 0
                  },
                  _uid: 1270,
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
    // document.body.appendChild(c);
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
