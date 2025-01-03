import type { TextAlignType, TextBaselineType } from '@visactor/vrender-core';
import { IMarkAreaLabelPosition, IMarkLineLabelPosition, IMarkCommonArcLabelPosition } from './type';

export const FUZZY_EQUAL_DELTA = 0.001;
export const DEFAULT_MARK_LINE_THEME = {
  interactive: true,
  startSymbol: {
    visible: false,
    symbolType: 'triangle',
    size: 12,
    fill: 'rgba(46, 47, 50)',
    lineWidth: 0
  },
  endSymbol: {
    visible: true,
    symbolType: 'triangle',
    size: 12,
    fill: 'rgba(46, 47, 50)',
    lineWidth: 0
  },
  label: {
    position: IMarkLineLabelPosition.end,
    refX: 0,
    refY: 0,
    refAngle: 0,
    textStyle: {
      fill: '#fff',
      stroke: '#fff',
      lineWidth: 0,
      fontSize: 10,
      fontWeight: 'normal',
      fontStyle: 'normal'
    },
    padding: [2, 2, 4, 4],
    panel: {
      visible: true,
      cornerRadius: 0,
      fill: 'rgb(48, 115, 242)',
      fillOpacity: 0.8
    }
  },
  lineStyle: {
    stroke: '#b2bacf',
    lineWidth: 1,
    lineDash: [2]
  }
};

export const DEFAULT_CARTESIAN_MARK_LINE_TEXT_STYLE_MAP: {
  [K: string]: {
    [T: string]: {
      textAlign: TextAlignType;
      textBaseline: TextBaselineType;
    };
  };
} = {
  postiveXAxis: {
    start: {
      textAlign: 'left',
      textBaseline: 'middle'
    },
    startTop: {
      textAlign: 'left',
      textBaseline: 'bottom'
    },
    startBottom: {
      textAlign: 'left',
      textBaseline: 'top'
    },
    insideStart: {
      textAlign: 'right',
      textBaseline: 'middle'
    },
    insideStartTop: {
      textAlign: 'right',
      textBaseline: 'bottom'
    },
    insideStartBottom: {
      textAlign: 'right',
      textBaseline: 'top'
    },

    middle: {
      textAlign: 'center',
      textBaseline: 'middle'
    },
    insideMiddleTop: {
      textAlign: 'center',
      textBaseline: 'bottom'
    },
    insideMiddleBottom: {
      textAlign: 'center',
      textBaseline: 'top'
    },

    end: {
      textAlign: 'left',
      textBaseline: 'middle'
    },
    endTop: {
      textAlign: 'left',
      textBaseline: 'bottom'
    },
    endBottom: {
      textAlign: 'left',
      textBaseline: 'top'
    },
    insideEnd: {
      textAlign: 'right',
      textBaseline: 'middle'
    },
    insideEndTop: {
      textAlign: 'right',
      textBaseline: 'bottom'
    },
    insideEndBottom: {
      textAlign: 'right',
      textBaseline: 'top'
    }
  },
  negativeXAxis: {
    start: {
      textAlign: 'right',
      textBaseline: 'middle'
    },
    startTop: {
      textAlign: 'right',
      textBaseline: 'bottom'
    },
    startBottom: {
      textAlign: 'right',
      textBaseline: 'top'
    },
    insideStart: {
      textAlign: 'left',
      textBaseline: 'middle'
    },
    insideStartTop: {
      textAlign: 'left',
      textBaseline: 'bottom'
    },
    insideStartBottom: {
      textAlign: 'left',
      textBaseline: 'top'
    },

    middle: {
      textAlign: 'center',
      textBaseline: 'middle'
    },
    insideMiddleTop: {
      textAlign: 'center',
      textBaseline: 'bottom'
    },
    insideMiddleBottom: {
      textAlign: 'center',
      textBaseline: 'top'
    },

    end: {
      textAlign: 'right',
      textBaseline: 'middle'
    },
    endTop: {
      textAlign: 'right',
      textBaseline: 'bottom'
    },
    endBottom: {
      textAlign: 'right',
      textBaseline: 'top'
    },
    insideEnd: {
      textAlign: 'left',
      textBaseline: 'middle'
    },
    insideEndTop: {
      textAlign: 'left',
      textBaseline: 'bottom'
    },
    insideEndBottom: {
      textAlign: 'left',
      textBaseline: 'top'
    }
  }
};

export const DEFAULT_MARK_ARC_LINE_THEME = {
  interactive: true,
  startSymbol: {
    visible: false,
    symbolType: 'triangle',
    size: 12,
    fill: 'rgba(46, 47, 50)',
    lineWidth: 0
  },
  endSymbol: {
    visible: true,
    symbolType: 'triangle',
    size: 12,
    fill: 'rgba(46, 47, 50)',
    lineWidth: 0
  },
  label: {
    position: IMarkCommonArcLabelPosition.arcOuterMiddle,
    refX: 0,
    refY: 0,
    refAngle: 0,
    textStyle: {
      fill: '#fff',
      stroke: '#fff',
      lineWidth: 0,
      fontSize: 10,
      fontWeight: 'normal',
      fontStyle: 'normal'
    },
    padding: [2, 2, 4, 4],
    panel: {
      visible: true,
      cornerRadius: 0,
      fill: 'rgb(48, 115, 242)',
      fillOpacity: 0.8
    }
  },
  lineStyle: {
    stroke: '#b2bacf',
    lineWidth: 1,
    lineDash: [2]
  }
};

export const DEFAULT_MARK_AREA_THEME = {
  interactive: true,
  label: {
    position: IMarkAreaLabelPosition.right,
    textStyle: {
      fill: '#fff',
      stroke: '#fff',
      lineWidth: 0,
      fontSize: 10,
      fontWeight: 'normal',
      fontStyle: 'normal'
    },
    padding: [2, 2, 4, 4],
    panel: {
      visible: true,
      cornerRadius: 0,
      fill: 'rgb(48, 115, 242)',
      fillOpacity: 0.8
    }
  },
  areaStyle: {
    fill: '#b2bacf',
    visible: true
  }
};

export const DEFAULT_MARK_ARC_AREA_THEME = {
  interactive: true,
  label: {
    position: IMarkCommonArcLabelPosition.arcOuterMiddle,
    textStyle: {
      fill: '#fff',
      stroke: '#fff',
      lineWidth: 0,
      fontSize: 10,
      fontWeight: 'normal',
      fontStyle: 'normal'
    },
    padding: [2, 2, 4, 4],
    panel: {
      visible: true,
      cornerRadius: 0,
      fill: 'rgb(48, 115, 242)',
      fillOpacity: 0.8
    }
  },
  areaStyle: {
    fill: '#b2bacf',
    visible: true
  }
};

export const DEFAULT_POLAR_MARKER_TEXT_STYLE_MAP: {
  [K: string]: {
    textAlign: TextAlignType;
    textBaseline: TextBaselineType;
  };
} = {
  arcInnerStart: {
    textAlign: 'center',
    textBaseline: 'bottom'
  },
  arcInnerEnd: {
    textAlign: 'center',
    textBaseline: 'bottom'
  },

  arcInnerMiddle: {
    textAlign: 'center',
    textBaseline: 'bottom'
  },
  arcOuterStart: {
    textAlign: 'center',
    textBaseline: 'top'
  },

  arcOuterEnd: {
    textAlign: 'center',
    textBaseline: 'top'
  },
  arcOuterMiddle: {
    textAlign: 'center',
    textBaseline: 'top'
  },

  center: {
    textAlign: 'center',
    textBaseline: 'middle'
  }
};

export const DEFAULT_CARTESIAN_MARK_AREA_TEXT_STYLE_MAP: {
  [K: string]: {
    textAlign: TextAlignType;
    textBaseline: TextBaselineType;
  };
} = {
  left: {
    textAlign: 'right',
    textBaseline: 'middle'
  },
  insideLeft: {
    textAlign: 'left',
    textBaseline: 'middle'
  },

  right: {
    textAlign: 'left',
    textBaseline: 'middle'
  },
  insideRight: {
    textAlign: 'right',
    textBaseline: 'middle'
  },

  top: {
    textAlign: 'center',
    textBaseline: 'bottom'
  },
  insideTop: {
    textAlign: 'center',
    textBaseline: 'top'
  },

  bottom: {
    textAlign: 'center',
    textBaseline: 'top'
  },
  insideBottom: {
    textAlign: 'center',
    textBaseline: 'bottom'
  },

  middle: {
    textAlign: 'center',
    textBaseline: 'middle'
  },

  topLeft: {
    textAlign: 'right',
    textBaseline: 'top'
  },
  insideTopLeft: {
    textAlign: 'left',
    textBaseline: 'top'
  },
  topRight: {
    textAlign: 'left',
    textBaseline: 'top'
  },
  insideTopRight: {
    textAlign: 'right',
    textBaseline: 'top'
  },
  bottomLeft: {
    textAlign: 'right',
    textBaseline: 'bottom'
  },
  insideBottomLeft: {
    textAlign: 'left',
    textBaseline: 'bottom'
  },
  bottomRight: {
    textAlign: 'left',
    textBaseline: 'bottom'
  },
  insideBottomRight: {
    textAlign: 'right',
    textBaseline: 'bottom'
  }
};

export const DEFAULT_MARK_POINT_THEME = {
  interactive: true,
  targetSymbol: {
    visible: false,
    offset: 0,
    style: {
      symbolType: 'circle',
      size: 20,
      fill: false,
      stroke: 'rgba(46, 47, 50)'
    }
  },
  itemLine: {
    visible: true,
    decorativeLine: {
      visible: false,
      length: 30
    },
    startSymbol: {
      visible: true,
      clip: true,
      symbolType: 'circle',
      size: 20,
      style: {
        fill: false,
        stroke: 'rgba(46, 47, 50)'
      }
    },
    endSymbol: {
      visible: false,
      clip: true,
      symbolType: 'triangle',
      size: 12,
      style: {
        fill: false,
        stroke: 'rgba(46, 47, 50)'
      }
    },
    lineStyle: {
      stroke: '#000',
      lineWidth: 1
    }
  },
  itemContent: {
    type: 'text',
    position: 'middle',
    refX: 10,
    symbolStyle: {
      symbolType: 'star',
      fill: 'rgb(48, 115, 242)',
      fillOpacity: 0.8,
      size: 20
    },
    textStyle: {
      dx: 0,
      dy: 0
    },
    imageStyle: {
      width: 80,
      height: 80
    },
    richTextStyle: {
      width: 100,
      height: 100
    }
  }
};

export const DEFAULT_MARK_POINT_TEXT_STYLE_MAP: {
  [K: string]: {
    [T: string]: {
      textAlign: TextAlignType;
      textBaseline: TextBaselineType;
    };
  };
} = {
  postiveXAxis: {
    top: {
      textAlign: 'left',
      textBaseline: 'bottom'
    },
    bottom: {
      textAlign: 'left',
      textBaseline: 'top'
    },
    middle: {
      textAlign: 'left',
      textBaseline: 'middle'
    },
    insideTop: {
      textAlign: 'right',
      textBaseline: 'bottom'
    },
    insideBottom: {
      textAlign: 'right',
      textBaseline: 'top'
    },
    insideMiddle: {
      textAlign: 'right',
      textBaseline: 'middle'
    }
  },
  negativeXAxis: {
    top: {
      textAlign: 'right',
      textBaseline: 'bottom'
    },
    bottom: {
      textAlign: 'right',
      textBaseline: 'top'
    },
    middle: {
      textAlign: 'right',
      textBaseline: 'middle'
    },
    insideTop: {
      textAlign: 'left',
      textBaseline: 'bottom'
    },
    insideBottom: {
      textAlign: 'left',
      textBaseline: 'top'
    },
    insideMiddle: {
      textAlign: 'left',
      textBaseline: 'middle'
    }
  }
};
