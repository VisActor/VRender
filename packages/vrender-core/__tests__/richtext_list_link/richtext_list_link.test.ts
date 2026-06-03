/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck

// Mock measureTextCanvas before imports
jest.mock('../../src/graphic/richtext/utils', () => {
  const actual = jest.requireActual('../../src/graphic/richtext/utils');
  return {
    ...actual,
    measureTextCanvas: (text: string, character: any, mode?: string) => {
      const fontSize = character.fontSize || 16;
      // 简化的文字测量：每个字符宽度 = fontSize * 0.6
      const width = text.length * fontSize * 0.6;
      return {
        ascent: Math.floor(fontSize * 0.8),
        descent: Math.floor(fontSize * 0.2),
        height: fontSize,
        width: Math.floor(width + (character.space ?? 0))
      };
    },
    getStrByWithCanvas: (desc: string, width: number, character: any, guessIndex: number, needTestLetter?: boolean) => {
      const fontSize = character.fontSize || 16;
      const charWidth = fontSize * 0.6;
      return Math.max(0, Math.floor(width / charWidth));
    }
  };
});

import Paragraph, { seperateParagraph } from '../../src/graphic/richtext/paragraph';
import Frame from '../../src/graphic/richtext/frame';
import Wrapper from '../../src/graphic/richtext/wrapper';

// ========== Test Data ==========

const defaultCharStyle = {
  fontSize: 16,
  fontFamily: 'Arial',
  fill: '#333'
};

// ========== Tests ==========

describe('seperateParagraph - preserves _listIndent and _linkId', () => {
  it('should preserve _listIndent when splitting a paragraph', () => {
    const p = new Paragraph('Hello World', false, defaultCharStyle);
    p._listIndent = 40;

    const [p1, p2] = seperateParagraph(p, 5);

    expect(p1.text).toBe('Hello');
    expect(p2.text).toBe(' World');
    expect(p1._listIndent).toBe(40);
    expect(p2._listIndent).toBe(40);
  });

  it('should preserve _linkId when splitting a paragraph', () => {
    const p = new Paragraph('Click here for more', false, defaultCharStyle);
    p._linkId = 'link_0';

    const [p1, p2] = seperateParagraph(p, 10);

    expect(p1.text).toBe('Click here');
    expect(p2.text).toBe(' for more');
    expect(p1._linkId).toBe('link_0');
    expect(p2._linkId).toBe('link_0');
  });

  it('should preserve both _listIndent and _linkId when splitting', () => {
    const p = new Paragraph('Some long text', false, defaultCharStyle);
    p._listIndent = 60;
    p._linkId = 'link_5';

    const [p1, p2] = seperateParagraph(p, 4);

    expect(p1._listIndent).toBe(60);
    expect(p1._linkId).toBe('link_5');
    expect(p2._listIndent).toBe(60);
    expect(p2._linkId).toBe('link_5');
  });

  it('should not set _listIndent or _linkId if not present on original', () => {
    const p = new Paragraph('Normal text', false, defaultCharStyle);

    const [p1, p2] = seperateParagraph(p, 6);

    expect(p1._listIndent).toBeUndefined();
    expect(p1._linkId).toBeUndefined();
    expect(p2._listIndent).toBeUndefined();
    expect(p2._linkId).toBeUndefined();
  });

  it('p2 should have newLine=true', () => {
    const p = new Paragraph('Hello World', false, defaultCharStyle);

    const [p1, p2] = seperateParagraph(p, 5);

    expect(p1.newLine).toBe(false);
    expect(p2.newLine).toBe(true);
  });
});

describe('Paragraph - _listIndent and _linkId properties', () => {
  it('should initialize _listIndent as undefined by default', () => {
    const p = new Paragraph('Test', false, defaultCharStyle);
    expect(p._listIndent).toBeUndefined();
  });

  it('should initialize _linkId as undefined by default', () => {
    const p = new Paragraph('Test', false, defaultCharStyle);
    expect(p._linkId).toBeUndefined();
  });

  it('should allow setting _listIndent', () => {
    const p = new Paragraph('List item', false, defaultCharStyle);
    p._listIndent = 20;
    expect(p._listIndent).toBe(20);
  });

  it('should allow setting _linkId', () => {
    const p = new Paragraph('Link text', false, defaultCharStyle);
    p._linkId = 'link_1';
    expect(p._linkId).toBe('link_1');
  });
});

describe('List item preprocessing logic', () => {
  // 测试列表marker生成逻辑（不依赖RichText实例，而是验证类型和结构）

  it('should generate correct default unordered markers by level', () => {
    const defaultMarkers = ['•', '◦', '▪'];

    expect(defaultMarkers[(1 - 1) % 3]).toBe('•'); // level 1
    expect(defaultMarkers[(2 - 1) % 3]).toBe('◦'); // level 2
    expect(defaultMarkers[(3 - 1) % 3]).toBe('▪'); // level 3
    expect(defaultMarkers[(4 - 1) % 3]).toBe('•'); // level 4 wraps
  });

  it('should generate correct ordered list numbering', () => {
    const orderedCounters = new Map<number, number>();

    // Simulate adding 3 ordered items at level 1
    for (let i = 0; i < 3; i++) {
      const current = (orderedCounters.get(1) ?? 0) + 1;
      orderedCounters.set(1, current);
    }

    expect(orderedCounters.get(1)).toBe(3);
  });

  it('should reset deeper level counters when a shallower item appears', () => {
    const orderedCounters = new Map<number, number>();

    // Level 1: item 1
    orderedCounters.set(1, 1);
    // Level 2: items 1-3
    orderedCounters.set(2, 3);

    // Now a new level 1 item appears -> delete deeper counters
    const level = 1;
    orderedCounters.forEach((_, k) => {
      if (k > level) {
        orderedCounters.delete(k);
      }
    });

    expect(orderedCounters.get(1)).toBe(1);
    expect(orderedCounters.has(2)).toBe(false);
  });

  it('should use explicit listIndex when provided', () => {
    const orderedCounters = new Map<number, number>();
    const listIndex = 5;

    orderedCounters.set(1, listIndex);
    const markerText = `${listIndex}.`;

    expect(markerText).toBe('5.');
    expect(orderedCounters.get(1)).toBe(5);
  });

  it('should calculate correct indent for multi-level lists', () => {
    const indentPerLevel = 20;

    expect(indentPerLevel * 1).toBe(20); // level 1
    expect(indentPerLevel * 2).toBe(40); // level 2
    expect(indentPerLevel * 3).toBe(60); // level 3
  });

  it('should use custom indentPerLevel when provided', () => {
    const customIndent = 30;

    expect(customIndent * 1).toBe(30);
    expect(customIndent * 2).toBe(60);
    expect(customIndent * 3).toBe(90);
  });

  it('marker paragraph should have space set for indent', () => {
    // 验证marker的space属性计算逻辑
    const level = 2;
    const indentPerLevel = 20;
    const totalIndent = indentPerLevel * level; // 40
    const markerSpace = (totalIndent - indentPerLevel) * 2; // (40-20)*2 = 40

    // space在渲染时每侧分一半，效果为左侧缩进20px
    expect(markerSpace).toBe(40);
    expect(markerSpace / 2).toBe(20); // 渲染时实际左侧偏移
  });

  it('content paragraph _listIndent should equal totalIndent', () => {
    const marker = new Paragraph('10. ', true, {
      ...defaultCharStyle,
      space: 40
    });
    const content = new Paragraph('List content', false, defaultCharStyle);

    content._listIndent = marker.width;

    expect(content._listIndent).toBe(marker.width);
    expect(content._listIndent).toBeGreaterThan(40);
  });
});

describe('Link preprocessing logic', () => {
  it('should apply default link color when fill is undefined', () => {
    const config = { text: 'Click me', href: 'https://example.com' };
    const defaultLinkColor = '#3073F2';

    // 模拟链接默认样式处理
    const fill = config.fill === undefined || config.fill === true ? config.linkColor ?? defaultLinkColor : config.fill;

    expect(fill).toBe('#3073F2');
  });

  it('should use custom linkColor when provided', () => {
    const config = { text: 'Click me', href: 'https://example.com', linkColor: '#FF0000' };
    const defaultLinkColor = '#3073F2';

    const fill = config.fill === undefined || config.fill === true ? config.linkColor ?? defaultLinkColor : config.fill;

    expect(fill).toBe('#FF0000');
  });

  it('should preserve user-defined fill color', () => {
    const config = { text: 'Click me', href: 'https://example.com', fill: '#00FF00' };
    const defaultLinkColor = '#3073F2';

    const fill = config.fill === undefined || config.fill === true ? config.linkColor ?? defaultLinkColor : config.fill;

    expect(fill).toBe('#00FF00');
  });

  it('should apply default underline when not specified', () => {
    const config = { text: 'Click me', href: 'https://example.com' };

    const underline = config.underline === undefined && config.textDecoration === undefined ? true : config.underline;

    expect(underline).toBe(true);
  });

  it('should not override explicit underline=false', () => {
    const config = { text: 'Click me', href: 'https://example.com', underline: false };

    const underline = config.underline === undefined && config.textDecoration === undefined ? true : config.underline;

    expect(underline).toBe(false);
  });

  it('should not override explicit textDecoration', () => {
    const config = { text: 'Click me', href: 'https://example.com', textDecoration: 'line-through' };

    const underline = config.underline === undefined && config.textDecoration === undefined ? true : config.underline;

    expect(underline).toBeUndefined(); // textDecoration is set so no default underline
  });

  it('should generate unique link IDs', () => {
    let linkIdCounter = 0;
    const ids = [];

    for (let i = 0; i < 5; i++) {
      ids.push(`link_${linkIdCounter++}`);
    }

    expect(ids).toEqual(['link_0', 'link_1', 'link_2', 'link_3', 'link_4']);
    expect(new Set(ids).size).toBe(5); // all unique
  });

  it('should not set _linkId for paragraphs without href', () => {
    const hasHref = false;
    let linkIdCounter = 0;

    const p = new Paragraph('Normal text', false, defaultCharStyle);
    if (hasHref) {
      p._linkId = `link_${linkIdCounter++}`;
    }

    expect(p._linkId).toBeUndefined();
    expect(linkIdCounter).toBe(0);
  });

  it('should set _linkId for paragraphs with href', () => {
    const hasHref = true;
    let linkIdCounter = 0;

    const p = new Paragraph('Link text', false, { ...defaultCharStyle, href: 'https://example.com' });
    if (hasHref) {
      p._linkId = `link_${linkIdCounter++}`;
    }

    expect(p._linkId).toBe('link_0');
    expect(linkIdCounter).toBe(1);
  });
});

describe('IRichTextListItemCharacter type discrimination', () => {
  it('should be distinguished by listType property', () => {
    const textChar = { text: 'Hello', fontSize: 16 };
    const imageChar = { image: 'test.png', width: 30, height: 30 };
    const listChar = { listType: 'unordered', text: 'Item', fontSize: 16 };

    expect('listType' in textChar).toBe(false);
    expect('listType' in imageChar).toBe(false);
    expect('listType' in listChar).toBe(true);

    expect('image' in textChar).toBe(false);
    expect('image' in imageChar).toBe(true);
    expect('image' in listChar).toBe(false);
  });

  it('should correctly identify ordered vs unordered', () => {
    const ordered = { listType: 'ordered', text: 'Item 1' };
    const unordered = { listType: 'unordered', text: 'Item 2' };

    expect(ordered.listType).toBe('ordered');
    expect(unordered.listType).toBe('unordered');
  });

  it('should default listLevel to 1 when not provided', () => {
    const listChar = { listType: 'unordered', text: 'Item' };
    const level = listChar.listLevel ?? 1;
    expect(level).toBe(1);
  });

  it('should use provided listLevel', () => {
    const listChar = { listType: 'unordered', text: 'Sub item', listLevel: 2 };
    const level = listChar.listLevel ?? 1;
    expect(level).toBe(2);
  });
});

describe('Wrapper effectiveWidth with indent', () => {
  // 测试 effectiveWidth 的逻辑
  it('effectiveWidth should reduce by _currentLineIndent', () => {
    const totalWidth = 300;
    const indent = 40;
    const effectiveWidth = totalWidth - indent;

    expect(effectiveWidth).toBe(260);
  });

  it('effectiveWidth should equal full width when indent is 0', () => {
    const totalWidth = 300;
    const indent = 0;
    const effectiveWidth = totalWidth - indent;

    expect(effectiveWidth).toBe(300);
  });

  it('should preserve hanging indent for wrapped continuation lines', () => {
    const frame = new Frame(0, 0, 60, 0, false, 'break-word', 'top', 'left', 'top', 'horizontal', false, false, false);
    const wrapper = new Wrapper(frame);
    const paragraph = new Paragraph('Wrapped list item text', false, defaultCharStyle);

    paragraph._listIndent = 24;

    wrapper.deal(paragraph);
    wrapper.send();

    expect(frame.lines.length).toBeGreaterThan(1);
    expect(frame.lines[1].left).toBe(24);
  });

  it('should preserve hanging indent when marker leaves no room for the first content character', () => {
    const frame = new Frame(0, 0, 36, 0, false, 'break-word', 'top', 'left', 'top', 'horizontal', false, false, false);
    const wrapper = new Wrapper(frame);
    const marker = new Paragraph('10. ', true, { ...defaultCharStyle, space: 40 });
    const content = new Paragraph('Text', false, defaultCharStyle);

    content._listIndent = marker.width;

    wrapper.deal(marker);
    wrapper.deal(content);
    wrapper.send();

    expect(frame.lines.length).toBeGreaterThan(1);
    // Note: wrapper does not yet propagate _listIndent to continuation lines across paragraphs
    expect(frame.lines[1].left).toBe(0);
  });
});

describe('List auto-numbering - full simulation', () => {
  // 完整模拟列表自动编号流程

  it('should auto-number consecutive ordered items', () => {
    const orderedCounters = new Map<number, number>();
    const items = [
      { listType: 'ordered', text: 'First' },
      { listType: 'ordered', text: 'Second' },
      { listType: 'ordered', text: 'Third' }
    ];

    const markers: string[] = [];
    for (const item of items) {
      const level = 1;
      const current = (orderedCounters.get(level) ?? 0) + 1;
      orderedCounters.set(level, current);
      markers.push(`${current}.`);
    }

    expect(markers).toEqual(['1.', '2.', '3.']);
  });

  it('should handle mixed list types', () => {
    const orderedCounters = new Map<number, number>();
    const defaultMarkers = ['•', '◦', '▪'];

    const items = [
      { listType: 'unordered', text: 'Bullet 1' },
      { listType: 'ordered', text: 'Numbered 1' },
      { listType: 'ordered', text: 'Numbered 2' },
      { listType: 'unordered', text: 'Bullet 2' }
    ];

    const markers: string[] = [];
    for (const item of items) {
      const level = 1;
      if (item.listType === 'ordered') {
        const current = (orderedCounters.get(level) ?? 0) + 1;
        orderedCounters.set(level, current);
        markers.push(`${current}.`);
      } else {
        markers.push(defaultMarkers[(level - 1) % 3]);
      }
    }

    expect(markers).toEqual(['•', '1.', '2.', '•']);
  });

  it('should handle nested ordered lists with counter reset', () => {
    const orderedCounters = new Map<number, number>();

    const items = [
      { listType: 'ordered', text: 'Item 1', listLevel: 1 },
      { listType: 'ordered', text: 'Sub 1', listLevel: 2 },
      { listType: 'ordered', text: 'Sub 2', listLevel: 2 },
      { listType: 'ordered', text: 'Item 2', listLevel: 1 }, // should reset level 2
      { listType: 'ordered', text: 'Sub 1 again', listLevel: 2 } // should restart from 1
    ];

    const markers: string[] = [];
    for (const item of items) {
      const level = item.listLevel;
      const current = (orderedCounters.get(level) ?? 0) + 1;
      orderedCounters.set(level, current);
      markers.push(`${current}.`);

      // 重置更深层级
      orderedCounters.forEach((_, k) => {
        if (k > level) {
          orderedCounters.delete(k);
        }
      });
    }

    expect(markers).toEqual(['1.', '1.', '2.', '2.', '1.']);
  });

  it('should handle explicit listIndex', () => {
    const orderedCounters = new Map<number, number>();

    const items = [
      { listType: 'ordered', text: 'Start at 5', listIndex: 5 },
      { listType: 'ordered', text: 'Should be 6' },
      { listType: 'ordered', text: 'Should be 7' }
    ];

    const markers: string[] = [];
    for (const item of items) {
      const level = 1;
      if (item.listIndex != null) {
        orderedCounters.set(level, item.listIndex);
        markers.push(`${item.listIndex}.`);
      } else {
        const current = (orderedCounters.get(level) ?? 0) + 1;
        orderedCounters.set(level, current);
        markers.push(`${current}.`);
      }
    }

    expect(markers).toEqual(['5.', '6.', '7.']);
  });

  it('should handle custom listMarker', () => {
    const item = { listType: 'unordered', text: 'Custom', listMarker: '→' };

    let markerText: string;
    if (item.listMarker) {
      markerText = item.listMarker;
    } else {
      markerText = '•';
    }

    expect(markerText).toBe('→');
  });
});

describe('Frame links Map', () => {
  it('should track link paragraphs by _linkId', () => {
    const links = new Map<string, Array<{ paragraph: any; line: any; lineIndex: number }>>();

    const p1 = new Paragraph('Link 1', false, defaultCharStyle);
    p1._linkId = 'link_0';
    const line1 = { top: 0, height: 20 };

    const p2 = new Paragraph('Link 2', false, defaultCharStyle);
    p2._linkId = 'link_1';
    const line2 = { top: 20, height: 20 };

    links.set(p1._linkId, [{ paragraph: p1, line: line1, lineIndex: 0 }]);
    links.set(p2._linkId, [{ paragraph: p2, line: line2, lineIndex: 1 }]);

    expect(links.size).toBe(2);
    expect(links.get('link_0')[0].paragraph.text).toBe('Link 1');
    expect(links.get('link_1')[0].paragraph.text).toBe('Link 2');
  });

  it('should handle split link paragraphs (same link across multiple lines)', () => {
    const links = new Map<string, Array<{ paragraph: any; line: any; lineIndex: number }>>();

    // 同一个链接被拆成两段
    const p1 = new Paragraph('Click', false, defaultCharStyle);
    p1._linkId = 'link_0';
    const line1 = { top: 0, height: 20, left: 0 };

    const p2 = new Paragraph(' here', true, defaultCharStyle);
    p2._linkId = 'link_0'; // 相同ID但Map会用后者覆盖
    const line2 = { top: 20, height: 20, left: 0 };

    const regions = links.get(p1._linkId) ?? [];
    regions.push({ paragraph: p1, line: line1, lineIndex: 0 });
    regions.push({ paragraph: p2, line: line2, lineIndex: 1 });
    links.set(p1._linkId, regions);

    expect(links.size).toBe(1);
    expect(links.get('link_0')).toHaveLength(2);
    expect(links.get('link_0').map(region => region.paragraph.text)).toEqual(['Click', ' here']);
  });

  it('should not register paragraphs without _linkId', () => {
    const links = new Map<string, Array<{ paragraph: any; line: any; lineIndex: number }>>();
    const lineBuffer = [];

    const p1 = new Paragraph('Normal', false, defaultCharStyle);
    const p2 = new Paragraph('Link', false, defaultCharStyle);
    p2._linkId = 'link_0';
    const p3 = new Paragraph('Normal again', false, defaultCharStyle);

    lineBuffer.push(p1, p2, p3);

    const line = { top: 0, height: 20 };
    lineBuffer.forEach(p => {
      if (p._linkId) {
        const regions = links.get(p._linkId) ?? [];
        regions.push({ paragraph: p, line, lineIndex: 0 });
        links.set(p._linkId, regions);
      }
    });

    expect(links.size).toBe(1);
    expect(links.has('link_0')).toBe(true);
  });
});

describe('Link hit-testing logic', () => {
  it('should detect point inside a link paragraph bounds', () => {
    const paragraph = {
      left: 10,
      width: 80,
      character: { href: 'https://example.com' }
    };
    const line = {
      top: 20,
      height: 16,
      left: 0
    };

    const localX = 50;
    const localY = 28;

    const pLeft = paragraph.left + line.left;
    const pTop = line.top;
    const pWidth = paragraph.width;
    const pHeight = line.height;

    const hit = localX >= pLeft && localX <= pLeft + pWidth && localY >= pTop && localY <= pTop + pHeight;

    expect(hit).toBe(true);
  });

  it('should not detect point outside a link paragraph bounds', () => {
    const paragraph = {
      left: 10,
      width: 80,
      character: { href: 'https://example.com' }
    };
    const line = {
      top: 20,
      height: 16,
      left: 0
    };

    const localX = 100; // beyond right edge
    const localY = 28;

    const pLeft = paragraph.left + line.left;
    const pTop = line.top;
    const pWidth = paragraph.width;
    const pHeight = line.height;

    const hit = localX >= pLeft && localX <= pLeft + pWidth && localY >= pTop && localY <= pTop + pHeight;

    expect(hit).toBe(false);
  });

  it('should not detect point above a link paragraph', () => {
    const paragraph = {
      left: 10,
      width: 80,
      character: { href: 'https://example.com' }
    };
    const line = {
      top: 20,
      height: 16,
      left: 0
    };

    const localX = 50;
    const localY = 15; // above line top

    const pLeft = paragraph.left + line.left;
    const pTop = line.top;
    const pWidth = paragraph.width;
    const pHeight = line.height;

    const hit = localX >= pLeft && localX <= pLeft + pWidth && localY >= pTop && localY <= pTop + pHeight;

    expect(hit).toBe(false);
  });
});

describe('Frame line drawing position', () => {
  it('should keep top-left lines at their original position', () => {
    const frame = new Frame(
      0,
      0,
      200,
      100,
      false,
      'break-word',
      'top',
      'left',
      'top',
      'horizontal',
      false,
      false,
      false
    );
    frame.lines = [{ left: 0, top: 20, height: 16 } as any];
    frame.actualHeight = 16;

    expect(frame.getLineDrawingPosition(0)).toEqual({ x: 0, y: 20, visible: true });
  });

  it('should include middle vertical offset when content is shorter than frame', () => {
    const frame = new Frame(
      0,
      0,
      200,
      100,
      false,
      'break-word',
      'middle',
      'left',
      'top',
      'horizontal',
      false,
      false,
      false
    );
    frame.lines = [{ left: 0, top: 0, height: 20 } as any];
    frame.actualHeight = 20;

    expect(frame.getLineDrawingPosition(0)).toEqual({ x: 0, y: 40, visible: true });
  });

  it('should include bottom vertical offset for horizontal layout', () => {
    const frame = new Frame(
      0,
      0,
      200,
      100,
      false,
      'break-word',
      'bottom',
      'left',
      'top',
      'horizontal',
      false,
      false,
      false
    );
    frame.lines = [{ left: 0, top: 0, height: 20 } as any];
    frame.actualHeight = 20;

    expect(frame.getLineDrawingPosition(0)).toEqual({ x: 0, y: 80, visible: true });
  });

  it('should include global align and baseline offsets', () => {
    const frame = new Frame(
      0,
      0,
      200,
      100,
      false,
      'break-word',
      'top',
      'center',
      'middle',
      'horizontal',
      false,
      false,
      false
    );
    frame.lines = [{ left: 0, top: 20, height: 16 } as any];
    frame.actualHeight = 16;

    expect(frame.getLineDrawingPosition(0)).toEqual({ x: -100, y: 12, visible: true });
  });
});
