import type { StandardProps } from '@byted-lynx/type-lynx';

declare module '@byted-lynx/type-lynx' {
  interface IntrinsicElements {
    canvas: StandardProps;
    'canvas-ng': StandardProps;
  }
}
