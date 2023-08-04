import { GUI } from 'lil-gui';
import { createGroup, Stage, createArc } from '@visactor/vrender';
import { createRenderer } from '../../util/render';
import { ArcLabel } from '../../../src';

const pieGenerator = () => {
  const spec: any = {
    attribute: {
      width: 800,
      height: 500,
      pickable: false,
      zIndex: 300
    },
    _uid: 14,
    type: 'group',
    name: 'pie_9',
    children: [
      {
        attribute: {
          fill: '#1f77b4',
          x: 100,
          y: 100,
          startAngle: 0,
          endAngle: 1.0927278795094932,
          innerRadius: 0,
          outerRadius: 80,
          fillOpacity: 1
        },
        _uid: 52,
        type: 'arc',
        children: []
      },
      {
        attribute: {
          fill: '#aec7e8',
          x: 100,
          y: 100,
          startAngle: 1.0927278795094932,
          endAngle: 2.731819698773733,
          innerRadius: 0,
          outerRadius: 80,
          fillOpacity: 1
        },
        _uid: 53,
        type: 'arc',
        children: []
      },
      {
        attribute: {
          fill: '#ff7f0e',
          x: 100,
          y: 100,
          startAngle: 2.731819698773733,
          endAngle: 5.463639397547466,
          innerRadius: 0,
          outerRadius: 80,
          fillOpacity: 1
        },
        _uid: 54,
        type: 'arc',
        children: []
      },
      {
        attribute: {
          fill: '#ffbb78',
          x: 100,
          y: 100,
          startAngle: 5.463639397547466,
          endAngle: 6.283185307179586,
          innerRadius: 0,
          outerRadius: 80,
          fillOpacity: 1
        },
        _uid: 55,
        type: 'arc',
        children: []
      }
    ]
    // children: [
    //   {
    //     attribute: {
    //       visible: true,
    //       lineWidth: 0,
    //       fillOpacity: 1,
    //       padAngle: 0,
    //       x: 388,
    //       y: 238,
    //       startAngle: -1.5707963267948966,
    //       endAngle: 1.357168026350791,
    //       outerRadius: 190.4,
    //       innerRadius: 0,
    //       cornerRadius: 0,
    //       fill: '#1664FF',
    //       stroke: '#1664FF',
    //       pickable: true
    //     },
    //     _uid: 15,
    //     type: 'arc',
    //     children: []
    //   },
    //   {
    //     attribute: {
    //       visible: true,
    //       lineWidth: 0,
    //       fillOpacity: 1,
    //       padAngle: 0,
    //       x: 388,
    //       y: 238,
    //       startAngle: 1.357168026350791,
    //       endAngle: 3.0988669935009723,
    //       outerRadius: 190.4,
    //       innerRadius: 0,
    //       cornerRadius: 0,
    //       fill: '#1AC6FF',
    //       stroke: '#1AC6FF',
    //       pickable: true
    //     },
    //     _uid: 16,
    //     type: 'arc',
    //     children: []
    //   },
    //   {
    //     attribute: {
    //       visible: true,
    //       lineWidth: 0,
    //       fillOpacity: 1,
    //       padAngle: 0,
    //       x: 388,
    //       y: 238,
    //       startAngle: 3.0988669935009723,
    //       endAngle: 3.609689958974673,
    //       outerRadius: 190.4,
    //       innerRadius: 0,
    //       cornerRadius: 0,
    //       fill: '#FF8A00',
    //       stroke: '#FF8A00',
    //       pickable: true
    //     },
    //     _uid: 17,
    //     type: 'arc',
    //     children: []
    //   },
    //   {
    //     attribute: {
    //       visible: true,
    //       lineWidth: 0,
    //       fillOpacity: 1,
    //       padAngle: 0,
    //       x: 388,
    //       y: 238,
    //       startAngle: 3.609689958974673,
    //       endAngle: 3.9238492243336522,
    //       outerRadius: 190.4,
    //       innerRadius: 0,
    //       cornerRadius: 0,
    //       fill: '#3CC780',
    //       stroke: '#3CC780',
    //       pickable: true
    //     },
    //     _uid: 18,
    //     type: 'arc',
    //     children: []
    //   },
    //   {
    //     attribute: {
    //       visible: true,
    //       lineWidth: 0,
    //       fillOpacity: 1,
    //       padAngle: 0,
    //       x: 388,
    //       y: 238,
    //       startAngle: 3.9238492243336522,
    //       endAngle: 4.151928850984271,
    //       outerRadius: 190.4,
    //       innerRadius: 0,
    //       cornerRadius: 0,
    //       fill: '#7442D4',
    //       stroke: '#7442D4',
    //       pickable: true
    //     },
    //     _uid: 19,
    //     type: 'arc',
    //     children: []
    //   },
    //   {
    //     attribute: {
    //       visible: true,
    //       lineWidth: 0,
    //       fillOpacity: 1,
    //       padAngle: 0,
    //       x: 388,
    //       y: 238,
    //       startAngle: 4.151928850984271,
    //       endAngle: 4.329742995177454,
    //       outerRadius: 190.4,
    //       innerRadius: 0,
    //       cornerRadius: 0,
    //       fill: '#FFC400',
    //       stroke: '#FFC400',
    //       pickable: true
    //     },
    //     _uid: 20,
    //     type: 'arc',
    //     children: []
    //   },
    //   {
    //     attribute: {
    //       visible: true,
    //       lineWidth: 0,
    //       fillOpacity: 1,
    //       padAngle: 0,
    //       x: 388,
    //       y: 238,
    //       startAngle: 4.329742995177454,
    //       endAngle: 4.492477494633405,
    //       outerRadius: 190.4,
    //       innerRadius: 0,
    //       cornerRadius: 0,
    //       fill: '#304D77',
    //       stroke: '#304D77',
    //       pickable: true
    //     },
    //     _uid: 21,
    //     type: 'arc',
    //     children: []
    //   },
    //   {
    //     attribute: {
    //       visible: true,
    //       lineWidth: 0,
    //       fillOpacity: 1,
    //       padAngle: 0,
    //       x: 388,
    //       y: 238,
    //       startAngle: 4.492477494633405,
    //       endAngle: 4.71238898038469,
    //       outerRadius: 190.4,
    //       innerRadius: 0,
    //       cornerRadius: 0,
    //       fill: '#B48DEB',
    //       stroke: '#B48DEB',
    //       pickable: true
    //     },
    //     _uid: 22,
    //     type: 'arc',
    //     children: []
    //   }
    // ]
  };
  return spec;
};

const latestData = [
  {
    type: 'oxygen',
    value: '46.60'
    // __VCHART_DEFAULT_DATA_INDEX: 0,
    // __VCHART_DEFAULT_DATA_KEY: 'oxygen_oxygen_0',
    // __VCHART_ARC_RATIO: 0.4660000000000001,
    // __VCHART_ARC_START_ANGLE: -1.5707963267948966,
    // __VCHART_ARC_END_ANGLE: 1.357168026350791,
    // __VCHART_ARC_MIDDLE_ANGLE: -0.10681415022205276,
    // __VCHART_ARC_RADIAN: 2.9279643531456876,
    // __VCHART_ARC_QUADRANT: 1,
    // __VCHART_ARC_K: 1,
    // VGRAMMAR_DATA_ID_KEY_16: 0
  },
  {
    type: 'silicon',
    value: '27.72',
    __VCHART_DEFAULT_DATA_INDEX: 1,
    __VCHART_DEFAULT_DATA_KEY: 'silicon_silicon_0',
    __VCHART_ARC_RATIO: 0.2772,
    __VCHART_ARC_START_ANGLE: 1.357168026350791,
    __VCHART_ARC_END_ANGLE: 3.0988669935009723,
    __VCHART_ARC_MIDDLE_ANGLE: 2.2280175099258814,
    __VCHART_ARC_RADIAN: 1.7416989671501812,
    __VCHART_ARC_QUADRANT: 3,
    __VCHART_ARC_K: 0.5948497854077253,
    VGRAMMAR_DATA_ID_KEY_16: 1
  },
  {
    type: 'aluminum',
    value: '8.13',
    __VCHART_DEFAULT_DATA_INDEX: 2,
    __VCHART_DEFAULT_DATA_KEY: 'aluminum_aluminum_0',
    __VCHART_ARC_RATIO: 0.08130000000000003,
    __VCHART_ARC_START_ANGLE: 3.0988669935009723,
    __VCHART_ARC_END_ANGLE: 3.609689958974673,
    __VCHART_ARC_MIDDLE_ANGLE: 3.3542784762378224,
    __VCHART_ARC_RADIAN: 0.5108229654737005,
    __VCHART_ARC_QUADRANT: 4,
    __VCHART_ARC_K: 0.17446351931330473,
    VGRAMMAR_DATA_ID_KEY_16: 2
  },
  {
    type: 'iron',
    value: '5',
    __VCHART_DEFAULT_DATA_INDEX: 3,
    __VCHART_DEFAULT_DATA_KEY: 'iron_iron_0',
    __VCHART_ARC_RATIO: 0.05000000000000001,
    __VCHART_ARC_START_ANGLE: 3.609689958974673,
    __VCHART_ARC_END_ANGLE: 3.9238492243336522,
    __VCHART_ARC_MIDDLE_ANGLE: 3.7667695916541626,
    __VCHART_ARC_RADIAN: 0.31415926535897937,
    __VCHART_ARC_QUADRANT: 4,
    __VCHART_ARC_K: 0.1072961373390558,
    VGRAMMAR_DATA_ID_KEY_16: 3
  },
  {
    type: 'calcium',
    value: '3.63',
    __VCHART_DEFAULT_DATA_INDEX: 4,
    __VCHART_DEFAULT_DATA_KEY: 'calcium_calcium_0',
    __VCHART_ARC_RATIO: 0.036300000000000006,
    __VCHART_ARC_START_ANGLE: 3.9238492243336522,
    __VCHART_ARC_END_ANGLE: 4.151928850984271,
    __VCHART_ARC_MIDDLE_ANGLE: 4.037889037658962,
    __VCHART_ARC_RADIAN: 0.228079626650619,
    __VCHART_ARC_QUADRANT: 4,
    __VCHART_ARC_K: 0.0778969957081545,
    VGRAMMAR_DATA_ID_KEY_16: 4
  },
  {
    type: 'sodium',
    value: '2.83',
    __VCHART_DEFAULT_DATA_INDEX: 5,
    __VCHART_DEFAULT_DATA_KEY: 'sodium_sodium_0',
    __VCHART_ARC_RATIO: 0.028300000000000006,
    __VCHART_ARC_START_ANGLE: 4.151928850984271,
    __VCHART_ARC_END_ANGLE: 4.329742995177454,
    __VCHART_ARC_MIDDLE_ANGLE: 4.240835923080862,
    __VCHART_ARC_RADIAN: 0.17781414419318234,
    __VCHART_ARC_QUADRANT: 4,
    __VCHART_ARC_K: 0.06072961373390558,
    VGRAMMAR_DATA_ID_KEY_16: 5
  },
  {
    type: 'potassium',
    value: '2.59',
    __VCHART_DEFAULT_DATA_INDEX: 6,
    __VCHART_DEFAULT_DATA_KEY: 'potassium_potassium_0',
    __VCHART_ARC_RATIO: 0.025900000000000003,
    __VCHART_ARC_START_ANGLE: 4.329742995177454,
    __VCHART_ARC_END_ANGLE: 4.492477494633405,
    __VCHART_ARC_MIDDLE_ANGLE: 4.411110244905429,
    __VCHART_ARC_RADIAN: 0.1627344994559513,
    __VCHART_ARC_QUADRANT: 4,
    __VCHART_ARC_K: 0.055579399141630896,
    VGRAMMAR_DATA_ID_KEY_16: 6
  },
  {
    type: 'others',
    value: '3.5',
    __VCHART_DEFAULT_DATA_INDEX: 7,
    __VCHART_DEFAULT_DATA_KEY: 'others_others_0',
    __VCHART_ARC_RATIO: 0.035,
    __VCHART_ARC_START_ANGLE: 4.492477494633405,
    __VCHART_ARC_END_ANGLE: 4.71238898038469,
    __VCHART_ARC_MIDDLE_ANGLE: 4.602433237509048,
    __VCHART_ARC_RADIAN: 0.21991148575128555,
    __VCHART_ARC_QUADRANT: 4,
    __VCHART_ARC_K: 0.07510729613733905,
    VGRAMMAR_DATA_ID_KEY_16: 7
  }
];

function createContent(stage: Stage) {
  const pieSpec = pieGenerator();
  const pieGroup = createGroup(pieSpec.attribute);
  pieGroup.name = pieSpec.name;
  pieGroup.id = pieSpec._uid;
  stage.defaultLayer.add(pieGroup);
  pieSpec.children.forEach(c => {
    pieGroup.add(createArc(c.attribute));
  });

  const pieLabel = new ArcLabel({
    baseMarkGroupName: pieSpec.name,
    data: pieSpec.children.map((c, index) => {
      return {
        // text: latestData[index].type,
        text: c._uid
        // fill: c.attribute.fill,
        // line: {
        //   stroke: c.attribute.stroke
        // },
        // lineWidth: 0
        // ...latestData[index]
      };
    }),
    type: 'arc',
    width: 800,
    height: 500,
    position: 'outside',
    // position: 'inside',

    // coverEnable: false,
    // layout: {
    //   strategy: 'none'
    // },

    // angle: 0,
    zIndex: 302
  });

  stage.defaultLayer.add(pieLabel);

  return { pie: pieGroup, label: pieLabel };
}

const stage = createRenderer('main', {
  width: 800,
  height: 500,
  viewBox: {
    x1: 0,
    y1: 0,
    x2: 800,
    y2: 500
  }
});
const { pie, label } = createContent(stage);
stage.render();
// gui
const gui = new GUI();
const guiObject = {
  name: 'Label',
  position: 'outside',
  baseMarkVisible: true,
  shapeCount: 100,
  overlap: true,
  debug() {
    label.render();
  }
};

gui.add(guiObject, 'name');
gui.add(guiObject, 'position', ['outside', 'inside']);
gui.add(guiObject, 'baseMarkVisible').onChange(value => {
  pie.forEachChildren(s => s.setAttribute('visible', !!value));
});
gui.add(guiObject, 'overlap').onChange(value => {
  label.setAttribute('overlap', {
    enable: value
  });
});

gui.add(guiObject, 'debug');
