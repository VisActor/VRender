import React, { act } from 'react';
import ReactDOM from 'react-dom';

declare const require: any;

type ReactDOMType = typeof import('react-dom');

const createRootMock = jest.fn(() => ({ render: jest.fn(), unmount: jest.fn() }));

jest.mock('react-dom', () => {
  const actual: ReactDOMType = jest.requireActual('react-dom');
  return {
    ...actual,
    createRoot: (...args: any[]) => (createRootMock as any)(...args)
  };
});

const hooks = {
  beforeRender: {
    tap: jest.fn(),
    unTap: jest.fn()
  }
};

const stageStub = {
  hooks,
  window: {
    getContainer: jest.fn(() => document.body)
  },
  renderNextFrame: jest.fn()
};

let stageForRef: any = stageStub;

jest.mock('@visactor/react-vrender', () => {
  const React = require('react') as typeof import('react');
  return {
    ShadowRoot: React.forwardRef<any, any>((props: any, ref: any): any => {
      React.useEffect(() => {
        if (ref) {
          ref.current = {
            _uid: 'uid',
            stage: stageForRef,
            shouldUpdateGlobalMatrix: () => true,
            globalTransMatrix: {
              toTransformAttrs: () => ({ x: 1, y: 2, scaleX: 1, scaleY: 1, rotateDeg: 0, skewX: 0, skewY: 0 })
            }
          };
        }
      }, []);
      return null;
    })
  };
});

import { Html } from '../../src/Html';

describe('react-vrender-utils Html', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    stageForRef = stageStub;
  });

  test('mount appends div and applies transform + divProps', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    stageStub.window.getContainer.mockReturnValue(container);

    const mountPoint = document.createElement('div');
    document.body.appendChild(mountPoint);

    act(() => {
      ReactDOM.render(
        <Html divProps={{ id: 'test-div', style: { color: 'red' } }}>
          <span>child</span>
        </Html>,
        mountPoint
      );
    });

    const div = container.querySelector('#test-div') as HTMLDivElement;
    expect(div).toBeTruthy();
    expect(div.style.position).toBe('absolute');
    expect(div.style.color).toBe('red');
    expect(container.style.position).toBe('relative');

    act(() => {
      ReactDOM.unmountComponentAtNode(mountPoint);
    });

    expect(container.querySelector('#test-div')).toBeFalsy();
    document.body.removeChild(container);
    document.body.removeChild(mountPoint);
  });

  test('transform=false clears transform styles and does not force container position', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    stageStub.window.getContainer.mockReturnValue(container);

    const mountPoint = document.createElement('div');
    document.body.appendChild(mountPoint);

    act(() => {
      ReactDOM.render(<Html transform={false} divProps={{ id: 'no-transform', style: { color: 'blue' } }} />, mountPoint);
    });

    const div = container.querySelector('#no-transform') as HTMLDivElement;
    expect(div).toBeTruthy();
    expect(div.style.position).toBe('');
    expect(div.style.color).toBe('blue');
    expect(container.style.position).toBe('');

    act(() => {
      ReactDOM.unmountComponentAtNode(mountPoint);
    });

    document.body.removeChild(container);
    document.body.removeChild(mountPoint);
  });

  test('needForceStyle=false keeps container position unchanged', () => {
    const container = document.createElement('div');
    container.style.position = 'absolute';
    document.body.appendChild(container);

    const cssSpy = jest.spyOn(window, 'getComputedStyle').mockReturnValue({ position: 'absolute' } as any);

    stageStub.window.getContainer.mockReturnValue(container);

    const mountPoint = document.createElement('div');
    document.body.appendChild(mountPoint);

    act(() => {
      ReactDOM.render(<Html divProps={{ id: 'keep-container' }} />, mountPoint);
    });

    expect(container.style.position).toBe('absolute');

    act(() => {
      ReactDOM.unmountComponentAtNode(mountPoint);
    });

    cssSpy.mockRestore();
    document.body.removeChild(container);
    document.body.removeChild(mountPoint);
  });

  test('early return when getContainer() is null (div not appended)', () => {
    stageStub.window.getContainer.mockReturnValue(null as any);

    const mountPoint = document.createElement('div');
    document.body.appendChild(mountPoint);

    act(() => {
      ReactDOM.render(<Html divProps={{ id: 'no-container' }} />, mountPoint);
    });

    expect(document.getElementById('no-container')).toBeFalsy();

    act(() => {
      ReactDOM.unmountComponentAtNode(mountPoint);
    });

    document.body.removeChild(mountPoint);
  });

  test('early return when groupRef has no stage (div not appended)', () => {
    stageForRef = null;

    const container = document.createElement('div');
    document.body.appendChild(container);
    stageStub.window.getContainer.mockReturnValue(container);

    const mountPoint = document.createElement('div');
    document.body.appendChild(mountPoint);

    act(() => {
      ReactDOM.render(<Html divProps={{ id: 'no-stage' }} />, mountPoint);
    });

    expect(container.querySelector('#no-stage')).toBeFalsy();

    act(() => {
      ReactDOM.unmountComponentAtNode(mountPoint);
    });

    document.body.removeChild(container);
    document.body.removeChild(mountPoint);
  });
});
