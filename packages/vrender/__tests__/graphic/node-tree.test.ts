/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { createGroup, createRect, createText } from '../../src/index';

describe('node-tree', () => {
  it('insertInto', () => {
    const group = createGroup({});
    const g1 = createRect({});
    const g2 = createRect({});
    const g3 = createRect({});
    const g4 = createRect({});
    const g5 = createRect({});
    const g6 = createRect({});
    group.insertInto(g1, 10);
    group.insertInto(g2, 30);
    group.insertInto(g3, 20);
    group.insertInto(g4, 12);
    group.insertInto(g5, 2);
    group.insertInto(g6, 3);
    const children = [g1, g2, g5, g6, g3, g4];
    expect(group.children.length).toEqual(children.length);
    group.getChildren().forEach((v, i) => {
      expect(v).toEqual(children[i]);
    });
  });
  it('insertIntoKeepIdx', () => {
    const group = createGroup({});
    const g1 = createRect({});
    const g2 = createRect({});
    const g3 = createRect({});
    const g4 = createRect({});
    const g5 = createRect({});
    const g6 = createRect({});
    group.insertIntoKeepIdx(g1, 10);
    group.insertIntoKeepIdx(g2, 30);
    group.insertIntoKeepIdx(g3, 20);
    group.insertIntoKeepIdx(g4, 12);
    group.insertIntoKeepIdx(g5, 2);
    group.insertIntoKeepIdx(g6, 3);
    const children = [g5, g6, g1, g4, g3, g2];
    expect(group.getChildren().length).toEqual(children.length);
    group.getChildren().forEach((v, i) => {
      expect(v).toEqual(children[i]);
    });

    const group2 = createGroup({});
    const g21 = createRect({});
    const g22 = createRect({});
    group2.insertIntoKeepIdx(g21, 1);
    group2.insertIntoKeepIdx(g22, 0);
    const children2 = [g22, g21];
    expect(group2.getChildren().length).toEqual(children2.length);
    group2.getChildren().forEach((v, i) => {
      expect(v).toEqual(children2[i]);
    });
  });

  describe('find api', () => {
    let tableGroup;
    let headerGroup;
    let bodyGroup;
    beforeAll(() => {
      // tableGroup
      tableGroup = createGroup({
        x: 10,
        y: 10,
        width: 800,
        height: 300,
        stroke: '#000',
        lineWidth: 2
      });
      tableGroup.name = 'tableGroup';

      headerGroup = createGroup({
        x: 0,
        y: 0,
        width: 800,
        height: 50,
        stroke: '#000',
        lineWidth: 2
      });
      headerGroup.name = 'headerGroup';

      tableGroup.add(headerGroup);

      bodyGroup = createGroup({
        x: 0,
        y: 50,
        width: 800,
        height: 250,
        stroke: '#000',
        lineWidth: 2
      });
      bodyGroup.name = 'bodyGroup';

      for (let i = 0; i < 5; i++) {
        const columnGroup = createGroup({
          x: i * 160,
          y: 0,
          width: 160,
          height: 250,
          stroke: '#000',
          lineWidth: 2
        });
        columnGroup.name = 'columnGroup';
        columnGroup.id = `columnGroup-${i}`;
        for (let j = 0; j < 5; j++) {
          const cellGroup = createGroup({
            x: 0,
            y: j * 50,
            width: 160,
            height: 50,
            stroke: '#000',
            lineWidth: 2,
            pickable: true,
            childrenPickable: i === 2
          });
          cellGroup.id = `cell_${i}_${j}`;
          cellGroup.name = 'cellGroup';
          const text = createText({
            x: 80,
            y: 25,
            text: `cell_${i}_${j}`,
            textAlign: 'center',
            textBaseline: 'middle',
            fill: 'red'
          });
          text.name = 'cellText';
          text.id = `cellText_${i}_${j}`;
          cellGroup.add(text);
          columnGroup.add(cellGroup);
        }
        bodyGroup.add(columnGroup);
      }
      tableGroup.add(bodyGroup);
    });
    it('should be work when call find()', () => {
      expect(tableGroup.find(node => node.name === 'bodyGroup')).toBe(bodyGroup);
      expect(tableGroup.find(node => node.name === 'columnGroup')).toBeNull;

      const result = tableGroup.find(node => node.id === 'cell_2_2', true);
      expect(result.id).toBe('cell_2_2');
    });

    it('should be work when call findAll()', () => {
      expect(tableGroup.findAll(node => node.name === 'columnGroup')).toHaveLength(0);
      expect(tableGroup.findAll(node => node.name === 'columnGroup', true)).toHaveLength(5);
    });

    it('should be work when call getElementById()', () => {
      const result = tableGroup.getElementById('cellText_2_2');
      expect(result.id).toBe('cellText_2_2');
    });

    it('should be work when call findChildrenByName()', () => {
      const result = tableGroup.findChildrenByName('cellGroup');
      expect(result).toHaveLength(25);
    });
  });
});
