import { createRect } from '../../../src/graphic/rect';
import { UpdateTag } from '../../../src/common/enums';

describe('Graphic attribute layering', () => {
  const createGraphic = () => {
    const graphic = createRect({
      x: 0,
      y: 0,
      width: 10,
      height: 20,
      fill: 'blue',
      stroke: 'black',
      lineWidth: 1,
      opacity: 1
    });

    jest.spyOn(graphic as any, 'getGraphicService').mockReturnValue({
      onAttributeUpdate: jest.fn(),
      onSetStage: jest.fn(),
      validCheck: jest.fn(() => true),
      beforeUpdateAABBBounds: jest.fn(),
      afterUpdateAABBBounds: jest.fn()
    });

    return graphic;
  };

  test('should keep baseAttributes as static truth while normalAttrs stays a readable deprecated alias', () => {
    const graphic = createGraphic();
    graphic.states = {
      hover: {
        fill: 'red',
        opacity: 0.4
      }
    } as any;

    graphic.useStates(['hover'], false);

    expect((graphic as any).baseAttributes).toEqual(
      expect.objectContaining({
        fill: 'blue',
        opacity: 1
      })
    );
    expect(graphic.normalAttrs).toEqual((graphic as any).baseAttributes);
    expect(graphic.resolvedStatePatch).toEqual({
      fill: 'red',
      opacity: 0.4
    });
    expect(graphic.attribute.fill).toBe('red');
    expect(graphic.attribute.opacity).toBe(0.4);

    graphic.clearStates(false);

    expect((graphic as any).baseAttributes).toEqual(
      expect.objectContaining({
        fill: 'blue',
        opacity: 1
      })
    );
    expect(graphic.normalAttrs).toEqual((graphic as any).baseAttributes);
    expect(graphic.attribute.fill).toBe('blue');
    expect(graphic.attribute.opacity).toBe(1);
    expect(graphic.resolvedStatePatch).toBeUndefined();
  });

  test('should restore attribute from current static truth on animation stop instead of committing props to base', () => {
    const graphic = createGraphic();
    graphic.states = {
      hover: {
        fill: 'red'
      }
    } as any;

    graphic.useStates(['hover'], false);

    (graphic.attribute as any).fill = 'animated-green';
    (graphic as any).finalAttribute = {
      fill: 'animated-green'
    };

    (graphic as any).onStop({
      fill: 'animated-green'
    });

    expect((graphic as any).baseAttributes).toEqual(
      expect.objectContaining({
        fill: 'blue'
      })
    );
    expect(graphic.resolvedStatePatch).toEqual({
      fill: 'red'
    });
    expect(graphic.attribute.fill).toBe('red');
  });

  test('should update ordinary attributes without rebuilding a full static snapshot when no state is active', () => {
    const graphic = createGraphic();
    const syncSpy = jest.spyOn(graphic as any, '_syncAttribute');
    const snapshotSpy = jest.spyOn(graphic as any, 'buildStaticAttributeSnapshot');

    graphic.setAttributes({
      x: 12,
      fill: 'red'
    });

    expect(syncSpy).not.toHaveBeenCalled();
    expect(snapshotSpy).not.toHaveBeenCalled();
    expect((graphic as any).baseAttributes.x).toBe(12);
    expect((graphic as any).baseAttributes.fill).toBe('red');
    expect(graphic.attribute.x).toBe(12);
    expect(graphic.attribute.fill).toBe('red');
  });

  test('should share physical storage for ordinary scalar attributes before state or animation forks it', () => {
    const graphic = createGraphic();

    expect(graphic.attribute).toBe((graphic as any).baseAttributes);

    graphic.setAttributes({
      x: 12,
      y: 6,
      fill: 'red'
    });

    expect(graphic.attribute).toBe((graphic as any).baseAttributes);
    expect(graphic.attribute.x).toBe(12);
    expect((graphic as any).baseAttributes.x).toBe(12);
  });

  test('should reshare static storage after ordinary writes when no visual layer is active', () => {
    const graphic = createGraphic();
    const shadowBlur = {
      value: 4,
      color: 'black'
    } as any;
    graphic.states = {
      hover: {
        fill: 'red'
      }
    } as any;

    graphic.useStates(['hover'], false);
    graphic.clearStates(false);

    expect(graphic.attribute).not.toBe((graphic as any).baseAttributes);

    graphic.setAttributes({
      shadowBlur
    } as any);

    expect(graphic.attribute).toBe((graphic as any).baseAttributes);
    expect((graphic as any).baseAttributes.shadowBlur).toBe(shadowBlur);
    expect((graphic.attribute as any).shadowBlur).toBe(shadowBlur);

    graphic.useStates(['hover'], false);

    expect(graphic.attribute).not.toBe((graphic as any).baseAttributes);
    expect((graphic.attribute as any).shadowBlur).not.toBe((graphic as any).baseAttributes.shadowBlur);
    expect((graphic as any).baseAttributes.shadowBlur).toBe(shadowBlur);
  });

  test('should adopt init attributes onto the shared static storage path', () => {
    const graphic = createGraphic();
    const syncSpy = jest.spyOn(graphic as any, '_syncAttribute');

    const attrs = {
      x: 2,
      y: 3,
      width: 8,
      height: 9,
      fill: 'green'
    } as any;

    graphic.initAttributes(attrs);

    expect(syncSpy).not.toHaveBeenCalled();
    expect(graphic.attribute).toBe(attrs);
    expect(graphic.attribute).toBe((graphic as any).baseAttributes);
    expect(graphic.attribute.x).toBe(2);
    expect((graphic as any).baseAttributes.fill).toBe('green');
  });

  test('should fork shared physical storage before applying state patches', () => {
    const graphic = createGraphic();
    graphic.states = {
      hover: {
        fill: 'red'
      }
    } as any;

    expect(graphic.attribute).toBe((graphic as any).baseAttributes);

    graphic.useStates(['hover'], false);

    expect(graphic.attribute).not.toBe((graphic as any).baseAttributes);
    expect(graphic.attribute.fill).toBe('red');
    expect((graphic as any).baseAttributes.fill).toBe('blue');

    graphic.clearStates(false);

    expect(graphic.attribute.fill).toBe('blue');
    expect((graphic as any).baseAttributes.fill).toBe('blue');
  });

  test('should fork shared physical storage before transient animation attributes', () => {
    const graphic = createGraphic();

    expect(graphic.attribute).toBe((graphic as any).baseAttributes);

    (graphic as any).applyTransientAttributes({
      y: 100
    });

    expect(graphic.attribute).not.toBe((graphic as any).baseAttributes);
    expect(graphic.attribute.y).toBe(100);
    expect((graphic as any).baseAttributes.y).toBe(0);
  });

  test('should keep bounds dirty when transform helpers update shared physical storage', () => {
    const graphic = createGraphic();

    expect(graphic.attribute).toBe((graphic as any).baseAttributes);
    (graphic as any)._updateTag = UpdateTag.NONE;

    graphic.translateTo(8, 6);

    expect(graphic.attribute).toBe((graphic as any).baseAttributes);
    expect(graphic.attribute.x).toBe(8);
    expect(graphic.attribute.y).toBe(6);
    expect((graphic as any)._updateTag & UpdateTag.UPDATE_BOUNDS).toBe(UpdateTag.UPDATE_BOUNDS);
  });

  test('should fall back to full static sync when transient attrs may leave stale keys', () => {
    const graphic = createGraphic();

    (graphic as any).applyTransientAttributes({
      shadowBlur: 6
    });

    expect((graphic.attribute as any).shadowBlur).toBe(6);

    graphic.setAttributes({
      x: 12
    });

    expect((graphic.attribute as any).shadowBlur).toBeUndefined();
    expect((graphic as any).baseAttributes.shadowBlur).toBeUndefined();
    expect(graphic.attribute.x).toBe(12);
    expect((graphic as any).baseAttributes.x).toBe(12);
  });

  test('should switch non-animated state styles without rebuilding a full static snapshot when static attrs are clean', () => {
    const graphic = createGraphic();
    graphic.states = {
      hover: {
        fill: 'red'
      },
      selected: {
        opacity: 0.5
      }
    } as any;
    const snapshotSpy = jest.spyOn(graphic as any, 'buildStaticAttributeSnapshot');
    const createStateModelSpy = jest.spyOn(graphic as any, 'createStateModel');

    graphic.useStates(['hover'], false);
    graphic.useStates(['selected'], false);

    expect(snapshotSpy).not.toHaveBeenCalled();
    expect(createStateModelSpy).not.toHaveBeenCalled();
    expect((graphic as any).stateEngine).toBeUndefined();
    expect((graphic as any).baseAttributes.fill).toBe('blue');
    expect((graphic as any).baseAttributes.opacity).toBe(1);
    expect(graphic.attribute.fill).toBe('blue');
    expect(graphic.attribute.opacity).toBe(0.5);
    expect(graphic.resolvedStatePatch).toEqual({
      opacity: 0.5
    });
  });
});
