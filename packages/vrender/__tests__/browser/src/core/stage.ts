import { vglobal } from '@visactor/vrender';
import { createBrowserAppStage } from '../app-stage';

export function createAStage() {
  console.log(vglobal);
  const stage = createBrowserAppStage({});
  console.log(stage);
  // const stage = new Stage({
  //   width: 600,
  //   height: 600
  // });
}

createAStage();
