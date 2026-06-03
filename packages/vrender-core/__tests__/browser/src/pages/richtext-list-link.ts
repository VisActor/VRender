import { createStage, createRichText, container } from '@visactor/vrender';
import { loadBrowserEnv, registerRichtext } from '@visactor/vrender-kits';
import { addShapesToStage } from '../utils';

loadBrowserEnv(container);
registerRichtext();

export const page = () => {
  const shapes: any[] = [];

  // ============================================================
  // Demo 1: 基本无序列表
  // ============================================================
  shapes.push(
    createRichText({
      x: 30,
      y: 30,
      width: 350,
      height: 0,
      textConfig: [
        { text: '无序列表\n', fontSize: 18, fontWeight: 'bold', fill: '#333' },
        { listType: 'unordered', text: '苹果 — 一种常见水果', fill: '#333', fontSize: 14 },
        { listType: 'unordered', text: '香蕉 — 富含钾元素的热带水果', fill: '#333', fontSize: 14 },
        { listType: 'unordered', text: '橙子 — 维生素C含量丰富', fill: '#333', fontSize: 14 }
      ] as any
    })
  );

  // ============================================================
  // Demo 2: 有序列表
  // ============================================================
  shapes.push(
    createRichText({
      x: 30,
      y: 180,
      width: 350,
      height: 0,
      textConfig: [
        { text: '有序列表\n', fontSize: 18, fontWeight: 'bold', fill: '#333' },
        { listType: 'ordered', text: '第一步：安装依赖', fill: '#333', fontSize: 14 },
        { listType: 'ordered', text: '第二步：初始化配置', fill: '#333', fontSize: 14 },
        { listType: 'ordered', text: '第三步：运行项目', fill: '#333', fontSize: 14 }
      ] as any
    })
  );

  // ============================================================
  // Demo 3: 嵌套列表（多级缩进）
  // ============================================================
  shapes.push(
    createRichText({
      x: 30,
      y: 350,
      width: 350,
      height: 0,
      textConfig: [
        { text: '嵌套列表\n', fontSize: 18, fontWeight: 'bold', fill: '#333' },
        { listType: 'unordered', listLevel: 1, text: '前端技术', fill: '#333', fontSize: 14 },
        { listType: 'unordered', listLevel: 2, text: 'React', fill: '#555', fontSize: 13 },
        { listType: 'unordered', listLevel: 2, text: 'Vue', fill: '#555', fontSize: 13 },
        { listType: 'unordered', listLevel: 3, text: 'Vue 2', fill: '#777', fontSize: 12 },
        { listType: 'unordered', listLevel: 3, text: 'Vue 3', fill: '#777', fontSize: 12 },
        { listType: 'unordered', listLevel: 1, text: '后端技术', fill: '#333', fontSize: 14 },
        { listType: 'unordered', listLevel: 2, text: 'Node.js', fill: '#555', fontSize: 13 },
        { listType: 'unordered', listLevel: 2, text: 'Go', fill: '#555', fontSize: 13 }
      ] as any
    })
  );

  // ============================================================
  // Demo 4: 有序列表 + 嵌套 + 自定义 marker
  // ============================================================
  shapes.push(
    createRichText({
      x: 420,
      y: 30,
      width: 350,
      height: 0,
      textConfig: [
        { text: '混合有序嵌套 & 自定义marker\n', fontSize: 18, fontWeight: 'bold', fill: '#333' },
        { listType: 'ordered', listLevel: 1, text: '数据可视化', fill: '#333', fontSize: 14 },
        { listType: 'ordered', listLevel: 2, text: 'VChart', fill: '#555', fontSize: 13 },
        { listType: 'ordered', listLevel: 2, text: 'VTable', fill: '#555', fontSize: 13 },
        { listType: 'ordered', listLevel: 1, text: '渲染引擎', fill: '#333', fontSize: 14 },
        {
          listType: 'unordered',
          listLevel: 2,
          listMarker: '★',
          text: 'VRender（自定义标记）',
          fill: '#555',
          fontSize: 13,
          markerColor: '#e6a817'
        },
        {
          listType: 'unordered',
          listLevel: 2,
          listMarker: '→',
          text: 'Canvas 2D',
          fill: '#555',
          fontSize: 13,
          markerColor: '#3073F2'
        }
      ] as any
    })
  );

  // ============================================================
  // Demo 5: 长文本自动换行（续行缩进测试）
  // ============================================================
  shapes.push(
    createRichText({
      x: 420,
      y: 250,
      width: 350,
      height: 0,
      wordBreak: 'break-word',
      textConfig: [
        { text: '长文本续行缩进\n', fontSize: 18, fontWeight: 'bold', fill: '#333' },
        {
          listType: 'ordered',
          text: '当列表项文本超出容器宽度时，应该自动换行并保持与首行文字对齐的悬挂缩进效果，而不是回到最左侧。',
          fill: '#333',
          fontSize: 14
        },
        {
          listType: 'ordered',
          text: '第二项也是长文本：这可以验证有序编号自动递增后续行缩进是否正确跟随 marker 的实际宽度。',
          fill: '#333',
          fontSize: 14
        },
        {
          listType: 'unordered',
          text: '无序列表的长文本同样需要保持续行缩进对齐效果，确保视觉上整齐统一。',
          fill: '#333',
          fontSize: 14
        }
      ] as any
    })
  );

  // ============================================================
  // Demo 6: 基本链接
  // ============================================================
  const linkRichText = createRichText({
    x: 420,
    y: 530,
    width: 350,
    height: 0,
    textConfig: [
      { text: '链接测试\n', fontSize: 18, fontWeight: 'bold', fill: '#333' },
      { text: '欢迎访问 ', fill: '#333', fontSize: 14 },
      {
        text: 'VisActor 官网',
        href: 'https://visactor.io',
        fontSize: 14
        // 默认自动添加蓝色和下划线
      },
      { text: ' 了解更多信息。也可以查看 ', fill: '#333', fontSize: 14 },
      {
        text: 'GitHub 仓库',
        href: 'https://github.com/VisActor',
        fontSize: 14,
        linkColor: '#9c27b0'
      },
      { text: '。', fill: '#333', fontSize: 14 }
    ] as any
  });
  linkRichText.bindIconEvent();
  linkRichText.addEventListener('richtext-link-click', (e: any) => {
    console.log('Link clicked:', e.detail);
    const info = document.getElementById('link-info');
    if (info) {
      info.textContent = `点击了链接: ${e.detail.href} (${e.detail.text})`;
    }
    window.open(e.detail.href, '_blank');
  });
  shapes.push(linkRichText);

  // ============================================================
  // Demo 7: 链接换行（多段 region 测试）
  // ============================================================
  const wrappedLinkRichText = createRichText({
    x: 820,
    y: 30,
    width: 300,
    height: 0,
    wordBreak: 'break-word',
    textConfig: [
      { text: '链接换行测试\n', fontSize: 18, fontWeight: 'bold', fill: '#333' },
      { text: '这段文字包含一个', fill: '#333', fontSize: 14 },
      {
        text: '很长很长很长很长很长的超链接文本，它会换行到下一行继续显示',
        href: 'https://visactor.io/vrender',
        fontSize: 14
      },
      { text: '，换行后的链接段也应该可以点击。', fill: '#333', fontSize: 14 }
    ] as any
  });
  wrappedLinkRichText.bindIconEvent();
  wrappedLinkRichText.addEventListener('richtext-link-click', (e: any) => {
    console.log('Wrapped link clicked:', e.detail);
    const info = document.getElementById('link-info');
    if (info) {
      info.textContent = `点击了换行链接: ${e.detail.href}`;
    }
    window.open(e.detail.href, '_blank');
  });
  shapes.push(wrappedLinkRichText);

  // ============================================================
  // Demo 8: 列表 + 链接组合
  // ============================================================
  const listWithLinks = createRichText({
    x: 820,
    y: 200,
    width: 350,
    height: 0,
    textConfig: [
      { text: '列表 + 链接组合\n', fontSize: 18, fontWeight: 'bold', fill: '#333' },
      { text: '推荐资源：\n', fill: '#555', fontSize: 14 },
      { listType: 'ordered', text: 'VChart 图表库', fill: '#333', fontSize: 14 },
      { listType: 'ordered', text: 'VTable 表格组件', fill: '#333', fontSize: 14 },
      { listType: 'ordered', text: 'VRender 渲染引擎', fill: '#333', fontSize: 14 },
      { text: '\n上方为列表，下方为链接：\n', fill: '#555', fontSize: 14 },
      { text: '项目主页: ', fill: '#333', fontSize: 14 },
      { text: 'visactor.io', href: 'https://visactor.io', fontSize: 14 }
    ] as any
  });
  listWithLinks.bindIconEvent();
  listWithLinks.addEventListener('richtext-link-click', (e: any) => {
    console.log('List+Link clicked:', e.detail);
    const info = document.getElementById('link-info');
    if (info) {
      info.textContent = `点击了链接: ${e.detail.href} (${e.detail.text})`;
    }
    window.open(e.detail.href, '_blank');
  });
  shapes.push(listWithLinks);

  // ============================================================
  // Demo 9: 双位数有序列表（验证编号宽度跟随）
  // ============================================================
  shapes.push(
    createRichText({
      x: 820,
      y: 430,
      width: 350,
      height: 0,
      textConfig: [
        { text: '双位数编号列表\n', fontSize: 18, fontWeight: 'bold', fill: '#333' },
        ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(i => ({
          listType: 'ordered' as const,
          text: `第 ${i} 项内容`,
          fill: '#333',
          fontSize: 13
        }))
      ] as any
    })
  );

  // ============================================================
  // 创建 Stage 并渲染
  // ============================================================
  const stage = createStage({
    canvas: 'main',
    autoRender: true
  });

  // 添加点击信息展示区
  const infoDiv = document.createElement('div');
  infoDiv.id = 'link-info';
  infoDiv.style.cssText =
    'position:fixed;bottom:20px;left:20px;padding:8px 16px;background:#f0f0f0;border-radius:4px;font-size:14px;color:#333;z-index:999;';
  infoDiv.textContent = '点击链接后此处显示信息';
  document.body.appendChild(infoDiv);

  addShapesToStage(stage, shapes, true);
  stage.render();

  (window as any).stage = stage;
};
