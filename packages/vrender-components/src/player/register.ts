import { registerGroup, registerSymbol } from '@visactor/vrender/es/register';
import { loadSlider } from '../slider';

function loadBasePlayer() {
  loadSlider();
  registerGroup();
  registerSymbol();
}

export function loadDiscretePlayer() {
  loadBasePlayer();
}

export function loadContinuousPlayer() {
  loadBasePlayer();
}
