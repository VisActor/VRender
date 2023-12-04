import {
  registerGroup,
  registerImage,
  registerLine,
  registerPolygon,
  registerSymbol
} from '@visactor/vrender/es/register';
import { loadTag } from '../tag/register';
import { loadSegment } from '../segment';
function loadBaseMarker() {
  registerGroup();
  loadTag();
}

export function loadMarkLine() {
  loadBaseMarker();
  loadSegment();
}

export function loadMarkArea() {
  loadBaseMarker();
  registerPolygon();
}

export function loadMarkPoint() {
  loadBaseMarker();
  loadSegment();
  registerSymbol();
  registerImage();
  registerLine();
}
