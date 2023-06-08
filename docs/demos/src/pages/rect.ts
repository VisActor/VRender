import { createStage, createRect, IGraphic } from '@visactor/vrender';
import { roughModule } from '@visactor/vrender-kits';
import { addShapesToStage, colorPools } from '../utils';

// container.load(roughModule);
export const page = () => {
  const graphics: IGraphic[] = [];
  graphics.push(createRect({
    x: 100,
    y: 100,
    width: 20,
    height: 100,
    fillColor: colorPools[10],
    strokeColor: colorPools[0],
    stroke: [true, true, true, true],
    borderRadius: 10,
    lineWidth: 5
  }));

  graphics.push(createRect({
    x: 300,
    y: 100,
    width: 100,
    height: 100,
    fillColor: colorPools[10],
    borderRadius: [5, 10, 15, 20],
    lineWidth: 5
  }));

  graphics.push(createRect({
    x: 300,
    y: 300,
    width: 100,
    height: 100,
    background:
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAklEQVR4AewaftIAAACiSURBVMXBsQmDUABF0evLrwISy2yQ1g3UzpHcyBXs9HeCE2SJgEhq0waxEBTeOckEK0bCTJgJM2EW2PGoa9Ki4EpLjMxdx1ZgR1oUPJuGq81dx5YwE2bCLHDSMgxs3fOcW5ZxROCkd1Wx9ep70rLkCGEmzISZMBNmwkyYCTNhJsyEmTATZsIssGOJkTM+bct3HPm3xMieZIIVI2EmzISZMPsBPLUeCZWhvyQAAAAASUVORK5CYII=',
    borderRadius: 100,
    lineWidth: 5
  }));

  const stage = createStage({
    canvas: 'main',
    autoRender: true
  });

  graphics.forEach(g => {
    stage.defaultLayer.add(g);
  })
};
