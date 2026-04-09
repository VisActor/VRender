import { createStage, vglobal } from '@visactor/vrender';

export function createAStage() {
  console.log(vglobal);
  const stage = createStage({});
  console.log(stage);
  // const stage = new Stage({
  //   width: 600,
  //   height: 600
  // });
}

createAStage();
