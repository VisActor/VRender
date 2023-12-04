import { registerGroup, registerPath } from '@visactor/vrender/es/register';
import { loadTagComponent } from '../tag/register';
import { loadPagerComponent } from '../pager/register';
import { loadSliderComponent } from '../slider/register';

function loadBaseLegend() {
  registerGroup();
  loadTagComponent();
}

export function loadDiscreteLegendComponent() {
  loadBaseLegend();
  loadPagerComponent();
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
