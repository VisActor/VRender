describe('picker/math-picker-service', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test('pickItem respects pickable and pickerMap', () => {
    jest.isolateModules(() => {
      jest.doMock('@visactor/vrender-core', () => ({
        ContributionProvider: {},
        inject: (): any => (): any => undefined,
        injectable: (): any => (t: any) => t,
        named: (): any => (): any => undefined,
        DefaultPickService: class DefaultPickService {
          constructor() {}
          // eslint-disable-next-line @typescript-eslint/naming-convention
          _init() {}
        },
        EmptyContext2d: class EmptyContext2d {
          constructor() {}
        },
        PickItemInterceptor: {},
        PickServiceInterceptor: {}
      }));

      jest.doMock('../../../src/picker/contributions/constants', () => ({
        MathPickerContribution: 'MathPickerContribution'
      }));

      const { DefaultMathPickerService } = require('../../../src/picker/math-picker-service');

      const service: any = Object.create(DefaultMathPickerService.prototype);
      service.pickerMap = new Map();

      const graphic: any = { attribute: { pickable: false }, numberType: 1 };
      expect(service.pickItem(graphic, { x: 0, y: 0 }, null, {})).toBeNull();

      graphic.attribute.pickable = true;
      expect(service.pickItem(graphic, { x: 0, y: 0 }, null, {})).toBeNull();

      const picker = { contains: jest.fn(() => true) };
      service.pickerMap.set(1, picker);
      const res = service.pickItem(graphic, { x: 1, y: 2 }, null, { pickContext: {} } as any);
      expect(res).toEqual({ graphic, params: true });

      picker.contains.mockReturnValueOnce(false);
      expect(service.pickItem(graphic, { x: 1, y: 2 }, null, { pickContext: {} } as any)).toBeNull();
    });
  });
});
