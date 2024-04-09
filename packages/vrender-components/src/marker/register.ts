import {
  registerArc,
  registerGroup,
  registerImage,
  registerLine,
  registerPolygon,
  registerSymbol
} from '@visactor/vrender-kits';
import { loadTagComponent } from '../tag/register';
import { loadArcSegmentComponent, loadSegmentComponent } from '../segment/register';
function loadBaseMarker() {
  registerGroup();
  loadTagComponent();
}

export function loadCartesianMarkLineComponent() {
  loadBaseMarker();
  loadSegmentComponent();
}

export function loadPolarMarkLineComponent() {
  loadBaseMarker();
  loadSegmentComponent();
}

export function loadPolarMarkArcLineComponent() {
  loadBaseMarker();
  loadArcSegmentComponent();
}

export function loadCartesianMarkAreaComponent() {
  loadBaseMarker();
  registerPolygon();
}

export function loadPolarMarkAreaComponent() {
  loadBaseMarker();
  registerArc();
}

export function loadMarkPointComponent() {
  loadBaseMarker();
  loadSegmentComponent();
  registerSymbol();
  registerImage();
  registerLine();
}
