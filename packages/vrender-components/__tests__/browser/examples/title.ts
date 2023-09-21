import GUI from 'lil-gui';
import { createLine } from '@visactor/vrender-core';
import render from '../../util/render';
import { Title } from '../../../src';

export function run() {
  const guiObject = {
    text: '柱形图',
    subtext: `柱形图，又称长条图、柱状统计图、条图、条状图、棒形图，是一种以长方形的长度为变量的统计图表。长条图用来比较两个或以上的价值（不同时间或者不同条件），只有一个变量，通常利用于较小的数据集分析。长条图亦可横向排列，或用多维方式表达。`,
    align: 'left',
    verticalAlign: 'top'
  };

  const title = new Title({
    x: 0,
    y: 10,
    padding: 10,
    text: '柱形图',
    subtext: `柱形图，又称长条图、柱状统计图、条图、条状图、棒形图，是一种以长方形的长度为变量的统计图表。长条图用来比较两个或以上的价值（不同时间或者不同条件），只有一个变量，通常利用于较小的数据集分析。长条图亦可横向排列，或用多维方式表达。`,

    // text: 'Bar Chart',
    // subtext: 'A bar chart plots numeric values for levels of a categorical feature as bars.',
    align: 'left',
    verticalAlign: 'top',
    width: 480,
    maxWidth: 480,
    maxHeight: 190
    // subtextStyle: {
    //   lineClamp: 1
    // }
    // textStyle: {
    //   // character: [
    //   //   {
    //   //     text: '汉字测试',
    //   //     fontSize: 30,
    //   //     textAlign: 'center',
    //   //     textDecoration: 'underline',
    //   //
    //   //     stroke: '#0f51b5'
    //   //   }
    //   // ]
    // }
    // subtextStyle: {
    //   ellipsis: true,
    //   character: [
    //     {
    //       text: 'Mapbox',
    //       fontWeight: 'bold',
    //       fontSize: 30,
    //       fill: '#3f51b5',
    //
    //     },
    //     {
    //       text: '公司成立于2010年，创立目标是为Google Map提供一个',
    //
    //     },
    //     {
    //       text: '替代方案',
    //       fontStyle: 'italic',
    //
    //       fill: '#3f51b5'
    //     },
    //     {
    //       text: '。在当时，Google Map',
    //
    //     },
    //     {
    //       text: '地图',
    //       textDecoration: 'line-through',
    //
    //     },
    //     {
    //       text: '[1]',
    //       script: 'super',
    //
    //     },
    //     {
    //       // "lineHeight": 30,
    //       text: '几乎垄断了所有线上地图业务，但是在Google Map中，几乎没有定制化的可能，也没有任何工具可以让制图者按照他们的设想来创建地图',
    //
    //     },
    //     {
    //       // "lineHeight": 30,
    //       text: '。\n',
    //
    //       fill: '#30ff05'
    //     },
    //     {
    //       lineHeight: 30,
    //       text: 'Mapbox的成立旨在改变这种状况，为制图人员和开发人员提供工具来创建他们想要的地图。值得一提的是，目前Mapbox提供的制图工具几乎都是开源的。\nMapbox目前主要提供地理数据、渲染客户端和其他与地图相关的服务。Mapbox GL JS是他们的一个开源客户端库，用于渲染Web端的可交互地图。作为Mapbox生态系统的一部分，它通常与Mapbox提供的其他服务集成在一起，统一对外使用。',
    //
    //     },
    //     {
    //       text: '\n目前Mapbox公司的主营业务除了地图相关产品，还包括LBS(Location Based Services)服务、自动驾驶、自有数据(Boundaries, Traffic Data, Movement)以及车机服务。',
    //
    //     }
    //   ]
    // }
  });

  const stage = render(
    [
      title,
      createLine({
        points: [
          { x: 0, y: 10 },
          { x: 500, y: 10 }
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
          { x: 250, y: 200 }
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
      })
    ],
    'main'
  );

  console.log(title);

  // gui
  const gui = new GUI();
  gui.add(guiObject, 'text');
  gui.add(guiObject, 'subtext');
  gui.add(guiObject, 'align', ['left', 'center', 'right']).onChange(value => {
    title.setAttribute('align', value);
  });
  gui.add(guiObject, 'verticalAlign', ['top', 'middle', 'bottom']).onChange(value => {
    title.setAttribute('verticalAlign', value);
  });
}
