declare const require: any;

jest.mock('@visactor/vrender-kits/register/register-group', () => ({
  registerGroup: jest.fn()
}));

jest.mock('@visactor/vrender-kits/register/register-symbol', () => ({
  registerSymbol: jest.fn()
}));

jest.mock('../../../src/slider/register', () => ({
  loadSliderComponent: jest.fn()
}));

import { loadContinuousPlayerComponent, loadDiscretePlayerComponent } from '../../../src/player/register';

describe('player/register', () => {
  test('loadDiscretePlayerComponent and loadContinuousPlayerComponent call base registrations', () => {
    const { registerGroup } = require('@visactor/vrender-kits/register/register-group');
    const { registerSymbol } = require('@visactor/vrender-kits/register/register-symbol');
    const { loadSliderComponent } = require('../../../src/slider/register');

    loadDiscretePlayerComponent();
    loadContinuousPlayerComponent();

    expect(loadSliderComponent).toHaveBeenCalledTimes(2);
    expect(registerGroup).toHaveBeenCalledTimes(2);
    expect(registerSymbol).toHaveBeenCalledTimes(2);
  });
});
