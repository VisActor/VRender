import { registerGroup, registerPath } from '@visactor/vrender/es/register';
import { loadTag } from '../tag/register';
import { loadPager } from '../pager/register';
import { loadSlider } from '../slider/register';

function loadBaseLegend() {
  registerGroup();
  loadTag();
}

export function loadDiscreteLegend() {
  loadBaseLegend();
  loadPager();
}

export function loadColorContinuousLegend() {
  loadBaseLegend();
  loadSlider();
}

export function loadSizeContinuousLegend() {
  loadBaseLegend();
  loadSlider();
  registerPath();
}
