// import { registerArc, registerGroup, registerLine, registerPath, registerRect } from '@visactor/vrender/es/register';
import { registerArc, registerGroup, registerLine, registerPath, registerRect } from '@visactor/vrender/es/register';

export function loadLineCrosshairComponent() {
  registerGroup();
  registerLine();
}

export function loadCircleCrosshairComponent() {
  registerGroup();
  registerArc();
}

export function loadPolygonCrosshairComponent() {
  registerGroup();
  registerPath();
}

export function loadRectCrosshairComponent() {
  registerGroup();
  registerRect();
}

export function loadSectorCrosshairComponent() {
  registerGroup();
  registerArc();
}
