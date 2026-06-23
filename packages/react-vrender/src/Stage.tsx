import * as VRender from '@visactor/vrender';
import type { IStage, IStageParams, IOption3D } from '@visactor/vrender';
import React from 'react';
// eslint-disable-next-line no-duplicate-imports
import type { HTMLAttributes, MutableRefObject } from 'react';
import type { FiberRoot } from 'react-reconciler';
import { reconcilor } from './hostConfig';
import { assertRef } from './util';

export interface StageProps
  extends Omit<IStageParams, 'autoRender' | 'container'>,
    Omit<HTMLAttributes<HTMLDivElement>, 'id' | 'title'> {
  containerId?: string | undefined;
  containerTitle?: string | undefined;
  children?: any;
  stage3dOptions?: IOption3D;
}

type TVRenderApp = {
  createStage: (params: Partial<IStageParams> & { autoRender?: boolean; container?: HTMLElement }) => IStage;
  release?: () => void;
};

function createBrowserStageApp(): TVRenderApp {
  return (VRender as any).createBrowserVRenderApp() as TVRenderApp;
}

export const Stage = React.forwardRef<IStage, StageProps>((props, ref) => {
  const {
    viewBox,
    width,
    height,
    dpr,
    background,
    canvasControled,
    title,
    canvas,
    disableDirtyBounds,
    beforeRender,
    afterRender,
    renderStyle,
    stage3dOptions,
    containerId,
    containerTitle,
    children,
    ...others
  } = props;
  assertRef(ref);

  const fiberRoot = React.useRef<FiberRoot | null>(null);
  const divRef = React.useRef<HTMLDivElement>(null);
  const innerStageRef = React.useRef<IStage | null>(null);
  const appRef = React.useRef<TVRenderApp | null>(null);
  const stageRef = ref && typeof ref !== 'function' ? (ref as MutableRefObject<IStage | null>) : innerStageRef;
  const initedRef = React.useRef(false);

  React.useLayoutEffect(() => {
    const app = createBrowserStageApp();
    const stage = app.createStage({
      viewBox,
      width,
      height,
      dpr,
      background,
      canvasControled,
      title,
      autoRender: true,
      disableDirtyBounds,
      beforeRender,
      afterRender,
      renderStyle,
      canvas,
      container: divRef.current as HTMLElement
    }) as IStage;

    if (stage3dOptions) {
      stage.set3dOptions(stage3dOptions);
    }

    appRef.current = app;
    stageRef.current = stage;

    fiberRoot.current = (reconcilor as any).createContainer(stage as any, 1, null, false, false, '');

    return () => {
      if (fiberRoot.current) {
        reconcilor.updateContainer(null, fiberRoot.current, null);
        fiberRoot.current = null;
      }
      stageRef.current = null;
      stage.release?.();
      appRef.current?.release();
      appRef.current = null;
    };
    // Intentionally mount-only: subsequent prop updates are handled by dedicated effects below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useLayoutEffect(() => {
    if (viewBox && stageRef.current && initedRef.current) {
      stageRef.current.setViewBox(
        viewBox.x1 as any,
        viewBox.y1 as never,
        viewBox.x2 - viewBox.x1,
        viewBox.y2 - viewBox.y1,
        false
      );
    }
  }, [stageRef, viewBox, initedRef]);

  React.useLayoutEffect(() => {
    if (dpr && stageRef.current && initedRef.current) {
      stageRef.current.setDpr(dpr);
    }
  }, [stageRef, dpr, initedRef]);

  React.useLayoutEffect(() => {
    if (width > 0 && height > 0 && stageRef.current && initedRef.current) {
      stageRef.current.resize(width, height);
    }
  }, [width, height, stageRef, initedRef]);

  React.useLayoutEffect(() => {
    initedRef.current = true;
    if (fiberRoot.current) {
      reconcilor.updateContainer(children, fiberRoot.current, null);
    }
  }, [children]);

  return <div {...others} id={containerId} title={containerTitle} ref={divRef} />;
});

Stage.displayName = 'Stage';
