import { createStage, container } from '@visactor/vrender';

export function createAStage() {
  console.log(container.get(Symbol.for('Global')));
  const stage = createStage({});
  console.log(stage);
  // const stage = new Stage({
  //   width: 600,
  //   height: 600
  // });
}

createAStage();
