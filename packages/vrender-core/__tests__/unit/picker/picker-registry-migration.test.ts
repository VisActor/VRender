import type { EnvType, IGlobal, IGraphic, IGraphicPicker, IPickParams, PickResult } from '../../../src/interface';
import { Point, type IPointLike } from '@visactor/vutils';
import { PickerRegistry } from '../../../src/registry';
import { DefaultPickService } from '../../../src/picker/picker-service';

class RegistryBackedPickService extends DefaultPickService {
  configure(global: IGlobal, env: EnvType): void {
    return;
  }

  constructor(...args: any[]) {
    super(args[0], args[1], args[2] ?? {});
    this.reInit();
  }

  pickItem(graphic: IGraphic, point: IPointLike, parentMatrix: any, params: IPickParams): PickResult | null {
    const picker = this.selectPicker(graphic);
    if (!picker) {
      return null;
    }

    return picker.contains(graphic, point, params)
      ? {
          graphic
        }
      : null;
  }
}

function createGlobalStub(): IGlobal {
  return {
    env: 'browser',
    hooks: {
      onSetEnv: {
        tap: jest.fn(),
        unTap: jest.fn()
      }
    }
  } as unknown as IGlobal;
}

describe('picker registry migration', () => {
  test('DefaultPickService should initialize pickerMap from PickerRegistry', () => {
    const registry = new PickerRegistry();
    const picker: IGraphicPicker = {
      type: 'rect',
      numberType: 1,
      contains: jest.fn(() => true)
    };
    registry.register('rect', picker);
    const service = new RegistryBackedPickService(undefined, undefined, {
      pickerRegistry: registry,
      global: createGlobalStub()
    });
    const graphic = {
      numberType: 1,
      attribute: {},
      AABBBounds: {
        containsPoint: () => true
      }
    } as unknown as IGraphic;

    const result = service.containsPoint(graphic, new Point(1, 2), {
      bounds: { width: () => 10, height: () => 10 } as any
    });

    expect(service.pickerMap.get(1)).toBe(picker);
    expect(result).toBe(true);
    expect(picker.contains).toHaveBeenCalled();
  });

  test('DefaultPickService should refresh registry-backed pickers on reInit', () => {
    const registry = new PickerRegistry();
    const firstPicker: IGraphicPicker = {
      type: 'rect',
      numberType: 2,
      contains: jest.fn(() => true)
    };
    const secondPicker: IGraphicPicker = {
      type: 'circle',
      numberType: 3,
      contains: jest.fn(() => true)
    };
    registry.register('rect', firstPicker);

    const service = new RegistryBackedPickService(undefined, undefined, {
      pickerRegistry: registry,
      global: createGlobalStub()
    });

    registry.register('circle', secondPicker);
    service.reInit();

    expect(service.pickerMap.get(2)).toBe(firstPicker);
    expect(service.pickerMap.get(3)).toBe(secondPicker);
  });
});
