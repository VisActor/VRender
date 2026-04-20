import { vglobal } from '@visactor/vrender';
import { createBrowserPageStage } from '../page-stage';

export function createAStage() {
  console.log(vglobal);
  const stage = createBrowserPageStage({});
  console.log(stage);
  // const stage = new Stage({
  //   width: 600,
  //   height: 600
  // });
}

createAStage();
