import type { IAABBBounds } from '@visactor/vutils';
import type { Matrix } from '@visactor/vutils';
import type { IGlobal, IWindow } from '../interface';
import { isNumber } from '../canvas/util';

function isIdentityMatrix(matrix: Matrix): boolean {
  return matrix.a === 1 && matrix.b === 0 && matrix.c === 0 && matrix.d === 1 && matrix.e === 0 && matrix.f === 0;
}

/**
 * Create an event transformer that corrects event coordinates based on container transformations
 * @param containerElement The container element
 * @param matrix The transformation matrix to apply
 * @param rect Optional DOMRect of the container, if not provided will use getBoundingClientRect
 * @returns A function that transforms events to correct coordinates
 */
export function createEventTransformer(
  containerElement: HTMLElement,
  getMatrix: () => Matrix,
  getRect: () => IAABBBounds,
  transformPoint: (clientX: number, clientY: number, matrix: Matrix, rect: IAABBBounds, transformedEvent: Event) => void
): (event: Event) => Event {
  return (event: Event): Event => {
    // Only transform mouse and touch events that have coordinates
    if (!(event instanceof MouseEvent) && !(event instanceof TouchEvent) && !(event instanceof PointerEvent)) {
      return event;
    }

    // Use provided matrix
    const transformMatrix = getMatrix();

    // If there's no transformation, return the original event
    if (isIdentityMatrix(transformMatrix)) {
      return event;
    }

    // Get the container's bounding rect for coordinate conversion
    const containerRect = getRect();

    // Create a copy of the event to modify
    const transformedEvent = new (event.constructor as any)(event.type, event);
    Object.defineProperties(transformedEvent, {
      target: { value: event.target },
      currentTarget: { value: event.currentTarget }
    });

    if (event instanceof MouseEvent || event instanceof PointerEvent) {
      transformPoint(event.clientX, event.clientY, transformMatrix, containerRect, transformedEvent);
    } else if (event instanceof TouchEvent) {
      // For touch events, we need to transform each touch point
      // This is a simplified version that assumes we're only using the first touch
      if (event.touches.length > 0) {
        const touch = event.touches[0];
        transformPoint(touch.clientX, touch.clientY, transformMatrix, containerRect, transformedEvent);
      }
    }

    return transformedEvent;
  };
}

/**
 * Create an event transformer for the given canvas element
 * @param canvasElement The canvas element
 * @param getMatrix The transformation matrix to apply
 * @param getRect Optional DOMRect of the container
 * @returns A function that transforms events to correct coordinates
 */
export function createCanvasEventTransformer(
  canvasElement: HTMLCanvasElement,
  getMatrix: () => Matrix,
  getRect: () => IAABBBounds,
  transformPoint: (clientX: number, clientY: number, matrix: Matrix, rect: IAABBBounds, transformedEvent: Event) => void
): (event: Event) => Event {
  return createEventTransformer(canvasElement.parentElement || canvasElement, getMatrix, getRect, transformPoint);
}

/**
 * Register the event transformer with a DefaultWindow instance
 * @param window The window instance
 * @param container The container element
 * @param getMatrix The transformation matrix to apply
 * @param getRect Optional DOMRect of the container
 */
export function registerWindowEventTransformer(
  window: IWindow,
  container: HTMLElement,
  getMatrix: () => Matrix,
  getRect: () => IAABBBounds,
  transformPoint: (clientX: number, clientY: number, matrix: Matrix, rect: IAABBBounds, transformedEvent: Event) => void
): void {
  const transformer = createEventTransformer(container, getMatrix, getRect, transformPoint);
  window.setEventListenerTransformer(transformer);
}

/**
 * Register the event transformer with a DefaultGlobal instance
 * @param global The global instance
 * @param container The container element
 * @param getMatrix The transformation matrix to apply
 * @param getRect Optional DOMRect of the container
 */
export function registerGlobalEventTransformer(
  global: IGlobal,
  container: HTMLElement,
  getMatrix: () => Matrix,
  getRect: () => IAABBBounds,
  transformPoint: (clientX: number, clientY: number, matrix: Matrix, rect: IAABBBounds, transformedEvent: Event) => void
): void {
  const transformer = createEventTransformer(container, getMatrix, getRect, transformPoint);
  global.setEventListenerTransformer(transformer);
}

export function transformPointForCanvas(
  clientX: number,
  clientY: number,
  matrix: Matrix,
  rect: IAABBBounds,
  transformedEvent: Event
) {
  // Apply the inverse transformation
  const transformedPoint = { x: clientX, y: clientY };

  matrix.transformPoint(transformedPoint, transformedPoint);

  // Update the event properties
  Object.defineProperties(transformedEvent, {
    _canvasX: { value: transformedPoint.x },
    _canvasY: { value: transformedPoint.y }
  });
  return;
}

export function mapToCanvasPointForCanvas(nativeEvent: any) {
  if (isNumber(nativeEvent._canvasX) && isNumber(nativeEvent._canvasY)) {
    return {
      x: nativeEvent._canvasX,
      y: nativeEvent._canvasY
    };
  }
  return;
}
