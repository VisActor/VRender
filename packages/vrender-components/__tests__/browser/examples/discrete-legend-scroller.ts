import '@visactor/vrender';
import { DiscreteLegend } from '../../../src';
import render from '../../util/render';

const scrollMask = {
  visible: true,
  gradientStops: [
    { offset: 0, color: 'rgba(255,255,255,1)' },
    { offset: 0.5, color: 'rgba(255,255,255,0.8)' },
    { offset: 1, color: 'rgba(255,255,255,0)' }
  ]
};
const hLegend = new DiscreteLegend({
  x: 20,
  y: 20,

  // ==== 测试使用 ====
  stroke: 'red',
  // ==== 测试使用 end ====

  maxWidth: 400,
  maxRow: 2,
  title: {
    visible: true,
    text: '水平布局',
    padding: 4,
    background: {
      visible: true,
      style: {
        fill: 'red'
      }
    }
  },
  item: {
    focus: true,
    // padding: [0, 20, 0, 0],
    // width: 120,
    shape: {
      style: {
        size: 8
      }
    },
    value: {
      alignRight: true,
      style: {
        fill: '#666',
        fontWeight: 'bold'
      }
    },
    background: {
      style: {
        stroke: '#000',
        lineWidth: 1
      }
    }
  },
  items: [
    { label: '苹果', shape: { fill: 'red', symbolType: 'circle' } },
    { label: '香蕉', shape: { fill: 'yellow', symbolType: 'square' } },
    { label: '橘子', shape: { fill: 'orange', symbolType: 'triangle' } },
    { label: '葡萄', shape: { fill: 'purple', symbolType: 'diamond' } },
    { label: '梨', shape: { fill: 'green', symbolType: 'star' } },
    { label: '苹果1', value: 100, shape: { fill: 'red', symbolType: 'circle' } },
    { label: '香蕉1', value: 100, shape: { fill: 'yellow', symbolType: 'square' } },
    { label: '橘子1', value: 100, shape: { fill: 'orange', symbolType: 'triangle' } },
    { label: '葡萄1', value: 100, shape: { fill: 'purple', symbolType: 'diamond' } },
    { label: '梨1', value: 100, shape: { fill: 'green', symbolType: 'star' } },
    { label: '苹果2', value: 100, shape: { fill: 'red', symbolType: 'circle' } },
    { label: '香蕉2', value: 100, shape: { fill: 'yellow', symbolType: 'square' } },
    { label: '橘子2', value: 100, shape: { fill: 'orange', symbolType: 'triangle' } },
    { label: '葡萄2', value: 100, shape: { fill: 'purple', symbolType: 'diamond' } },
    { label: '梨2', value: 100, shape: { fill: 'green', symbolType: 'star' } }
  ],
  allowAllCanceled: false,
  pager: {
    type: 'scrollbar',
    scrollByPosition: false,
    roamScroll: true,
    visible: false,
    scrollMask
  },
  lazyload: true
});

const vLegend = new DiscreteLegend({
  x: 20,
  y: 200,

  // ==== 测试使用 ====
  stroke: 'red',
  // ==== 测试使用 end ====

  layout: 'vertical',
  maxHeight: 200,
  maxCol: 1,
  // autoPage: false,
  title: {
    visible: true,
    align: 'center',
    text: '垂直布局',
    padding: 4,
    background: {
      visible: true,
      style: {
        fill: 'red'
      }
    }
  },
  item: {
    contentScrollDirection: 'vertical',
    // padding: 4,
    padding: [4, 20, 0, 0],
    width: 120,
    // height: 25,
    shape: {
      style: {
        size: 8
      },
      state: {
        selectedHover: {
          size: 10
        }
      }
    },
    label: {
      state: {
        selectedHover: {
          fill: 'red'
        }
      }
    },
    value: {
      alignRight: true,
      style: {
        fill: '#666'
      },
      state: {
        selectedHover: {
          fill: 'red'
        }
      }
    },
    // background: {
    //   style: {
    //     stroke: '#000',
    //     lineWidth: 1
    //     // cornerRadius: 5
    //   },
    //   state: {
    //     selectedHover: {
    //       fill: 'rgba(0,0,0,.3)'
    //     },
    //     selected: {
    //       fill: 'pink',
    //       fillOpacity: 0.5
    //     },
    //     unSelected: {
    //       fill: 'blue'
    //     }
    //   }
    // },
    focus: true
  },
  items: [
    { label: '苹果', value: 100, shape: { fill: 'red', symbolType: 'circle' } },
    { label: '香蕉', value: 100, shape: { fill: 'yellow', symbolType: 'square' } },
    { label: '橘子', value: 100, shape: { fill: 'orange', symbolType: 'triangle' } },
    { label: '葡萄', value: 100, shape: { fill: 'purple', symbolType: 'diamond' } },
    { label: '梨', value: 100, shape: { fill: 'green', symbolType: 'star' } },
    { label: '苹果1', value: 100, shape: { fill: 'red', symbolType: 'circle' } },
    { label: '香蕉1', value: 100, shape: { fill: 'yellow', symbolType: 'square' } },
    { label: '橘子1', value: 100, shape: { fill: 'orange', symbolType: 'triangle' } },
    { label: '葡萄1', value: 100, shape: { fill: 'purple', symbolType: 'diamond' } },
    { label: '梨1', value: 100, shape: { fill: 'green', symbolType: 'star' } },
    { label: '苹果2', value: 100, shape: { fill: 'red', symbolType: 'circle' } },
    { label: '香蕉2', value: 100, shape: { fill: 'yellow', symbolType: 'square' } },
    { label: '橘子2', value: 100, shape: { fill: 'orange', symbolType: 'triangle' } },
    { label: '葡萄2', value: 100, shape: { fill: 'purple', symbolType: 'diamond' } },
    { label: '梨2', value: 100, shape: { fill: 'green', symbolType: 'star' } }
  ],
  defaultSelected: ['苹果'],
  allowAllCanceled: false,
  selectMode: 'single',
  pager: {
    type: 'scrollbar',
    // visible: false,
    roamScroll: true,
    scrollByPosition: false,
    scrollMask,
    railStyle: {
      fill: 'pink'
    }
  }
  // reversed: true
});

const legend = new DiscreteLegend({
  layout: 'horizontal',
  title: {
    align: 'end',
    space: 0,
    textStyle: {
      fontSize: 14,
      fontWeight: 'normal',
      fill: '#1890ff'
    },
    visible: true,
    padding: 0,
    text: 'Total'
  },
  item: {
    spaceCol: 10,
    spaceRow: 10,
    shape: {
      space: 4,
      style: {
        size: 10,
        symbolType: 'circle',
        cursor: 'pointer'
      },
      state: {
        selectedHover: {
          opacity: 0.85
        },
        unSelected: {
          fill: '#D8D8D8',
          stroke: '#D8D8D8',
          fillOpacity: 0.5
        }
      }
    },
    label: {
      space: 4,
      style: {
        fontSize: 12,
        fill: 'black',
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
      alignRight: true,
      style: {
        fontSize: 12,
        fill: '#333',
        cursor: 'pointer'
      },
      state: {
        selectedHover: {
          opacity: 0.85
        },
        unSelected: {
          fill: '#D8D8D8'
        },
        unselected: {
          fill: '#d8d8d8'
        }
      }
    },
    background: {
      style: {
        cursor: 'pointer'
      },
      state: {
        selectedHover: {
          fillOpacity: 0.7,
          fill: 'gray'
        },
        unSelectedHover: {
          fillOpacity: 0.2,
          fill: 'gray'
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
      top: 2,
      bottom: 2,
      left: 2,
      right: 2
    },
    width: 400
  },
  autoPage: true,
  pager: {
    type: 'scrollbar',
    scrollMask
  },
  hover: true,
  select: false,
  selectMode: 'multiple',
  allowAllCanceled: false,
  items: [
    {
      label: 'nlp',
      shape: {
        fill: '#1890ff',
        symbolType: 'circle',
        stroke: '#1890ff'
      },
      value: '20,000',
      id: 'nlp',
      index: 0
    },
    {
      label: 'blockchain',
      shape: {
        fill: '#2fc25b',
        symbolType: 'circle',
        stroke: '#2fc25b'
      },
      value: '7,000',
      id: 'blockchain',
      index: 1
    }
  ],
  zIndex: 500,
  maxWidth: 400,
  maxHeight: 464,
  shape: {
    style: {
      symbolType: 'square'
    }
  },
  width: 797,
  height: 66,
  dx: -0.5,
  dy: 0,
  x: 12,
  y: 422
});

const disableTriggerEventLegend = new DiscreteLegend({
  x: 20,
  y: 110,
  disableTriggerEvent: true,
  // ==== 测试使用 ====
  stroke: 'red',
  // ==== 测试使用 end ====

  maxWidth: 400,
  maxRow: 2,
  title: {
    visible: true,
    text: '水平布局 关闭交互',
    padding: 4,
    background: {
      visible: true,
      style: {
        fill: 'red'
      }
    }
  },
  item: {
    focus: true,
    // padding: [0, 20, 0, 0],
    // width: 120,
    shape: {
      style: {
        size: 8
      }
    },
    value: {
      alignRight: true,
      style: {
        fill: '#666',
        fontWeight: 'bold'
      }
    },
    background: {
      style: {
        stroke: '#000',
        lineWidth: 1
      }
    }
  },
  items: [
    { label: '苹果', shape: { fill: 'red', symbolType: 'circle' } },
    { label: '香蕉', shape: { fill: 'yellow', symbolType: 'square' } },
    { label: '橘子', shape: { fill: 'orange', symbolType: 'triangle' } },
    { label: '葡萄', shape: { fill: 'purple', symbolType: 'diamond' } },
    { label: '梨', shape: { fill: 'green', symbolType: 'star' } },
    { label: '苹果1', value: 100, shape: { fill: 'red', symbolType: 'circle' } },
    { label: '香蕉1', value: 100, shape: { fill: 'yellow', symbolType: 'square' } },
    { label: '橘子1', value: 100, shape: { fill: 'orange', symbolType: 'triangle' } },
    { label: '葡萄1', value: 100, shape: { fill: 'purple', symbolType: 'diamond' } },
    { label: '梨1', value: 100, shape: { fill: 'green', symbolType: 'star' } },
    { label: '苹果2', value: 100, shape: { fill: 'red', symbolType: 'circle' } },
    { label: '香蕉2', value: 100, shape: { fill: 'yellow', symbolType: 'square' } },
    { label: '橘子2', value: 100, shape: { fill: 'orange', symbolType: 'triangle' } },
    { label: '葡萄2', value: 100, shape: { fill: 'purple', symbolType: 'diamond' } },
    { label: '梨2', value: 100, shape: { fill: 'green', symbolType: 'star' } }
  ],
  allowAllCanceled: false,
  pager: {
    type: 'scrollbar',
    roamScroll: true,
    scrollMask
  }
});

const stage = render([hLegend, vLegend, legend, disableTriggerEventLegend], 'main', { background: '#fff' });

vLegend.addEventListener('legendItemClick', e => {
  console.log(e, e.detail.currentSelected);
});

vLegend.addEventListener('legendItemHover', e => {
  console.log('legendItemHover');
});

vLegend.addEventListener('legendItemUnHover', e => {
  console.log('legendItemUnHover');
});

window.vLegend = vLegend;
window.hLegend = hLegend;
