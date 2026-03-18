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

jest.mock('@visactor/react-vrender', () => {
  const React = require('react') as typeof import('react');
  return {
    ShadowRoot: React.forwardRef<any, any>((props: any, ref: any): any => {
      React.useEffect(() => {
        if (ref) {
          ref.current = {
            _uid: 'uid',
            stage: stageStub,
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
  });
});
