import { LinearScale, PointScale } from '@visactor/vscale';
import { GroupFadeIn, GroupFadeOut } from '@visactor/vrender-core';
import { LineAxis, GroupTransition, LineAxisGrid } from '../../../src';
import render from '../../util/render';

const data = [
  {
    animation: true,
    animationAppear: {
      duration: 400,
      easing: 'cubicOut'
    },
    animationUpdate: {
      duration: 400,
      easing: 'linear'
    },
    animationEnter: {
      duration: 400,
      easing: 'linear'
    },
    title: {
      space: 4,
      padding: [0, 0, 0, 0],
      textStyle: {
        fontSize: 12,
        fill: '#333333',
        fontWeight: 'normal',
        fillOpacity: 1
      },
      autoRotate: false,
      text: 'country',
      maxWidth: null
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
      },
      formatMethod: null
    },
    tick: {
      visible: true,
      inside: false,
      alignWithLabel: true,
      length: 4,
      style: {
        lineWidth: 1,
        stroke: '#D8DCE3',
        strokeOpacity: 1
      }
    },
    subTick: {
      visible: true,
      inside: false,
      count: 4,
      length: 2,
      style: {
        lineWidth: 1,
        stroke: '#D8DCE3',
        strokeOpacity: 1
      }
    },
    line: {
      visible: true,
      style: {
        lineWidth: 1,
        stroke: 'red',
        strokeOpacity: 1
      }
    },
    grid: {
      style: {
        lineWidth: 1,
        stroke: 'red',
        strokeOpacity: 1,
        lineDash: [4, 4]
      },
      type: 'line',
      visible: true,
      length: 599
    },
    subGrid: {
      visible: false,
      style: {
        lineWidth: 1,
        stroke: 'red',
        strokeOpacity: 1,
        lineDash: [4, 4]
      },
      type: 'line'
    },
    verticalFactor: 1,
    zIndex: 100,
    dx: 0,
    start: {
      x: 0,
      y: 0
    },
    end: {
      x: 0,
      y: 456
    },
    items: [
      [
        {
          value: null
        }
      ]
    ],
    x: 101,
    y: 12
  },
  {
    animation: true,
    animationAppear: {
      duration: 400,
      easing: 'cubicOut'
    },
    animationUpdate: {
      duration: 400,
      easing: 'linear'
    },
    animationEnter: {
      duration: 400,
      easing: 'linear'
    },
    title: {
      space: 4,
      padding: [0, 0, 0, 0],
      textStyle: {
        fontSize: 12,
        fill: '#333333',
        fontWeight: 'normal',
        fillOpacity: 1
      },
      autoRotate: false,
      text: 'country',
      maxWidth: null
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
      },
      formatMethod: null
    },
    tick: {
      visible: true,
      inside: false,
      alignWithLabel: true,
      length: 4,
      style: {
        lineWidth: 1,
        stroke: '#D8DCE3',
        strokeOpacity: 1
      }
    },
    subTick: {
      visible: true,
      inside: false,
      count: 4,
      length: 2,
      style: {
        lineWidth: 1,
        stroke: '#D8DCE3',
        strokeOpacity: 1
      }
    },
    line: {
      visible: true,
      style: {
        lineWidth: 1,
        stroke: 'red',
        strokeOpacity: 1
      }
    },
    grid: {
      style: {
        lineWidth: 1,
        stroke: 'red',
        strokeOpacity: 1,
        lineDash: [4, 4]
      },
      type: 'line',
      visible: true,
      length: 536
    },
    subGrid: {
      visible: false,
      style: {
        lineWidth: 1,
        stroke: 'red',
        strokeOpacity: 1,
        lineDash: [4, 4]
      },
      type: 'line'
    },
    verticalFactor: 1,
    zIndex: 100,
    dx: 0,
    start: {
      x: 0,
      y: 0
    },
    end: {
      x: 0,
      y: 456
    },
    items: [
      [
        {
          id: '马来西亚',
          label: '马来西亚',
          value: 0.9594594594594595,
          rawValue: '马来西亚'
        },
        {
          id: '泰国',
          label: '泰国',
          value: 0.9054054054054055,
          rawValue: '泰国'
        },
        {
          id: '菲律宾',
          label: '菲律宾',
          value: 0.8513513513513514,
          rawValue: '菲律宾'
        },
        {
          id: '韩国',
          label: '韩国',
          value: 0.7972972972972974,
          rawValue: '韩国'
        },
        {
          id: '芬兰',
          label: '芬兰',
          value: 0.7432432432432433,
          rawValue: '芬兰'
        },
        {
          id: '印度尼西亚',
          label: '印度尼西亚',
          value: 0.6891891891891893,
          rawValue: '印度尼西亚'
        },
        {
          id: '挪威',
          label: '挪威',
          value: 0.6351351351351352,
          rawValue: '挪威'
        },
        {
          id: '土耳其',
          label: '土耳其',
          value: 0.581081081081081,
          rawValue: '土耳其'
        },
        {
          id: '比利时',
          label: '比利时',
          value: 0.527027027027027,
          rawValue: '比利时'
        },
        {
          id: '印度',
          label: '印度',
          value: 0.47297297297297297,
          rawValue: '印度'
        },
        {
          id: '瑞典',
          label: '瑞典',
          value: 0.4189189189189189,
          rawValue: '瑞典'
        },
        {
          id: '沙特阿拉伯',
          label: '沙特阿拉伯',
          value: 0.36486486486486486,
          rawValue: '沙特阿拉伯'
        },
        {
          id: '瑞士',
          label: '瑞士',
          value: 0.31081081081081074,
          rawValue: '瑞士'
        },
        {
          id: '荷兰',
          label: '荷兰',
          value: 0.25675675675675674,
          rawValue: '荷兰'
        },
        {
          id: '西班牙',
          label: '西班牙',
          value: 0.20270270270270271,
          rawValue: '西班牙'
        },
        {
          id: '意大利',
          label: '意大利',
          value: 0.14864864864864866,
          rawValue: '意大利'
        },
        {
          id: '英国',
          label: '英国',
          value: 0.09459459459459459,
          rawValue: '英国'
        },
        {
          id: '日本',
          label: '日本',
          value: 0.040540540540540536,
          rawValue: '日本'
        }
      ]
    ],
    x: 164,
    y: 12
  },
  {
    animation: true,
    animationAppear: {
      duration: 400,
      easing: 'cubicOut'
    },
    animationUpdate: {
      duration: 400,
      easing: 'linear'
    },
    animationEnter: {
      duration: 400,
      easing: 'linear'
    },
    title: {
      space: 4,
      padding: [0, 0, 0, 0],
      textStyle: {
        fontSize: 12,
        fill: '#333333',
        fontWeight: 'normal',
        fillOpacity: 1
      },
      autoRotate: false,
      text: 'country',
      maxWidth: null
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
      },
      formatMethod: null
    },
    tick: {
      visible: true,
      inside: false,
      alignWithLabel: true,
      length: 4,
      style: {
        lineWidth: 1,
        stroke: '#D8DCE3',
        strokeOpacity: 1
      }
    },
    subTick: {
      visible: true,
      inside: false,
      count: 4,
      length: 2,
      style: {
        lineWidth: 1,
        stroke: '#D8DCE3',
        strokeOpacity: 1
      }
    },
    line: {
      visible: true,
      style: {
        lineWidth: 1,
        stroke: 'red',
        strokeOpacity: 1
      }
    },
    grid: {
      style: {
        lineWidth: 1,
        stroke: 'red',
        strokeOpacity: 1,
        lineDash: [4, 4]
      },
      type: 'line',
      visible: true,
      length: 536
    },
    subGrid: {
      visible: false,
      style: {
        lineWidth: 1,
        stroke: 'red',
        strokeOpacity: 1,
        lineDash: [4, 4]
      },
      type: 'line'
    },
    verticalFactor: 1,
    zIndex: 100,
    dx: 0,
    start: {
      x: 0,
      y: 0
    },
    end: {
      x: 0,
      y: 456
    },
    items: [
      [
        {
          id: '马来西亚',
          label: '马来西亚',
          value: 0.9594594594594595,
          rawValue: '马来西亚'
        },
        {
          id: '泰国',
          label: '泰国',
          value: 0.9054054054054055,
          rawValue: '泰国'
        },
        {
          id: '菲律宾',
          label: '菲律宾',
          value: 0.8513513513513514,
          rawValue: '菲律宾'
        },
        {
          id: '芬兰',
          label: '芬兰',
          value: 0.7972972972972974,
          rawValue: '芬兰'
        },
        {
          id: '韩国',
          label: '韩国',
          value: 0.7432432432432433,
          rawValue: '韩国'
        },
        {
          id: '印度尼西亚',
          label: '印度尼西亚',
          value: 0.6891891891891893,
          rawValue: '印度尼西亚'
        },
        {
          id: '挪威',
          label: '挪威',
          value: 0.6351351351351352,
          rawValue: '挪威'
        },
        {
          id: '土耳其',
          label: '土耳其',
          value: 0.581081081081081,
          rawValue: '土耳其'
        },
        {
          id: '瑞典',
          label: '瑞典',
          value: 0.527027027027027,
          rawValue: '瑞典'
        },
        {
          id: '比利时',
          label: '比利时',
          value: 0.47297297297297297,
          rawValue: '比利时'
        },
        {
          id: '印度',
          label: '印度',
          value: 0.4189189189189189,
          rawValue: '印度'
        },
        {
          id: '沙特阿拉伯',
          label: '沙特阿拉伯',
          value: 0.36486486486486486,
          rawValue: '沙特阿拉伯'
        },
        {
          id: '瑞士',
          label: '瑞士',
          value: 0.31081081081081074,
          rawValue: '瑞士'
        },
        {
          id: '荷兰',
          label: '荷兰',
          value: 0.25675675675675674,
          rawValue: '荷兰'
        },
        {
          id: '西班牙',
          label: '西班牙',
          value: 0.20270270270270271,
          rawValue: '西班牙'
        },
        {
          id: '英国',
          label: '英国',
          value: 0.14864864864864866,
          rawValue: '英国'
        },
        {
          id: '意大利',
          label: '意大利',
          value: 0.09459459459459459,
          rawValue: '意大利'
        },
        {
          id: '日本',
          label: '日本',
          value: 0.040540540540540536,
          rawValue: '日本'
        }
      ]
    ],
    x: 164,
    y: 12
  },
  {
    animation: true,
    animationAppear: {
      duration: 400,
      easing: 'cubicOut'
    },
    animationUpdate: {
      duration: 400,
      easing: 'linear'
    },
    animationEnter: {
      duration: 400,
      easing: 'linear'
    },
    title: {
      space: 4,
      padding: [0, 0, 0, 0],
      textStyle: {
        fontSize: 12,
        fill: '#333333',
        fontWeight: 'normal',
        fillOpacity: 1
      },
      autoRotate: false,
      text: 'country',
      maxWidth: null
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
      },
      formatMethod: null
    },
    tick: {
      visible: true,
      inside: false,
      alignWithLabel: true,
      length: 4,
      style: {
        lineWidth: 1,
        stroke: '#D8DCE3',
        strokeOpacity: 1
      }
    },
    subTick: {
      visible: true,
      inside: false,
      count: 4,
      length: 2,
      style: {
        lineWidth: 1,
        stroke: '#D8DCE3',
        strokeOpacity: 1
      }
    },
    line: {
      visible: true,
      style: {
        lineWidth: 1,
        stroke: 'red',
        strokeOpacity: 1
      }
    },
    grid: {
      style: {
        lineWidth: 1,
        stroke: 'red',
        strokeOpacity: 1,
        lineDash: [4, 4]
      },
      type: 'line',
      visible: true,
      length: 536
    },
    subGrid: {
      visible: false,
      style: {
        lineWidth: 1,
        stroke: 'red',
        strokeOpacity: 1,
        lineDash: [4, 4]
      },
      type: 'line'
    },
    verticalFactor: 1,
    zIndex: 100,
    dx: 0,
    start: {
      x: 0,
      y: 0
    },
    end: {
      x: 0,
      y: 456
    },
    items: [
      [
        {
          id: '马来西亚',
          label: '马来西亚',
          value: 0.9594594594594595,
          rawValue: '马来西亚'
        },
        {
          id: '泰国',
          label: '泰国',
          value: 0.9054054054054055,
          rawValue: '泰国'
        },
        {
          id: '菲律宾',
          label: '菲律宾',
          value: 0.8513513513513514,
          rawValue: '菲律宾'
        },
        {
          id: '芬兰',
          label: '芬兰',
          value: 0.7972972972972974,
          rawValue: '芬兰'
        },
        {
          id: '韩国',
          label: '韩国',
          value: 0.7432432432432433,
          rawValue: '韩国'
        },
        {
          id: '印度尼西亚',
          label: '印度尼西亚',
          value: 0.6891891891891893,
          rawValue: '印度尼西亚'
        },
        {
          id: '挪威',
          label: '挪威',
          value: 0.6351351351351352,
          rawValue: '挪威'
        },
        {
          id: '沙特阿拉伯',
          label: '沙特阿拉伯',
          value: 0.581081081081081,
          rawValue: '沙特阿拉伯'
        },
        {
          id: '土耳其',
          label: '土耳其',
          value: 0.527027027027027,
          rawValue: '土耳其'
        },
        {
          id: '比利时',
          label: '比利时',
          value: 0.47297297297297297,
          rawValue: '比利时'
        },
        {
          id: '瑞典',
          label: '瑞典',
          value: 0.4189189189189189,
          rawValue: '瑞典'
        },
        {
          id: '印度',
          label: '印度',
          value: 0.36486486486486486,
          rawValue: '印度'
        },
        {
          id: '瑞士',
          label: '瑞士',
          value: 0.31081081081081074,
          rawValue: '瑞士'
        },
        {
          id: '荷兰',
          label: '荷兰',
          value: 0.25675675675675674,
          rawValue: '荷兰'
        },
        {
          id: '西班牙',
          label: '西班牙',
          value: 0.20270270270270271,
          rawValue: '西班牙'
        },
        {
          id: '英国',
          label: '英国',
          value: 0.14864864864864866,
          rawValue: '英国'
        },
        {
          id: '意大利',
          label: '意大利',
          value: 0.09459459459459459,
          rawValue: '意大利'
        },
        {
          id: '日本',
          label: '日本',
          value: 0.040540540540540536,
          rawValue: '日本'
        }
      ]
    ],
    x: 164,
    y: 12
  },
  {
    animation: true,
    animationAppear: {
      duration: 400,
      easing: 'cubicOut'
    },
    animationUpdate: {
      duration: 400,
      easing: 'linear'
    },
    animationEnter: {
      duration: 400,
      easing: 'linear'
    },
    title: {
      space: 4,
      padding: [0, 0, 0, 0],
      textStyle: {
        fontSize: 12,
        fill: '#333333',
        fontWeight: 'normal',
        fillOpacity: 1
      },
      autoRotate: false,
      text: 'country',
      maxWidth: null
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
      },
      formatMethod: null
    },
    tick: {
      visible: true,
      inside: false,
      alignWithLabel: true,
      length: 4,
      style: {
        lineWidth: 1,
        stroke: '#D8DCE3',
        strokeOpacity: 1
      }
    },
    subTick: {
      visible: true,
      inside: false,
      count: 4,
      length: 2,
      style: {
        lineWidth: 1,
        stroke: '#D8DCE3',
        strokeOpacity: 1
      }
    },
    line: {
      visible: true,
      style: {
        lineWidth: 1,
        stroke: 'red',
        strokeOpacity: 1
      }
    },
    grid: {
      style: {
        lineWidth: 1,
        stroke: 'red',
        strokeOpacity: 1,
        lineDash: [4, 4]
      },
      type: 'line',
      visible: true,
      length: 536
    },
    subGrid: {
      visible: false,
      style: {
        lineWidth: 1,
        stroke: 'red',
        strokeOpacity: 1,
        lineDash: [4, 4]
      },
      type: 'line'
    },
    verticalFactor: 1,
    zIndex: 100,
    dx: 0,
    start: {
      x: 0,
      y: 0
    },
    end: {
      x: 0,
      y: 456
    },
    items: [
      [
        {
          id: '马来西亚',
          label: '马来西亚',
          value: 0.9594594594594595,
          rawValue: '马来西亚'
        },
        {
          id: '菲律宾',
          label: '菲律宾',
          value: 0.9054054054054055,
          rawValue: '菲律宾'
        },
        {
          id: '泰国',
          label: '泰国',
          value: 0.8513513513513514,
          rawValue: '泰国'
        },
        {
          id: '芬兰',
          label: '芬兰',
          value: 0.7972972972972974,
          rawValue: '芬兰'
        },
        {
          id: '挪威',
          label: '挪威',
          value: 0.7432432432432433,
          rawValue: '挪威'
        },
        {
          id: '沙特阿拉伯',
          label: '沙特阿拉伯',
          value: 0.6891891891891893,
          rawValue: '沙特阿拉伯'
        },
        {
          id: '印度尼西亚',
          label: '印度尼西亚',
          value: 0.6351351351351352,
          rawValue: '印度尼西亚'
        },
        {
          id: '比利时',
          label: '比利时',
          value: 0.581081081081081,
          rawValue: '比利时'
        },
        {
          id: '韩国',
          label: '韩国',
          value: 0.527027027027027,
          rawValue: '韩国'
        },
        {
          id: '瑞典',
          label: '瑞典',
          value: 0.47297297297297297,
          rawValue: '瑞典'
        },
        {
          id: '土耳其',
          label: '土耳其',
          value: 0.4189189189189189,
          rawValue: '土耳其'
        },
        {
          id: '瑞士',
          label: '瑞士',
          value: 0.36486486486486486,
          rawValue: '瑞士'
        },
        {
          id: '印度',
          label: '印度',
          value: 0.31081081081081074,
          rawValue: '印度'
        },
        {
          id: '荷兰',
          label: '荷兰',
          value: 0.25675675675675674,
          rawValue: '荷兰'
        },
        {
          id: '西班牙',
          label: '西班牙',
          value: 0.20270270270270271,
          rawValue: '西班牙'
        },
        {
          id: '英国',
          label: '英国',
          value: 0.14864864864864866,
          rawValue: '英国'
        },
        {
          id: '意大利',
          label: '意大利',
          value: 0.09459459459459459,
          rawValue: '意大利'
        },
        {
          id: '日本',
          label: '日本',
          value: 0.040540540540540536,
          rawValue: '日本'
        }
      ]
    ],
    x: 164,
    y: 12
  },
  {
    animation: true,
    animationAppear: {
      duration: 400,
      easing: 'cubicOut'
    },
    animationUpdate: {
      duration: 400,
      easing: 'linear'
    },
    animationEnter: {
      duration: 400,
      easing: 'linear'
    },
    title: {
      space: 4,
      padding: [0, 0, 0, 0],
      textStyle: {
        fontSize: 12,
        fill: '#333333',
        fontWeight: 'normal',
        fillOpacity: 1
      },
      autoRotate: false,
      text: 'country',
      maxWidth: null
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
      },
      formatMethod: null
    },
    tick: {
      visible: true,
      inside: false,
      alignWithLabel: true,
      length: 4,
      style: {
        lineWidth: 1,
        stroke: '#D8DCE3',
        strokeOpacity: 1
      }
    },
    subTick: {
      visible: true,
      inside: false,
      count: 4,
      length: 2,
      style: {
        lineWidth: 1,
        stroke: '#D8DCE3',
        strokeOpacity: 1
      }
    },
    line: {
      visible: true,
      style: {
        lineWidth: 1,
        stroke: 'red',
        strokeOpacity: 1
      }
    },
    grid: {
      style: {
        lineWidth: 1,
        stroke: 'red',
        strokeOpacity: 1,
        lineDash: [4, 4]
      },
      type: 'line',
      visible: true,
      length: 536
    },
    subGrid: {
      visible: false,
      style: {
        lineWidth: 1,
        stroke: 'red',
        strokeOpacity: 1,
        lineDash: [4, 4]
      },
      type: 'line'
    },
    verticalFactor: 1,
    zIndex: 100,
    dx: 0,
    start: {
      x: 0,
      y: 0
    },
    end: {
      x: 0,
      y: 456
    },
    items: [
      [
        {
          id: '菲律宾',
          label: '菲律宾',
          value: 0.9594594594594595,
          rawValue: '菲律宾'
        },
        {
          id: '马来西亚',
          label: '马来西亚',
          value: 0.9054054054054055,
          rawValue: '马来西亚'
        },
        {
          id: '芬兰',
          label: '芬兰',
          value: 0.8513513513513514,
          rawValue: '芬兰'
        },
        {
          id: '泰国',
          label: '泰国',
          value: 0.7972972972972974,
          rawValue: '泰国'
        },
        {
          id: '挪威',
          label: '挪威',
          value: 0.7432432432432433,
          rawValue: '挪威'
        },
        {
          id: '瑞典',
          label: '瑞典',
          value: 0.6891891891891893,
          rawValue: '瑞典'
        },
        {
          id: '比利时',
          label: '比利时',
          value: 0.6351351351351352,
          rawValue: '比利时'
        },
        {
          id: '沙特阿拉伯',
          label: '沙特阿拉伯',
          value: 0.581081081081081,
          rawValue: '沙特阿拉伯'
        },
        {
          id: '印度尼西亚',
          label: '印度尼西亚',
          value: 0.527027027027027,
          rawValue: '印度尼西亚'
        },
        {
          id: '土耳其',
          label: '土耳其',
          value: 0.47297297297297297,
          rawValue: '土耳其'
        },
        {
          id: '瑞士',
          label: '瑞士',
          value: 0.4189189189189189,
          rawValue: '瑞士'
        },
        {
          id: '韩国',
          label: '韩国',
          value: 0.36486486486486486,
          rawValue: '韩国'
        },
        {
          id: '荷兰',
          label: '荷兰',
          value: 0.31081081081081074,
          rawValue: '荷兰'
        },
        {
          id: '印度',
          label: '印度',
          value: 0.25675675675675674,
          rawValue: '印度'
        },
        {
          id: '西班牙',
          label: '西班牙',
          value: 0.20270270270270271,
          rawValue: '西班牙'
        },
        {
          id: '英国',
          label: '英国',
          value: 0.14864864864864866,
          rawValue: '英国'
        },
        {
          id: '意大利',
          label: '意大利',
          value: 0.09459459459459459,
          rawValue: '意大利'
        },
        {
          id: '日本',
          label: '日本',
          value: 0.040540540540540536,
          rawValue: '日本'
        }
      ]
    ],
    x: 164,
    y: 12
  },
  {
    animation: true,
    animationAppear: {
      duration: 400,
      easing: 'cubicOut'
    },
    animationUpdate: {
      duration: 400,
      easing: 'linear'
    },
    animationEnter: {
      duration: 400,
      easing: 'linear'
    },
    title: {
      space: 4,
      padding: [0, 0, 0, 0],
      textStyle: {
        fontSize: 12,
        fill: '#333333',
        fontWeight: 'normal',
        fillOpacity: 1
      },
      autoRotate: false,
      text: 'country',
      maxWidth: null
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
      },
      formatMethod: null
    },
    tick: {
      visible: true,
      inside: false,
      alignWithLabel: true,
      length: 4,
      style: {
        lineWidth: 1,
        stroke: '#D8DCE3',
        strokeOpacity: 1
      }
    },
    subTick: {
      visible: true,
      inside: false,
      count: 4,
      length: 2,
      style: {
        lineWidth: 1,
        stroke: '#D8DCE3',
        strokeOpacity: 1
      }
    },
    line: {
      visible: true,
      style: {
        lineWidth: 1,
        stroke: 'red',
        strokeOpacity: 1
      }
    },
    grid: {
      style: {
        lineWidth: 1,
        stroke: 'red',
        strokeOpacity: 1,
        lineDash: [4, 4]
      },
      type: 'line',
      visible: true,
      length: 536
    },
    subGrid: {
      visible: false,
      style: {
        lineWidth: 1,
        stroke: 'red',
        strokeOpacity: 1,
        lineDash: [4, 4]
      },
      type: 'line'
    },
    verticalFactor: 1,
    zIndex: 100,
    dx: 0,
    start: {
      x: 0,
      y: 0
    },
    end: {
      x: 0,
      y: 456
    },
    items: [
      [
        {
          id: '菲律宾',
          label: '菲律宾',
          value: 0.9594594594594595,
          rawValue: '菲律宾'
        },
        {
          id: '马来西亚',
          label: '马来西亚',
          value: 0.9054054054054055,
          rawValue: '马来西亚'
        },
        {
          id: '芬兰',
          label: '芬兰',
          value: 0.8513513513513514,
          rawValue: '芬兰'
        },
        {
          id: '泰国',
          label: '泰国',
          value: 0.7972972972972974,
          rawValue: '泰国'
        },
        {
          id: '挪威',
          label: '挪威',
          value: 0.7432432432432433,
          rawValue: '挪威'
        },
        {
          id: '瑞典',
          label: '瑞典',
          value: 0.6891891891891893,
          rawValue: '瑞典'
        },
        {
          id: '沙特阿拉伯',
          label: '沙特阿拉伯',
          value: 0.6351351351351352,
          rawValue: '沙特阿拉伯'
        },
        {
          id: '比利时',
          label: '比利时',
          value: 0.581081081081081,
          rawValue: '比利时'
        },
        {
          id: '印度尼西亚',
          label: '印度尼西亚',
          value: 0.527027027027027,
          rawValue: '印度尼西亚'
        },
        {
          id: '瑞士',
          label: '瑞士',
          value: 0.47297297297297297,
          rawValue: '瑞士'
        },
        {
          id: '土耳其',
          label: '土耳其',
          value: 0.4189189189189189,
          rawValue: '土耳其'
        },
        {
          id: '韩国',
          label: '韩国',
          value: 0.36486486486486486,
          rawValue: '韩国'
        },
        {
          id: '荷兰',
          label: '荷兰',
          value: 0.31081081081081074,
          rawValue: '荷兰'
        },
        {
          id: '印度',
          label: '印度',
          value: 0.25675675675675674,
          rawValue: '印度'
        },
        {
          id: '西班牙',
          label: '西班牙',
          value: 0.20270270270270271,
          rawValue: '西班牙'
        },
        {
          id: '意大利',
          label: '意大利',
          value: 0.14864864864864866,
          rawValue: '意大利'
        },
        {
          id: '英国',
          label: '英国',
          value: 0.09459459459459459,
          rawValue: '英国'
        },
        {
          id: '日本',
          label: '日本',
          value: 0.040540540540540536,
          rawValue: '日本'
        }
      ]
    ],
    x: 164,
    y: 12
  },
  {
    animation: true,
    animationAppear: {
      duration: 400,
      easing: 'cubicOut'
    },
    animationUpdate: {
      duration: 400,
      easing: 'linear'
    },
    animationEnter: {
      duration: 400,
      easing: 'linear'
    },
    title: {
      space: 4,
      padding: [0, 0, 0, 0],
      textStyle: {
        fontSize: 12,
        fill: '#333333',
        fontWeight: 'normal',
        fillOpacity: 1
      },
      autoRotate: false,
      text: 'country',
      maxWidth: null
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
      },
      formatMethod: null
    },
    tick: {
      visible: true,
      inside: false,
      alignWithLabel: true,
      length: 4,
      style: {
        lineWidth: 1,
        stroke: '#D8DCE3',
        strokeOpacity: 1
      }
    },
    subTick: {
      visible: true,
      inside: false,
      count: 4,
      length: 2,
      style: {
        lineWidth: 1,
        stroke: '#D8DCE3',
        strokeOpacity: 1
      }
    },
    line: {
      visible: true,
      style: {
        lineWidth: 1,
        stroke: 'red',
        strokeOpacity: 1
      }
    },
    grid: {
      style: {
        lineWidth: 1,
        stroke: 'red',
        strokeOpacity: 1,
        lineDash: [4, 4]
      },
      type: 'line',
      visible: true,
      length: 536
    },
    subGrid: {
      visible: false,
      style: {
        lineWidth: 1,
        stroke: 'red',
        strokeOpacity: 1,
        lineDash: [4, 4]
      },
      type: 'line'
    },
    verticalFactor: 1,
    zIndex: 100,
    dx: 0,
    start: {
      x: 0,
      y: 0
    },
    end: {
      x: 0,
      y: 456
    },
    items: [
      [
        {
          id: '菲律宾',
          label: '菲律宾',
          value: 0.9594594594594595,
          rawValue: '菲律宾'
        },
        {
          id: '马来西亚',
          label: '马来西亚',
          value: 0.9054054054054055,
          rawValue: '马来西亚'
        },
        {
          id: '芬兰',
          label: '芬兰',
          value: 0.8513513513513514,
          rawValue: '芬兰'
        },
        {
          id: '泰国',
          label: '泰国',
          value: 0.7972972972972974,
          rawValue: '泰国'
        },
        {
          id: '挪威',
          label: '挪威',
          value: 0.7432432432432433,
          rawValue: '挪威'
        },
        {
          id: '沙特阿拉伯',
          label: '沙特阿拉伯',
          value: 0.6891891891891893,
          rawValue: '沙特阿拉伯'
        },
        {
          id: '比利时',
          label: '比利时',
          value: 0.6351351351351352,
          rawValue: '比利时'
        },
        {
          id: '瑞典',
          label: '瑞典',
          value: 0.581081081081081,
          rawValue: '瑞典'
        },
        {
          id: '瑞士',
          label: '瑞士',
          value: 0.527027027027027,
          rawValue: '瑞士'
        },
        {
          id: '印度尼西亚',
          label: '印度尼西亚',
          value: 0.47297297297297297,
          rawValue: '印度尼西亚'
        },
        {
          id: '土耳其',
          label: '土耳其',
          value: 0.4189189189189189,
          rawValue: '土耳其'
        },
        {
          id: '荷兰',
          label: '荷兰',
          value: 0.36486486486486486,
          rawValue: '荷兰'
        },
        {
          id: '韩国',
          label: '韩国',
          value: 0.31081081081081074,
          rawValue: '韩国'
        },
        {
          id: '印度',
          label: '印度',
          value: 0.25675675675675674,
          rawValue: '印度'
        },
        {
          id: '西班牙',
          label: '西班牙',
          value: 0.20270270270270271,
          rawValue: '西班牙'
        },
        {
          id: '意大利',
          label: '意大利',
          value: 0.14864864864864866,
          rawValue: '意大利'
        },
        {
          id: '英国',
          label: '英国',
          value: 0.09459459459459459,
          rawValue: '英国'
        },
        {
          id: '日本',
          label: '日本',
          value: 0.040540540540540536,
          rawValue: '日本'
        }
      ]
    ],
    x: 164,
    y: 12
  },
  {
    animation: true,
    animationAppear: {
      duration: 400,
      easing: 'cubicOut'
    },
    animationUpdate: {
      duration: 400,
      easing: 'linear'
    },
    animationEnter: {
      duration: 400,
      easing: 'linear'
    },
    title: {
      space: 4,
      padding: [0, 0, 0, 0],
      textStyle: {
        fontSize: 12,
        fill: '#333333',
        fontWeight: 'normal',
        fillOpacity: 1
      },
      autoRotate: false,
      text: 'country',
      maxWidth: null
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
      },
      formatMethod: null
    },
    tick: {
      visible: true,
      inside: false,
      alignWithLabel: true,
      length: 4,
      style: {
        lineWidth: 1,
        stroke: '#D8DCE3',
        strokeOpacity: 1
      }
    },
    subTick: {
      visible: true,
      inside: false,
      count: 4,
      length: 2,
      style: {
        lineWidth: 1,
        stroke: '#D8DCE3',
        strokeOpacity: 1
      }
    },
    line: {
      visible: true,
      style: {
        lineWidth: 1,
        stroke: 'red',
        strokeOpacity: 1
      }
    },
    grid: {
      style: {
        lineWidth: 1,
        stroke: 'red',
        strokeOpacity: 1,
        lineDash: [4, 4]
      },
      type: 'line',
      visible: true,
      length: 536
    },
    subGrid: {
      visible: false,
      style: {
        lineWidth: 1,
        stroke: 'red',
        strokeOpacity: 1,
        lineDash: [4, 4]
      },
      type: 'line'
    },
    verticalFactor: 1,
    zIndex: 100,
    dx: 0,
    start: {
      x: 0,
      y: 0
    },
    end: {
      x: 0,
      y: 456
    },
    items: [
      [
        {
          id: '菲律宾',
          label: '菲律宾',
          value: 0.9594594594594595,
          rawValue: '菲律宾'
        },
        {
          id: '马来西亚',
          label: '马来西亚',
          value: 0.9054054054054055,
          rawValue: '马来西亚'
        },
        {
          id: '芬兰',
          label: '芬兰',
          value: 0.8513513513513514,
          rawValue: '芬兰'
        },
        {
          id: '泰国',
          label: '泰国',
          value: 0.7972972972972974,
          rawValue: '泰国'
        },
        {
          id: '挪威',
          label: '挪威',
          value: 0.7432432432432433,
          rawValue: '挪威'
        },
        {
          id: '比利时',
          label: '比利时',
          value: 0.6891891891891893,
          rawValue: '比利时'
        },
        {
          id: '瑞典',
          label: '瑞典',
          value: 0.6351351351351352,
          rawValue: '瑞典'
        },
        {
          id: '沙特阿拉伯',
          label: '沙特阿拉伯',
          value: 0.581081081081081,
          rawValue: '沙特阿拉伯'
        },
        {
          id: '瑞士',
          label: '瑞士',
          value: 0.527027027027027,
          rawValue: '瑞士'
        },
        {
          id: '印度尼西亚',
          label: '印度尼西亚',
          value: 0.47297297297297297,
          rawValue: '印度尼西亚'
        },
        {
          id: '土耳其',
          label: '土耳其',
          value: 0.4189189189189189,
          rawValue: '土耳其'
        },
        {
          id: '荷兰',
          label: '荷兰',
          value: 0.36486486486486486,
          rawValue: '荷兰'
        },
        {
          id: '韩国',
          label: '韩国',
          value: 0.31081081081081074,
          rawValue: '韩国'
        },
        {
          id: '印度',
          label: '印度',
          value: 0.25675675675675674,
          rawValue: '印度'
        },
        {
          id: '西班牙',
          label: '西班牙',
          value: 0.20270270270270271,
          rawValue: '西班牙'
        },
        {
          id: '意大利',
          label: '意大利',
          value: 0.14864864864864866,
          rawValue: '意大利'
        },
        {
          id: '英国',
          label: '英国',
          value: 0.09459459459459459,
          rawValue: '英国'
        },
        {
          id: '日本',
          label: '日本',
          value: 0.040540540540540536,
          rawValue: '日本'
        }
      ]
    ],
    x: 164,
    y: 12
  },
  {
    animation: true,
    animationAppear: {
      duration: 400,
      easing: 'cubicOut'
    },
    animationUpdate: {
      duration: 400,
      easing: 'linear'
    },
    animationEnter: {
      duration: 400,
      easing: 'linear'
    },
    title: {
      space: 4,
      padding: [0, 0, 0, 0],
      textStyle: {
        fontSize: 12,
        fill: '#333333',
        fontWeight: 'normal',
        fillOpacity: 1
      },
      autoRotate: false,
      text: 'country',
      maxWidth: null
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
      },
      formatMethod: null
    },
    tick: {
      visible: true,
      inside: false,
      alignWithLabel: true,
      length: 4,
      style: {
        lineWidth: 1,
        stroke: '#D8DCE3',
        strokeOpacity: 1
      }
    },
    subTick: {
      visible: true,
      inside: false,
      count: 4,
      length: 2,
      style: {
        lineWidth: 1,
        stroke: '#D8DCE3',
        strokeOpacity: 1
      }
    },
    line: {
      visible: true,
      style: {
        lineWidth: 1,
        stroke: 'red',
        strokeOpacity: 1
      }
    },
    grid: {
      style: {
        lineWidth: 1,
        stroke: 'red',
        strokeOpacity: 1,
        lineDash: [4, 4]
      },
      type: 'line',
      visible: true,
      length: 536
    },
    subGrid: {
      visible: false,
      style: {
        lineWidth: 1,
        stroke: 'red',
        strokeOpacity: 1,
        lineDash: [4, 4]
      },
      type: 'line'
    },
    verticalFactor: 1,
    zIndex: 100,
    dx: 0,
    start: {
      x: 0,
      y: 0
    },
    end: {
      x: 0,
      y: 456
    },
    items: [
      [
        {
          id: '菲律宾',
          label: '菲律宾',
          value: 0.9594594594594595,
          rawValue: '菲律宾'
        },
        {
          id: '芬兰',
          label: '芬兰',
          value: 0.9054054054054055,
          rawValue: '芬兰'
        },
        {
          id: '马来西亚',
          label: '马来西亚',
          value: 0.8513513513513514,
          rawValue: '马来西亚'
        },
        {
          id: '泰国',
          label: '泰国',
          value: 0.7972972972972974,
          rawValue: '泰国'
        },
        {
          id: '挪威',
          label: '挪威',
          value: 0.7432432432432433,
          rawValue: '挪威'
        },
        {
          id: '比利时',
          label: '比利时',
          value: 0.6891891891891893,
          rawValue: '比利时'
        },
        {
          id: '瑞典',
          label: '瑞典',
          value: 0.6351351351351352,
          rawValue: '瑞典'
        },
        {
          id: '瑞士',
          label: '瑞士',
          value: 0.581081081081081,
          rawValue: '瑞士'
        },
        {
          id: '沙特阿拉伯',
          label: '沙特阿拉伯',
          value: 0.527027027027027,
          rawValue: '沙特阿拉伯'
        },
        {
          id: '荷兰',
          label: '荷兰',
          value: 0.47297297297297297,
          rawValue: '荷兰'
        },
        {
          id: '印度尼西亚',
          label: '印度尼西亚',
          value: 0.4189189189189189,
          rawValue: '印度尼西亚'
        },
        {
          id: '土耳其',
          label: '土耳其',
          value: 0.36486486486486486,
          rawValue: '土耳其'
        },
        {
          id: '韩国',
          label: '韩国',
          value: 0.31081081081081074,
          rawValue: '韩国'
        },
        {
          id: '西班牙',
          label: '西班牙',
          value: 0.25675675675675674,
          rawValue: '西班牙'
        },
        {
          id: '印度',
          label: '印度',
          value: 0.20270270270270271,
          rawValue: '印度'
        },
        {
          id: '意大利',
          label: '意大利',
          value: 0.14864864864864866,
          rawValue: '意大利'
        },
        {
          id: '英国',
          label: '英国',
          value: 0.09459459459459459,
          rawValue: '英国'
        },
        {
          id: '日本',
          label: '日本',
          value: 0.040540540540540536,
          rawValue: '日本'
        }
      ]
    ],
    x: 164,
    y: 12
  }
];

const axis = new LineAxis({
  ...data[3]
  // animation: false
});

const grid = new LineAxisGrid({
  ...data[3],
  items: data[3].items[0],
  ...data[3].grid
});
axis.animate().play(new GroupFadeIn(600, 'cubicOut'));
grid.animate().play(new GroupFadeIn(600, 'cubicOut'));
render([axis, grid], 'main');

for (let index = 1; index < data.length; index++) {
  const attrs = data[index];

  setTimeout(() => {
    axis.setAttributes(attrs);
    grid.setAttributes({
      ...attrs,
      items: attrs.items[0],
      ...attrs.grid
    });
    axis.animate().play(new GroupTransition(null, null, 600, 'linear'));
    grid.animate().play(new GroupTransition(null, null, 600, 'linear'));
  }, index * 600);
}

setTimeout(() => {
  axis.animate().play(new GroupFadeOut(600, 'linear'));
  grid.animate().play(new GroupFadeOut(600, 'linear'));
}, 600 * (data.length - 1));
