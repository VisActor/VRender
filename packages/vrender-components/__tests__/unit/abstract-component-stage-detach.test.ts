import type { IGroupGraphicAttribute, Stage } from '@visactor/vrender-core';
import { AbstractComponent } from '../../src/core/base';
import { createCanvas } from '../util/dom';
import { createTestStage } from '../util/vrender';

class ProbeComponent extends AbstractComponent<IGroupGraphicAttribute> {
  renderCount = 0;
  bindCount = 0;

  protected render(): void {
    this.renderCount += 1;
  }

  protected bindEvents(): void {
    this.bindCount += 1;
  }
}

describe('AbstractComponent detach behavior', () => {
  let stage: Stage;

  beforeAll(() => {
    createCanvas(document.body, 'main');
    stage = createTestStage('main');
  });

  afterAll(() => {
    stage.release();
  });

  test('removeChild should not rerender component on detach', () => {
    const component = new ProbeComponent({});

    stage.defaultLayer.add(component as any);

    expect(component.renderCount).toBe(1);
    expect(component.bindCount).toBe(1);

    stage.defaultLayer.removeChild(component as any);

    expect(component.stage).toBeNull();
    expect(component.renderCount).toBe(1);
    expect(component.bindCount).toBe(1);
  });
});
