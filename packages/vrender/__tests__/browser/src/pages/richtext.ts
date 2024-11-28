import { createStage, createRichText, createGroup, createCircle, xul } from '@visactor/vrender';
import { addShapesToStage, colorPools } from '../utils';

// const urlPng = 'https://vega.github.io/images/idl-logo.png';
// const svg =
//   '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="6" cy="6" r="6" fill="#FD9C87"></circle><circle opacity="0.6" cx="6" cy="6" r="1" stroke="white" stroke-width="2"></circle></svg>';
const svg =
  '<svg t="1706853751091" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4226" width="100" height="100"><path d="M533.333333 85.333333c-247.426667 0-448 200.573333-448 448s200.573333 448 448 448 448-200.573333 448-448-200.573333-448-448-448z m0 853.333334c-223.86 0-405.333333-181.473333-405.333333-405.333334s181.473333-405.333333 405.333333-405.333333 405.333333 181.473333 405.333334 405.333333-181.473333 405.333333-405.333334 405.333334z m21.333334-192a21.333333 21.333333 0 1 1-21.333334-21.333334 21.333333 21.333333 0 0 1 21.333334 21.333334z m-21.333334-85.333334a21.333333 21.333333 0 0 1-21.333333-21.333333v-42.666667a21.333333 21.333333 0 0 1 6.246667-15.086666c13.1-13.093333 28.9-24.886667 45.633333-37.333334C601.333333 516.966667 640 488.1 640 448c0-58.813333-47.853333-106.666667-106.666667-106.666667s-106.666667 47.853333-106.666666 106.666667a21.333333 21.333333 0 0 1-42.666667 0 149.333333 149.333333 0 0 1 298.666667 0c0 28.113333-10.6 53.873333-32.406667 78.74-17.593333 20.046667-39.593333 36.466667-60.873333 52.34-12.666667 9.453333-24.76 18.473333-34.72 27.433333V640a21.333333 21.333333 0 0 1-21.333334 21.333333z" fill="#5C5C66" p-id="4227"></path></svg>';

export const page = () => {
  const shapes = [];

  const r = createRichText({
    visible: true,
    fontSize: 26,
    width: 0,
    background: 'green',
    fill: 'linear-gradient(45deg, red 0%, green 100%)',
    stroke: 'green',
    // "textAlign": "center",
    textConfig: [
      {
        text: '我',
        fontSize: 26,
        textAlign: 'center'
      },
      {
        text: '们',
        fontSize: 26,
        textAlign: 'center'
      },
      {
        text: '是',
        fontSize: 26,
        textAlign: 'center'
      },
      {
        text: '无',
        fontSize: 26,
        textAlign: 'center'
      },
      {
        text: '缘',
        fontSize: 26,
        textAlign: 'center'
      },
      {
        text: '无',
        fontSize: 26,
        textAlign: 'center'
      },
      {
        text: '故',
        fontSize: 26,
        textAlign: 'center'
      },
      {
        text: '的',
        fontSize: 26,
        textAlign: 'center'
      },
      {
        text: '尘',
        fontSize: 26,
        textAlign: 'center'
      },
      {
        text: '埃\n',
        fontSize: 26,
        textAlign: 'center',
        fill: '#0f51b5'
      },
      {
        text: '无',
        fontSize: 26,
        textAlign: 'center',
        fill: '#0f51b5'
      },
      {
        text: '缘',
        fontSize: 26,
        textAlign: 'center',
        fill: '#0f51b5'
      },
      {
        text: '无',
        fontSize: 26,
        textAlign: 'center',
        fill: '#0f51b5'
      },
      {
        text: '故',
        fontSize: 26,
        textAlign: 'center',
        fill: '#0f51b5'
      },
      {
        text: '的',
        fontSize: 26,
        textAlign: 'center',
        fill: '#0f51b5'
      },
      {
        text: '游',
        fontSize: 26,
        textAlign: 'center',
        fill: '#0f51b5'
      },
      {
        text: '走\n',
        fontSize: 26,
        textAlign: 'center',
        fill: '#0f51b5'
      },
      {
        text: '黑',
        fontSize: 26,
        textAlign: 'center',
        fill: '#0f51b5'
      },
      {
        text: '暗',
        fontSize: 26,
        textAlign: 'center',
        fill: '#0f51b5'
      },
      {
        text: '只',
        fontSize: 26,
        textAlign: 'center',
        fill: '#0f51b5'
      },
      {
        text: '需',
        fontSize: 26,
        textAlign: 'center',
        fill: '#0f51b5'
      },
      {
        text: '要',
        fontSize: 26,
        textAlign: 'center',
        fill: '#0f51b5'
      },
      {
        text: '张',
        fontSize: 26,
        textAlign: 'center',
        fill: '#0f51b5'
      },
      {
        text: '开',
        fontSize: 26,
        textAlign: 'center',
        fill: '#0f51b5'
      },
      {
        text: '一',
        fontSize: 26,
        textAlign: 'center',
        fill: '#0f51b5'
      },
      {
        text: '张',
        fontSize: 26,
        textAlign: 'center',
        fill: '#0f51b5'
      },
      {
        text: '缝',
        fontSize: 26,
        textAlign: 'center',
        fill: '#0f51b5'
      },
      {
        text: '隙\n',
        fontSize: 26,
        textAlign: 'center',
        fill: '#0f51b5'
      },
      {
        text: '就',
        fontSize: 26,
        textAlign: 'center',
        fill: '#0f51b5'
      },
      {
        text: '能',
        fontSize: 26,
        textAlign: 'center',
        fill: '#0f51b5'
      },
      {
        text: '挂',
        fontSize: 26,
        textAlign: 'center',
        fill: '#0f51b5'
      },
      {
        text: '起',
        fontSize: 26,
        textAlign: 'center',
        fill: '#0f51b5'
      },
      {
        text: '飓',
        fontSize: 26,
        textAlign: 'center',
        fill: '#0f51b5'
      },
      {
        text: '风\n',
        fontSize: 26,
        textAlign: 'center',
        fill: '#0f51b5'
      }
    ]
  });
  shapes.push(r);
  let angle = 0;
  r.animate().to({ stroke: 'pink' }, 10000, 'linear');
  // .onFrame(() => {
  //   angle += 0.01;
  //   console.log(angle);
  //   r.setAttributes({ fill: `linear-gradient(${angle}deg, red 0%, green 100%)` });
  // });

  shapes.push(
    createRichText({
      x: 100,
      y: 100,
      width: 300,
      height: 0,
      wordBreak: 'break-word',
      textConfig: [
        {
          text: 'Mapbox',
          fontWeight: 'bold',
          direction: 'vertical',
          fontSize: 30,
          fill: '#3f51b5'
        },
        {
          text: '公司成立于2010年，创立目标是为Google Map提供一个',
          fill: '#000'
        },
        {
          text: '替代方案',
          fontStyle: 'italic',
          fill: '#3f51b5'
        },
        {
          text: '。在当时，Google Map',
          fill: '#000'
        },
        {
          text: '地图',
          textDecoration: 'line-through',
          fill: '#000'
        },
        {
          text: '[1]',
          script: 'super',
          fill: '#000'
        },
        {
          // "lineHeight": 30,
          text: '几乎垄断了所有线上地图业务，但是在Google Map中，几乎没有定制化的可能，也没有任何工具可以让制图者按照他们的设想来创建地图',
          fill: '#000'
        },
        {
          // "lineHeight": 30,
          text: '。\n',

          fill: '#30ff05'
        },
        {
          lineHeight: 30,
          text: 'Mapbox的成立旨在改变这种状况，为制图人员和开发人员提供工具来创建他们想要的地图。值得一提的是，目前Mapbox提供的制图工具几乎都是开源的。\nMapbox目前主要提供地理数据、渲染客户端和其他与地图相关的服务。Mapbox GLabc JS是他们的一个开源客户端库，用于渲染Web端的可交互地图。作为Mapbox生态系统的一部分，它通常与Mapbox提供的其他服务集成在一起，统一对外使用。',
          fill: '#000'
        },
        {
          text: '\n目前Mapbox公司的主营业务除了地图相关产品，还包括LBS(Location Based Services)服务、自动驾驶、自有数据(Boundaries, Traffic Data, Movement)以及车机服务。',
          fill: '#000'
        }
        // {
        //   "text": "当前值 219,300\n",
        //   "fontSize": 20,
        //   "fill": true,
        //   "textAlign": "center",
        //   "fill": "#ccc",
        // },
        // {
        //   "text": "50%\n",
        //   "fontSize": 30,
        //   "fill": true,
        //   "textAlign": "center",
        //   "fill": "#000",
        // },
        // {
        //   "text": "利润",
        //   "fontSize": 20,
        //   "fill": true,
        //   "textAlign": "center",
        //   "fill": "#ccc",
        // },
      ]
    })
  );

  shapes.push(
    createRichText({
      x: 400,
      y: 50,
      width: 300,
      height: 300,
      textConfig: [
        {
          text: 'ID',
          fontFamily: 'Arial,sans-serif',
          fontSize: 16,
          fontWeight: 'bold',
          fill: '#000',
          stroke: false,
          textAlign: 'left',
          textBaseline: 'middle',
          lineHeight: 16,
          ellipsis: '...'
        },
        {
          image:
            '<svg t="1706853751091" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4226" width="100" height="100"><path d="M533.333333 85.333333c-247.426667 0-448 200.573333-448 448s200.573333 448 448 448 448-200.573333 448-448-200.573333-448-448-448z m0 853.333334c-223.86 0-405.333333-181.473333-405.333333-405.333334s181.473333-405.333333 405.333333-405.333333 405.333333 181.473333 405.333334 405.333333-181.473333 405.333333-405.333334 405.333334z m21.333334-192a21.333333 21.333333 0 1 1-21.333334-21.333334 21.333333 21.333333 0 0 1 21.333334 21.333334z m-21.333334-85.333334a21.333333 21.333333 0 0 1-21.333333-21.333333v-42.666667a21.333333 21.333333 0 0 1 6.246667-15.086666c13.1-13.093333 28.9-24.886667 45.633333-37.333334C601.333333 516.966667 640 488.1 640 448c0-58.813333-47.853333-106.666667-106.666667-106.666667s-106.666667 47.853333-106.666666 106.666667a21.333333 21.333333 0 0 1-42.666667 0 149.333333 149.333333 0 0 1 298.666667 0c0 28.113333-10.6 53.873333-32.406667 78.74-17.593333 20.046667-39.593333 36.466667-60.873333 52.34-12.666667 9.453333-24.76 18.473333-34.72 27.433333V640a21.333333 21.333333 0 0 1-21.333334 21.333333z" fill="#5C5C66" p-id="4227"></path></svg>',
          visibleTime: 'always',
          id: 'question',
          width: 14,
          height: 14,
          margin: [0, 6, 0, 6],
          cursor: 'pointer',
          tooltip: {
            style: {
              arrowMark: false,
              maxWidth: 200
            },
            title:
              'this is tooltip content很多文字是思考和弗雷斯科货到付款就水电费就开始思考拉多加湖弗兰克撒娇划分空间里说货到付款就水电费快结束的反馈content很多文字是思考和弗雷斯科货到付款就水电费就开始思考拉多加湖弗兰克撒娇划分空间里说货到付款就水电费快结束的反馈content很多文字是思考和弗雷斯科货到付款就水电费就开始思考拉多加湖弗兰克撒娇划分空间里说货到付款就水电费快结束的反馈content很多文字是思考和弗雷斯科货到付款就水电费就开始思考拉多加湖弗兰克撒娇划分空间里说货到付款就水电费快结束的反馈content很多文字是思考和弗雷斯科货到付款就水电费就开始思考拉多加湖弗兰克撒娇划分空间里说货到付款就水电费快结束的反馈content很多文字是思考和弗雷斯科货到付款就水电费就开始思考拉多加湖弗兰克撒娇划分空间里说货到付款就水电费快结束的反馈',
            placement: 'bottom'
          },
          backgroundWidth: 14,
          backgroundHeight: 14,
          backgroundShowMode: 'hover'
        },
        {
          text: 'ID',
          fontFamily: 'Arial,sans-serif',
          fontSize: 16,
          fontWeight: 'bold',
          fill: '#000',
          stroke: false,
          textAlign: 'left',
          textBaseline: 'middle',
          lineHeight: 16,
          ellipsis: '...'
        }
      ]
    })
  );
  shapes[shapes.length - 1].bindIconEvent();

  shapes.push(
    createRichText({
      x: 500,
      y: 100,
      width: 300,
      stroke: 'green',
      height: 0,
      lineWidth: 10,
      textConfig: [
        {
          text: '图标测试',
          fontSize: 30,
          textAlign: 'center',
          textDecoration: 'underline',

          fill: '#0f51b5'
        },

        // textAlign
        {
          text: '\ntextAlign: left',
          fill: '#000'
        },
        {
          // image: 'https://vega.github.io/images/idl-logo.png',
          image: svg,
          width: 30,
          height: 30,
          backgroundWidth: 34,
          backgroundHeight: 34,
          backgroundShowMode: 'hover',

          id: 'circle-0'

          // margin: [0, 0, 10, 5]
        },
        {
          text: '\ntextAlign: center',
          fill: '#000',
          textAlign: 'center'
        },
        {
          // image: 'https://vega.github.io/images/idl-logo.png',
          image: svg,
          width: 30,
          height: 30,
          backgroundWidth: 34,
          backgroundHeight: 34,
          backgroundShowMode: 'hover',

          id: 'circle-1'
        },
        {
          text: '\ntextAlign: right',
          fill: 'red',
          textAlign: 'end'
        },
        {
          // image: 'https://vega.github.io/images/idl-logo.png',
          image: svg,
          width: 30,
          height: 30,
          backgroundWidth: 34,
          backgroundHeight: 34,
          backgroundShowMode: 'hover',

          id: 'circle-2'
        },

        // textBaseline
        {
          text: '\ntextBaseline: top',
          fill: '#000',
          textBaseline: 'top'
        },
        {
          // image: 'https://vega.github.io/images/idl-logo.png',
          image: svg,
          width: 30,
          height: 30,
          backgroundWidth: 34,
          backgroundHeight: 34,
          backgroundShowMode: 'hover',
          textBaseline: 'top',

          id: 'circle-3'
        },
        {
          text: '\ntextBaseline: middle',
          fill: '#000',
          textBaseline: 'middle'
        },
        {
          // image: 'https://vega.github.io/images/idl-logo.png',
          image: svg,
          width: 30,
          height: 30,
          backgroundWidth: 34,
          backgroundHeight: 34,
          backgroundShowMode: 'hover',
          textBaseline: 'middle',

          id: 'circle-4'
        },
        {
          text: '\ntextBaseline: alphabetic',
          fill: '#000',
          textBaseline: 'alphabetic'
        },
        {
          // image: 'https://vega.github.io/images/idl-logo.png',
          image: svg,
          width: 12,
          height: 12,
          backgroundWidth: 34,
          backgroundHeight: 34,
          backgroundShowMode: 'hover',
          textBaseline: 'alphabetic',

          id: 'circle-5'
        },
        {
          text: '\ntextBaseline: bottom',
          fill: '#000',
          textBaseline: 'bottom'
        },
        {
          // image: 'https://vega.github.io/images/idl-logo.png',
          image: svg,
          width: 30,
          height: 30,
          backgroundWidth: 34,
          backgroundHeight: 34,
          backgroundShowMode: 'hover',
          textBaseline: 'bottom',

          id: 'circle-6'
        },

        // wrap
        {
          text: '\nlong lone lone lone lone lone text warps line',
          fill: '#000',
          textAlign: 'left'
        },
        {
          text: ' line',
          fill: '#000',
          textAlign: 'left'
        },
        {
          // image: 'https://vega.github.io/images/idl-logo.png',
          image: svg,
          width: 30,
          height: 30,
          backgroundWidth: 34,
          backgroundHeight: 34,
          backgroundShowMode: 'hover',

          id: 'circle-7'
        },

        // pos
        {
          text: '\n'
        },
        {
          // image: 'https://vega.github.io/images/idl-logo.png',
          image: svg,
          width: 30,
          height: 30,
          backgroundWidth: 34,
          backgroundHeight: 34,
          backgroundShowMode: 'hover',

          id: 'circle-8'
        },
        {
          text: 'icon line start; ',
          fill: '#000',
          textAlign: 'left'
        },
        {
          // image: 'https://vega.github.io/images/idl-logo.png',
          image: svg,
          width: 30,
          height: 30,
          backgroundWidth: 34,
          backgroundHeight: 34,
          backgroundShowMode: 'hover',

          id: 'circle-9'
        },
        {
          text: 'icon line middle; ',
          fill: '#000',
          textAlign: 'left'
        },
        {
          text: 'icon line end',
          fill: '#000',
          textAlign: 'left'
        },
        {
          // image: 'https://vega.github.io/images/idl-logo.png',
          image: svg,
          width: 30,
          height: 30,
          backgroundWidth: 50,
          backgroundHeight: 50,
          backgroundShowMode: 'hover',

          id: 'circle-10'
        },
        {
          text: '\nmargin',
          fill: '#000',
          textAlign: 'left'
        },
        {
          // image: 'https://vega.github.io/images/idl-logo.png',
          image: svg,
          width: 30,
          height: 30,
          backgroundWidth: 50,
          backgroundHeight: 50,
          backgroundShowMode: 'hover',
          margin: [10, 5, 10, 10],
          cursor: 'pointer',

          id: 'circle-11'
        },
        {
          text: 'margin',
          fill: '#000',
          textAlign: 'left'
        },
        {
          text: '\nmargin margin margin',
          fill: '#000',
          textAlign: 'left'
        }
      ]
    })
  );
  shapes[shapes.length - 1].bindIconEvent();

  shapes.push(
    createRichText({
      x: 900,
      y: 100,
      width: 50,
      height: 150,
      layoutDirection: 'vertical',
      textConfig: [
        // {
        //   // lineHeight: 30,
        //   text: '中',
        //
        //   textAlign: 'left'
        // },
        // {
        //   // lineHeight: 30,
        //   text: '文',
        //
        //   textAlign: 'left'
        //   // rotate: -Math.PI / 3,
        // },
        // {
        //   // lineHeight: 30,
        //   text: '字',
        //
        //   textAlign: 'left'
        //   // rotate: Math.PI / 2,
        // },
        // {
        //   // lineHeight: 30,
        //   text: '符',
        //
        //   textAlign: 'left'
        //   // rotate: Math.PI,
        // },
        // {
        //   // lineHeight: 30,
        //   text: 'English',
        //
        //   textAlign: 'left',
        //   // rotate: Math.PI / 2,
        //   direction: 'vertical'
        //   // textDecoration: 'underline'
        // },
        // {
        //   // lineHeight: 30,
        //   text: 'n',
        //
        //   textAlign: 'left'
        //   // rotate: Math.PI / 3,
        // },
        // {
        //   // lineHeight: 30,
        //   text: 'g',
        //
        //   textAlign: 'left'
        //   // rotate: Math.PI / 2,
        // }

        {
          text: '这',

          // stroke: false,
          fontFamily:
            'PingFang SC,Microsoft Yahei,system-ui,-apple-system,segoe ui,Roboto,Helvetica,Arial,sans-serif, apple color emoji,segoe ui emoji,segoe ui symbol',
          fontSize: 12,
          fontWeight: 'normal',
          // lineHeight: 'normal',
          textDecoration: 'none',
          textAlign: 'left',
          script: 'normal',
          fill: '#6F6F6F',
          stroke: 'black'
        },
        {
          text: '是',

          // stroke: false,
          fontFamily:
            'PingFang SC,Microsoft Yahei,system-ui,-apple-system,segoe ui,Roboto,Helvetica,Arial,sans-serif, apple color emoji,segoe ui emoji,segoe ui symbol',
          fontSize: 12,
          fontWeight: 'normal',
          // lineHeight: 'normal',
          textDecoration: 'none',
          textAlign: 'right',
          script: 'normal',
          fill: '#6F6F6F',
          stroke: 'black'
        },
        {
          text: '一',

          // stroke: false,
          fontFamily:
            'PingFang SC,Microsoft Yahei,system-ui,-apple-system,segoe ui,Roboto,Helvetica,Arial,sans-serif, apple color emoji,segoe ui emoji,segoe ui symbol',
          fontSize: 12,
          fontWeight: 'normal',
          // lineHeight: 'normal',
          textDecoration: 'none',
          textAlign: 'right',
          script: 'normal',
          fill: '#6F6F6F',
          stroke: 'black'
        },
        {
          text: '个',

          // stroke: false,
          fontFamily:
            'PingFang SC,Microsoft Yahei,system-ui,-apple-system,segoe ui,Roboto,Helvetica,Arial,sans-serif, apple color emoji,segoe ui emoji,segoe ui symbol',
          fontSize: 12,
          fontWeight: 'normal',
          // lineHeight: 'normal',
          textDecoration: 'none',
          textAlign: 'right',
          script: 'normal',
          fill: '#6F6F6F',
          stroke: 'black'
        },
        {
          text: '汉',

          // stroke: false,
          fontFamily:
            'PingFang SC,Microsoft Yahei,system-ui,-apple-system,segoe ui,Roboto,Helvetica,Arial,sans-serif, apple color emoji,segoe ui emoji,segoe ui symbol',
          fontSize: 12,
          fontWeight: 'normal',
          // lineHeight: 'normal',
          textDecoration: 'none',
          textAlign: 'right',
          script: 'normal',
          fill: '#6F6F6F',
          stroke: 'black'
        },
        {
          text: '【',
          direction: 'vertical',

          // stroke: false,
          fontFamily:
            'PingFang SC,Microsoft Yahei,system-ui,-apple-system,segoe ui,Roboto,Helvetica,Arial,sans-serif, apple color emoji,segoe ui emoji,segoe ui symbol',
          fontSize: 12,
          fontWeight: 'normal',
          // lineHeight: 'normal',
          textDecoration: 'none',
          textAlign: 'right',
          script: 'normal',
          fill: '#6F6F6F',
          stroke: 'black'
        },
        {
          text: '放',

          // stroke: false,
          fontFamily:
            'PingFang SC,Microsoft Yahei,system-ui,-apple-system,segoe ui,Roboto,Helvetica,Arial,sans-serif, apple color emoji,segoe ui emoji,segoe ui symbol',
          fontSize: 12,
          fontWeight: 'normal',
          // lineHeight: 'normal',
          textDecoration: 'none',
          textAlign: 'right',
          script: 'normal',
          fill: '#6F6F6F',
          stroke: 'black'
        },
        {
          text: '大',

          // stroke: false,
          fontFamily:
            'PingFang SC,Microsoft Yahei,system-ui,-apple-system,segoe ui,Roboto,Helvetica,Arial,sans-serif, apple color emoji,segoe ui emoji,segoe ui symbol',
          fontSize: 12,
          fontWeight: 'normal',
          // lineHeight: 'normal',
          textDecoration: 'none',
          textAlign: 'right',
          script: 'normal',
          fill: '#6F6F6F',
          stroke: 'black'
        },
        {
          text: 'a0这是什么',
          direction: 'vertical',

          // stroke: false,
          fontFamily:
            'PingFang SC,Microsoft Yahei,system-ui,-apple-system,segoe ui,Roboto,Helvetica,Arial,sans-serif, apple color emoji,segoe ui emoji,segoe ui symbol',
          fontSize: 12,
          fontWeight: 'normal',
          // lineHeight: 'normal',
          textDecoration: 'none',
          textAlign: 'right',
          script: 'normal',
          fill: '#6F6F6F',
          stroke: 'black'
        }
      ]
    })
  );

  shapes.push(
    createCircle({
      x: 900,
      y: 300,
      radius: 5,
      fill: '#000'
    })
  );
  shapes.push(
    createRichText({
      x: 900,
      y: 300,
      width: 0,
      height: 0,
      textBaseline: 'middle',
      textConfig: [
        {
          text: '富文本全局',
          fill: '#000'
        },
        {
          text: '\ntextBaseline: middle',
          fill: '#000'
        }
      ],
      cursor: 'pointer'
    })
  );

  shapes.push(
    createCircle({
      x: 900,
      y: 400,
      radius: 5,
      fill: '#000'
    })
  );
  shapes.push(
    createRichText({
      x: 900,
      y: 400,
      width: 0,
      height: 0,
      textBaseline: 'bottom',
      textConfig: [
        {
          text: '富文本全局',
          fill: '#000'
        },
        {
          text: '\ntextBaseline: bottom',
          fill: '#000'
        }
      ]
    })
  );

  shapes.push(
    createCircle({
      x: 900,
      y: 500,
      radius: 5,
      fill: '#000'
    })
  );
  shapes.push(
    createRichText({
      x: 900,
      y: 500,
      width: 0,
      height: 0,
      textAlign: 'center',
      textConfig: [
        {
          text: '富文本全局',
          fill: '#000'
        },
        {
          text: '\ntextAlign: center',
          fill: '#000'
        }
      ]
    })
  );

  shapes.push(
    createCircle({
      x: 900,
      y: 600,
      radius: 5,
      fill: '#000'
    })
  );
  shapes.push(
    createRichText({
      x: 900,
      y: 600,
      width: 0,
      height: 0,
      textAlign: 'right',
      textConfig: [
        {
          text: '富文本全局',
          fill: '#000'
        },
        {
          text: '\ntextAlign: right',
          fill: '#000'
        }
      ]
    })
  );

  console.log(
    createRichText({
      x: 600,
      y: 600,
      width: 0,
      height: 0,
      textAlign: 'right',
      textConfig: xul(`<tc>
      <text attribute="fill: red;">富文本全局</text>
      <image attribute="image: ${svg
        .replaceAll('"', '&quot')
        .replaceAll('<', '&lt')
        .replaceAll('>', '&gt')};; width: 30; height: 30; id: circle-0;"></image>
      </tc>`)
    })
  );

  shapes.push(
    createRichText({
      x: 600,
      y: 600,
      width: 0,
      height: 0,
      textAlign: 'right',
      textConfig: xul(`<tc>
        <text attribute="fill: red;">富文本全局</text>
        <image attribute="image: ${svg
          .replaceAll('"', '&quot')
          .replaceAll('<', '&lt')
          .replaceAll('>', '&gt')};; width: 30; height: 30; id: circle-0;"></image>
        </tc>`)
    })
  );

  const rt = createRichText({
    fontSize: 14,
    fill: '#FFC400',
    fontFamily:
      'PingFang SC,Helvetica Neue,Microsoft Yahei,system-ui,-apple-system,segoe ui,Roboto,Helvetica,Arial,sans-serif,apple color emoji,segoe ui emoji,segoe ui symbol',
    textAlign: 'center',
    textBaseline: 'middle',
    boundsPadding: [10, 0, 10, 0],
    fontWeight: 'normal',
    fillOpacity: 1,
    ellipsis: true,
    pickable: true,
    lineJoin: 'bevel',
    stroke: '#ffffff',
    _debug_bounds: true,
    zIndex: -1,
    // maxLineWidth: 200,
    disableAutoWrapLine: true,
    x: 100,
    y: 100,
    angle: 0,
    // lineWidth: 0,
    textConfig: [
      {
        text: '空值0\n',
        fontSize: 12,
        textAlign: 'left',
        fill: '#1F2329'
      },
      {
        text: '8%',
        fontSize: 12,
        textAlign: 'left',
        fill: '#646A73'
      }
    ],
    z: 0,
    // width: 30,
    width: 31,
    // width: 0,
    height: 80
    // maxWidth: 200
  });

  console.log(rt);

  const stage = createStage({
    canvas: 'main',
    width: 1200,
    height: 700
    // viewWidth: 1200,
    // viewHeight: 600
  });

  const group = createGroup({});
  group.createOrUpdateChild('rt', { x: 10 }, 'richtext');
  console.log(group);

  // shapes[1].addEventListener('click', (e: any) => {
  //   // console.log(e.clone());
  //   console.log(shapes[1].pickIcon(e.global));
  // });

  // console.log(
  //   `<image attribute="image: ${svg
  //     .replaceAll("'", "\\'")
  //     .replaceAll('"', '\\"')}; width: 30; height: 30; id: circle-0" />`
  // );

  // shapes.length = 0;

  shapes.push(rt);

  // shapes.push(
  //   createRichText({
  //     fontSize: 14,
  //     fill: '#FF8A00',
  //     fontFamily:
  //       'PingFang SC,Helvetica Neue,Microsoft Yahei,system-ui,-apple-system,segoe ui,Roboto,Helvetica,Arial,sans-serif,apple color emoji,segoe ui emoji,segoe ui symbol',
  //     textAlign: 'center',
  //     textBaseline: 'middle',
  //     boundsPadding: [-1, 0, -1, 0],
  //     visible: true,
  //     fontWeight: 'normal',
  //     fillOpacity: 1,
  //     pickable: false,
  //     lineJoin: 'bevel',
  //     stroke: '#ffffff',
  //     width: 50,
  //     height: 40,
  //     ellipsis: true,
  //     disableAutoWrapLine: true,
  //     x: 446.334013251786,
  //     y: 198.39408125844088,
  //     angle: 0,
  //     lineWidth: 0,
  //     textConfig: [
  //       {
  //         text: 'aluminum1111111111111\n',
  //         fontSize: 14,
  //         fontWeight: 'bold',
  //         fill: 'red'
  //       },
  //       {
  //         text: '1.13%',
  //         fontSize: 14,
  //         lineThrough: true,
  //         underline: true,
  //         fill: 'green'
  //       }
  //     ],
  //     z: 0,
  //     id: 'vrender-component-arc-label-2',
  //     opacity: 1,
  //     strokeOpacity: 1
  //   })
  // );

  addShapesToStage(stage, shapes as any, true);
  stage.render();

  (window as any).stage = stage;
};
