import { createStage, createArea, container, IGraphic, global } from '@visactor/vrender';
import { addShapesToStage, colorPools } from '../utils';

const subP1 = [
  [0, 100],
  [20, 40],
  [40, 60],
  [60, 20],
  [70, 30]
].map(item => ({ x: item[0], y: item[1], y1: 120, defined: item[0] !== 20 }));

const subP2 = [
  [80, 80],
  [120, 60],
  [160, 40],
  [200, 20],
  [240, 50]
].map(item => ({ x: item[0], y1: 120, y: item[1] }));

const points = [
  [0, 100],
  [20, 40],
  [40, 60],
  [60, 20],
  [70, 30],
  [80, 80],
  [120, 60],
  [160, 40],
  [200, 20],
  [240, 50]
].map(item => ({ x: item[0], y: item[1], y1: 120, defined: item[0] !== 40 && item[0] !== 70 }));

export const page = () => {
  const graphics: IGraphic[] = [];
  ['linear'].forEach((type, i) => {
    graphics.push(
      createArea({
        x1: 0,
        y1: 0,
        points: [
          {
            x: 301.00000000000006,
            y: 161.7421686746988,
            x1: 301,
            y1: 186.7289156626506,
            context: 'Jan._B_0'
          },
          {
            x: 335.30769230769226,
            y: 163.57733383263698,
            x1: 321.9276923076923,
            y1: 186.75217363790856,
            context: 'Feb._B_0'
          },
          {
            x: 386.3031337513188,
            y: 173.75021276595746,
            x1: 346.36351621457413,
            y1: 196.80936170212766,
            context: 'Mar._B_0'
          },
          {
            x: 387.7891891891892,
            y: 223,
            x1: 352.5310810810811,
            y1: 223,
            context: 'Apr._B_0'
          },
          {
            x: 370.27261898314873,
            y: 262.99456521739125,
            x1: 329.9685497565895,
            y1: 239.725,
            context: 'May._B_0'
          },
          {
            x: 327.48125,
            y: 268.8668704479333,
            x1: 317.725,
            y1: 251.96854975658945,
            context: 'Jun._B_0'
          },
          {
            x: 301,
            y: 294.2035087719298,
            x1: 301,
            y1: 248.82105263157894,
            context: 'Jul._B_0'
          },
          {
            x: 256.7279411764706,
            y: 299.68145523803094,
            x1: 280.339705882353,
            y1: 258.7846791110811,
            context: 'Aug._B_0'
          },
          {
            x: 233.29822079358865,
            y: 262.08764044943825,
            x1: 263.8942171657169,
            y1: 244.4230337078652,
            context: 'Sep._B_0'
          },
          {
            x: 231.79310344827587,
            y: 223,
            x1: 260.2448275862069,
            y1: 223,
            context: 'Oct._B_0'
          },
          {
            x: 229.94956520606036,
            y: 181.97901234567905,
            x1: 268.0974496591823,
            y1: 204.00370370370374,
            context: 'Nov._B_0'
          },
          {
            x: 245.33138686131375,
            y: 126.57913365689937,
            x1: 281.4671532846715,
            y1: 189.16811707259626,
            context: 'Dec._B_0'
          }
        ],
        segments: null,
        visible: true,
        lineWidth: 0,
        fillOpacity: 0.2,
        fill: '#1AC6FF',
        closePath: true,
        // curveType: 'linearClosed',
        stroke: '#1AC6FF',
        x: 0,
        y: 0,
        pickable: true
      })
    );
  });

  // ['linear', 'step', 'stepBefore', 'stepAfter', 'basis', 'monotoneX', 'monotoneY'].forEach((type, i) => {
  //   i += 7;
  //   graphics.push(
  //     createArea({
  //       points,
  //       curveType: type as any,
  //       x: ((i * 300) % 900) + 100,
  //       y: Math.floor((i * 300) / 900) * 200,
  //       segments: [
  //         {
  //           points: subP1,
  //           fill: colorPools[3],
  //           stroke: ['red', false],
  //           lineWidth: 10,
  //           connectedType: 'connect',
  //           connectedStyle: {
  //             fill: 'grey'
  //           }
  //         },
  //         {
  //           points: subP2,
  //           stroke: ['red', false],
  //           fill: colorPools[2],
  //           texture: 'bias-rl',
  //           textureColor: 'grey'
  //         }
  //       ],
  //       connectedType: 'connect',
  //       fill: true,
  //       stroke: true
  //     })
  //   );
  // });

  // graphics.forEach(item => {
  //   item.animate().to({ clipRange: 0 }, 0, 'linear').to({ clipRange: 1 }, 10000, 'linear');
  // });

  const stage = createStage({
    canvas: document.getElementById('main'),
    autoRender: true
  });

  graphics.forEach(g => {
    stage.defaultLayer.add(g);
  });
};
