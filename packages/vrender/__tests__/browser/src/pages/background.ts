import { createGroup, createRect, createStage, createText, IGraphic, IGraphicAttribute } from '@visactor/vrender';

const demoImage = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="140" viewBox="0 0 240 140">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#15324b"/>
      <stop offset="100%" stop-color="#f08a5d"/>
    </linearGradient>
  </defs>
  <rect width="240" height="140" fill="url(#bg)"/>
  <rect x="16" y="16" width="64" height="108" rx="10" fill="#f6d365" fill-opacity="0.95"/>
  <rect x="92" y="24" width="48" height="92" rx="24" fill="#fff3e6" fill-opacity="0.95"/>
  <circle cx="188" cy="46" r="26" fill="#95e1d3"/>
  <path d="M150 118 C170 84 210 84 226 118" fill="none" stroke="#ffffff" stroke-width="10" stroke-linecap="round"/>
  <text x="20" y="132" fill="#ffffff" font-size="20" font-family="Arial">VRender BG</text>
</svg>`;

type LayoutSpec = {
  title: string;
  description: string;
  background: Partial<IGraphicAttribute>;
};

type PositionSpec = {
  title: string;
  position: IGraphicAttribute['backgroundPosition'];
};

const layoutSpecs: LayoutSpec[] = [
  {
    title: 'cover',
    description: '等比放大并裁剪',
    background: {
      backgroundSizing: 'cover',
      backgroundPosition: 'center'
    }
  },
  {
    title: 'contain',
    description: '等比缩放完整包含',
    background: {
      backgroundSizing: 'contain',
      backgroundPosition: 'center'
    }
  },
  {
    title: 'fill',
    description: '拉伸填满图元',
    background: {
      backgroundSizing: 'fill',
      backgroundPosition: 'center'
    }
  },
  {
    title: 'auto',
    description: '按原始尺寸显示',
    background: {
      backgroundSizing: 'auto',
      backgroundPosition: 'center'
    }
  }
];

const positionSpecs: PositionSpec[] = [
  {
    title: 'top-left',
    position: 'top-left'
  },
  {
    title: 'center',
    position: 'center'
  },
  {
    title: 'bottom-right',
    position: 'bottom-right'
  },
  {
    title: '25% 75%',
    position: ['25%', '75%']
  }
];

function createCaption(text: string, x: number, y: number, fontSize: number = 18) {
  return createText({
    x,
    y,
    text,
    fontSize,
    fill: '#17324d',
    textBaseline: 'top',
    fontFamily: 'Arial'
  });
}

function createHint(text: string, x: number, y: number) {
  return createText({
    x,
    y,
    text,
    fontSize: 13,
    fill: '#61758a',
    textBaseline: 'top',
    fontFamily: 'Arial'
  });
}

function createDemoFrame(
  x: number,
  y: number,
  width: number,
  height: number,
  title: string,
  attrs: Partial<IGraphicAttribute>
) {
  const graphics: IGraphic[] = [];

  graphics.push(
    createRect({
      x,
      y,
      width,
      height,
      fill: '#f7f3eb',
      stroke: '#d5c7b8',
      lineWidth: 1,
      cornerRadius: 16
    })
  );

  graphics.push(
    createRect({
      x: x + 18,
      y: y + 42,
      width: width - 36,
      height: height - 60,
      cornerRadius: 14,
      stroke: '#102a43',
      lineWidth: 1,
      background: demoImage,
      backgroundClip: true,
      ...attrs
    })
  );

  graphics.push(createCaption(title, x + 18, y + 14, 16));
  return graphics;
}

export const page = () => {
  const stage = createStage({
    canvas: 'main',
    width: 1600,
    height: 900,
    autoRender: true,
    background: {
      background: demoImage,
      width: 1600,
      height: 900
    }
  });

  stage.setAttributes({
    backgroundSizing: 'cover',
    backgroundPosition: 'center',
    backgroundOpacity: 0.12
  });

  const graphics: IGraphic[] = [];

  graphics.push(
    createRect({
      x: 36,
      y: 28,
      width: 1520,
      height: 844,
      fill: '#fffdf9',
      cornerRadius: 28,
      shadowBlur: 24,
      shadowColor: 'rgba(19, 50, 75, 0.12)'
    })
  );

  graphics.push(createCaption('Background Image Layout Demo', 72, 58, 28));
  graphics.push(createHint('cover / contain / fill / auto + position + stage/group/text', 72, 96));

  layoutSpecs.forEach((spec, index) => {
    const x = 72 + index * 360;
    const y = 150;
    graphics.push(...createDemoFrame(x, y, 320, 230, spec.title, spec.background));
    graphics.push(createHint(spec.description, x + 18, y + 188));
  });

  graphics.push(createCaption('Position Anchors', 72, 430, 22));
  graphics.push(createHint('同一张图片在 cover 模式下使用不同对齐点', 72, 460));

  positionSpecs.forEach((spec, index) => {
    const x = 72 + index * 360;
    const y = 500;
    graphics.push(
      ...createDemoFrame(x, y, 320, 220, spec.title, {
        backgroundSizing: 'cover',
        backgroundPosition: spec.position
      })
    );
  });

  const group = createGroup({
    x: 1160,
    y: 500,
    width: 340,
    height: 220,
    cornerRadius: 20,
    clip: true,
    background: demoImage,
    backgroundSizing: 'contain',
    backgroundPosition: 'bottom-right',
    backgroundClip: true
  });
  group.add(
    createText({
      x: 20,
      y: 18,
      text: 'group background',
      fontSize: 18,
      fill: '#17324d',
      textBaseline: 'top',
      fontFamily: 'Arial'
    })
  );
  group.add(
    createRect({
      x: 20,
      y: 56,
      width: 120,
      height: 120,
      fill: 'rgba(255,255,255,0.82)',
      cornerRadius: 14,
      stroke: '#17324d',
      lineWidth: 1
    })
  );
  group.add(
    createText({
      x: 166,
      y: 74,
      text: 'contain\nright bottom',
      fontSize: 18,
      fill: '#17324d',
      textBaseline: 'top',
      fontFamily: 'Arial',
      lineHeight: 24
    })
  );
  graphics.push(group);

  const textLabel = createText({
    x: 1160,
    y: 756,
    text: 'text background',
    fontSize: 18,
    fill: '#17324d',
    textBaseline: 'top',
    fontFamily: 'Arial',
    background: {
      background: demoImage,
      x: 1146,
      y: 742,
      width: 280,
      height: 92
    },
    backgroundSizing: 'cover',
    backgroundPosition: 'center',
    backgroundClip: true
  });
  graphics.push(textLabel);
  graphics.push(createHint('text 节点使用包装 background 配置，验证 x/y/width/height 与 cover + center', 1160, 792));

  graphics.forEach(graphic => {
    stage.defaultLayer.add(graphic);
  });
};
