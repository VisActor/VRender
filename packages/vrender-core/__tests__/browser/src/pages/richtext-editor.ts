import {
  createStage,
  createRichText,
  ContainerModule,
  RichTextEditPlugin,
  AutoEnablePlugins,
  container
} from '@visactor/vrender';
import { loadBrowserEnv, registerRichtext, registerShadowRoot } from '@visactor/vrender-kits';

loadBrowserEnv(container);
registerRichtext();
registerShadowRoot();

// ---- 初始 textConfig，包含普通文本、列表、链接 ----
const initialTextConfig = [
  { text: 'Hello ', fill: '#1F2329', fontSize: 18, fontWeight: 'bold' },
  { text: 'RichText ', fill: '#3073F2', fontSize: 18 },
  { text: 'Editor', fill: '#1F2329', fontSize: 18, fontStyle: 'italic' },
  { text: '\n' },
  { text: '这是一段可编辑的富文本，支持多种样式。', fill: '#333', fontSize: 14 },
  { text: '\n' },
  { text: '点击上方按钮可以对选中文本应用样式。', fill: '#666', fontSize: 14 },
  { text: '\n' },
  // 无序列表
  { text: '无序列表项 A', fill: '#1F2329', fontSize: 14, listType: 'unordered' as const, listLevel: 1 },
  { text: '\n' },
  { text: '无序列表项 B', fill: '#1F2329', fontSize: 14, listType: 'unordered' as const, listLevel: 1 },
  { text: '\n' },
  { text: '嵌套子项 B-1', fill: '#1F2329', fontSize: 14, listType: 'unordered' as const, listLevel: 2 },
  { text: '\n' },
  // 有序列表
  { text: '有序列表第一项', fill: '#1F2329', fontSize: 14, listType: 'ordered' as const, listLevel: 1 },
  { text: '\n' },
  { text: '有序列表第二项', fill: '#1F2329', fontSize: 14, listType: 'ordered' as const, listLevel: 1 },
  { text: '\n' },
  // 链接
  { text: '访问 GitHub', fill: '#3073F2', fontSize: 14, underline: true, href: 'https://github.com' },
  { text: ' | ' },
  { text: 'VisActor 官网', fill: '#3073F2', fontSize: 14, underline: true, href: 'https://visactor.io' }
];

export const page = () => {
  const c = new ContainerModule(bind => {
    bind(RichTextEditPlugin).toSelf();
    bind(AutoEnablePlugins).toService(RichTextEditPlugin);
  });
  container.load(c);

  const richText = createRichText({
    visible: true,
    x: 60,
    y: 30,
    text: null,
    fontSize: 14,
    whiteSpace: 'normal',
    fill: '#1F2329',
    ignoreBuf: true,
    editable: true,
    editOptions: {
      placeholder: '请输入文本...',
      placeholderColor: '#B3B8C3',
      keepHeightWhileEmpty: true,
      boundsStrokeWhenInput: '#4E83FD',
      syncPlaceholderToTextConfig: false,
      stopPropagation: true
    },
    fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif',
    width: 500,
    height: 0,
    strokeBoundsBuffer: -1,
    scaleX: 2,
    scaleY: 2,
    _debug_bounds: true,
    textConfig: JSON.parse(JSON.stringify(initialTextConfig)),
    upgradeAttrs: { lineHeight: true, multiBreakLine: true }
  });

  const stage = createStage({
    canvas: 'main',
    width: 1200,
    height: 700,
    pluginList: ['RichTextEditPlugin']
  });

  stage.defaultLayer.add(richText);
  stage.render();

  const plugin = stage.pluginService.findPluginsByName('RichTextEditPlugin')[0] as RichTextEditPlugin;

  // ===================== UI 工具栏 =====================
  const containerEl = document.getElementById('container') || document.body;
  const canvasEl = document.getElementById('main');

  const toolbar = document.createElement('div');
  toolbar.style.cssText =
    'display:flex;flex-wrap:wrap;gap:6px;padding:8px 12px;background:#f5f6f8;border-radius:6px;margin-bottom:8px;align-items:center;font-family:sans-serif;font-size:13px;';
  containerEl.insertBefore(toolbar, canvasEl);

  // 选区信息面板
  const infoPanel = document.createElement('div');
  infoPanel.style.cssText =
    'padding:8px 12px;background:#fff;border:1px solid #e0e0e0;border-radius:6px;font-family:monospace;font-size:12px;white-space:pre-wrap;height:100px;overflow:auto;color:#333;margin-bottom:8px;';
  infoPanel.textContent = '选区信息：双击文本进入编辑，选中文本后这里显示信息';
  containerEl.insertBefore(infoPanel, canvasEl);

  const btnStyle =
    'padding:4px 10px;border:1px solid #ccc;border-radius:4px;background:#fff;cursor:pointer;font-size:12px;';
  const activeBtnStyle = btnStyle + 'background:#4E83FD;color:#fff;border-color:#4E83FD;';

  const createBtn = (label: string, onClick: () => void, title?: string) => {
    const btn = document.createElement('button');
    btn.innerHTML = label;
    btn.style.cssText = btnStyle;
    btn.title = title || label;
    btn.addEventListener('click', onClick);
    toolbar.appendChild(btn);
    return btn;
  };

  const addSeparator = () => {
    const sep = document.createElement('span');
    sep.style.cssText = 'width:1px;height:20px;background:#ccc;margin:0 2px;';
    toolbar.appendChild(sep);
  };

  // ---- 基础样式按钮 ----
  const label = document.createElement('span');
  label.textContent = '样式：';
  label.style.fontWeight = 'bold';
  toolbar.appendChild(label);

  createBtn('<b>B</b>', () => plugin.dispatchCommand('FORMAT_TEXT_COMMAND', 'bold'), '加粗');
  createBtn('<i>I</i>', () => plugin.dispatchCommand('FORMAT_TEXT_COMMAND', 'italic'), '斜体');
  createBtn('<u>U</u>', () => plugin.dispatchCommand('FORMAT_TEXT_COMMAND', 'underline'), '下划线');
  createBtn('<s>S</s>', () => plugin.dispatchCommand('FORMAT_TEXT_COMMAND', 'lineThrough'), '删除线');

  addSeparator();

  // ---- 颜色按钮 ----
  const colors = [
    { label: '红色', fill: '#E54545' },
    { label: '蓝色', fill: '#3073F2' },
    { label: '绿色', fill: '#2EA121' },
    { label: '橙色', fill: '#F77234' },
    { label: '紫色', fill: '#7B61FF' },
    { label: '黑色', fill: '#1F2329' }
  ];
  colors.forEach(c => {
    const btn = createBtn(
      `<span style="display:inline-block;width:14px;height:14px;background:${c.fill};border-radius:2px;vertical-align:middle;"></span>`,
      () => plugin.dispatchCommand('FORMAT_TEXT_COMMAND', { fill: c.fill }),
      `文字颜色: ${c.label}`
    );
    btn.style.padding = '4px 6px';
  });

  addSeparator();

  // ---- 背景色按钮 ----
  const bgLabel = document.createElement('span');
  bgLabel.textContent = '背景：';
  bgLabel.style.fontWeight = 'bold';
  toolbar.appendChild(bgLabel);

  const bgColors = [
    { label: '粉色', bg: '#FFE4E6' },
    { label: '黄色', bg: '#FEF3C7' },
    { label: '绿色', bg: '#D1FAE5' },
    { label: '蓝色', bg: '#DBEAFE' },
    { label: '无', bg: '' }
  ];
  bgColors.forEach(c => {
    createBtn(
      c.bg
        ? `<span style="display:inline-block;width:14px;height:14px;background:${c.bg};border:1px solid #ccc;border-radius:2px;vertical-align:middle;"></span>`
        : '✕',
      () => plugin.dispatchCommand('FORMAT_TEXT_COMMAND', { background: c.bg || undefined }),
      `背景色: ${c.label}`
    );
  });

  addSeparator();

  // ---- 字号按钮 ----
  const fsLabel = document.createElement('span');
  fsLabel.textContent = '字号：';
  fsLabel.style.fontWeight = 'bold';
  toolbar.appendChild(fsLabel);

  [12, 14, 16, 20, 24, 32].forEach(size => {
    createBtn(`${size}`, () => plugin.dispatchCommand('FORMAT_TEXT_COMMAND', { fontSize: size }), `字号 ${size}px`);
  });

  // ---- 第二行工具栏 ----
  const toolbar2 = document.createElement('div');
  toolbar2.style.cssText =
    'display:flex;flex-wrap:wrap;gap:6px;padding:8px 12px;background:#f5f6f8;border-radius:6px;margin-bottom:8px;align-items:center;font-family:sans-serif;font-size:13px;';
  containerEl.insertBefore(toolbar2, canvasEl);

  const createBtn2 = (label: string, onClick: () => void, title?: string) => {
    const btn = document.createElement('button');
    btn.innerHTML = label;
    btn.style.cssText = btnStyle;
    btn.title = title || label;
    btn.addEventListener('click', onClick);
    toolbar2.appendChild(btn);
    return btn;
  };

  const addSeparator2 = () => {
    const sep = document.createElement('span');
    sep.style.cssText = 'width:1px;height:20px;background:#ccc;margin:0 2px;';
    toolbar2.appendChild(sep);
  };

  // ---- 链接操作 ----
  const linkLabel = document.createElement('span');
  linkLabel.textContent = '链接：';
  linkLabel.style.fontWeight = 'bold';
  toolbar2.appendChild(linkLabel);

  createBtn2(
    '🔗 添加链接',
    () => {
      const href = prompt('请输入链接地址:', 'https://visactor.io');
      if (href) {
        plugin.dispatchCommand('FORMAT_LINK_COMMAND', { href, linkColor: '#3073F2' });
      }
    },
    '为选中文本添加链接'
  );

  createBtn2(
    '🚫 移除链接',
    () => {
      plugin.dispatchCommand('REMOVE_LINK_COMMAND', null);
    },
    '移除选中文本的链接'
  );

  addSeparator2();

  // ---- 列表操作（直接修改 textConfig） ----
  const listLabel = document.createElement('span');
  listLabel.textContent = '列表：';
  listLabel.style.fontWeight = 'bold';
  toolbar2.appendChild(listLabel);

  createBtn2(
    '● 无序列表',
    () => {
      const tc = richText.attribute.textConfig || [];
      tc.push(
        { text: '\n' },
        { text: '新无序列表项', fill: '#1F2329', fontSize: 14, listType: 'unordered' as const, listLevel: 1 }
      );
      richText.setAttributes({ textConfig: [...tc] });
      stage.render();
    },
    '追加一个无序列表项'
  );

  createBtn2(
    '1. 有序列表',
    () => {
      const tc = richText.attribute.textConfig || [];
      tc.push(
        { text: '\n' },
        { text: '新有序列表项', fill: '#1F2329', fontSize: 14, listType: 'ordered' as const, listLevel: 1 }
      );
      richText.setAttributes({ textConfig: [...tc] });
      stage.render();
    },
    '追加一个有序列表项'
  );

  createBtn2(
    '⤵ 嵌套子项',
    () => {
      const tc = richText.attribute.textConfig || [];
      tc.push(
        { text: '\n' },
        { text: '嵌套子项', fill: '#1F2329', fontSize: 14, listType: 'unordered' as const, listLevel: 2 }
      );
      richText.setAttributes({ textConfig: [...tc] });
      stage.render();
    },
    '追加一个嵌套的无序列表子项'
  );

  addSeparator2();

  // ---- 预设样式一键应用 ----
  const presetLabel = document.createElement('span');
  presetLabel.textContent = '预设：';
  presetLabel.style.fontWeight = 'bold';
  toolbar2.appendChild(presetLabel);

  createBtn2(
    '标题样式',
    () => {
      plugin.dispatchCommand('FORMAT_TEXT_COMMAND', { fontSize: 24, fontWeight: 'bold', fill: '#1F2329' });
    },
    '将选中文本设为标题样式'
  );

  createBtn2(
    '代码样式',
    () => {
      plugin.dispatchCommand('FORMAT_TEXT_COMMAND', {
        fontFamily: 'Menlo, Monaco, Consolas, monospace',
        fontSize: 13,
        fill: '#D63384',
        background: '#F8F9FA'
      });
    },
    '将选中文本设为代码样式'
  );

  createBtn2(
    '引用样式',
    () => {
      plugin.dispatchCommand('FORMAT_TEXT_COMMAND', {
        fill: '#6B7280',
        fontStyle: 'italic',
        fontSize: 14
      });
    },
    '将选中文本设为引用样式'
  );

  createBtn2(
    '高亮样式',
    () => {
      plugin.dispatchCommand('FORMAT_TEXT_COMMAND', {
        fill: '#B45309',
        background: '#FEF3C7',
        fontWeight: 'bold'
      });
    },
    '将选中文本高亮'
  );

  addSeparator2();

  // ---- 重置按钮 ----
  const resetBtn = createBtn2(
    '🔄 重置内容',
    () => {
      richText.setAttributes({ textConfig: JSON.parse(JSON.stringify(initialTextConfig)) });
      stage.render();
      infoPanel.textContent = '已重置为初始内容';
    },
    '重置富文本为初始内容'
  );
  resetBtn.style.cssText = activeBtnStyle;

  // ---- 全选按钮 ----
  createBtn2(
    '全选',
    () => {
      plugin.fullSelection();
    },
    '全选文本'
  );

  // ===================== 选区信息监听 =====================
  const updateSelectionInfo = (p: RichTextEditPlugin) => {
    const selection = p.getSelection();
    if (!selection) {
      infoPanel.textContent = '选区信息：无选区';
      return;
    }

    const text = selection.getSelectionPureText();
    const isEmpty = selection.isEmpty();

    const formats: Record<string, any> = {};
    [
      'fill',
      'fontSize',
      'fontWeight',
      'fontStyle',
      'fontFamily',
      'underline',
      'lineThrough',
      'background',
      'href'
    ].forEach(key => {
      const vals = selection.getAllFormat(key);
      if (vals && vals.length > 0 && vals.some((v: any) => v != null)) {
        formats[key] = vals.length === 1 ? vals[0] : vals;
      }
    });

    const lines = [
      `选区信息：`,
      `  空选区: ${isEmpty}`,
      `  选中文本: "${text.length > 80 ? text.slice(0, 80) + '...' : text}"`,
      `  光标位置: ${p.curCursorIdx}`,
      `  选区开始: ${p.selectionStartCursorIdx}`,
      `  格式属性:`,
      ...Object.entries(formats).map(([k, v]) => `    ${k}: ${JSON.stringify(v)}`)
    ];

    infoPanel.textContent = lines.join('\n');
  };

  // 仅在 pointerup 时刷新选区信息，避免拖选时面板抖动
  stage.on('pointerup', () => {
    setTimeout(() => updateSelectionInfo(plugin), 50);
  });

  plugin.registerUpdateListener((type, p) => {
    if (type === 'onfocus') {
      updateSelectionInfo(p);
    }
    if (type === 'defocus') {
      infoPanel.textContent = '选区信息：已退出编辑';
    }
  });

  // ===================== 链接点击事件 =====================
  richText.bindIconEvent();
  richText.addEventListener('bindLinkClick', (e: any) => {
    const { href, text } = e.detail || {};
    if (href) {
      infoPanel.textContent = `链接点击：${text} → ${href}`;
    }
  });

  (window as any).stage = stage;
  (window as any).richText = richText;
  (window as any).plugin = plugin;
};
