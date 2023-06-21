import { Slider } from '../../../src';
import render from '../../util/render';

const doubleSlider1 = new Slider({
  x: 100,
  y: 200,
  layout: 'horizontal',
  railWidth: 200,
  railHeight: 10,
  range: {
    draggableTrack: true
  },
  min: 0,
  max: 100,
  value: [10, 78],
  railStyle: {
    cornerRadius: 5
  },
  startText: {
    visible: true,
    text: 'Low',
    space: 8
  },
  endText: {
    visible: true,
    text: 'High',
    space: 8
  }
});

const doubleSlider2 = new Slider({
  x: 100,
  y: 250,
  layout: 'vertical',
  railWidth: 10,
  railHeight: 200,
  range: {
    draggableTrack: false
  },
  min: 0,
  max: 100,
  value: [10, 78],
  railStyle: {
    cornerRadius: 5
  },
  startText: {
    visible: true,
    text: 'Low',
    space: 8
  },
  endText: {
    visible: true,
    text: 'High',
    space: 8
  }
});

const doubleSlider3 = new Slider({
  x: 50,
  y: 250,
  layout: 'vertical',
  railWidth: 10,
  railHeight: 200,
  range: {
    draggableTrack: false
  },
  min: 0,
  max: 100,
  railStyle: {
    cornerRadius: 5
  },
  startText: {
    visible: true,
    text: 'Low',
    space: 8
  },
  endText: {
    visible: true,
    text: 'High',
    space: 8
  }
});

const singleSlider1 = new Slider({
  x: 100,
  y: 100,
  layout: 'horizontal',
  railWidth: 200,
  railHeight: 10,
  range: false,
  min: 50,
  max: 100,
  value: 80,
  railStyle: {
    cornerRadius: 5
  },
  startText: {
    visible: true,
    text: 'Low',
    space: 8
  },
  endText: {
    visible: true,
    text: 'High',
    space: 8
  }
});

const singleSlider2 = new Slider({
  x: 180,
  y: 250,
  layout: 'vertical',
  railWidth: 10,
  railHeight: 200,
  range: false,
  min: 0,
  max: 100,
  value: 80,
  railStyle: {
    cornerRadius: 5
  },
  startText: {
    visible: true,
    text: 'Low',
    space: 8
  },
  endText: {
    visible: true,
    text: 'High',
    space: 8
  }
});

const singleSlider3 = new Slider({
  x: 300,
  y: 250,
  layout: 'vertical',
  railWidth: 10,
  railHeight: 200,
  range: false,
  min: 0,
  max: 100,
  railStyle: {
    cornerRadius: 5
  },
  startText: {
    visible: true,
    text: 'Low',
    space: 8
  },
  endText: {
    visible: true,
    text: 'High',
    space: 8
  }
});

const stage = render(
  [doubleSlider1, doubleSlider2, doubleSlider3, singleSlider1, singleSlider2, singleSlider3],
  'main'
);

singleSlider1.setValue(60);
doubleSlider1.setValue([10, 30]);

singleSlider1.addEventListener('change', e => {
  console.log('水平单滑块', e.detail);
});

doubleSlider1.addEventListener('change', e => {
  console.log('水平双滑块', e.detail);
});
