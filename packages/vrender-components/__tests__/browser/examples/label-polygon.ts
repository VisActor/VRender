import { PolygonLabel } from './../../../src/label/polygon';
import { ILine, ISymbol, Stage, Symbol } from '@visactor/vrender-core';
import { createRenderer, _add } from '../../util/render';
import { LineLabel, SymbolLabel } from '../../../src';

const spec: any = {
  attribute: {
    x: 0,
    y: 0,
    width: 1094,
    height: 500,
    pickable: true,
    zIndex: 0
  },
  id: 198,
  type: 'group',
  name: 'root',
  children: [
    {
      attribute: {
        visible: true,
        clip: false,
        x: 12,
        y: 12,
        width: 817.5,
        height: 452,
        sizeAttrs: {
          x: 12,
          y: 12,
          width: 817.5,
          height: 452
        },
        pickable: false,
        zIndex: 450
      },
      _uid: 4299,
      type: 'group',
      name: 'regionGroup_1468',
      children: [
        {
          attribute: {
            visible: true,
            x: 0,
            y: 0,
            clip: false,
            sizeAttrs: {
              x: 0,
              y: 0
            },
            pickable: false,
            zIndex: 0
          },
          _uid: 4300,
          type: 'group',
          name: 'seriesGroup_funnel_1469_1472',
          children: [
            {
              attribute: {
                pickable: false,
                zIndex: 300
              },
              _uid: 4301,
              type: 'group',
              name: 'funnel_1473',
              children: [
                {
                  attribute: {
                    x: 0,
                    y: 0,
                    lineWidth: 0,
                    visible: true,
                    points: [
                      {
                        x: 81.75,
                        y: 0
                      },
                      {
                        x: 735.75,
                        y: 0
                      },
                      {
                        x: 670.35,
                        y: 90.4
                      },
                      {
                        x: 147.14999999999998,
                        y: 90.4
                      }
                    ],
                    fill: '#1664FF',
                    stroke: '#1664FF',
                    pickable: true
                  },
                  _uid: 4302,
                  type: 'polygon',
                  children: []
                },
                {
                  attribute: {
                    x: 0,
                    y: 0,
                    lineWidth: 0,
                    visible: true,
                    points: [
                      {
                        x: 147.14999999999998,
                        y: 90.40000000000002
                      },
                      {
                        x: 670.35,
                        y: 90.40000000000002
                      },
                      {
                        x: 604.95,
                        y: 180.8
                      },
                      {
                        x: 212.55,
                        y: 180.8
                      }
                    ],
                    fill: '#1AC6FF',
                    stroke: '#1AC6FF',
                    pickable: true
                  },
                  _uid: 4303,
                  type: 'polygon',
                  children: []
                },
                {
                  attribute: {
                    x: 0,
                    y: 0,
                    lineWidth: 0,
                    visible: true,
                    points: [
                      {
                        x: 212.55,
                        y: 180.8
                      },
                      {
                        x: 604.95,
                        y: 180.8
                      },
                      {
                        x: 539.55,
                        y: 271.2
                      },
                      {
                        x: 277.95,
                        y: 271.2
                      }
                    ],
                    fill: '#FF8A00',
                    stroke: '#FF8A00',
                    pickable: true
                  },
                  _uid: 4304,
                  type: 'polygon',
                  children: []
                },
                {
                  attribute: {
                    x: 0,
                    y: 0,
                    lineWidth: 0,
                    visible: true,
                    points: [
                      {
                        x: 277.95,
                        y: 271.20000000000005
                      },
                      {
                        x: 539.55,
                        y: 271.20000000000005
                      },
                      {
                        x: 474.15,
                        y: 361.6
                      },
                      {
                        x: 343.35,
                        y: 361.6
                      }
                    ],
                    fill: '#3CC780',
                    stroke: '#3CC780',
                    pickable: true
                  },
                  _uid: 4305,
                  type: 'polygon',
                  children: []
                },
                {
                  attribute: {
                    x: 0,
                    y: 0,
                    lineWidth: 0,
                    visible: true,
                    points: [
                      {
                        x: 343.35,
                        y: 361.6
                      },
                      {
                        x: 474.15,
                        y: 361.6
                      },
                      {
                        x: 408.75,
                        y: 452
                      },
                      {
                        x: 408.75,
                        y: 452
                      }
                    ],
                    fill: '#7442D4',
                    stroke: '#7442D4',
                    pickable: true
                  },
                  _uid: 4306,
                  type: 'polygon',
                  children: []
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};

const labelData = [
  {
    visible: true,
    angle: 0,
    textAlign: 'center',
    lineWidth: 2,
    fontSize: 14,
    fontWeight: 'normal',
    fillOpacity: 1,
    fill: 'white',
    textBaseline: 'middle',
    x: 408.75,
    y: 45.2,
    text: 'Step1 100',
    limit: 654,
    stroke: '#1664FF',
    limitAttrs: {
      text: 'Step1 100',
      limit: 654
    },
    maxLineWidth: 654,
    pickable: true,
    opacity: 1,
    strokeOpacity: 1
  },
  {
    visible: true,
    angle: 0,
    textAlign: 'center',
    lineWidth: 2,
    fontSize: 14,
    fontWeight: 'normal',
    fillOpacity: 1,
    fill: 'white',
    textBaseline: 'middle',
    x: 408.75000000000006,
    y: 135.60000000000002,
    text: 'Step2 80',
    limit: 654,
    stroke: '#1AC6FF',
    limitAttrs: {
      text: 'Step2 80',
      limit: 654
    },
    maxLineWidth: 654,
    pickable: true,
    opacity: 1,
    strokeOpacity: 1
  },
  {
    visible: true,
    angle: 0,
    textAlign: 'center',
    lineWidth: 2,
    fontSize: 14,
    fontWeight: 'normal',
    fillOpacity: 1,
    fill: 'white',
    textBaseline: 'middle',
    x: 408.75,
    y: 226,
    text: 'Step3 60',
    limit: 654,
    stroke: '#FF8A00',
    limitAttrs: {
      text: 'Step3 60',
      limit: 654
    },
    maxLineWidth: 654,
    pickable: true,
    opacity: 1,
    strokeOpacity: 1
  },
  {
    visible: true,
    angle: 0,
    textAlign: 'center',
    lineWidth: 2,
    fontSize: 14,
    fontWeight: 'normal',
    fillOpacity: 1,
    fill: 'white',
    textBaseline: 'middle',
    x: 408.75,
    y: 316.40000000000003,
    text: 'Step4 40',
    limit: 654,
    stroke: '#3CC780',
    limitAttrs: {
      text: 'Step4 40',
      limit: 654
    },
    maxLineWidth: 654,
    pickable: true,
    opacity: 1,
    strokeOpacity: 1
  },
  {
    visible: true,
    angle: 0,
    textAlign: 'center',
    lineWidth: 2,
    fontSize: 14,
    fontWeight: 'normal',
    fillOpacity: 1,
    fill: 'white',
    textBaseline: 'middle',
    x: 408.75,
    y: 406.8,
    text: 'Step5 20',
    limit: 654,
    stroke: '#7442D4',
    limitAttrs: {
      text: 'Step5 20',
      limit: 654
    },
    maxLineWidth: 654,
    pickable: true,
    opacity: 1,
    strokeOpacity: 1
  }
];

function createContent(stage: Stage) {
  const rootGroup = _add(stage.defaultLayer, spec);
  const polygonGraphic = stage.defaultLayer.findAll(node => node.type === 'polygon', true) as ISymbol[];
  const label = new PolygonLabel({
    type: 'polygon',
    baseMarkGroupName: 'funnel_1473',
    data: labelData,
    overlap: {
      size: {
        width: 817.5,
        height: 452
      }
    }
  });
  label.setLocation({ x: 12, y: 12 });
  stage.defaultLayer.add(label);

  return { symbol: rootGroup };
}

const stage = createRenderer('main', {
  width: 1094,
  height: 500,
  viewBox: {
    x1: 0,
    y1: 0,
    x2: 1094,
    y2: 500
  }
});
createContent(stage);
stage.render();
