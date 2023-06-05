import { createStage } from '@visactor/vrender';
// eslint-disable-next-line no-duplicate-imports
import type { IStage, IStageParams, IOption3D } from '@visactor/vrender';
import { forwardRef, useLayoutEffect, useRef } from 'react';
// eslint-disable-next-line no-duplicate-imports
import React from 'react';
import type { FiberRoot } from 'react-reconciler';
import { reconcilor } from './hostConfig';
import { assertRef } from './util';

export interface StageProps
  extends Omit<IStageParams, 'autoRender' | 'container'>,
    Omit<React.HTMLAttributes<HTMLDivElement>, 'id' | 'title'> {
  containerId?: string | undefined;
  containerTitle?: string | undefined;
  children?: any;
  stage3dOptions?: IOption3D;
}

export const Stage = forwardRef<IStage, StageProps>((props, ref) => {
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

  const fiberRoot = useRef<FiberRoot>();
  const divRef = useRef<HTMLDivElement>(null);
  const innerStageRef = useRef<IStage>(null);
  const stageRef = ref || innerStageRef;
  const initedRef = useRef(false);

  useLayoutEffect(() => {
    const stage = createStage({
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
    });

    if (stage3dOptions) {
      stage.set3dOptions(stage3dOptions);
    }

    stageRef.current = stage;

    fiberRoot.current = (reconcilor as any).createContainer(stage as any, 1, null, false, false, '');

    return () => {
      reconcilor.updateContainer(null, fiberRoot.current, null);
    };
  }, []);

  useLayoutEffect(() => {
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

  useLayoutEffect(() => {
    if (dpr && stageRef.current && initedRef.current) {
      stageRef.current.setDpr(dpr);
    }
  }, [stageRef, dpr, initedRef]);

  useLayoutEffect(() => {
    if (width > 0 && height > 0 && stageRef.current && initedRef.current) {
      stageRef.current.resize(width, height);
    }
  }, [width, height, stageRef, initedRef]);

  useLayoutEffect(() => {
    initedRef.current = true;
    if (fiberRoot.current) {
      reconcilor.updateContainer(children, fiberRoot.current, null);
    }
  }, [children]);

  return <div {...others} id={containerId} title={containerTitle} ref={divRef} />;
});
