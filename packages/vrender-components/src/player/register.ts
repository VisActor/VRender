import { registerGroup } from '@visactor/vrender-kits/register/register-group';
import { registerSymbol } from '@visactor/vrender-kits/register/register-symbol';
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
