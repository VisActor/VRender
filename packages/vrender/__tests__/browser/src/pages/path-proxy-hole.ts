import { createStage, createRect, createText, createGroup, createCircle, createPath } from '@visactor/vrender';

export const page = () => {
  // 创建 Stage
  const stage = createStage({
    canvas: 'main',
    width: 1200,
    height: 700,
    autoRender: true
  });

  // 示例 1: 使用非零环绕规则 (Non-Zero Winding) 挖洞
  // 顺时针画外框，逆时针画内框，或者相反方向，这样可以实现挖洞
  const group1 = createGroup({
    x: 100,
    y: 50
  });

  // 添加标题
  group1.add(
    createText({
      x: 0,
      y: -20,
      text: '示例1: Non-Zero Winding 规则挖洞',
      fontSize: 16,
      fill: '#333'
    })
  );

  const rect1 = createRect({
    x: 0,
    y: 0,
    width: 200,
    height: 200,
    fill: '#4e6cf1',
    pathProxy: `
      M0 0 L200 0 L200 200 L0 200 Z
      M50 50 L50 150 L150 150 L150 50 Z
    `
  });

  group1.add(rect1);
  stage.defaultLayer.add(group1);

  // 示例 2: 使用奇偶规则 (Even-Odd) 挖洞
  const group2 = createGroup({
    x: 350,
    y: 50
  });

  group2.add(
    createText({
      x: 0,
      y: -20,
      text: '示例2: 多个嵌套挖洞',
      fontSize: 16,
      fill: '#333'
    })
  );

  const rect2 = createRect({
    x: 0,
    y: 0,
    width: 200,
    height: 200,
    fill: '#f14e6c',
    pathProxy: `
      M0 0 L200 0 L200 200 L0 200 Z
      M30 30 L30 170 L170 170 L170 30 Z
      M60 60 L60 140 L140 140 L140 60 Z
    `
  });

  group2.add(rect2);
  stage.defaultLayer.add(group2);

  // 示例 3: 圆形挖洞
  const group3 = createGroup({
    x: 600,
    y: 50
  });

  group3.add(
    createText({
      x: 0,
      y: -20,
      text: '示例3: 圆形挖洞',
      fontSize: 16,
      fill: '#333'
    })
  );

  const circle1 = createCircle({
    x: 100,
    y: 100,
    radius: 100,
    fill: '#4ef16c',
    pathProxy: `
      M100 0 A100 100 0 1 0 100 200 A100 100 0 1 0 100 0 Z
      M100 35 A65 65 0 1 1 100 165 A65 65 0 1 1 100 35 Z
    `
  });

  group3.add(circle1);
  stage.defaultLayer.add(group3);

  // 示例 4: 复杂形状挖洞
  const group4 = createGroup({
    x: 850,
    y: 50
  });

  group4.add(
    createText({
      x: 0,
      y: -20,
      text: '示例4: 复杂形状挖洞',
      fontSize: 16,
      fill: '#333'
    })
  );

  const rect3 = createRect({
    x: 0,
    y: 0,
    width: 200,
    height: 200,
    fill: '#f19f4e'
  });

  // 复杂形状 - 方格外加多个小圆洞（保留createPathProxy旧用法，验证兼容）
  rect3.createPathProxy(`
    M0 0 L200 0 L200 200 L0 200 Z
    M50 50 A20 20 0 1 0 50 51 A20 20 0 1 0 50 50 Z
    M150 50 A20 20 0 1 0 150 51 A20 20 0 1 0 150 50 Z
    M100 100 A30 30 0 1 0 100 101 A30 30 0 1 0 100 100 Z
    M50 150 A20 20 0 1 0 50 151 A20 20 0 1 0 50 150 Z
    M150 150 A20 20 0 1 0 150 151 A20 20 0 1 0 150 150 Z
  `);

  group4.add(rect3);
  stage.defaultLayer.add(group4);

  // 添加说明文字
  const description = createText({
    x: 50,
    y: 280,
    text: '挖洞原理：在同一路径中，通过改变内外框的绘制方向（顺时针/逆时针交替），利用 Canvas 的路径填充规则实现挖洞效果。',
    fontSize: 14,
    fill: '#666',
    textBaseline: 'top',
    maxLineWidth: 1100
  });

  stage.defaultLayer.add(description);

  // 示例 5: 使用 Path 图元直接配置路径属性
  const group5 = createGroup({
    x: 100,
    y: 380
  });

  group5.add(
    createText({
      x: 0,
      y: -20,
      text: '示例5: 使用 Path 图元直接配置 path 属性',
      fontSize: 16,
      fill: '#333'
    })
  );

  const path1 = createPath({
    x: 0,
    y: 0,
    path: `
      M0 0 L300 0 L300 200 L0 200 Z
      M30 30 L30 170 L270 170 L270 30 Z
      M60 60 L60 140 L240 140 L240 60 Z
      M90 90 L90 110 L210 110 L210 90 Z
    `,
    fill: '#9f4ef1',
    stroke: '#333',
    lineWidth: 2
  });

  group5.add(path1);
  stage.defaultLayer.add(group5);

  // 示例 6: 使用 Path 图元的 customPath 属性（编程方式）
  const group6 = createGroup({
    x: 450,
    y: 380
  });

  group6.add(
    createText({
      x: 0,
      y: -20,
      text: '示例6: 使用 Path 图元的 customPath 属性',
      fontSize: 16,
      fill: '#333'
    })
  );

  const path2 = createPath({
    x: 0,
    y: 0,
    fill: '#f14ec3',
    stroke: '#333',
    lineWidth: 2,
    customPath: ctx => {
      // 外框 - 五角星形状
      const cx = 100;
      const cy = 100;
      const outerR = 90;
      const innerR = 35;
      const points = 5;

      for (let i = 0; i < points * 2; i++) {
        const radius = i % 2 === 0 ? outerR : innerR;
        const angle = (i * Math.PI) / points - Math.PI / 2;
        const x = cx + radius * Math.cos(angle);
        const y = cy + radius * Math.sin(angle);
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();

      // 内框 - 圆形挖洞
      ctx.moveTo(cx + 20, cy);
      ctx.arc(cx, cy, 20, 0, Math.PI * 2, true);
    }
  });

  group6.add(path2);
  stage.defaultLayer.add(group6);

  // 添加关于 Path 图元的说明
  const pathDesc = createText({
    x: 800,
    y: 380,
    text: 'Path 图元优势：\n\n1. 可以直接在 path 属性中配置 SVG 路径字符串\n2. 支持 customPath 属性进行编程式路径绘制\n3. 更灵活的路径组合方式',
    fontSize: 14,
    fill: '#666',
    textBaseline: 'top',
    maxLineWidth: 300
  });

  stage.defaultLayer.add(pathDesc);
};
