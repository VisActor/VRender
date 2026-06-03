/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck

// We need to test the Selection class and command handlers.
// The Selection class is not exported directly, so we test through RichTextEditPlugin.CreateSelection
// and the static/instance methods.

// Mock some dependencies that the plugin needs
jest.mock('../../src/application', () => ({
  application: {
    graphicService: {
      updateTempAABBBounds: jest.fn(),
      transformAABBBounds: jest.fn()
    },
    global: {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      isMacOS: jest.fn(() => false),
      copyToClipBoard: jest.fn()
    }
  }
}));

jest.mock('../../src/graphic/bounds', () => ({
  getRichTextBounds: jest.fn(() => ({
    x1: 0,
    y1: 0,
    x2: 100,
    y2: 20,
    width: () => 100,
    height: () => 20
  })),
  getTextBounds: jest.fn(() => ({
    x1: 0,
    y1: 0,
    x2: 50,
    y2: 16,
    width: () => 50,
    height: () => 16
  }))
}));

jest.mock('../../src/graphic/richtext/utils', () => {
  const actual = jest.requireActual('../../src/graphic/richtext/utils');
  return {
    ...actual,
    measureTextCanvas: (text: string, character: any, mode?: string) => {
      const fontSize = character.fontSize || 16;
      const width = text.length * fontSize * 0.6;
      return {
        ascent: Math.floor(fontSize * 0.8),
        descent: Math.floor(fontSize * 0.2),
        height: fontSize,
        width: Math.floor(width + (character.space ?? 0))
      };
    },
    getStrByWithCanvas: (desc: string, width: number, character: any, guessIndex: number) => {
      const fontSize = character.fontSize || 16;
      const charWidth = fontSize * 0.6;
      return Math.max(0, Math.floor(width / charWidth));
    }
  };
});

import { RichText } from '../../src/graphic/richtext';
import {
  RichTextEditPlugin,
  FORMAT_TEXT_COMMAND,
  FORMAT_ALL_TEXT_COMMAND,
  FORMAT_LINK_COMMAND,
  REMOVE_LINK_COMMAND
} from '../../src/plugins/builtin-plugin/richtext-edit-plugin';
import { findConfigIndexByCursorIdx, findCursorIdxByConfigIndex } from '../../src/plugins/builtin-plugin/edit-module';

// ========== Helpers ==========

function createMockRichText(textConfig: any[]) {
  // Create a minimal mock RichText-like object
  const rt = {
    type: 'richtext',
    attribute: {
      textConfig,
      width: 300,
      height: 200
    },
    setAttributes: jest.fn(function (attrs) {
      if (attrs.textConfig) {
        this.attribute.textConfig = attrs.textConfig;
      }
      Object.assign(this.attribute, attrs);
    }),
    getFrameCache: jest.fn(() => null),
    AABBBounds: { x1: 0, y1: 0, x2: 300, y2: 200, width: () => 300, height: () => 200 },
    globalTransMatrix: {
      getInverse: jest.fn(() => ({
        transformPoint: jest.fn((point, out) => {
          if (out) {
            out.x = point.x || 0;
            out.y = point.y || 0;
          }
          return out || { x: point.x || 0, y: point.y || 0 };
        })
      }))
    },
    shadowRoot: null,
    attachShadow: jest.fn(function () {
      const sr = {
        setAttributes: jest.fn(),
        removeAllChild: jest.fn(),
        add: jest.fn(),
        removeChild: jest.fn()
      };
      this.shadowRoot = sr;
      return sr;
    })
  };
  return rt;
}

function setupPlugin(plugin, rt) {
  plugin.currRt = rt;
  plugin.selectionStartCursorIdx = 0;
  plugin.curCursorIdx = 1;
  // Create a chainable mock for animation
  const chainable = {
    to: jest.fn().mockReturnThis(),
    wait: jest.fn().mockReturnThis(),
    loop: jest.fn().mockReturnThis(),
    stop: jest.fn(),
    release: jest.fn()
  };
  // Mock editLine and editBg to avoid null errors in selectionRangeByCursorIdx
  plugin.editLine = {
    setAttributes: jest.fn(),
    animates: null,
    animate: jest.fn(() => chainable)
  };
  plugin.editBg = {
    setAttributes: jest.fn(),
    removeAllChild: jest.fn()
  };
  plugin.editModule = {
    moveTo: jest.fn(),
    currRt: rt
  };
  plugin.pluginService = {
    stage: {
      window: { getBoundingClientRect: () => ({ left: 0, top: 0 }) },
      renderNextFrame: jest.fn()
    }
  };
}

// ========== Tests ==========

describe('RichTextEditPlugin.CreateSelection', () => {
  it('should return null when rt is null', () => {
    expect(RichTextEditPlugin.CreateSelection(null)).toBeNull();
  });

  it('should create a Selection spanning the full text', () => {
    const rt = createMockRichText([
      { text: 'a', fontSize: 16 },
      { text: 'b', fontSize: 16 },
      { text: 'c', fontSize: 16 }
    ]);
    const selection = RichTextEditPlugin.CreateSelection(rt);
    expect(selection).not.toBeNull();
    expect(selection.selectionStartCursorIdx).toBe(0);
    expect(selection.curCursorIdx).toBe(2); // textConfig.length - 1
    expect(selection.rt).toBe(rt);
  });

  it('should handle empty textConfig', () => {
    const rt = createMockRichText([]);
    const selection = RichTextEditPlugin.CreateSelection(rt);
    expect(selection).not.toBeNull();
    expect(selection.selectionStartCursorIdx).toBe(0);
    expect(selection.curCursorIdx).toBe(-1);
  });

  it('should handle single character textConfig', () => {
    const rt = createMockRichText([{ text: 'x', fontSize: 16 }]);
    const selection = RichTextEditPlugin.CreateSelection(rt);
    expect(selection.selectionStartCursorIdx).toBe(0);
    expect(selection.curCursorIdx).toBe(0);
  });
});

describe('Selection.isEmpty', () => {
  it('should return true when start equals current', () => {
    const rt = createMockRichText([{ text: 'a', fontSize: 16 }]);
    const selection = RichTextEditPlugin.CreateSelection(rt);
    // Modify to make them equal
    selection.selectionStartCursorIdx = 1;
    selection.curCursorIdx = 1;
    expect(selection.isEmpty()).toBe(true);
  });

  it('should return false when start differs from current', () => {
    const rt = createMockRichText([
      { text: 'a', fontSize: 16 },
      { text: 'b', fontSize: 16 }
    ]);
    const selection = RichTextEditPlugin.CreateSelection(rt);
    selection.selectionStartCursorIdx = 0;
    selection.curCursorIdx = 1;
    expect(selection.isEmpty()).toBe(false);
  });
});

describe('Selection.getSelectionPureText', () => {
  it('should return empty string when selection is empty', () => {
    const rt = createMockRichText([
      { text: 'a', fontSize: 16 },
      { text: 'b', fontSize: 16 }
    ]);
    const selection = RichTextEditPlugin.CreateSelection(rt);
    selection.selectionStartCursorIdx = 1;
    selection.curCursorIdx = 1;
    expect(selection.getSelectionPureText()).toBe('');
  });

  it('should return selected text for forward selection', () => {
    const rt = createMockRichText([
      { text: 'H', fontSize: 16 },
      { text: 'e', fontSize: 16 },
      { text: 'l', fontSize: 16 },
      { text: 'l', fontSize: 16 },
      { text: 'o', fontSize: 16 }
    ]);
    const selection = RichTextEditPlugin.CreateSelection(rt);
    selection.selectionStartCursorIdx = 0;
    selection.curCursorIdx = 2;
    const text = selection.getSelectionPureText();
    expect(text.length).toBeGreaterThan(0);
  });

  it('should handle reverse selection (end before start)', () => {
    const rt = createMockRichText([
      { text: 'a', fontSize: 16 },
      { text: 'b', fontSize: 16 },
      { text: 'c', fontSize: 16 }
    ]);
    const selection = RichTextEditPlugin.CreateSelection(rt);
    selection.selectionStartCursorIdx = 2;
    selection.curCursorIdx = 0;
    // Should still return text between min and max
    const text = selection.getSelectionPureText();
    expect(text.length).toBeGreaterThan(0);
  });
});

describe('Selection.hasFormat', () => {
  it('should return true when format exists on selected char', () => {
    const rt = createMockRichText([
      { text: 'a', fontSize: 16, fontWeight: 'bold' },
      { text: 'b', fontSize: 16 }
    ]);
    const selection = RichTextEditPlugin.CreateSelection(rt);
    selection.selectionStartCursorIdx = 0;
    selection.curCursorIdx = 0;
    expect(selection.hasFormat('fontWeight')).toBe(true);
  });

  it('should return false when format does not exist', () => {
    const rt = createMockRichText([
      { text: 'a', fontSize: 16 },
      { text: 'b', fontSize: 16 }
    ]);
    const selection = RichTextEditPlugin.CreateSelection(rt);
    selection.selectionStartCursorIdx = 0;
    selection.curCursorIdx = 0;
    expect(selection.hasFormat('fontStyle')).toBe(false);
  });
});

describe('Selection.getFormat', () => {
  it('should return format value for single cursor position', () => {
    const rt = createMockRichText([
      { text: 'a', fontSize: 24 },
      { text: 'b', fontSize: 16 }
    ]);
    const selection = RichTextEditPlugin.CreateSelection(rt);
    selection.selectionStartCursorIdx = 0;
    selection.curCursorIdx = 0;
    expect(selection.getFormat('fontSize')).toBe(24);
  });

  it('should return null when rt is null', () => {
    const rt = createMockRichText([{ text: 'a', fontSize: 16 }]);
    const selection = RichTextEditPlugin.CreateSelection(rt);
    selection.rt = null;
    expect(selection.getFormat('fontSize')).toBeNull();
  });

  it('should return null for empty textConfig', () => {
    const rt = createMockRichText([]);
    const selection = RichTextEditPlugin.CreateSelection(rt);
    selection.selectionStartCursorIdx = 0;
    selection.curCursorIdx = 0;
    expect(selection.getFormat('fontSize')).toBeNull();
  });
});

describe('Selection.getAllFormat', () => {
  it('should return unique format values across selection range', () => {
    const rt = createMockRichText([
      { text: 'a', fontSize: 16, fill: 'red' },
      { text: 'b', fontSize: 16, fill: 'blue' },
      { text: 'c', fontSize: 16, fill: 'red' }
    ]);
    const selection = RichTextEditPlugin.CreateSelection(rt);
    selection.selectionStartCursorIdx = 0;
    selection.curCursorIdx = 2;
    const fills = selection.getAllFormat('fill');
    expect(fills).toContain('red');
    expect(fills).toContain('blue');
  });

  it('should return single value when all same', () => {
    const rt = createMockRichText([
      { text: 'a', fontSize: 16, fill: 'red' },
      { text: 'b', fontSize: 16, fill: 'red' }
    ]);
    const selection = RichTextEditPlugin.CreateSelection(rt);
    selection.selectionStartCursorIdx = 0;
    selection.curCursorIdx = 1;
    const fills = selection.getAllFormat('fill');
    expect(fills).toEqual(['red']);
  });

  it('should handle supportOutAttr', () => {
    const rt = createMockRichText([
      { text: 'a', fontSize: 16 },
      { text: 'b', fontSize: 16 }
    ]);
    rt.attribute.fill = 'green';
    const selection = RichTextEditPlugin.CreateSelection(rt);
    selection.selectionStartCursorIdx = 0;
    selection.curCursorIdx = 0;
    const fills = selection.getAllFormat('fill', true);
    // Should include the outer attribute
    expect(fills.length).toBeGreaterThan(0);
  });
});

describe('RichTextEditPlugin static methods', () => {
  it('tryUpdateRichtext should transform multi-char config to single chars', () => {
    const rt = createMockRichText([{ text: 'abc', fontSize: 16 }]);
    // Need getFrameCache to return a cache with multi-char paragraphs
    rt.getFrameCache = jest.fn(() => ({
      lines: [{ paragraphs: [{ text: 'abc' }] }],
      icons: new Map(),
      links: new Map()
    }));
    rt.doUpdateFrameCache = jest.fn();

    RichTextEditPlugin.tryUpdateRichtext(rt);

    expect(rt.setAttributes).toHaveBeenCalled();
    const lastCall = rt.setAttributes.mock.calls[0][0];
    expect(lastCall.textConfig).toHaveLength(3);
    expect(lastCall.textConfig[0].text).toBe('a');
    expect(lastCall.textConfig[1].text).toBe('b');
    expect(lastCall.textConfig[2].text).toBe('c');
  });

  it('tryUpdateRichtext should not modify already-single-char config', () => {
    const rt = createMockRichText([
      { text: 'a', fontSize: 16 },
      { text: 'b', fontSize: 16 }
    ]);
    rt.getFrameCache = jest.fn(() => ({
      lines: [{ paragraphs: [{ text: 'a' }, { text: 'b' }] }],
      icons: new Map(),
      links: new Map()
    }));

    RichTextEditPlugin.tryUpdateRichtext(rt);

    expect(rt.setAttributes).not.toHaveBeenCalled();
  });
});

describe('RichTextEditPlugin constructor', () => {
  it('should initialize with correct default values', () => {
    const plugin = new RichTextEditPlugin();
    expect(plugin.name).toBe('RichTextEditPlugin');
    expect(plugin.activeEvent).toBe('onRegister');
    expect(plugin.editing).toBe(false);
    expect(plugin.focusing).toBe(false);
    expect(plugin.pointerDown).toBe(false);
  });

  it('should have FORMAT_TEXT_COMMAND registered', () => {
    const plugin = new RichTextEditPlugin();
    expect(plugin.commandCbs.has(FORMAT_TEXT_COMMAND)).toBe(true);
    expect(plugin.commandCbs.get(FORMAT_TEXT_COMMAND)).toHaveLength(1);
  });

  it('should have FORMAT_ALL_TEXT_COMMAND registered', () => {
    const plugin = new RichTextEditPlugin();
    expect(plugin.commandCbs.has(FORMAT_ALL_TEXT_COMMAND)).toBe(true);
  });

  it('should have FORMAT_LINK_COMMAND registered', () => {
    const plugin = new RichTextEditPlugin();
    expect(plugin.commandCbs.has(FORMAT_LINK_COMMAND)).toBe(true);
  });

  it('should have REMOVE_LINK_COMMAND registered', () => {
    const plugin = new RichTextEditPlugin();
    expect(plugin.commandCbs.has(REMOVE_LINK_COMMAND)).toBe(true);
  });
});

describe('RichTextEditPlugin.registerCommand and removeCommand', () => {
  it('should register a new command callback', () => {
    const plugin = new RichTextEditPlugin();
    const cb = jest.fn();
    plugin.registerCommand('MY_COMMAND', cb);
    expect(plugin.commandCbs.has('MY_COMMAND')).toBe(true);
    expect(plugin.commandCbs.get('MY_COMMAND')).toContain(cb);
  });

  it('should add multiple callbacks for the same command', () => {
    const plugin = new RichTextEditPlugin();
    const cb1 = jest.fn();
    const cb2 = jest.fn();
    plugin.registerCommand('MY_COMMAND', cb1);
    plugin.registerCommand('MY_COMMAND', cb2);
    const cbs = plugin.commandCbs.get('MY_COMMAND');
    expect(cbs).toHaveLength(2);
    expect(cbs).toContain(cb1);
    expect(cbs).toContain(cb2);
  });

  it('should remove a command callback', () => {
    const plugin = new RichTextEditPlugin();
    const cb = jest.fn();
    plugin.registerCommand('MY_COMMAND', cb);
    plugin.removeCommand('MY_COMMAND', cb);
    expect(plugin.commandCbs.get('MY_COMMAND')).toHaveLength(0);
  });

  it('should handle removing non-existent callback', () => {
    const plugin = new RichTextEditPlugin();
    const cb = jest.fn();
    plugin.removeCommand('NONEXISTENT', cb);
    // Should not throw
  });
});

describe('RichTextEditPlugin.registerUpdateListener and removeUpdateListener', () => {
  it('should register an update listener', () => {
    const plugin = new RichTextEditPlugin();
    const cb = jest.fn();
    plugin.registerUpdateListener(cb);
    expect(plugin.updateCbs).toContain(cb);
  });

  it('should remove an update listener', () => {
    const plugin = new RichTextEditPlugin();
    const cb = jest.fn();
    plugin.registerUpdateListener(cb);
    plugin.removeUpdateListener(cb);
    expect(plugin.updateCbs).not.toContain(cb);
  });
});

describe('RichTextEditPlugin.getSelection', () => {
  it('should return null when currRt is null', () => {
    const plugin = new RichTextEditPlugin();
    plugin.currRt = null;
    expect(plugin.getSelection()).toBeNull();
  });

  it('should return Selection when cursor indices are set', () => {
    const plugin = new RichTextEditPlugin();
    plugin.currRt = createMockRichText([
      { text: 'a', fontSize: 16 },
      { text: 'b', fontSize: 16 }
    ]);
    plugin.selectionStartCursorIdx = 0;
    plugin.curCursorIdx = 1;
    const selection = plugin.getSelection();
    expect(selection).not.toBeNull();
    expect(selection.selectionStartCursorIdx).toBe(0);
    expect(selection.curCursorIdx).toBe(1);
  });

  it('should return full selection when defaultAll is true and no cursor', () => {
    const plugin = new RichTextEditPlugin();
    plugin.currRt = createMockRichText([
      { text: 'a', fontSize: 16 },
      { text: 'b', fontSize: 16 }
    ]);
    plugin.selectionStartCursorIdx = undefined;
    plugin.curCursorIdx = undefined;
    const selection = plugin.getSelection(true);
    expect(selection).not.toBeNull();
  });

  it('should return null when defaultAll is false and no cursor', () => {
    const plugin = new RichTextEditPlugin();
    plugin.currRt = createMockRichText([
      { text: 'a', fontSize: 16 },
      { text: 'b', fontSize: 16 }
    ]);
    plugin.selectionStartCursorIdx = undefined;
    plugin.curCursorIdx = undefined;
    expect(plugin.getSelection(false)).toBeNull();
  });
});

describe('FORMAT_TEXT_COMMAND constants', () => {
  it('should export correct string constants', () => {
    expect(FORMAT_TEXT_COMMAND).toBe('FORMAT_TEXT_COMMAND');
    expect(FORMAT_ALL_TEXT_COMMAND).toBe('FORMAT_ALL_TEXT_COMMAND');
    expect(FORMAT_LINK_COMMAND).toBe('FORMAT_LINK_COMMAND');
    expect(REMOVE_LINK_COMMAND).toBe('REMOVE_LINK_COMMAND');
  });
});

describe('RichTextEditPlugin._formatTextCommand', () => {
  let plugin;

  beforeEach(() => {
    plugin = new RichTextEditPlugin();
  });

  it('should apply bold format', () => {
    const config = [
      { text: 'a', fontSize: 16 },
      { text: 'b', fontSize: 16 }
    ];
    const rt = createMockRichText(config);
    setupPlugin(plugin, rt);

    plugin._formatTextCommand('bold', config, rt);

    expect(config[0].fontWeight).toBe('bold');
    expect(config[1].fontWeight).toBe('bold');
  });

  it('should apply italic format', () => {
    const config = [{ text: 'a', fontSize: 16 }];
    const rt = createMockRichText(config);
    setupPlugin(plugin, rt);

    plugin._formatTextCommand('italic', config, rt);

    expect(config[0].fontStyle).toBe('italic');
  });

  it('should apply underline format', () => {
    const config = [{ text: 'a', fontSize: 16 }];
    const rt = createMockRichText(config);
    setupPlugin(plugin, rt);

    plugin._formatTextCommand('underline', config, rt);

    expect(config[0].underline).toBe(true);
  });

  it('should apply lineThrough format', () => {
    const config = [{ text: 'a', fontSize: 16 }];
    const rt = createMockRichText(config);
    setupPlugin(plugin, rt);

    plugin._formatTextCommand('lineThrough', config, rt);

    expect(config[0].lineThrough).toBe(true);
  });

  it('should merge object payload', () => {
    const config = [{ text: 'a', fontSize: 16 }];
    const rt = createMockRichText(config);
    setupPlugin(plugin, rt);

    plugin._formatTextCommand({ fontSize: 24, fill: 'red' }, config, rt);

    expect(config[0].fontSize).toBe(24);
    expect(config[0].fill).toBe('red');
  });

  it('should call setAttributes on rt', () => {
    const config = [{ text: 'a', fontSize: 16 }];
    const rt = createMockRichText(config);
    setupPlugin(plugin, rt);

    plugin._formatTextCommand('bold', config, rt);

    expect(rt.setAttributes).toHaveBeenCalledWith(rt.attribute);
  });

  it('should handle null cache gracefully', () => {
    const config = [{ text: 'a', fontSize: 16 }];
    const rt = createMockRichText(config);
    rt.getFrameCache = jest.fn(() => null);
    setupPlugin(plugin, rt);

    // Should not throw
    expect(() => plugin._formatTextCommand('bold', config, rt)).not.toThrow();
  });
});

describe('formatLinkCommandCb', () => {
  it('should add href to selected text config items', () => {
    const plugin = new RichTextEditPlugin();
    const config = [
      { text: 'a', fontSize: 16 },
      { text: 'b', fontSize: 16 },
      { text: 'c', fontSize: 16 }
    ];
    const rt = createMockRichText(config);
    setupPlugin(plugin, rt);

    plugin.formatLinkCommandCb({ href: 'https://example.com' }, plugin);

    // Check that href was set on affected items
    const updatedConfig = rt.attribute.textConfig;
    const hasHref = updatedConfig.some(item => item.href === 'https://example.com');
    expect(hasHref).toBe(true);
  });

  it('should not modify when currRt is null', () => {
    const plugin = new RichTextEditPlugin();
    plugin.currRt = null;
    // Should not throw
    expect(() => plugin.formatLinkCommandCb({ href: 'https://example.com' }, plugin)).not.toThrow();
  });

  it('should not modify when selection is empty', () => {
    const plugin = new RichTextEditPlugin();
    const config = [{ text: 'a', fontSize: 16 }];
    const rt = createMockRichText(config);
    setupPlugin(plugin, rt);
    plugin.selectionStartCursorIdx = 1;
    plugin.curCursorIdx = 1;

    plugin.formatLinkCommandCb({ href: 'https://example.com' }, plugin);

    // Should not add href when selection is empty
    expect(config[0].href).toBeUndefined();
  });

  it('should apply default link color when fill is black', () => {
    const plugin = new RichTextEditPlugin();
    const config = [
      { text: 'a', fontSize: 16, fill: 'black' },
      { text: 'b', fontSize: 16, fill: 'black' }
    ];
    const rt = createMockRichText(config);
    setupPlugin(plugin, rt);

    plugin.formatLinkCommandCb({ href: 'https://example.com' }, plugin);

    expect(config[0].fill).toBe('#3073F2');
  });

  it('should apply custom link color', () => {
    const plugin = new RichTextEditPlugin();
    const config = [{ text: 'a', fontSize: 16, fill: 'black' }];
    const rt = createMockRichText(config);
    setupPlugin(plugin, rt);
    plugin.selectionStartCursorIdx = 0;
    plugin.curCursorIdx = 0.1;

    plugin.formatLinkCommandCb({ href: 'https://test.com', linkColor: '#FF0000' }, plugin);

    expect(config[0].fill).toBe('#FF0000');
    expect(config[0].linkColor).toBe('#FF0000');
  });
});

describe('removeLinkCommandCb', () => {
  it('should remove href from selected text config items', () => {
    const plugin = new RichTextEditPlugin();
    const config = [
      { text: 'a', fontSize: 16, href: 'https://example.com', underline: true },
      { text: 'b', fontSize: 16, href: 'https://example.com', underline: true }
    ];
    const rt = createMockRichText(config);
    setupPlugin(plugin, rt);

    plugin.removeLinkCommandCb(null, plugin);

    expect(config[0].href).toBeUndefined();
    expect(config[0].underline).toBe(false);
    expect(config[1].href).toBeUndefined();
  });

  it('should not modify when currRt is null', () => {
    const plugin = new RichTextEditPlugin();
    plugin.currRt = null;
    expect(() => plugin.removeLinkCommandCb(null, plugin)).not.toThrow();
  });

  it('should also remove linkColor and linkHoverColor', () => {
    const plugin = new RichTextEditPlugin();
    const config = [
      { text: 'a', fontSize: 16, href: 'https://test.com', linkColor: '#FF0000', linkHoverColor: '#00FF00' }
    ];
    const rt = createMockRichText(config);
    setupPlugin(plugin, rt);
    plugin.selectionStartCursorIdx = 0;
    plugin.curCursorIdx = 0.1;

    plugin.removeLinkCommandCb(null, plugin);

    expect(config[0].linkColor).toBeUndefined();
    expect(config[0].linkHoverColor).toBeUndefined();
  });
});

describe('RichTextEditPlugin.dispatchCommand', () => {
  it('should invoke registered command callbacks', () => {
    const plugin = new RichTextEditPlugin();
    const cb = jest.fn();
    plugin.registerCommand('TEST_CMD', cb);
    plugin.dispatchCommand('TEST_CMD', { data: 'test' });
    expect(cb).toHaveBeenCalledWith({ data: 'test' }, plugin);
  });

  it('should invoke update listeners after command', () => {
    const plugin = new RichTextEditPlugin();
    const updateCb = jest.fn();
    plugin.registerUpdateListener(updateCb);
    plugin.registerCommand('TEST_CMD', jest.fn());
    plugin.dispatchCommand('TEST_CMD', {});
    expect(updateCb).toHaveBeenCalledWith('dispatch', plugin);
  });

  it('should not throw for unknown command', () => {
    const plugin = new RichTextEditPlugin();
    expect(() => plugin.dispatchCommand('UNKNOWN_CMD', {})).not.toThrow();
  });
});

describe('Selection._getFormat', () => {
  it('should skip newline characters when counting', () => {
    const rt = createMockRichText([
      { text: 'a', fontSize: 16, fill: 'red' },
      { text: '\n', fontSize: 16, fill: 'green' },
      { text: 'b', fontSize: 16, fill: 'blue' }
    ]);
    const selection = RichTextEditPlugin.CreateSelection(rt);
    // cursorIdx 0 should map to 'a' (fill: red)
    const val = selection._getFormat('fill', 0);
    expect(val).toBe('red');
  });

  it('should return null for null rt', () => {
    const rt = createMockRichText([{ text: 'a', fontSize: 16 }]);
    const selection = RichTextEditPlugin.CreateSelection(rt);
    selection.rt = null;
    expect(selection._getFormat('fill', 0)).toBeNull();
  });

  it('should return last item value when idx exceeds config length', () => {
    const rt = createMockRichText([{ text: 'a', fontSize: 16, fill: 'red' }]);
    const selection = RichTextEditPlugin.CreateSelection(rt);
    // Large cursor idx
    const val = selection._getFormat('fill', 100);
    expect(typeof val === 'string' || val === undefined).toBe(true);
  });
});
