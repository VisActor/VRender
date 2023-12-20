export const DEFAULT_HANDLER_PATH =
  // eslint-disable-next-line max-len
  'M -0.0544 0.25 C -0.0742 0.25 -0.0901 0.234 -0.0901 0.2143 L -0.0901 -0.1786 C -0.0901 -0.1983 -0.0742 -0.2143 -0.0544 -0.2143 L -0.0187 -0.2143 L -0.0187 -0.5 L 0.017 -0.5 L 0.017 -0.2143 L 0.0527 -0.2143 C 0.0724 -0.2143 0.0884 -0.1983 0.0884 -0.1786 L 0.0884 0.2143 C 0.0884 0.234 0.0724 0.25 0.0527 0.25 L 0.017 0.25 L 0.017 0.5 L -0.0187 0.5 L -0.0187 0.25 L -0.0544 0.25 Z M -0.0187 -0.1429 L -0.0544 -0.1429 L -0.0544 0.1786 L -0.0187 0.1786 L -0.0187 -0.1429 Z M 0.0527 -0.1429 L 0.017 -0.1429 L 0.017 0.1786 L 0.0527 0.1786 L 0.0527 -0.1429 Z';
export const DEFAULT_DATA_ZOOM_ATTRIBUTES = {
  orient: 'bottom',
  showDetail: 'auto',
  brushSelect: true,
  zoomLock: false,
  minSpan: 0,
  maxSpan: 1,
  delayType: 'throttle',
  delayTime: 0,
  realTime: true,
  backgroundStyle: {
    fill: 'white',
    stroke: '#D1DBEE',
    lineWidth: 1,
    cornerRadius: 2
  },
  dragMaskStyle: {
    fill: '#B0C8F9',
    fillOpacity: 0.2
  },
  backgroundChartStyle: {
    area: {
      visible: true,
      stroke: '#D1DBEE',
      lineWidth: 1,
      fill: '#F6F8FC'
    },
    line: {
      visible: true,
      stroke: '#D1DBEE',
      lineWidth: 1
    }
  },
  selectedBackgroundStyle: {
    fill: '#B0C8F9',
    fillOpacity: 0.5
  },
  selectedBackgroundChartStyle: {
    area: {
      visible: true,
      stroke: '#B0C8F9',
      lineWidth: 1,
      fill: '#fbb934'
    },
    line: {
      visible: true,
      stroke: '#fbb934',
      lineWidth: 1
    }
  },
  middleHandlerStyle: {
    visible: true,
    background: {
      size: 8,
      style: {
        fill: 'white',
        stroke: '#B0C8F9',
        cornerRadius: 2
      }
    },
    icon: {
      size: 6,
      fill: 'white',
      stroke: '#B0C8F9',
      symbolType:
        // eslint-disable-next-line max-len
        'M 0.3 -0.5 C 0.41 -0.5 0.5 -0.41 0.5 -0.3 C 0.5 -0.3 0.5 0.3 0.5 0.3 C 0.5 0.41 0.41 0.5 0.3 0.5 C 0.3 0.5 -0.3 0.5 -0.3 0.5 C -0.41 0.5 -0.5 0.41 -0.5 0.3 C -0.5 0.3 -0.5 -0.3 -0.5 -0.3 C -0.5 -0.41 -0.41 -0.5 -0.3 -0.5 C -0.3 -0.5 0.3 -0.5 0.3 -0.5 Z',
      lineWidth: 0.5
    }
  },
  startHandlerStyle: {
    visible: true,
    triggerMinSize: 0,
    symbolType: DEFAULT_HANDLER_PATH,
    fill: 'white',
    stroke: '#B0C8F9',
    lineWidth: 0.5
  },
  endHandlerStyle: {
    visible: true,
    triggerMinSize: 0,
    symbolType: DEFAULT_HANDLER_PATH,
    fill: 'white',
    stroke: '#B0C8F9',
    lineWidth: 0.5
  },
  startTextStyle: {
    padding: 4,
    textStyle: {
      fontSize: 10,
      fill: '#6F6F6F'
    }
  },
  endTextStyle: {
    padding: 4,
    textStyle: {
      fontSize: 10,
      fill: '#6F6F6F'
    }
  }
};

export const DEFAULT_HANDLER_ATTR_MAP = {
  horizontal: {
    angle: 0,
    strokeBoundsBuffer: 0,
    boundsPadding: 2,
    pickMode: 'imprecise',
    cursor: 'ew-resize'
  },
  vertical: {
    angle: 90 * (Math.PI / 180),
    cursor: 'ns-resize',
    boundsPadding: 2,
    pickMode: 'imprecise',
    strokeBoundsBuffer: 0
  }
};
