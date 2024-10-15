export const DEFAULT_AXIS_THEME = {
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
      fill: '#333',
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
      stroke: '#000',
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
      stroke: '#999',
      strokeOpacity: 1
    }
  },
  line: {
    visible: true,
    style: {
      lineWidth: 1,
      stroke: '#000',
      strokeOpacity: 1
    }
  }
};

export const DEFAULT_AXIS_BREAK_SYMBOL_STYLE = {
  size: 8,
  stroke: '#000',
  lineWidth: 1,
  zIndex: 1
};
