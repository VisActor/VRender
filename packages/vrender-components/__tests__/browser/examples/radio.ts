import '@visactor/vrender';
import { IPointLike } from '@visactor/vutils';
import render from '../../util/render';
import { Radio } from '../../../src';
import { createLine } from '@visactor/vrender-core';

export function run() {
  const radios: Radio[] = [];
  radios.push(
    new Radio({
      id: 'radio-1',
      x: 100,
      y: 100,
      text: {
        text: 'radio-1'
      },
      checked: false,
      disabled: true
    })
  );

  radios.push(
    new Radio({
      id: 'radio-2',
      x: 200,
      y: 100,
      text: {
        text: 'radio-2'
      },
      checked: false,
      disabled: false
    })
  );

  radios.push(
    new Radio({
      id: 'radio-3',
      x: 300,
      y: 100,
      text: {
        text: 'radio-3'
      },
      checked: true,
      disabled: false
    })
  );

  radios.push(
    new Radio({
      id: 'radio-4',
      x: 400,
      y: 100,
      text: {
        text: 'radio-4'
      },
      checked: true,
      disabled: true
    })
  );

  radios.push(
    new Radio({
      id: 'radio-5',
      x: 100,
      y: 200,
      text: {
        text: 'radio-5'
      },
      disabled: true
    })
  );

  radios.push(
    new Radio({
      id: 'radio-6',
      x: 200,
      y: 200,
      text: {
        text: 'radio-6'
      },
      disabled: false
    })
  );

  radios.push(
    new Radio({
      id: 'radio-7',
      x: 300,
      y: 200,
      text: {
        text: 'radio-7'
      },
      disabled: false
    })
  );

  radios.push(
    new Radio({
      id: 'radio-8',
      x: 400,
      y: 200,
      text: {
        text: 'radio-8'
      },
      disabled: true
    })
  );

  const stage = render(radios, 'main');

  stage.addEventListener('radio_checked', e => {
    console.log('radio_checked', e);
    const targetRadio = e.target as Radio;
    radios.forEach(radio => {
      if (radio !== targetRadio) {
        radio.setAttribute('checked', false);
      }
    });
  });
}
