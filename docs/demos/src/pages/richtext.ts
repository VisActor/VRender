import { createStage, createRichText, createGroup, createCircle } from '@visactor/vrender';
import { addShapesToStage, colorPools } from '../utils';

// const urlPng = 'https://vega.github.io/images/idl-logo.png';
const svg =
  '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="6" cy="6" r="6" fill="#FD9C87"></circle><circle opacity="0.6" cx="6" cy="6" r="1" stroke="white" stroke-width="2"></circle></svg>';

export const page = () => {
  const shapes = [];

  shapes.push(
    createRichText({
      x: 100,
      y: 100,
      width: 300,
      height: 0,
      textConfig: [
        {
          text: 'Mapbox',
          fontWeight: 'bold',
          fontSize: 30,
          fillColor: '#3f51b5',
          fill: true
        },
        {
          text: '公司成立于2010年，创立目标是为Google Map提供一个',
          fill: true
        },
        {
          text: '替代方案',
          fontStyle: 'italic',
          fill: true,
          fillColor: '#3f51b5'
        },
        {
          text: '。在当时，Google Map',
          fill: true
        },
        {
          text: '地图',
          textDecoration: 'line-through',
          fill: true
        },
        {
          text: '[1]',
          script: 'super',
          fill: true
        },
        {
          // "lineHeight": 30,
          text: '几乎垄断了所有线上地图业务，但是在Google Map中，几乎没有定制化的可能，也没有任何工具可以让制图者按照他们的设想来创建地图',
          fill: true
        },
        {
          // "lineHeight": 30,
          text: '。\n',
          fill: true,
          fillColor: '#30ff05'
        },
        {
          lineHeight: 30,
          text: 'Mapbox的成立旨在改变这种状况，为制图人员和开发人员提供工具来创建他们想要的地图。值得一提的是，目前Mapbox提供的制图工具几乎都是开源的。\nMapbox目前主要提供地理数据、渲染客户端和其他与地图相关的服务。Mapbox GL JS是他们的一个开源客户端库，用于渲染Web端的可交互地图。作为Mapbox生态系统的一部分，它通常与Mapbox提供的其他服务集成在一起，统一对外使用。',
          fill: true
        },
        {
          text: '\n目前Mapbox公司的主营业务除了地图相关产品，还包括LBS(Location Based Services)服务、自动驾驶、自有数据(Boundaries, Traffic Data, Movement)以及车机服务。',
          fill: true
        }
        // {
        //   "text": "当前值 219,300\n",
        //   "fontSize": 20,
        //   "fill": true,
        //   "textAlign": "center",
        //   "fillColor": "#ccc",
        // },
        // {
        //   "text": "50%\n",
        //   "fontSize": 30,
        //   "fill": true,
        //   "textAlign": "center",
        //   "fillColor": "#000",
        // },
        // {
        //   "text": "利润",
        //   "fontSize": 20,
        //   "fill": true,
        //   "textAlign": "center",
        //   "fillColor": "#ccc",
        // },
      ]
    })
  );

  shapes.push(
    createRichText({
      x: 500,
      y: 100,
      width: 300,
      height: 0,
      textConfig: [
        {
          text: '图标测试',
          fontSize: 30,
          textAlign: 'center',
          textDecoration: 'underline',
          fill: true,
          fillColor: '#0f51b5'
        },

        // textAlign
        {
          text: '\ntextAlign: left',
          fill: true
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
          fill: true,
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

          id: 'circle-0'
        },
        {
          text: '\ntextAlign: right',
          fill: true,
          textAlign: 'right'
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
        },

        // textBaseline
        {
          text: '\ntextBaseline: top',
          fill: true,
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

          id: 'circle-0'
        },
        {
          text: '\ntextBaseline: middle',
          fill: true,
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

          id: 'circle-0'
        },
        {
          text: '\ntextBaseline: alphabetic',
          fill: true,
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

          id: 'circle-0'
        },
        {
          text: '\ntextBaseline: bottom',
          fill: true,
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

          id: 'circle-0'
        },

        // wrap
        {
          text: '\nlong lone lone lone lone lone text warps line',
          fill: true,
          textAlign: 'left'
        },
        {
          text: ' line',
          fill: true,
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

          id: 'circle-0'
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

          id: 'circle-0'
        },
        {
          text: 'icon line start; ',
          fill: true,
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

          id: 'circle-0'
        },
        {
          text: 'icon line middle; ',
          fill: true,
          textAlign: 'left'
        },
        {
          text: 'icon line end',
          fill: true,
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

          id: 'circle-0'
        },
        {
          text: '\nmargin',
          fill: true,
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

          id: 'circle-0'
        },
        {
          text: 'margin',
          fill: true,
          textAlign: 'left'
        },
        {
          text: '\nmargin margin margin',
          fill: true,
          textAlign: 'left'
        }
      ]
    })
  );

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
        //   fill: true,
        //   textAlign: 'left'
        // },
        // {
        //   // lineHeight: 30,
        //   text: '文',
        //   fill: true,
        //   textAlign: 'left'
        //   // rotate: -Math.PI / 3,
        // },
        // {
        //   // lineHeight: 30,
        //   text: '字',
        //   fill: true,
        //   textAlign: 'left'
        //   // rotate: Math.PI / 2,
        // },
        // {
        //   // lineHeight: 30,
        //   text: '符',
        //   fill: true,
        //   textAlign: 'left'
        //   // rotate: Math.PI,
        // },
        // {
        //   // lineHeight: 30,
        //   text: 'English',
        //   fill: true,
        //   textAlign: 'left',
        //   // rotate: Math.PI / 2,
        //   direction: 'vertical'
        //   // textDecoration: 'underline'
        // },
        // {
        //   // lineHeight: 30,
        //   text: 'n',
        //   fill: true,
        //   textAlign: 'left'
        //   // rotate: Math.PI / 3,
        // },
        // {
        //   // lineHeight: 30,
        //   text: 'g',
        //   fill: true,
        //   textAlign: 'left'
        //   // rotate: Math.PI / 2,
        // }

        {
          text: '这',
          fill: true,
          stroke: false,
          fontFamily:
            'PingFang SC,Microsoft Yahei,system-ui,-apple-system,segoe ui,Roboto,Helvetica,Arial,sans-serif, apple color emoji,segoe ui emoji,segoe ui symbol',
          fontSize: 12,
          fontWeight: 'normal',
          // lineHeight: 'normal',
          textDecoration: 'none',
          textAlign: 'left',
          script: 'normal',
          fillColor: '#6F6F6F',
          strokeColor: 'black'
        },
        {
          text: '是',
          fill: true,
          stroke: false,
          fontFamily:
            'PingFang SC,Microsoft Yahei,system-ui,-apple-system,segoe ui,Roboto,Helvetica,Arial,sans-serif, apple color emoji,segoe ui emoji,segoe ui symbol',
          fontSize: 12,
          fontWeight: 'normal',
          // lineHeight: 'normal',
          textDecoration: 'none',
          textAlign: 'right',
          script: 'normal',
          fillColor: '#6F6F6F',
          strokeColor: 'black'
        },
        {
          text: '一',
          fill: true,
          stroke: false,
          fontFamily:
            'PingFang SC,Microsoft Yahei,system-ui,-apple-system,segoe ui,Roboto,Helvetica,Arial,sans-serif, apple color emoji,segoe ui emoji,segoe ui symbol',
          fontSize: 12,
          fontWeight: 'normal',
          // lineHeight: 'normal',
          textDecoration: 'none',
          textAlign: 'right',
          script: 'normal',
          fillColor: '#6F6F6F',
          strokeColor: 'black'
        },
        {
          text: '个',
          fill: true,
          stroke: false,
          fontFamily:
            'PingFang SC,Microsoft Yahei,system-ui,-apple-system,segoe ui,Roboto,Helvetica,Arial,sans-serif, apple color emoji,segoe ui emoji,segoe ui symbol',
          fontSize: 12,
          fontWeight: 'normal',
          // lineHeight: 'normal',
          textDecoration: 'none',
          textAlign: 'right',
          script: 'normal',
          fillColor: '#6F6F6F',
          strokeColor: 'black'
        },
        {
          text: '汉',
          fill: true,
          stroke: false,
          fontFamily:
            'PingFang SC,Microsoft Yahei,system-ui,-apple-system,segoe ui,Roboto,Helvetica,Arial,sans-serif, apple color emoji,segoe ui emoji,segoe ui symbol',
          fontSize: 12,
          fontWeight: 'normal',
          // lineHeight: 'normal',
          textDecoration: 'none',
          textAlign: 'right',
          script: 'normal',
          fillColor: '#6F6F6F',
          strokeColor: 'black'
        },
        {
          text: '【',
          direction: 'vertical',
          fill: true,
          stroke: false,
          fontFamily:
            'PingFang SC,Microsoft Yahei,system-ui,-apple-system,segoe ui,Roboto,Helvetica,Arial,sans-serif, apple color emoji,segoe ui emoji,segoe ui symbol',
          fontSize: 12,
          fontWeight: 'normal',
          // lineHeight: 'normal',
          textDecoration: 'none',
          textAlign: 'right',
          script: 'normal',
          fillColor: '#6F6F6F',
          strokeColor: 'black'
        },
        {
          text: '放',
          fill: true,
          stroke: false,
          fontFamily:
            'PingFang SC,Microsoft Yahei,system-ui,-apple-system,segoe ui,Roboto,Helvetica,Arial,sans-serif, apple color emoji,segoe ui emoji,segoe ui symbol',
          fontSize: 12,
          fontWeight: 'normal',
          // lineHeight: 'normal',
          textDecoration: 'none',
          textAlign: 'right',
          script: 'normal',
          fillColor: '#6F6F6F',
          strokeColor: 'black'
        },
        {
          text: '大',
          fill: true,
          stroke: false,
          fontFamily:
            'PingFang SC,Microsoft Yahei,system-ui,-apple-system,segoe ui,Roboto,Helvetica,Arial,sans-serif, apple color emoji,segoe ui emoji,segoe ui symbol',
          fontSize: 12,
          fontWeight: 'normal',
          // lineHeight: 'normal',
          textDecoration: 'none',
          textAlign: 'right',
          script: 'normal',
          fillColor: '#6F6F6F',
          strokeColor: 'black'
        },
        {
          text: 'a0',
          direction: 'vertical',
          fill: true,
          stroke: false,
          fontFamily:
            'PingFang SC,Microsoft Yahei,system-ui,-apple-system,segoe ui,Roboto,Helvetica,Arial,sans-serif, apple color emoji,segoe ui emoji,segoe ui symbol',
          fontSize: 12,
          fontWeight: 'normal',
          // lineHeight: 'normal',
          textDecoration: 'none',
          textAlign: 'right',
          script: 'normal',
          fillColor: '#6F6F6F',
          strokeColor: 'black'
        }
      ]
    })
  );

  shapes.push(
    createCircle({
      x: 900,
      y: 300,
      radius: 5,
      fill: true
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
          fill: true
        },
        {
          text: '\ntextBaseline: middle',
          fill: true
        }
      ]
    })
  );

  shapes.push(
    createCircle({
      x: 900,
      y: 400,
      radius: 5,
      fill: true
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
          fill: true
        },
        {
          text: '\ntextBaseline: bottom',
          fill: true
        }
      ]
    })
  );

  shapes.push(
    createCircle({
      x: 900,
      y: 500,
      radius: 5,
      fill: true
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
          fill: true
        },
        {
          text: '\ntextAlign: center',
          fill: true
        }
      ]
    })
  );

  shapes.push(
    createCircle({
      x: 900,
      y: 600,
      radius: 5,
      fill: true
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
          fill: true
        },
        {
          text: '\ntextAlign: right',
          fill: true
        }
      ]
    })
  );

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

  addShapesToStage(stage, shapes as any, true);
  stage.render();

  (window as any).stage = stage;
};
