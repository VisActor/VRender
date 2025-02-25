import { ContainerModule, GraphicRender } from '@visactor/vrender-core';
import { DefaultCanvasCharacterRender } from './character-render';

let loadCharacterModule = false;
export const characterModule = new ContainerModule(bind => {
  if (loadCharacterModule) {
    return;
  }
  loadCharacterModule = true;
  // 角色渲染器
  bind(DefaultCanvasCharacterRender).toSelf().inSingletonScope();
  bind(GraphicRender).toService(DefaultCanvasCharacterRender);
});
