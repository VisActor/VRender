import { registerArc, registerGroup, registerLine, registerPath, registerRect } from '@visactor/vrender/es/register';

export function loadLineCrosshair() {
  registerGroup();
  registerLine();
}

export function loadCircleCrosshair() {
  registerGroup();
  registerArc();
}

export function loadPolygonCrosshair() {
  registerGroup();
  registerPath();
}

export function loadRectCrosshair() {
  registerGroup();
  registerRect();
}

export function loadSectorCrosshair() {
  registerGroup();
  registerArc();
}
