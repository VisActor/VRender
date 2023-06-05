import React from 'react';
// eslint-disable-next-line no-duplicate-imports
import type { HTMLAttributes, PropsWithChildren } from 'react';
import * as ReactDOM from 'react-dom';
import { ShadowRoot } from '@visactor/react-vrender';
// eslint-disable-next-line no-duplicate-imports
import type { IShadowRoot } from '@visactor/vrender';

const needForceStyle = (el: HTMLDivElement) => {
  const pos = window.getComputedStyle(el).position;
  const ok = pos === 'absolute' || pos === 'relative';
  return !ok;
};

export type HtmlTransformAttrs = {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotateDeg: number;
  skewX: number;
  skewY: number;
};

export type HtmlProps = PropsWithChildren<{
  divProps?: HTMLAttributes<HTMLDivElement>;
  transform?: boolean;
  transformFunc?: (attrs: HtmlTransformAttrs) => HtmlTransformAttrs;
}>;

export const Html = ({ children, divProps, transform, transformFunc }: HtmlProps) => {
  const groupRef = React.useRef<IShadowRoot>(null);

  const [div] = React.useState(() => document.createElement('div'));
  const root = React.useMemo(() => (ReactDOM as any).createRoot(div), [div]);

  const shouldTransform = transform ?? true;

  const handleGroupRerender = () => {
    if (shouldTransform && groupRef.current) {
      if (!groupRef.current.shouldUpdateGlobalMatrix()) {
        return;
      }

      const matrix = groupRef.current.globalTransMatrix;
      let attrs = matrix.toTransformAttrs();
      if (transformFunc) {
        attrs = transformFunc(attrs);
      }
      div.style.position = 'absolute';
      div.style.zIndex = '10';
      div.style.top = '0px';
      div.style.left = '0px';
      // eslint-disable-next-line max-len
      div.style.transform = `translate(${attrs.x}px, ${attrs.y}px) rotate(${attrs.rotateDeg}deg) scaleX(${attrs.scaleX}) scaleY(${attrs.scaleY})`;
      div.style.transformOrigin = 'top left';
    } else {
      div.style.position = '';
      div.style.zIndex = '';
      div.style.top = '';
      div.style.left = '';
      div.style.transform = ``;
      div.style.transformOrigin = '';
    }
    const { style, ...restProps } = divProps || {};
    Object.assign(div.style, style);
    Object.assign(div, restProps);
  };

  React.useEffect(() => {
    const group = groupRef.current;
    if (!group?.stage) {
      return;
    }
    const stage = group.stage;
    const htmlContainer = stage.window?.getContainer?.();
    if (!htmlContainer) {
      return;
    }
    htmlContainer.appendChild(div);

    if (shouldTransform && needForceStyle(htmlContainer)) {
      htmlContainer.style.position = 'relative';
    }

    stage.hooks.beforeRender.tap(`${group._uid}-render`, handleGroupRerender);

    handleGroupRerender();
    return () => {
      stage.hooks.beforeRender.unTap(`${group._uid}-render`, handleGroupRerender);
      div.parentNode?.removeChild(div);
    };
  }, [shouldTransform]);

  React.useLayoutEffect(() => {
    handleGroupRerender();
  }, [divProps]);

  React.useLayoutEffect(() => {
    root.render(children);
  });

  React.useLayoutEffect(() => {
    return () => {
      root.unmount();
    };
  }, []);

  return <ShadowRoot ref={groupRef as any} />;
};
