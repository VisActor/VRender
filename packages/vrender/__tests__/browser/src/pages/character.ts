import { createStage, createRect, IGraphic, container, createHumanCharacter } from '@visactor/vrender';
import { characterModule, characterCanvasPickModule } from '@visactor/vrender-kits';
import { addShapesToStage, colorPools } from '../utils';

container.load(characterModule);
container.load(characterCanvasPickModule);
const characterConfig = {
  name: 'SimpleCharacter',
  description: 'A simple character with basic parts'

  // 骨骼系统定义
  // skeleton: {
  //   joints: [
  //     {
  //       name: 'root',
  //       position: [0, 0],
  //       rotation: 0,
  //       scale: [1, 1]
  //     },
  //     {
  //       name: 'body',
  //       parent: 'root',
  //       position: [0, 50],
  //       rotation: 0
  //     }
  //     // ... 更多关节
  //   ]
  // },

  // // 默认姿势
  // defaultPose: {
  //   root: { position: [0, 0], rotation: 0 },
  //   body: { position: [0, 50], rotation: 0 }
  // },

  // // 部件定义
  // parts: [
  //   {
  //     name: 'body',
  //     jointName: 'body',
  //     graphic: {
  //       type: 'rect',
  //       attributes: {
  //         width: 40,
  //         height: 60,
  //         fill: 'blue'
  //       }
  //     },
  //     offset: {
  //       position: [-20, -30] // 居中对齐
  //     }
  //   }
  //   // ... 更多部件
  // ],

  // // 预定义姿势
  // poses: {
  //   stand: {
  //     root: { position: [0, 0], rotation: 0 },
  //     body: { position: [0, 50], rotation: 0 }
  //   },
  //   sit: {
  //     root: { position: [0, -20], rotation: 0 },
  //     body: { position: [0, 30], rotation: 45 }
  //   }
  // },

  // animations: {
  //   // 形变动画配置
  //   morphs: {
  //     mouth: {
  //       states: {
  //         closed: 'M0,0 L10,0 L10,2 L0,2 Z',
  //         speaking: 'M0,0 L10,0 L10,8 L0,8 Z',
  //         smile: 'M0,0 C2,0 8,0 10,0 C10,5 0,5 0,0 Z'
  //       },
  //       defaultState: 'closed'
  //     }
  //   },
  //   // 运动动画配置
  //   motions: {
  //     leftHand: {
  //       path: 'M0,0 C10,-10 20,-10 30,0',
  //       duration: 1000,
  //       loop: true,
  //       followPath: true
  //     }
  //   }
  // }
};

// container.load(roughModule);
export const page = () => {
  const graphics: IGraphic[] = [];

  const character = createHumanCharacter({
    characterDefinition: characterConfig,
    x: 100,
    y: 100,
    width: 200,
    height: 300
  });

  graphics.push(character);

  const stage = createStage({
    canvas: 'main',
    autoRender: true
  });

  console.log(character);

  graphics.forEach(g => {
    stage.defaultLayer.add(g);
  });

  stage.render();
};
