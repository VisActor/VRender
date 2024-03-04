import { registerGroup, registerPath } from '@visactor/vrender-kits';
import { loadTagComponent } from '../tag/register';
import { loadPagerComponent } from '../pager/register';
import { loadSliderComponent } from '../slider/register';
import { loadScrollbarComponent } from '../scrollbar/register';

function loadBaseLegend() {
  registerGroup();
  loadTagComponent();
}

export function loadDiscreteLegendComponent() {
  loadBaseLegend();
  loadPagerComponent();
  loadScrollbarComponent();
}

export function loadColorContinuousLegendComponent() {
  loadBaseLegend();
  loadSliderComponent();
}

export function loadSizeContinuousLegendComponent() {
  loadBaseLegend();
  loadSliderComponent();
  registerPath();
}
