declare var require: any;

jest.mock('@visactor/vrender-kits', () => ({
  registerGroup: jest.fn(),
  registerSymbol: jest.fn()
}));

jest.mock('../../../src/slider/register', () => ({
  loadSliderComponent: jest.fn()
}));

import { loadContinuousPlayerComponent, loadDiscretePlayerComponent } from '../../../src/player/register';

describe('player/register', () => {
  test('loadDiscretePlayerComponent and loadContinuousPlayerComponent call base registrations', () => {
    const { registerGroup, registerSymbol } = require('@visactor/vrender-kits');
    const { loadSliderComponent } = require('../../../src/slider/register');

    loadDiscretePlayerComponent();
    loadContinuousPlayerComponent();

    expect(loadSliderComponent).toHaveBeenCalledTimes(2);
    expect(registerGroup).toHaveBeenCalledTimes(2);
    expect(registerSymbol).toHaveBeenCalledTimes(2);
  });
});
