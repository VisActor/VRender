describe('picker/canvas-picker-service', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test('pickItem handles pickable, interceptors, and missing picker', () => {
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
        DrawContribution: {},
        PickItemInterceptor: {},
        PickServiceInterceptor: {},
        canvasAllocate: {
          shareCanvas: () => ({
            getContext: () => ({})
          })
        },
        application: {
          global: {
            hooks: {
              onSetEnv: { tap: (): void => undefined }
            },
            env: 'node'
          }
        }
      }));

      jest.doMock('../../../src/picker/contributions/constants', () => ({
        CanvasArcPicker: 1,
        CanvasAreaPicker: 2,
        CanvasCirclePicker: 3,
        CanvasImagePicker: 4,
        CanvasLinePicker: 5,
        CanvasPathPicker: 6,
        CanvasPickerContribution: 'CanvasPickerContribution',
        CanvasPolygonPicker: 7,
        CanvasRectPicker: 8,
        CanvasSymbolPicker: 9,
        CanvasTextPicker: 10,
        CanvasRichTextPicker: 11
      }));

      const { DefaultCanvasPickerService } = require('../../../src/picker/canvas-picker-service');

      const service: any = Object.create(DefaultCanvasPickerService.prototype);
      service.pickerMap = new Map();
      service.InterceptorContributions = [];

      const graphic: any = { attribute: { pickable: false }, numberType: 1 };
      expect(service.pickItem(graphic, { x: 0, y: 0 }, null, {})).toBeNull();

      graphic.attribute.pickable = true;
      expect(service.pickItem(graphic, { x: 0, y: 0 }, null, {})).toBeNull();

      const beforePickItem = jest.fn(() => ({ graphic: 'intercepted', params: { ok: true } }));
      const afterPickItem = jest.fn(() => ({ graphic: 'after', params: { ok: false } }));
      service.InterceptorContributions = [{ beforePickItem }, { afterPickItem }];

      // beforePickItem short-circuit
      expect(service.pickItem(graphic, { x: 0, y: 0 }, null, {})).toEqual({ graphic: 'intercepted', params: { ok: true } });

      // no interceptor result -> use picker.contains
      beforePickItem.mockReturnValueOnce(null);
      const picker = { contains: jest.fn(() => true) };
      service.pickerMap.set(1, picker);
      const hit = service.pickItem(graphic, { x: 0, y: 0 }, null, {});
      expect(hit).toEqual({ graphic, params: true });
      expect(afterPickItem).not.toHaveBeenCalled();

      // miss -> afterPickItem may override
      beforePickItem.mockReturnValueOnce(null);
      picker.contains.mockReturnValueOnce(false);
      const miss = service.pickItem(graphic, { x: 0, y: 0 }, null, {});
      expect(miss).toEqual({ graphic: 'after', params: { ok: false } });
    });
  });
});
