import type { Node } from '../../../src/graphic/node-tree';

function loadNodeCopy(): typeof Node {
  let copy: typeof Node;
  jest.isolateModules(() => {
    copy = jest.requireActual<{ Node: typeof Node }>('../../../src/graphic/node-tree').Node;
  });
  return copy;
}

describe('node trees across independently loaded bundles', () => {
  test('attaches a child from another bundle instead of treating it as the parent itself', () => {
    const FirstNode = loadNodeCopy();
    const SecondNode = loadNodeCopy();
    expect(FirstNode).not.toBe(SecondNode);

    const parent = new FirstNode();
    const child = new SecondNode();

    expect(parent.appendChild(child)).toBe(child);
    expect(parent.firstChild).toBe(child);
    expect(parent.childrenCount).toBe(1);
    expect(child.parent).toBe(parent);
    expect(parent.appendChild(parent)).toBeNull();
  });

  test('preserves child lookup and removal when reparenting nodes from another bundle', () => {
    const FirstNode = loadNodeCopy();
    const SecondNode = loadNodeCopy();
    const firstParent = new FirstNode();
    const firstChild = new FirstNode();
    const secondParent = new SecondNode();
    const secondChild = new SecondNode();
    firstParent.appendChild(firstChild);
    secondParent.appendChild(secondChild);

    firstParent.appendChild(secondChild);

    expect(secondParent.childrenCount).toBe(0);
    expect(firstParent.childrenCount).toBe(2);
    expect(firstParent.findChildByUid(firstChild._uid)).toBe(firstChild);
    expect(firstParent.findChildByUid(secondChild._uid)).toBe(secondChild);
    expect(firstParent.removeChild(firstChild)).toBe(firstChild);
    expect(firstChild.parent).toBeNull();
    expect(firstParent.firstChild).toBe(secondChild);
    expect(firstParent.findChildByUid(secondChild._uid)).toBe(secondChild);
    expect(firstParent.removeChild(secondChild)).toBe(secondChild);
    expect(firstParent.childrenCount).toBe(0);
  });

  test('distinguishes ancestry in separate trees created by different bundles', () => {
    const FirstNode = loadNodeCopy();
    const SecondNode = loadNodeCopy();
    const firstParent = new FirstNode();
    const firstChild = new FirstNode();
    const secondParent = new SecondNode();
    const secondChild = new SecondNode();
    firstParent.appendChild(firstChild);
    secondParent.appendChild(secondChild);

    expect(firstChild.isChildOf(firstParent)).toBe(true);
    expect(firstChild.isChildOf(secondParent)).toBe(false);
    expect(firstChild.isDescendantsOf(secondParent)).toBe(false);
    expect(firstParent.containNode(secondChild)).toBe(false);
    expect(secondParent.containNode(firstChild)).toBe(false);
  });
});
