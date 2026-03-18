import { bindGraphicEvent, splitProps, updateProps } from '../../src/processProps';

describe('react-vrender processProps', () => {
  test('splitProps separates event props from graphic props', () => {
    const props: any = {
      x: 1,
      visible: true,
      onClick: () => 1,
      onPointerDown: () => 2
    };

    const { graphicProps, eventProps } = splitProps(props);
    expect(graphicProps).toMatchObject({ x: 1, visible: true });
    expect(Object.keys(eventProps).sort()).toEqual(['onClick', 'onPointerDown']);
  });

  test('bindGraphicEvent only binds function handlers', () => {
    const instance: any = {
      addEventListener: jest.fn()
    };

    bindGraphicEvent({ onClick: () => 1, onPointerDown: 1 as any } as any, instance);

    expect(instance.addEventListener).toHaveBeenCalledTimes(1);
    expect(instance.addEventListener.mock.calls[0][0]).toBe('click');
  });

  test('updateProps removes old handlers/attrs and adds new ones', () => {
    const oldClick = jest.fn();
    const newClick = jest.fn();

    const instance: any = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      setAttribute: jest.fn()
    };

    const oldProps: any = { x: 1, onClick: oldClick, onPointerDown: oldClick, keep: 1 };
    const newProps: any = { x: 2, onClick: newClick, onPointerDown: undefined, keep: 1 };

    updateProps(instance, newProps, oldProps);

    // remove changed events
    expect(instance.removeEventListener).toHaveBeenCalledWith('click', oldClick);
    expect(instance.removeEventListener).toHaveBeenCalledWith('pointerdown', oldClick);

    // remove changed non-event
    expect(instance.setAttribute).toHaveBeenCalledWith('x', undefined);

    // add changed event only when function
    expect(instance.addEventListener).toHaveBeenCalledWith('click', newClick);

    // add changed non-event
    expect(instance.setAttribute).toHaveBeenCalledWith('x', 2);

    // unchanged keys should not trigger setAttribute
    expect(instance.setAttribute).not.toHaveBeenCalledWith('keep', expect.anything());
  });
});
