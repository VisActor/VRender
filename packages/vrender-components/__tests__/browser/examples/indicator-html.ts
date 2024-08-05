import '@visactor/vrender';
import { createCircle, createLine } from '@visactor/vrender';
import render from '../../util/render';
import { Indicator } from '../../../src';

export function run() {
  const attr1 = {
    visible: true,
    size: {
      width: 649.455,
      height: 300
    },
    x: 176,
    y: 100,
    dx: 0,
    dy: 0,
    limitRatio: 1,
    title: {
      visible: false,
      autoLimit: false,
      autoFit: true,
      style: {
        fontSize: 42,

        fontWeight: 'normal',
        fillOpacity: 1,
        textBaseline: 'top',
        textAlign: 'center',
        fill: 'red'
      }
    },
    content: [
      {
        visible: true,
        autoLimit: true,
        fitPercent: 1,
        style: {
          fontSize: 16,

          fontWeight: 'normal',
          fillOpacity: 1,
          textBaseline: 'top',
          textAlign: 'center',
          text: 'CONTENT0',
          fill: 'black'
        }
      },
      {
        visible: true,
        autoFit: true,
        style: {
          fontSize: 16,

          fontWeight: 'bolder',
          fillOpacity: 1,
          textBaseline: 'top',
          textAlign: 'center',
          text: 'CONTENT111111111111111111111111111111111111111',
          fill: 'blue'
        }
      }
    ]
  };

  const attr2 = {
    visible: true,
    size: {
      width: 649.455,
      height: 300
    },
    x: 176,
    y: 100,
    dx: 0,
    dy: 0,
    limitRatio: 1,
    title: {
      visible: true,
      autoLimit: false,
      autoFit: true,
      style: {
        text: 'Aris',
        fontSize: 42,

        fontWeight: 'normal',
        fillOpacity: 1,
        textBaseline: 'top',
        textAlign: 'center',
        fill: 'red'
      }
    },
    content: [
      {
        visible: true,
        autoLimit: true,
        fitPercent: 1,
        style: {
          fontSize: 16,

          fontWeight: 'normal',
          fillOpacity: 1,
          textBaseline: 'top',
          textAlign: 'center',
          text: 'CONTENT0',
          fill: 'black'
        }
      },
      {
        visible: true,
        autoFit: true,
        style: {
          fontSize: 16,

          fontWeight: 'bolder',
          fillOpacity: 1,
          textBaseline: 'top',
          textAlign: 'center',
          text: 'CONTENT111111111111111111111111111111111111111',
          fill: 'blue'
        }
      }
    ]
  };

  const attr3 = {
    visible: true,
    size: {
      width: 649.455,
      height: 300
    },
    x: 176,
    y: 100,
    dx: 0,
    dy: 0,
    limitRatio: 1,
    title: {
      visible: false,
      // visible: true,
      autoLimit: false,
      autoFit: true,
      style: {
        // text: '',
        fontSize: 42,

        fontWeight: 'normal',
        fillOpacity: 1,
        textBaseline: 'top',
        textAlign: 'center',
        fill: 'red'
      }
    },
    content: [
      {
        visible: true,
        autoLimit: true,
        fitPercent: 1,
        style: {
          fontSize: 16,

          fontWeight: 'normal',
          fillOpacity: 1,
          textBaseline: 'top',
          textAlign: 'center',
          text: 'CONTENT0',
          fill: 'black'
        }
      },
      {
        visible: true,
        autoFit: true,
        style: {
          fontSize: 16,

          fontWeight: 'bolder',
          fillOpacity: 1,
          textBaseline: 'top',
          textAlign: 'center',
          text: 'CONTENT111111111111111111111111111111111111111',
          fill: 'blue'
        }
      }
    ]
  };

  const attr4 = {
    visible: false,
    size: {
      width: 649.455,
      height: 300
    },
    x: 176,
    y: 100,
    dx: 0,
    dy: 0,
    limitRatio: 1,
    title: {
      visible: false,
      space: 0,
      autoLimit: false,
      autoFit: true,
      style: {
        text: 'TITLE',
        fontSize: 42,

        fontWeight: 'normal',
        fillOpacity: 1,
        textBaseline: 'top',
        textAlign: 'center',
        fill: 'red'
      }
    },
    content: [
      {
        visible: true,
        autoLimit: true,
        fitPercent: 1,
        style: {
          fontSize: 16,

          fontWeight: 'normal',
          fillOpacity: 1,
          textBaseline: 'top',
          textAlign: 'center',
          text: 'CONTENT0',
          fill: 'black'
        }
      },
      {
        visible: true,
        autoFit: true,
        style: {
          fontSize: 16,

          fontWeight: 'bolder',
          fillOpacity: 1,
          textBaseline: 'top',
          textAlign: 'center',
          text: 'CONTENT111111111111111111111111111111111111111',
          fill: 'blue'
        }
      }
    ]
  };

  const attr5 = {
    visible: true,
    size: {
      width: 649.455,
      height: 300
    },
    x: 176,
    y: 100,
    dx: 0,
    dy: 0,
    limitRatio: 1,
    title: {
      visible: true,
      space: 0,
      autoLimit: false,
      autoFit: true,
      style: {
        text: 'TITLE',
        fontSize: 42,

        fontWeight: 'normal',
        fillOpacity: 1,
        textBaseline: 'top',
        textAlign: 'center',
        fill: 'red'
      }
    },
    content: [
      {
        visible: true,
        autoLimit: true,
        fitPercent: 1,
        style: {
          fontSize: 16,

          fontWeight: 'normal',
          fillOpacity: 1,
          textBaseline: 'top',
          textAlign: 'center',
          text: 'CONTENT0',
          fill: 'black'
        }
      },
      {
        visible: true,
        autoFit: true,
        style: {
          fontSize: 16,

          fontWeight: 'bolder',
          fillOpacity: 1,
          textBaseline: 'top',
          textAlign: 'center',
          text: 'CONTENT111111111111111111111111111111111111111',
          fill: 'blue'
        }
      }
    ]
  };

  const attr6 = {
    visible: false,
    size: {
      width: 649.455,
      height: 300
    },
    x: 176,
    y: 100,
    dx: 0,
    dy: 0,
    limitRatio: 1,
    title: {
      visible: false,
      space: 0,
      autoLimit: false,
      autoFit: true,
      style: {
        text: 'TITLE',
        fontSize: 42,

        fontWeight: 'normal',
        fillOpacity: 1,
        textBaseline: 'top',
        textAlign: 'center',
        fill: 'red'
      }
    },
    content: [
      {
        visible: true,
        autoLimit: true,
        fitPercent: 1,
        style: {
          fontSize: 16,

          fontWeight: 'normal',
          fillOpacity: 1,
          textBaseline: 'top',
          textAlign: 'center',
          text: 'CONTENT0',
          fill: 'black'
        }
      },
      {
        visible: true,
        autoFit: true,
        style: {
          fontSize: 16,

          fontWeight: 'bolder',
          fillOpacity: 1,
          textBaseline: 'top',
          textAlign: 'center',
          text: 'CONTENT111111111111111111111111111111111111111',
          fill: 'blue'
        }
      }
    ]
  };

  const attr7 = {
    size: {
      width: 500,
      height: 500
    },
    visible: true,
    // limitRatio: 0.8,
    limitRatio: 1,
    title: {
      // visible: false,
      space: 10,
      autoFit: true,
      fitStrategy: 'inscribed',
      fitPercent: 1,
      formatMethod: text => {
        return {
          type: 'html',
          text: {
            dom: '<div>TitleABCDEFG</div>'
          }
        };
      },
      style: {
        fontSize: 64,
        text: 'TitleABCDEFG'
      }
    },
    content: [
      {
        space: 5,
        // autoFit: true,
        fitStrategy: 'inscribed',
        fitPercent: 1,
        formatMethod: text => {
          return {
            type: 'html',
            text: {
              dom: '<div>CONTENT0</div>'
            }
          };
        },
        style: {
          fontSize: 66,
          text: 'CONTENT0'
        }
      },
      {
        autoLimit: true,
        autoFit: true,
        fitPercent: 1,
        fitStrategy: 'inscribed',
        formatMethod: (text, textStyle) => {
          console.log(text, textStyle);
          return {
            type: 'html',
            text: {
              style: {
                maxWidth: textStyle.maxLineWidth
              },
              dom: '<div>CONTENT1111111111111111111111111111111111111111111111111111</div>'
            }
          };
        },
        // space: 5,
        style: {
          fontSize: 16,
          // text: 'CONTENT111111111111111111111111111111111111111111111111111111111111111111111111111111',
          text: 'CONTENT1111111111111111111111111111111111111111111111111111',
          fill: 'blue',
          fontWeight: 'bolder'
        }
      }
    ]
  };

  const attr_progress = {
    visible: true,
    size: {
      width: 767.818,
      height: 476
    },
    x: 12,
    y: 12,
    dx: 0,
    dy: 0,
    limitRatio: null,
    title: {
      visible: true,
      space: 0,
      autoLimit: false,
      autoFit: true,
      style: {
        fontSize: 20,

        fontWeight: 'normal',
        fillOpacity: 1,
        textBaseline: 'top',
        textAlign: 'center',
        fill: 'red',
        text: 2
      }
    },
    content: [
      {
        visible: true,
        style: {
          fontSize: 16,

          fontWeight: 'normal',
          fillOpacity: 1,
          textBaseline: 'top',
          textAlign: 'center',
          text: 0.9,
          fill: 'black'
        }
      },
      {
        visible: true,
        style: {
          fontSize: 16,

          fontWeight: 'normal',
          fillOpacity: 1,
          textBaseline: 'top',
          textAlign: 'center',
          text: 'CONTENT0',
          fill: 'black'
        }
      },
      {
        visible: true,
        autoLimit: true,
        style: {
          fontSize: 16,

          fontWeight: 'bolder',
          fillOpacity: 1,
          textBaseline: 'top',
          textAlign: 'center',
          text: 'CONTENT111111111111111111111111111111111111111',
          fill: 'blue'
        }
      }
    ]
  };

  // const indicator = new Indicator(attr_progress);

  // const indicator = new Indicator({
  //   // dx: 100,
  //   // dy: 100,
  //   size: {
  //     width: 500,
  //     height: 500
  //   },
  //   visible: true,
  //   // limitRatio: 0.8,
  //   limitRatio: 1,
  //   title: {
  //     // visible: false,
  //     space: 10,
  //     //   autoLimit: true,
  //     autoFit: true,
  //     style: {
  //       type: 'rich',
  //       text: [
  //         {
  //           text: 'Visactor-',
  //           fontWeight: 'bold',
  //           fontSize: 42,
  //           fill: 'red'
  //         },

  //         {
  //           text: 'vchart',
  //           textDecoration: 'underline',
  //           fontSize: 36,
  //           fill: 'black'
  //         }
  //       ],
  //       fontSize: 42,

  //       fill: 'red'
  //     }
  //   },
  //   content: [
  //     {
  //       // fitPercent: 1,
  //       // autoFit: true,
  //       // visible: true,
  //       space: 5,
  //       // autoLimit: true,
  //       style: {
  //         fontSize: 16,
  //         // text: 'CONTENT0'
  //         type: 'rich',
  //         text: [
  //           {
  //             text: 'Mapbox',
  //             fontWeight: 'bold',
  //             fontSize: 25,
  //             fill: '#3f51b5'
  //           },

  //           {
  //             text: '替代方案',
  //             fontStyle: 'italic',
  //             textDecoration: 'underline',
  //             fill: '#3f51b5'
  //           }
  //         ]
  //       }
  //     },
  //     {
  //       // visible: false,
  //       // fitPercent: 0.2,
  //       autoLimit: true,
  //       // autoFit: true,
  //       space: 5,
  //       style: {
  //         fontSize: 16,
  //         text: 'CONTENT111111111111111111111111111111111111111111111111111111111111111111111111111111',

  //         fill: 'blue',
  //         fontWeight: 'bolder'
  //       }
  //     }
  //   ]
  // });

  const indicator = new Indicator(attr7);

  /** 指标卡部分隐藏 */
  // const indicator = new Indicator(attr1);

  /** 指标卡全部隐藏 */
  // const indicator = new Indicator(attr4);

  const stage = render(
    [
      indicator,
      createLine({
        points: [
          { x: 0, y: 250 },
          { x: 500, y: 250 }
        ],
        lineWidth: 1,

        stroke: '#ccc',
        lineDash: [2]
      }),
      createLine({
        points: [
          { x: 0, y: 0 },
          { x: 0, y: 200 }
        ],
        lineWidth: 1,

        stroke: '#ccc',
        lineDash: [2]
      }),
      createLine({
        points: [
          { x: 250, y: 0 },
          { x: 250, y: 500 }
        ],
        lineWidth: 1,

        stroke: '#ccc',
        lineDash: [2]
      }),
      createLine({
        points: [
          { x: 500, y: 0 },
          { x: 500, y: 200 }
        ],
        lineWidth: 1,

        stroke: '#ccc',
        lineDash: [2]
      }),
      createCircle({
        x: 250,
        y: 250,
        radius: 250,
        fill: 'rgba(0, 0, 0, 0.1)'
      })
    ],
    'main'
  );

  window.indicator = indicator;
  window.stage = stage;
  console.log(indicator);

  /** 指标卡部分隐藏 */
  // indicator.setAttributes(attr2);

  // indicator.setAttributes(attr3);

  /** 指标卡全部隐藏 */
  // indicator.setAttributes(attr5);

  // indicator.setAttributes(attr6);
}
