export enum DataZoomActiveTag {
  startHandler = 'startHandler',
  endHandler = 'endHandler',
  middleHandler = 'middleHandler',
  background = 'background'
}
export const DEFAULT_DATA_ZOOM_ATTRIBUTES = {
  orient: 'bottom',
  showDetail: 'auto',
  brushSelect: true,
  backgroundStyle: {
    fill: true,
    fillColor: 'white',
    strokeColor: '#D1DBEE',
    lineWidth: 1,
    borderRadius: 2
  },
  dragMaskStyle: {
    fill: true,
    fillColor: '#B0C8F9',
    fillOpacity: 0.2
  },
  backgroundChartStyle: {
    area: {
      visible: true,
      strokeColor: '#D1DBEE',
      lineWidth: 1,
      fillColor: '#F6F8FC',
      fill: true
    },
    line: {
      visible: true,
      strokeColor: '#D1DBEE',
      lineWidth: 1
    }
  },
  selectedBackgroundStyle: {
    fill: true,
    fillColor: '#B0C8F9',
    fillOpacity: 0.5
  },
  selectedBackgroundChartStyle: {
    area: {
      visible: true,
      strokeColor: '#B0C8F9',
      lineWidth: 1,
      fillColor: '#fbb934',
      fill: true
    },
    line: {
      visible: true,
      strokeColor: '#fbb934',
      lineWidth: 1
    }
  },
  middleHandlerStyle: {
    visible: false,
    background: {
      size: 8,
      style: {
        fill: true,
        fillColor: 'white',
        strokeColor: '#B0C8F9',
        borderRadius: 2
      }
    },
    icon: {
      size: 6,
      fill: true,
      fillColor: 'white',
      strokeColor: '#B0C8F9',
      symbolType:
        // eslint-disable-next-line max-len
        'M 0.3 -0.5 C 0.41 -0.5 0.5 -0.41 0.5 -0.3 C 0.5 -0.3 0.5 0.3 0.5 0.3 C 0.5 0.41 0.41 0.5 0.3 0.5 C 0.3 0.5 -0.3 0.5 -0.3 0.5 C -0.41 0.5 -0.5 0.41 -0.5 0.3 C -0.5 0.3 -0.5 -0.3 -0.5 -0.3 C -0.5 -0.41 -0.41 -0.5 -0.3 -0.5 C -0.3 -0.5 0.3 -0.5 0.3 -0.5 Z',
      lineWidth: 0.5
    }
  },
  startHandlerStyle: {
    symbolType:
      // eslint-disable-next-line max-len
      'M -0.0544 0.25 C -0.0742 0.25 -0.0901 0.234 -0.0901 0.2143 L -0.0901 -0.1786 C -0.0901 -0.1983 -0.0742 -0.2143 -0.0544 -0.2143 L -0.0187 -0.2143 L -0.0187 -0.5 L 0.017 -0.5 L 0.017 -0.2143 L 0.0527 -0.2143 C 0.0724 -0.2143 0.0884 -0.1983 0.0884 -0.1786 L 0.0884 0.2143 C 0.0884 0.234 0.0724 0.25 0.0527 0.25 L 0.017 0.25 L 0.017 0.5 L -0.0187 0.5 L -0.0187 0.25 L -0.0544 0.25 Z M -0.0187 -0.1429 L -0.0544 -0.1429 L -0.0544 0.1786 L -0.0187 0.1786 L -0.0187 -0.1429 Z M 0.0527 -0.1429 L 0.017 -0.1429 L 0.017 0.1786 L 0.0527 0.1786 L 0.0527 -0.1429 Z',
    // size: 40,
    fill: true,
    fillColor: 'white',
    strokeColor: '#B0C8F9',
    lineWidth: 0.5
  },
  endHandlerStyle: {
    symbolType:
      // eslint-disable-next-line max-len
      'M -0.0544 0.25 C -0.0742 0.25 -0.0901 0.234 -0.0901 0.2143 L -0.0901 -0.1786 C -0.0901 -0.1983 -0.0742 -0.2143 -0.0544 -0.2143 L -0.0187 -0.2143 L -0.0187 -0.5 L 0.017 -0.5 L 0.017 -0.2143 L 0.0527 -0.2143 C 0.0724 -0.2143 0.0884 -0.1983 0.0884 -0.1786 L 0.0884 0.2143 C 0.0884 0.234 0.0724 0.25 0.0527 0.25 L 0.017 0.25 L 0.017 0.5 L -0.0187 0.5 L -0.0187 0.25 L -0.0544 0.25 Z M -0.0187 -0.1429 L -0.0544 -0.1429 L -0.0544 0.1786 L -0.0187 0.1786 L -0.0187 -0.1429 Z M 0.0527 -0.1429 L 0.017 -0.1429 L 0.017 0.1786 L 0.0527 0.1786 L 0.0527 -0.1429 Z',
    // size: 40,
    fill: true,
    fillColor: 'white',
    strokeColor: '#B0C8F9',
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
