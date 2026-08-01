import { InteractiveDrawItemInterceptorContribution } from '../../../src/render/contributions/render/draw-interceptor';
import { createCircle } from '../../../src/graphic/circle';
import { createGroup } from '../../../src/graphic/group';

/**
 * 交互层只需要一个能收下克隆的 shadowRoot，这里直接给现成的，
 * 免得为了走通 attachShadow 再搭一套 application 环境。
 */
function createDrawContextStub() {
  const hoisted: any[] = [];
  const interactiveGroup = {
    id: '_interactive_group',
    shadowRoot: {
      add: (child: any): void => {
        hoisted.push(child);
      },
      removeChild: (child: any): void => {
        const index = hoisted.indexOf(child);
        if (index >= 0) {
          hoisted.splice(index, 1);
        }
      }
    }
  };
  const interactiveLayer = {
    getElementById: (id: string): any => (id === '_interactive_group' ? interactiveGroup : undefined),
    add: (): void => undefined
  };
  return {
    hoisted,
    drawContext: {
      stage: {
        tryInitInteractiveLayer: (): void => undefined,
        getLayer: (name: string): any => (name === '_builtin_interactive' ? interactiveLayer : undefined)
      }
    }
  };
}

function expectSamePlacement(actual: any, expected: any) {
  expect(actual.a).toBeCloseTo(expected.a);
  expect(actual.b).toBeCloseTo(expected.b);
  expect(actual.c).toBeCloseTo(expected.c);
  expect(actual.d).toBeCloseTo(expected.d);
  expect(actual.e).toBeCloseTo(expected.e);
  expect(actual.f).toBeCloseTo(expected.f);
}

describe('interactive graphic bounds', () => {
  test('keeps the hoisted clone aligned with the source graphic under a transformed parent', () => {
    const parent = createGroup({ x: 100, y: 80 });
    const circle = createCircle({ x: 150, y: 100, radius: 12, globalZIndex: 100 });
    parent.add(circle);

    const { hoisted, drawContext } = createDrawContextStub();
    const handled = new InteractiveDrawItemInterceptorContribution().beforeSetInteractive(
      circle as any,
      {} as any,
      drawContext as any,
      {} as any
    );

    expect(handled).toBe(true);
    expect(hoisted).toHaveLength(1);

    // 克隆是绘制层级的占位，拾取的包围盒预筛读的也是它，所以必须和原图元落在同一处
    expectSamePlacement(circle.interactiveGraphic.globalTransMatrix, circle.globalTransMatrix);
  });

  test('leaves the clone untouched when the source graphic has no parent', () => {
    const circle = createCircle({ x: 150, y: 100, radius: 12, globalZIndex: 100 });

    const { drawContext } = createDrawContextStub();
    new InteractiveDrawItemInterceptorContribution().beforeSetInteractive(
      circle as any,
      {} as any,
      drawContext as any,
      {} as any
    );

    expect(circle.interactiveGraphic.attribute.postMatrix).toBeUndefined();
    expectSamePlacement(circle.interactiveGraphic.globalTransMatrix, circle.globalTransMatrix);
  });
});
