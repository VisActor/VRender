import { pi } from '@visactor/vutils';
import { BandScale, LinearScale, PointScale } from '@visactor/vscale';
import { CircleAxis, LineAxis } from '../../../src';
import render from '../../util/render';

const scale = new LinearScale().domain([0, 100]).range([0, 1]).nice();
const items = scale.ticks(10).map(tick => {
  return {
    id: tick,
    label: tick,
    value: scale.scale(tick),
    rawValue: tick
  };
});
const nextYItems = scale.ticks(5).map(tick => {
  return {
    id: tick,
    label: tick,
    value: scale.scale(tick),
    rawValue: tick
  };
});

const domain = 'ABCDEFGH'.split('');
const pointScale = new PointScale().domain(domain).range([0, 1]);
const xItems = domain.map(value => {
  return {
    id: value,
    label: value,
    value: pointScale.scale(value),
    rawValue: value
  };
});
const nextXItems = 'BDFH'.split('').map(value => {
  return {
    id: value,
    label: value,
    value: pointScale.scale(value),
    rawValue: value
  };
});

const bandScale = new BandScale().domain(domain).range([0, 1]);
const angleItems = domain.map(value => {
  return {
    id: value,
    label: value,
    value: bandScale.scale(value),
    rawValue: value
  };
});

const stateStyle = {
  hover: {
    fill: 'blue',
    stroke: 'blue',
    fontWeight: 500
  },
  hover_reverse: {
    fill: 'yellow',
    stroke: 'yellow',
    fontWeight: 500
  },
  selected: {
    fill: 'red',
    stroke: 'red',
    fontSize: 16
  },
  selected_reverse: {
    fill: '#ccc',
    stroke: '#ccc'
  }
};

const xAxisBottom = new LineAxis({
  start: { x: 100, y: 400 },
  end: { x: 400, y: 400 },
  items: [xItems, nextXItems],
  line: {
    startSymbol: {
      visible: true,
      symbolType: 'triangle'
    },
    endSymbol: {
      visible: true,
      symbolType: 'triangle'
    },
    state: stateStyle
  },
  title: {
    visible: true,
    position: 'middle',
    autoRotate: true,
    // background: {
    //   visible: true,
    //   style: {
    //     fill: 'rgba(0, 0, 0, 0.3)'
    //   }
    // },
    padding: 4,
    maxWidth: 100,
    text: 'x 轴 -- bottom',
    space: 0,
    state: {
      text: stateStyle,
      shape: stateStyle,
      background: stateStyle
    }
  },
  tick: {
    visible: true,
    state: stateStyle
  },
  label: {
    visible: true,
    space: 0,
    state: stateStyle
  },
  subGrid: {
    visible: true,
    style: {
      stroke: 'red'
    }
  },
  hover: true,
  select: true,
  panel: {
    visible: true,
    style: {
      fill: 'rgba(23, 133, 45, 1)'
    },
    state: stateStyle
  }
});

const xAxisTop = new LineAxis({
  start: { x: 100, y: 100 },
  end: { x: 400, y: 100 },
  items: [xItems, nextXItems],
  title: {
    visible: true,
    space: 0,
    position: 'middle',
    autoRotate: false,
    background: {
      visible: true,
      style: {
        fill: 'rgba(0, 0, 0, 0.3)'
      }
    },
    padding: 0,
    // maxWidth: 60,
    text: 'x 轴 - Top'
  },
  verticalFactor: -1,
  tick: {
    visible: true,
    inside: true
  },
  label: {
    visible: true,
    space: 0
  },
  subGrid: {
    visible: true,
    style: {
      stroke: 'red'
    }
  },
  panel: {
    visible: true,
    style: {
      fill: 'rgba(23, 133, 45, 1)'
    }
  }
});

const yAxisLeft = new LineAxis({
  start: { x: 100, y: 350 },
  end: { x: 100, y: 150 },
  items: [items, nextYItems],
  title: {
    visible: true,
    position: 'middle',
    autoRotate: true,
    background: {
      visible: true,
      style: {
        fill: 'rgba(0, 0, 0, 0.3)'
      }
    },
    padding: 4,
    // maxWidth: 60,
    text: 'y 轴 - left'
  },
  panel: {
    visible: true,
    style: {
      fill: 'rgba(23, 133, 45, 1)'
    }
  },
  label: {
    visible: true,
    style: {
      angle: Math.PI * 0.25
    }
  }
});

const yAxisRight = new LineAxis({
  start: { x: 300, y: 350 },
  end: { x: 300, y: 150 },
  items: [items, nextYItems],
  verticalFactor: -1,
  panel: {
    visible: true,
    style: {
      fill: 'rgba(23, 133, 45, 1)'
    }
  },
  title: {
    visible: true,
    position: 'middle',
    autoRotate: true,
    shape: {
      visible: true,
      style: {
        symbolType: 'circle',
        fill: 'red'
      }
    },
    background: {
      visible: true,
      style: {
        fill: 'rgba(0, 0, 0, 0.3)'
      }
    },
    padding: 4,
    // maxWidth: 60,
    text: 'y 轴 - right'
  },
  label: {
    visible: true,
    style: {
      angle: Math.PI * 0.25
    }
  }
});

const yAxis = new LineAxis({
  start: { x: 350, y: 350 },
  end: { x: 450, y: 150 },
  items: [items, nextYItems],
  verticalFactor: -1,
  panel: {
    visible: true,
    style: {
      fill: 'rgba(23, 133, 45, 1)'
    }
  },
  title: {
    visible: true,
    position: 'middle',
    autoRotate: true,
    background: {
      visible: true,
      style: {
        fill: 'rgba(0, 0, 0, 0.3)'
      }
    },
    padding: 4,
    // maxWidth: 60,
    text: 'y 轴 - 倾斜'
  }
});

// const stage = render([xAxisTop, yAxisLeft, zAxisBottom, yAxisRight, yAxis], 'main');

const yAxis3d = new LineAxis(
  {
    start: { x: 50, y: 400 },
    end: { x: 50, y: 150 },
    items: [items],
    // verticalFactor: -1,
    title: {
      visible: true,
      position: 'middle',
      autoRotate: true,
      background: {
        visible: true,
        style: {
          fill: 'rgba(0, 0, 0, 0.3)'
        }
      },
      padding: 4,
      maxWidth: 60,
      text: 'y 轴'
    },
    grid: {
      visible: true,
      type: 'line',
      depth: 300,
      length: 300,
      style: {
        lineDash: [0]
      }
    },
    label: {
      visible: true
      // space: 0
    },
    tick: {
      visible: true
    }
  },
  '3d'
);

const xAxis3d = new LineAxis(
  {
    start: { x: 50, y: 400 },
    end: { x: 350, y: 400 },
    items: [xItems],
    title: {
      visible: true,
      position: 'middle',
      autoRotate: true,
      background: {
        visible: true,
        style: {
          fill: 'rgba(0, 0, 0, 0.3)'
        }
      },
      padding: 4,
      maxWidth: 60,
      text: 'x 轴',
      space: 0
    },
    grid: {
      visible: true,
      type: 'line',
      depth: 300,
      length: 250,
      style: {
        lineDash: [0]
      }
    },
    tick: {
      visible: true
    },
    label: {
      visible: true,
      space: 0
    }
  },
  '3d'
);

const zAxis3d = new LineAxis(
  {
    x: 350,
    y: 0,
    start: { x: 0, y: 400 },
    end: { x: 300, y: 400 },
    alpha: -pi / 2,
    anchor3d: [0, 0],
    items: [xItems],
    line: {
      visible: true
    },
    title: {
      visible: true,
      position: 'middle',
      autoRotate: true,
      background: {
        visible: true,
        style: {
          fill: 'rgba(0, 0, 0, 0.3)'
        }
      },
      padding: 4,
      maxWidth: 60,
      text: 'z 轴',
      space: 0
    },
    tick: {
      visible: true
    },
    grid: {
      visible: true,
      type: 'line',
      depth: 300,
      length: 250,
      style: {
        lineDash: [0]
      }
    },
    label: {
      visible: true,
      space: 0,
      style: {
        dy: 5,
        keepDirIn3d: false
        // anchor3d: [150, 0],
        // alpha: pi / 2
      }
    }
  },
  '3d'
);

// xAxis3d.set3dMode();
// yAxis3d.set3dMode();
// zAxis3d.set3dMode();

// const stage = render([xAxis3d, yAxis3d, zAxis3d], 'main');
// console.log(stage);

// stage.set3dOptions({
//   alpha: 0,
//   beta: 0,
//   center: { x: 300, y: 300 },
//   fieldRatio: 0.8,
//   light: {
//     dir: [1, 1, -1],
//     color: 'white',
//     ambient: 0.3
//   }
// });
// stage.render();
// const stage = render([xAxisTop, xAxisBottom, yAxisLeft, yAxisRight, yAxis], 'main');

const axisWidthGird = new LineAxis({
  start: { x: 100, y: 200 },
  end: { x: 100, y: 10 },
  items: [items],
  verticalFactor: -1,
  title: {
    visible: true,
    position: 'middle',
    autoRotate: true,
    shape: {
      visible: true,
      style: {
        symbolType: 'circle',
        fill: 'red'
      }
    },
    background: {
      visible: true,
      style: {
        fill: 'rgba(0, 0, 0, 0.3)'
      }
    },
    padding: 4,
    // maxWidth: 60,
    text: 'y 轴 - right'
  },
  label: {
    visible: true
  },
  tick: {
    visible: true,
    length: 12,
    alignWithLabel: false
  },
  grid: {
    type: 'line',
    visible: true,
    length: 300,
    alignWithLabel: false,
    style: {
      stroke: 'red'
    },
    zIndex: 1,
    alternateColor: ['#ccc', '#000']
  },
  subGrid: {
    visible: true
    // alternateColor: ['red', 'yellow']
  },
  subTick: {
    visible: true,
    length: 6
  }
});

const angleAxisWithGrid = new CircleAxis({
  center: {
    x: 250,
    y: 350
  },
  radius: 100,
  innerRadius: 20,
  items: [angleItems],
  tick: {
    visible: true,
    length: 12,
    alignWithLabel: false
  },
  subTick: {
    visible: true,
    length: 6,
    style: {
      stroke: 'blue'
    }
  },
  grid: {
    type: 'line',
    visible: true,
    alternateColor: ['rgba(0, 0, 0, 0.3)', 'rgba(200, 0, 0, 0.3)'],
    smoothLink: true,
    alignWithLabel: false
  },
  // subGrid: {
  //   visible: true,
  //   style: {
  //     stroke: 'blue'
  //   }
  //   // alternateColor: ['rgba(0, 0, 0, 0.3)', 'rgba(200, 0, 0, 0.3)']
  // },
  label: {
    visible: true
  }
});

render([axisWidthGird, angleAxisWithGrid], 'main');
