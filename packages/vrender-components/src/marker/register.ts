import { registerGroup, registerImage, registerLine, registerPolygon, registerSymbol } from '@visactor/vrender-kits';
import { loadTagComponent } from '../tag/register';
import { loadSegmentComponent } from '../segment/register';
function loadBaseMarker() {
  registerGroup();
  loadTagComponent();
}

export function loadMarkLineComponent() {
  loadBaseMarker();
  loadSegmentComponent();
}

export function loadMarkAreaComponent() {
  loadBaseMarker();
  registerPolygon();
}

export function loadMarkPointComponent() {
  loadBaseMarker();
  loadSegmentComponent();
  registerSymbol();
  registerImage();
  registerLine();
}
