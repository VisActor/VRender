import GUI from 'lil-gui';
import { degreeToRadian } from '@visactor/vutils';
import render from '../../util/render';
import { MarkPoint } from '../../../src/marker';

export function run() {
  console.log('MarkPoint');

  const guiObject = {
    name: 'MarkPoint',
    itemLineType: 'type-do',
    itemLineVisible: true,
    // itemType: 'text',
    itemPos: 'middle',
    itemOffsetX: 100,
    itemOffsetY: 30,
    itemAutoRotate: true,
    itemRefX: 10,
    itemRefY: 0,
    itemRefAngle: 0,
    decorativeLineVisible: false
  };

  const styleAttr = {
    itemLine: {
      type: guiObject.itemLineType,
      visible: guiObject.itemLineVisible,
      decorativeLineVisible: guiObject.decorativeLineVisible
    },
    itemContent: {
      offsetX: guiObject.itemOffsetX,
      offsetY: guiObject.itemOffsetY,
      refX: guiObject.itemRefX,
      refY: guiObject.itemRefY,
      refAngle: guiObject.itemRefAngle,
      textStyle: {
        text: 'mark point label text'
      },
      richTextStyle: {
        textConfig: [
          {
            text: 'Mapbox',
            fontWeight: 'bold',
            fontSize: 10,
            fill: '#3f51b5'
          },
          {
            text: '公司成立于2010年，创立目标是为Google Map提供一个',

            fontSize: 8
          },
          {
            text: '替代方案',
            fontStyle: 'italic',

            fill: '#3f51b5',
            fontSize: 8
          },
          {
            text: '。在当时，Google Map',

            fontSize: 8
          },
          {
            text: '地图',
            textDecoration: 'line-through',

            fontSize: 8
          },
          {
            text: '[1]',
            script: 'super',

            fontSize: 8
          },
          {
            text: '几乎垄断了所有线上地图业务，但是在Google Map中，几乎没有定制化的可能，也没有任何工具可以让制图者按照他们的设想来创建地图',

            fontSize: 8
          },
          {
            text: '。\n',

            fill: '#30ff05',
            fontSize: 8
          }
        ]
      },
      imageStyle: {
        image: `${window.location.origin}/__tests__/browser/sources/shape_logo.png`
      }
    },
    clipInRange: true,
    limitRect: {
      x: 50,
      y: 50,
      width: 200,
      height: 200
    }
  };

  const markPoint = new MarkPoint({
    position: {
      x: 100,
      y: 50
    },
    ...(styleAttr as any),
    itemContent: {
      ...styleAttr.itemContent,
      type: 'symbol'
    }
  });

  const markPoint2 = new MarkPoint({
    position: {
      x: 100,
      y: 150
    },
    ...(styleAttr as any),
    itemContent: {
      ...styleAttr.itemContent,
      type: 'text'
    }
  });

  const markPoint3 = new MarkPoint({
    position: {
      x: 100,
      y: 250
    },
    ...(styleAttr as any),
    itemContent: {
      ...styleAttr.itemContent,
      type: 'richText'
    }
  });

  const markPoint4 = new MarkPoint({
    position: {
      x: 100,
      y: 350
    },
    ...(styleAttr as any),
    itemContent: {
      ...styleAttr.itemContent,
      type: 'image'
    }
  });

  const markPoints = [markPoint, markPoint2, markPoint3, markPoint4];

  const stage = render(markPoints, 'main');

  // gui
  const gui = new GUI();
  gui.add(guiObject, 'name');
  gui
    .add(guiObject, 'itemPos', ['top', 'middle', 'bottom', 'insideTop', 'insideMiddle', 'insideBottom'])
    .onChange(value => {
      markPoints.forEach(markPoint =>
        markPoint.setAttribute('itemContent', {
          position: value
        })
      );
    });
  gui.add(guiObject, 'itemLineType', ['type-do', 'type-s', 'type-op', 'type-po']).onChange(value => {
    markPoints.forEach(markPoint =>
      markPoint.setAttribute('itemLine', {
        type: value
      })
    );
  });
  gui.add(guiObject, 'itemLineVisible').onChange(value => {
    markPoints.forEach(markPoint =>
      markPoint.setAttribute('itemLine', {
        visible: value
      })
    );
  });

  gui.add(guiObject, 'itemOffsetX').onChange(value => {
    markPoints.forEach(markPoint =>
      markPoint.setAttribute('itemContent', {
        offsetX: value
      })
    );
  });

  gui.add(guiObject, 'itemOffsetY').onChange(value => {
    markPoints.forEach(markPoint =>
      markPoint.setAttribute('itemContent', {
        offsetY: value
      })
    );
  });

  gui.add(guiObject, 'itemAutoRotate').onChange(value => {
    markPoints.forEach(markPoint =>
      markPoint.setAttribute('itemContent', {
        autoRotate: value
      })
    );
  });

  gui.add(guiObject, 'itemRefX').onChange(value => {
    markPoints.forEach(markPoint =>
      markPoint.setAttribute('itemContent', {
        refX: value
      })
    );
  });

  gui.add(guiObject, 'itemRefY').onChange(value => {
    markPoints.forEach(markPoint =>
      markPoint.setAttribute('itemContent', {
        refY: value
      })
    );
  });

  gui.add(guiObject, 'itemRefAngle').onChange(value => {
    markPoints.forEach(markPoint =>
      markPoint.setAttribute('itemContent', {
        refAngle: degreeToRadian(value)
      })
    );
  });

  gui.add(guiObject, 'decorativeLineVisible').onChange(value => {
    markPoints.forEach(markPoint =>
      markPoint.setAttribute('itemLine', {
        decorativeLine: {
          visible: value
        }
      })
    );
  });
}
