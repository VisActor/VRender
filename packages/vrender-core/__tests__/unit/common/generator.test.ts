/**
 * @jest-environment node
 */

import { Generator } from '../../../src/common/generator';

declare const require: any;

describe('Generator', () => {
  test('GenAutoIncrementId returns a finite number', () => {
    const id = Generator.GenAutoIncrementId();
    expect(typeof id).toBe('number');
    expect(Number.isFinite(id)).toBe(true);
  });

  test('GenAutoIncrementId increments by 1 each call (relative assertion)', () => {
    const a = Generator.GenAutoIncrementId();
    const b = Generator.GenAutoIncrementId();

    expect(b).toBe(a + 1);
  });

  test('GenAutoIncrementId keeps monotonically increasing sequence', () => {
    const ids = Array.from({ length: 5 }, () => Generator.GenAutoIncrementId());
    for (let i = 0; i < ids.length - 1; i++) {
      expect(ids[i + 1]).toBe(ids[i] + 1);
    }
  });

  test('GenAutoIncrementId shares one sequence across isolated module instances', () => {
    jest.resetModules();
    const { Generator: FirstGenerator } = require('../../../src/common/generator');
    const firstId = FirstGenerator.GenAutoIncrementId();

    jest.resetModules();
    const { Generator: SecondGenerator } = require('../../../src/common/generator');
    const secondId = SecondGenerator.GenAutoIncrementId();

    expect(secondId).toBe(firstId + 1);
  });

  test('keeps node ids unique across isolated module instances', () => {
    jest.resetModules();
    const { Node: ParentNode } = require('../../../src/graphic/node-tree');
    const parent = new ParentNode();

    jest.resetModules();
    const { Node: ChildNode } = require('../../../src/graphic/node-tree');
    const child = new ChildNode();

    expect(child._uid).not.toBe(parent._uid);
    expect(parent.appendChild(child)).toBe(child);
    expect(parent.firstChild).toBe(child);
  });
});
