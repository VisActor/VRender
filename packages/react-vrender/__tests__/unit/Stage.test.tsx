import React from 'react';
import { act } from 'react-dom/test-utils';
import { createRoot } from 'react-dom/client';

jest.mock('@visactor/vrender', () => {
  return {
    createStage: jest.fn(() => ({
      stage: null,
      set3dOptions: jest.fn(),
      setViewBox: jest.fn(),
      setDpr: jest.fn(),
      resize: jest.fn(),
      release: jest.fn()
    }))
  };
});

jest.mock('../../src/hostConfig', () => {
  return {
    reconcilor: {
      createContainer: jest.fn(() => ({ _fiber: true })),
      updateContainer: jest.fn()
    }
  };
});

import { createStage } from '@visactor/vrender';
import { reconcilor } from '../../src/hostConfig';
import { Stage } from '../../src/Stage';

const StageAny: any = Stage;

describe('react-vrender Stage', () => {
  test('mount/unmount lifecycle calls', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const root = createRoot(container);
    const ref = React.createRef<any>();

    act(() => {
      root.render(
        <StageAny ref={ref} width={200} height={100} stage3dOptions={{ enable: true } as any}>
          <></>
        </StageAny>
      );
    });

    const stageStub = (createStage as any).mock.results[0].value;
    stageStub.stage = stageStub;

    expect(createStage).toHaveBeenCalledTimes(1);
    expect(reconcilor.createContainer).toHaveBeenCalledTimes(1);
    expect(ref.current).toBe(stageStub);
    expect(stageStub.set3dOptions).toHaveBeenCalledTimes(1);

    act(() => {
      root.unmount();
    });

    expect(reconcilor.updateContainer).toHaveBeenCalled();
  });

  test('initedRef gate for viewBox/dpr/resize', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const root = createRoot(container);

    act(() => {
      root.render(
        <StageAny width={200} height={100} dpr={2} viewBox={{ x1: 0, y1: 0, x2: 10, y2: 20 } as any}>
          <></>
        </StageAny>
      );
    });

    const stageStub = (createStage as any).mock.results[(createStage as any).mock.results.length - 1].value;
    stageStub.stage = stageStub;

    // 初次 mount 时不应直接同步 props（受 initedRef 控制）
    expect(stageStub.setViewBox).toHaveBeenCalledTimes(0);
    expect(stageStub.setDpr).toHaveBeenCalledTimes(0);
    expect(stageStub.resize).toHaveBeenCalledTimes(0);

    act(() => {
      root.render(
        <StageAny width={300} height={150} dpr={3} viewBox={{ x1: 1, y1: 2, x2: 11, y2: 22 } as any}>
          <></>
        </StageAny>
      );
    });

    expect(stageStub.setViewBox).toHaveBeenCalledWith(1, 2, 10, 20, false);
    expect(stageStub.setDpr).toHaveBeenCalledWith(3);
    expect(stageStub.resize).toHaveBeenCalledWith(300, 150);

    act(() => root.unmount());
  });
});
