/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { findCursorIdxByConfigIndex, findConfigIndexByCursorIdx } from '../../src/plugins/builtin-plugin/edit-module';

const textConfig1 = [
  {
    text: '我',
    fontSize: 16,
    lineHeight: 26,
    textAlign: 'center',
    background: 'orange',
    fill: '#0f51b5'
  },
  {
    text: '们',
    fontSize: 16,
    lineHeight: 26,
    textAlign: 'center',
    background: 'orange',
    fill: '#0f51b5'
  },
  {
    text: '是',
    fontSize: 16,
    lineHeight: 26,
    textAlign: 'center',
    background: 'orange',
    fill: '#0f51b5'
  }
];
const textConfig2 = [
  {
    text: '我',
    fontSize: 16,
    lineHeight: 26,
    textAlign: 'center',
    background: 'orange',
    fill: '#0f51b5'
  },
  {
    fill: '#0f51b5',
    text: '\n',
    fontSize: 16,
    lineHeight: 26,
    textAlign: 'center',
    background: 'orange',
    isComposing: false
  },
  {
    fill: '#0f51b5',
    text: '\n',
    fontSize: 16,
    lineHeight: 26,
    textAlign: 'center',
    background: 'orange',
    isComposing: false
  },
  {
    fill: '#0f51b5',
    text: '\n',
    fontSize: 16,
    lineHeight: 26,
    textAlign: 'center',
    background: 'orange',
    isComposing: false
  },
  {
    fill: '#0f51b5',
    text: '\n',
    fontSize: 16,
    lineHeight: 26,
    textAlign: 'center',
    background: 'orange',
    isComposing: false
  },
  {
    text: '们',
    fontSize: 16,
    lineHeight: 26,
    textAlign: 'center',
    background: 'orange',
    fill: '#0f51b5'
  },
  {
    text: '是',
    fontSize: 16,
    lineHeight: 26,
    textAlign: 'center',
    background: 'orange',
    fill: '#0f51b5'
  }
];
const textConfig3 = [
  {
    text: '我',
    fontSize: 16,
    lineHeight: 26,
    textAlign: 'center',
    background: 'orange',
    fill: '#0f51b5'
  },
  {
    fill: '#0f51b5',
    text: '\n',
    fontSize: 16,
    lineHeight: 26,
    textAlign: 'center',
    background: 'orange',
    isComposing: false
  },
  {
    fill: '#0f51b5',
    text: '\n',
    fontSize: 16,
    lineHeight: 26,
    textAlign: 'center',
    background: 'orange',
    isComposing: false
  },
  {
    fill: '#0f51b5',
    text: 'a',
    fontSize: 16,
    lineHeight: 26,
    textAlign: 'center',
    background: 'orange',
    isComposing: false
  },
  {
    fill: '#0f51b5',
    text: '\n',
    fontSize: 16,
    lineHeight: 26,
    textAlign: 'center',
    background: 'orange',
    isComposing: false
  },
  {
    fill: '#0f51b5',
    text: '\n',
    fontSize: 16,
    lineHeight: 26,
    textAlign: 'center',
    background: 'orange',
    isComposing: false
  },
  {
    text: '们',
    fontSize: 16,
    lineHeight: 26,
    textAlign: 'center',
    background: 'orange',
    fill: '#0f51b5'
  },
  {
    text: '是',
    fontSize: 16,
    lineHeight: 26,
    textAlign: 'center',
    background: 'orange',
    fill: '#0f51b5'
  }
];

describe('richtext_editor', () => {
  it('richtext_editor findConfigIndexByCursorIdx config 1', () => {
    // expect(findConfigIndexByCursorIdx(textConfig1, -0.1)).toEqual(0);
    // expect(findConfigIndexByCursorIdx(textConfig1, 0.1)).toEqual(0);
    // expect(findConfigIndexByCursorIdx(textConfig1, 0.9)).toEqual(0);
    // expect(findConfigIndexByCursorIdx(textConfig1, 1.1)).toEqual(1);
    // expect(findConfigIndexByCursorIdx(textConfig1, 1.9)).toEqual(1);
    // expect(findConfigIndexByCursorIdx(textConfig1, 2.1)).toEqual(2);
    // expect(findConfigIndexByCursorIdx(textConfig1, -0.1, 1)).toEqual(0);
    // expect(findConfigIndexByCursorIdx(textConfig1, 0.1, 1)).toEqual(1);
    // expect(findConfigIndexByCursorIdx(textConfig1, 0.9, 1)).toEqual(1);
    // expect(findConfigIndexByCursorIdx(textConfig1, 1.1, 1)).toEqual(2);
    // expect(findConfigIndexByCursorIdx(textConfig1, 1.9, 1)).toEqual(2);
    // expect(findConfigIndexByCursorIdx(textConfig1, 2.1, 1)).toEqual(2);
  });

  it('richtext_editor findConfigIndexByCursorIdx config 2', () => {
    // expect(findConfigIndexByCursorIdx(textConfig2, -0.1)).toEqual(0);
    // expect(findConfigIndexByCursorIdx(textConfig2, 0.1)).toEqual(0);
    // expect(findConfigIndexByCursorIdx(textConfig2, 0.9)).toEqual(0);
    // expect(findConfigIndexByCursorIdx(textConfig2, 1.1)).toEqual(2);
    // expect(findConfigIndexByCursorIdx(textConfig2, 1.9)).toEqual(2);
    // expect(findConfigIndexByCursorIdx(textConfig2, 2.1)).toEqual(3);
    // expect(findConfigIndexByCursorIdx(textConfig2, 2.9)).toEqual(3);
    // expect(findConfigIndexByCursorIdx(textConfig2, 3.1)).toEqual(4);
    // expect(findConfigIndexByCursorIdx(textConfig2, 3.9)).toEqual(4);
    // expect(findConfigIndexByCursorIdx(textConfig2, 4.1)).toEqual(5);
    // expect(findConfigIndexByCursorIdx(textConfig2, 4.9)).toEqual(5);
    // expect(findConfigIndexByCursorIdx(textConfig2, 5.1)).toEqual(6);
    // expect(findConfigIndexByCursorIdx(textConfig2, -0.1, 1)).toEqual(0);
    // expect(findConfigIndexByCursorIdx(textConfig2, 0.1, 1)).toEqual(2);
    // expect(findConfigIndexByCursorIdx(textConfig2, 0.9, 1)).toEqual(2);
    // expect(findConfigIndexByCursorIdx(textConfig2, 1.1, 1)).toEqual(3);
    // expect(findConfigIndexByCursorIdx(textConfig2, 1.9, 1)).toEqual(3);
    // expect(findConfigIndexByCursorIdx(textConfig2, 2.1, 1)).toEqual(4);
    // expect(findConfigIndexByCursorIdx(textConfig2, 2.9, 1)).toEqual(4);
    // expect(findConfigIndexByCursorIdx(textConfig2, 3.1, 1)).toEqual(5);
    // expect(findConfigIndexByCursorIdx(textConfig2, 3.9, 1)).toEqual(5);
    // expect(findConfigIndexByCursorIdx(textConfig2, 4.1, 1)).toEqual(6);
    // expect(findConfigIndexByCursorIdx(textConfig2, 4.9, 1)).toEqual(6);
    // expect(findConfigIndexByCursorIdx(textConfig2, 5.1, 1)).toEqual(6);
  });

  it('richtext_editor findConfigIndexByCursorIdx config 3', () => {
    // expect(findConfigIndexByCursorIdx(textConfig3, -0.1)).toEqual(0);
    // expect(findConfigIndexByCursorIdx(textConfig3, 0.1)).toEqual(0);
    // expect(findConfigIndexByCursorIdx(textConfig3, 0.9)).toEqual(0);
    // expect(findConfigIndexByCursorIdx(textConfig3, 1.1)).toEqual(2);
    // expect(findConfigIndexByCursorIdx(textConfig3, 1.9)).toEqual(2);
    // expect(findConfigIndexByCursorIdx(textConfig3, 2.1)).toEqual(3);
    // expect(findConfigIndexByCursorIdx(textConfig3, 2.9)).toEqual(3);
    // expect(findConfigIndexByCursorIdx(textConfig3, 3.1)).toEqual(5);
    // expect(findConfigIndexByCursorIdx(textConfig3, 3.9)).toEqual(5);
    // expect(findConfigIndexByCursorIdx(textConfig3, 4.1)).toEqual(6);
    // expect(findConfigIndexByCursorIdx(textConfig3, 4.9)).toEqual(6);
    // expect(findConfigIndexByCursorIdx(textConfig3, 5.1)).toEqual(7);
    // expect(findConfigIndexByCursorIdx(textConfig3, 5.9)).toEqual(7);
    // expect(findConfigIndexByCursorIdx(textConfig3, -0.1, 1)).toEqual(0);
    // expect(findConfigIndexByCursorIdx(textConfig3, 0.1, 1)).toEqual(2);
    // expect(findConfigIndexByCursorIdx(textConfig3, 0.9, 1)).toEqual(2);
    // expect(findConfigIndexByCursorIdx(textConfig3, 1.1, 1)).toEqual(3);
    // expect(findConfigIndexByCursorIdx(textConfig3, 1.9, 1)).toEqual(3);
    // expect(findConfigIndexByCursorIdx(textConfig3, 2.1, 1)).toEqual(5);
    // expect(findConfigIndexByCursorIdx(textConfig3, 2.9, 1)).toEqual(5);
    // expect(findConfigIndexByCursorIdx(textConfig3, 3.1, 1)).toEqual(6);
    // expect(findConfigIndexByCursorIdx(textConfig3, 3.9, 1)).toEqual(6);
    // expect(findConfigIndexByCursorIdx(textConfig3, 4.1, 1)).toEqual(7);
    // expect(findConfigIndexByCursorIdx(textConfig3, 4.9, 1)).toEqual(7);
    // expect(findConfigIndexByCursorIdx(textConfig3, 5.1, 1)).toEqual(7);
    // expect(findConfigIndexByCursorIdx(textConfig3, 5.9, 1)).toEqual(7);
  });

  it('richtext_editor findCursorIdxByConfigIndex config 1', () => {
    // expect(findCursorIdxByConfigIndex(textConfig1, 0)).toEqual(0.1);
    // expect(findCursorIdxByConfigIndex(textConfig1, 1)).toEqual(1.1);
    // expect(findCursorIdxByConfigIndex(textConfig1, 2)).toEqual(2.1);
    // expect(findCursorIdxByConfigIndex(textConfig1, 0, -0.1)).toEqual(-0.1);
    // expect(findCursorIdxByConfigIndex(textConfig1, 1, -0.1)).toEqual(0.9);
    // expect(findCursorIdxByConfigIndex(textConfig1, 2, -0.1)).toEqual(1.9);
  });
  it('richtext_editor findCursorIdxByConfigIndex config 2', () => {
    // expect(findCursorIdxByConfigIndex(textConfig2, 0)).toEqual(0.1);
    // expect(findCursorIdxByConfigIndex(textConfig2, 1)).toEqual(0.9);
    // expect(findCursorIdxByConfigIndex(textConfig2, 2)).toEqual(0.9);
    // expect(findCursorIdxByConfigIndex(textConfig2, 3)).toEqual(1.9);
    // expect(findCursorIdxByConfigIndex(textConfig2, 4)).toEqual(2.9);
    // expect(findCursorIdxByConfigIndex(textConfig2, 5)).toEqual(4.1);
    // expect(findCursorIdxByConfigIndex(textConfig2, 6)).toEqual(5.1);
    // expect(findCursorIdxByConfigIndex(textConfig2, 0, -0.1)).toEqual(-0.1);
    // expect(findCursorIdxByConfigIndex(textConfig2, 1, -0.1)).toEqual(0.9);
    // expect(findCursorIdxByConfigIndex(textConfig2, 2, -0.1)).toEqual(0.9);
    // expect(findCursorIdxByConfigIndex(textConfig2, 3, -0.1)).toEqual(1.9);
    // expect(findCursorIdxByConfigIndex(textConfig2, 4, -0.1)).toEqual(2.9);
    // expect(findCursorIdxByConfigIndex(textConfig2, 5, -0.1)).toEqual(3.9);
    // expect(findCursorIdxByConfigIndex(textConfig2, 6, -0.1)).toEqual(4.9);
  });
  it('richtext_editor findCursorIdxByConfigIndex config 3', () => {
    // expect(findCursorIdxByConfigIndex(textConfig3, 0)).toEqual(0.1);
    // expect(findCursorIdxByConfigIndex(textConfig3, 1)).toEqual(0.9);
    // expect(findCursorIdxByConfigIndex(textConfig3, 2)).toEqual(0.9);
    // expect(findCursorIdxByConfigIndex(textConfig3, 3)).toEqual(2.1);
    // expect(findCursorIdxByConfigIndex(textConfig3, 4)).toEqual(2.9);
    // expect(findCursorIdxByConfigIndex(textConfig3, 5)).toEqual(2.9);
    // expect(findCursorIdxByConfigIndex(textConfig3, 6)).toEqual(4.1);
    // expect(findCursorIdxByConfigIndex(textConfig3, 7)).toEqual(5.1);
    // expect(findCursorIdxByConfigIndex(textConfig3, 0, -0.1)).toEqual(-0.1);
    // expect(findCursorIdxByConfigIndex(textConfig3, 1, -0.1)).toEqual(0.9);
    // expect(findCursorIdxByConfigIndex(textConfig3, 2, -0.1)).toEqual(0.9);
    // expect(findCursorIdxByConfigIndex(textConfig3, 3, -0.1)).toEqual(1.9);
    // expect(findCursorIdxByConfigIndex(textConfig3, 4, -0.1)).toEqual(2.9);
    // expect(findCursorIdxByConfigIndex(textConfig3, 5, -0.1)).toEqual(2.9);
    // expect(findCursorIdxByConfigIndex(textConfig3, 6, -0.1)).toEqual(3.9);
    // expect(findCursorIdxByConfigIndex(textConfig3, 7, -0.1)).toEqual(4.9);
  });
});
