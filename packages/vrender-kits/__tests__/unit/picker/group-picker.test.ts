describe('picker/contributions/canvas-picker/group-picker', () => {
  test('DefaultCanvasGroupPicker.contains always returns false', () => {
    jest.isolateModules(() => {
      jest.doMock('@visactor/vrender-core', () => ({
        injectable: () => (t: any) => t,
        GROUP_NUMBER_TYPE: 999
      }));

      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { DefaultCanvasGroupPicker } = require('../../../src/picker/contributions/canvas-picker/group-picker');
      const picker = new DefaultCanvasGroupPicker();
      expect(picker.numberType).toBe(999);
      expect(picker.contains({} as any, {} as any)).toBe(false);
      expect(picker.contains({ attribute: { pickMode: 'imprecise' } } as any, { x: 0, y: 0 } as any)).toBe(false);
    });
  });
});
