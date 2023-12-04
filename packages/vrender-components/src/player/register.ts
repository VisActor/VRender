import { registerGroup, registerSymbol } from '@visactor/vrender/es/register';
import { loadSliderComponent } from '../slider/register';

function loadBasePlayer() {
  loadSliderComponent();
  registerGroup();
  registerSymbol();
}

export function loadDiscretePlayerComponent() {
  loadBasePlayer();
}

export function loadContinuousPlayerComponent() {
  loadBasePlayer();
}
