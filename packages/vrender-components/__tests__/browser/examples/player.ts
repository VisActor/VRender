import '@visactor/vrender';
import { IGraphic } from '@visactor/vrender';
import { ContinuousPlayer, DiscretePlayer, PlayerEventEnum } from '../../../src';
import render from '../../util/render';

const data = [1, 2, 3, 4, 5, 6];

/**
 * Layout
 */
const layoutPlayer1 = new DiscretePlayer({
  type: 'discrete',
  data: [1, 2, 3, 4],
  interval: 1000,
  direction: 'default',
  visible: true,
  orient: 'bottom',
  size: {
    width: 450,
    height: 50
  },
  slider: {
    space: 10,
    trackStyle: {
      fillOpacity: 1,
      cornerRadius: 5,
      stroke: 'black',
      fill: 'red'
    },
    railStyle: {},
    handlerStyle: {
      stroke: 'yellow'
    }
  },
  controller: {
    start: {
      order: 3,
      space: 10,
      style: {
        size: 20,

        fill: '#63B5FC'
      }
    },
    pause: {
      style: {
        size: 20,

        fill: '#63B5FC'
      }
    },
    backward: {
      style: {
        size: 20,

        fill: '#63B5FC'
      }
    },
    forward: {
      space: 10,
      position: 'start',
      style: {
        fill: '#63B5FC'
      }
    }
  }
});
let direction = 'default';
layoutPlayer1.addEventListener(PlayerEventEnum.OnEnd, e => {
  console.log('end');
  direction = direction === 'default' ? 'reverse' : 'default';

  layoutPlayer1.setAttributes({
    direction: direction,
    dataIndex: direction === 'reverse' ? 4 - 2 : 1
  });
  layoutPlayer1.play();
});

const layoutPlayer2 = new DiscretePlayer({
  data,
  type: 'discrete',
  direction: 'reverse',
  x: 450,
  y: 100,
  width: 10,
  height: 300,
  size: {
    height: 200,
    width: 50
  },
  orient: 'right'
});

const layoutPlayer3 = new ContinuousPlayer({
  data,
  type: 'continuous',
  x: 0,
  y: 450,
  size: {
    height: 50,
    width: 500
  },
  orient: 'bottom',
  slider: {
    visible: false,
    railStyle: {
      cornerRadius: 40,

      stroke: 'blue',
      strokeOpacity: 0.1
    }
  },
  controller: {
    forward: {
      order: 0,
      space: 15,
      position: 'end'
    },
    start: {
      position: 'end',
      space: 0,
      order: 1
    }
  }
});

const layoutPlayer4 = new ContinuousPlayer({
  x: 50,
  y: 100,
  size: {
    height: 300,
    width: 100
  },
  type: 'continuous',
  data: [1, 2, 3, 4],
  dataIndex: 0,
  interval: 1000,
  visible: true,
  orient: 'left',
  slider: {
    visible: true,
    space: 10,
    railStyle: {
      visible: true,
      width: 5
    },
    trackStyle: {
      dx: 15,
      width: 20
    }
  },
  controller: {
    visible: false,
    start: {
      visible: true,
      order: 1,
      position: 'start',
      style: {
        size: 50
      }
    },
    pause: {
      visible: true,
      style: {
        size: 50
      }
    },
    backward: {
      visible: true,
      order: 0,
      position: 'start',
      style: {}
    },
    forward: {
      visible: false,
      position: 'end',
      order: 3
    }
  }
});

const layoutPlayer5 = new ContinuousPlayer({
  x: 150,
  y: 200,
  size: {
    height: 300,
    width: 100
  },
  type: 'continuous',
  data: [1, 2, 3, 4],
  dataIndex: 0,
  interval: 1000,
  auto: false,
  visible: true,
  orient: 'left',
  slider: {
    visible: true,
    space: 10,
    railStyle: {
      visible: true,
      width: 5
    },
    trackStyle: {
      dx: 15,
      width: 20
    }
  },
  controller: {
    visible: false,
    start: {
      visible: true,
      order: 1,
      position: 'start',
      style: {
        size: 50
      }
    },
    pause: {
      visible: true,
      style: {
        size: 50
      }
    },
    backward: {
      visible: true,
      order: 0,
      position: 'start',
      style: {}
    },
    forward: {
      visible: false,
      position: 'end',
      order: 3
    }
  },
  disableTriggerEvent: true
});

const layoutPlayer6 = new DiscretePlayer({
  data,
  type: 'discrete',
  direction: 'reverse',
  x: 250,
  y: 200,
  auto: false,
  width: 10,
  height: 300,
  size: {
    height: 200,
    width: 50
  },
  orient: 'right',
  disableTriggerEvent: false,
  loop: false
});

layoutPlayer4.addEventListener(PlayerEventEnum.OnChange, e => {
  console.log('change!', e.detail);
});

// layoutPlayer4.addEventListener(PlayerEventEnum.OnPlay, () => {
//   console.log('onplay');
// });

// layoutPlayer4.addEventListener(PlayerEventEnum.OnPause, () => {
//   console.log('onpause');
// });

// layoutPlayer4.addEventListener(PlayerEventEnum.OnForward, () => {
//   console.log('onforward');
// });

// layoutPlayer4.addEventListener(PlayerEventEnum.OnBackward, () => {
//   console.log('onbackward');
// });

// layoutPlayer4.addEventListener(PlayerEventEnum.OnEnd, () => {
//   console.log('onend');
// });

// Layout 测试
const LAYOUT = [layoutPlayer6];
LAYOUT.forEach(d => d.play());

render(LAYOUT as IGraphic[], 'main');
setInterval(() => {
  layoutPlayer3.setAttributes({
    data,
    type: 'continuous',
    x: 0,
    y: 450,
    orient: 'bottom',
    slider: {
      railStyle: {
        cornerRadius: 40,

        stroke: 'blue',
        strokeOpacity: 0.1
      }
    },
    controller: {
      forward: {
        order: 0,
        space: 15,
        position: 'end'
      },
      start: {
        position: 'end',
        space: 0,
        order: 1
      }
    },
    size: {
      height: 50,
      width: Math.random() * 200 + 200
    }
  });
}, 1000);
