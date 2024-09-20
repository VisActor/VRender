import '@visactor/vrender';
import { IPointLike } from '@visactor/vutils';
import render from '../../util/render';
import { CheckBox } from '../../../src';
import { createLine } from '@visactor/vrender-core';

export function run() {
  const checkboxs: CheckBox[] = [];
  checkboxs.push(
    new CheckBox({
      x: 100,
      y: 100,
      text: {
        text: 'checkbox'
      },
      checked: false,
      disabled: true,
      box: {
        disableFill: 'red'
      }
    })
  );

  checkboxs.push(
    new CheckBox({
      x: 200,
      y: 100,
      text: {
        text: 'checkbox'
      },
      checked: false,
      disabled: false
    })
  );

  checkboxs.push(
    new CheckBox({
      x: 300,
      y: 100,
      text: {
        text: 'checkbox'
      },
      checked: true,
      disabled: false
    })
  );

  checkboxs.push(
    new CheckBox({
      x: 400,
      y: 100,
      text: {
        text: 'checkbox'
      },
      checked: true,
      disabled: true
    })
  );

  checkboxs.push(
    new CheckBox({
      x: 100,
      y: 200,
      text: {
        text: 'checkbox'
      },
      indeterminate: false,
      disabled: true
    })
  );

  checkboxs.push(
    new CheckBox({
      x: 200,
      y: 200,
      text: {
        text: 'checkbox'
      },
      indeterminate: false,
      disabled: false
    })
  );

  checkboxs.push(
    new CheckBox({
      x: 300,
      y: 200,
      text: {
        text: 'checkbox'
      },
      indeterminate: true,
      disabled: false
    })
  );

  checkboxs.push(
    new CheckBox({
      x: 400,
      y: 200,
      text: {
        text: 'checkbox'
      },
      indeterminate: true,
      disabled: true
    })
  );

  const stage = render(checkboxs, 'main');
}
