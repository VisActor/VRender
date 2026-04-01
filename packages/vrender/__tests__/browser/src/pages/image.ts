import { createStage, createImage, createRect, createText } from '@visactor/vrender';
import { addShapesToStage } from '../utils';

const svg =
  '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="6" cy="6" r="6" fill="#FD9C87"></circle><circle opacity="0.6" cx="6" cy="6" r="1" stroke="white" stroke-width="2"></circle></svg>';
const svg1 =
  '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g><rect x="2" y="1" width="20" height="20" rx="10" fill="#1E54C9"/><rect x="2.5" y="1.5" width="19" height="19" rx="9.5" stroke="#141414" stroke-opacity="0.2"/></g><path d="M14.9492 9.39531C15.0086 9.31911 15.0165 9.21887 14.9698 9.1356C14.923 9.05234 14.8294 9 14.7273 9L9.27273 9C9.17057 9 9.07697 9.05234 9.03023 9.1356C8.98348 9.21887 8.99142 9.31911 9.0508 9.39531L11.7781 12.8953C11.8293 12.961 11.9119 13 12 13C12.0881 13 12.1707 12.961 12.2219 12.8953L14.9492 9.39531Z" fill="white"/></svg>';
const base64 =
  'data:image/png;base64,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';
const dogImage = 'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/vrender/lovely_dog.jpg';
const layoutImage = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="140" viewBox="0 0 240 140">
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
  <text x="20" y="132" fill="#ffffff" font-size="20" font-family="Arial">Image Layout</text>
</svg>`;

const createLabel = (text: string, x: number, y: number, fontSize = 16, fill = '#17324d') =>
  createText({
    x,
    y,
    text,
    fontSize,
    fill,
    textBaseline: 'top',
    fontFamily: 'Arial'
  });

const createHint = (text: string, x: number, y: number) =>
  createText({
    x,
    y,
    text,
    fontSize: 13,
    fill: '#61758a',
    textBaseline: 'top',
    fontFamily: 'Arial'
  });

const createLayoutCard = (
  title: string,
  description: string,
  x: number,
  y: number,
  imageSizing: 'cover' | 'contain' | 'fill' | 'auto'
) => {
  const width = 320;
  const height = 220;
  const frameX = x + 18;
  const frameY = y + 42;
  const frameWidth = width - 36;
  const frameHeight = 140;

  return [
    createRect({
      x,
      y,
      width,
      height,
      fill: '#f7f3eb',
      stroke: '#d5c7b8',
      lineWidth: 1,
      cornerRadius: 16
    }),
    createLabel(title, x + 18, y + 14),
    createHint(description, x + 18, y + 182),
    createRect({
      x: frameX,
      y: frameY,
      width: frameWidth,
      height: frameHeight,
      fill: '#fff8ef',
      stroke: '#102a43',
      lineWidth: 1,
      cornerRadius: 14
    }),
    createImage({
      x: frameX,
      y: frameY,
      width: frameWidth,
      height: frameHeight,
      image: layoutImage,
      imageSizing,
      imagePosition: 'center',
      cornerRadius: 14
    })
  ];
};

export const page = () => {
  const shapes = [];

  shapes.push(createLabel('Image Primitive Demo', 48, 28, 28));
  shapes.push(createHint('basic image loading + sizing modes (cover / contain / fill / auto)', 48, 66));

  const dogRounded = createImage({
    x: 48,
    y: 112,
    image: dogImage,
    clipConfig: {
      shape: 'rectRound'
    }
  });
  const dogStroke = createImage({
    x: 248,
    y: 112,
    width: 120,
    stroke: '#2563eb',
    cornerRadius: 24,
    lineWidth: 8,
    fillStrokeOrder: -1,
    image: dogImage
  });
  const dogSquare = createImage({
    x: 420,
    y: 112,
    width: 120,
    height: 120,
    image: dogImage,
    stroke: '#f43f5e',
    fillStrokeOrder: -1,
    lineWidth: 8
  });
  const tinySvg = createImage({
    x: 592,
    y: 112,
    width: 120,
    height: 120,
    image: svg
  });
  const base64Image = createImage({
    x: 764,
    y: 112,
    width: 120,
    height: 120,
    image: base64
  });

  shapes.push(dogRounded, dogStroke, dogSquare, tinySvg, base64Image);
  shapes.push(createHint('clipConfig', 48, 238));
  shapes.push(createHint('stroke + radius', 248, 238));
  shapes.push(createHint('fixed width/height', 420, 238));
  shapes.push(createHint('inline svg', 592, 238));
  shapes.push(createHint('base64 image', 764, 238));

  const cards = [
    createLayoutCard('cover', '等比缩放裁剪', 48, 300, 'cover'),
    createLayoutCard('contain', '等比缩放留白', 404, 300, 'contain'),
    createLayoutCard('fill', '拉伸适配设置大小', 760, 300, 'fill'),
    createLayoutCard('auto', '保留原始尺寸', 1116, 300, 'auto')
  ];
  cards.forEach(card => shapes.push(...card));

  shapes.push(createLabel('Same API on image primitive', 48, 560, 22));
  shapes.push(
    createHint("set `imageSizing` to 'cover' | 'contain' | 'fill' | 'auto' after width/height is specified", 48, 592)
  );

  const stage = createStage({
    canvas: 'main',
    width: 1600,
    height: 900,
    viewWidth: 1600,
    viewHeight: 900
  });

  addShapesToStage(stage, shapes as any, false);
  stage.render();

  window.updateImage1 = () => {
    tinySvg.setAttribute('image', svg1);
    stage.render();
  };

  window.updateImage0 = () => {
    tinySvg.setAttribute('image', svg);
    stage.render();
  };
};
