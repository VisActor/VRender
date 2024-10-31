import { createStage, createImage } from '@visactor/vrender';
import { addShapesToStage, colorPools } from '../utils';

const urlPng = 'https://vega.github.io/images/idl-logo.png';
const svg =
  '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="6" cy="6" r="6" fill="#FD9C87"></circle><circle opacity="0.6" cx="6" cy="6" r="1" stroke="white" stroke-width="2"></circle></svg>';
const svg1 =
  '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g><rect x="2" y="1" width="20" height="20" rx="10" fill="#1E54C9"/><rect x="2.5" y="1.5" width="19" height="19" rx="9.5" stroke="#141414" stroke-opacity="0.2"/></g><path d="M14.9492 9.39531C15.0086 9.31911 15.0165 9.21887 14.9698 9.1356C14.923 9.05234 14.8294 9 14.7273 9L9.27273 9C9.17057 9 9.07697 9.05234 9.03023 9.1356C8.98348 9.21887 8.99142 9.31911 9.0508 9.39531L11.7781 12.8953C11.8293 12.961 11.9119 13 12 13C12.0881 13 12.1707 12.961 12.2219 12.8953L14.9492 9.39531Z" fill="white"/></svg>';
const base64 =
  'data:image/png;base64,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';
// const urlSvg = 'https://replace-with-svg-link.svg';

const svg2 = `<svg width="240" height="240" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M33.9995 64.001C33.9995 47.4324 47.431 34.001 63.9995 34.001H176C192.568 34.001 206 47.4324 206 64.001V176.001C206 192.57 192.568 206.001 176 206.001H63.9995C47.431 206.001 33.9995 192.57 33.9995 176.001V64.001ZM63.9995 46.001C54.0584 46.001 45.9995 54.0598 45.9995 64.001V176.001C45.9995 185.942 54.0584 194.001 63.9995 194.001H176C185.941 194.001 194 185.942 194 176.001V64.001C194 54.0599 185.941 46.001 176 46.001H63.9995Z" fill="url(#paint0_linear_434_12379)"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M103.335 81C108.306 81 112.335 85.0294 112.335 90V160C112.335 164.971 108.306 169 103.335 169C98.3649 169 94.3354 164.971 94.3354 160V90C94.3354 85.0294 98.3649 81 103.335 81Z" fill="url(#paint1_linear_434_12379)"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M170.005 100.999C174.975 100.999 179.005 105.028 179.005 109.999V159.999C179.005 164.97 174.975 168.999 170.005 168.999C165.034 168.999 161.005 164.97 161.005 159.999V109.999C161.005 105.028 165.034 100.999 170.005 100.999Z" fill="url(#paint2_linear_434_12379)"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M69.9995 121.001C74.9701 121.001 78.9995 125.03 78.9995 130.001V160.001C78.9995 164.972 74.9701 169.001 69.9995 169.001C65.0289 169.001 60.9995 164.972 60.9995 160.001V130.001C60.9995 125.03 65.0289 121.001 69.9995 121.001Z" fill="url(#paint3_linear_434_12379)"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M117.041 75.3603L136.669 101.532L156.298 75.3604L136.669 81.9033L117.041 75.3603ZM145.67 117.831C145.67 112.86 141.641 108.831 136.67 108.831C131.7 108.831 127.67 112.86 127.67 117.831L127.67 159.999C127.67 164.97 131.7 168.999 136.67 168.999C141.641 168.999 145.67 164.97 145.67 159.999L145.67 117.831Z" fill="url(#paint4_linear_434_12379)"/>
<defs>
<linearGradient id="paint0_linear_434_12379" x1="120" y1="34.001" x2="197" y2="206" gradientUnits="userSpaceOnUse">
<stop stop-color="#30CFF2"/>
<stop offset="1" stop-color="#3073F2"/>
</linearGradient>
<linearGradient id="paint1_linear_434_12379" x1="103.335" y1="81" x2="103.335" y2="169" gradientUnits="userSpaceOnUse">
<stop stop-color="#D8E5FF"/>
<stop offset="1" stop-color="#7FACFF"/>
</linearGradient>
<linearGradient id="paint2_linear_434_12379" x1="170.005" y1="100.999" x2="170.005" y2="168.999" gradientUnits="userSpaceOnUse">
<stop stop-color="#D8E5FF"/>
<stop offset="1" stop-color="#7FACFF"/>
</linearGradient>
<linearGradient id="paint3_linear_434_12379" x1="69.9995" y1="121.001" x2="69.9995" y2="169.001" gradientUnits="userSpaceOnUse">
<stop stop-color="#D8E5FF"/>
<stop offset="1" stop-color="#7FACFF"/>
</linearGradient>
<linearGradient id="paint4_linear_434_12379" x1="136.669" y1="75.3604" x2="192.751" y2="127.88" gradientUnits="userSpaceOnUse">
<stop stop-color="#30CFF2"/>
<stop offset="1" stop-color="#3073F2"/>
</linearGradient>
</defs>
</svg>
`;

export const page = () => {
  const shapes = [];

  shapes.push(
    createImage({
      x: 100,
      y: 100,
      width: 200,
      height: 200,
      image:
        'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/vchart-editor/upload-images/a85cb6c4-b494-4a52-bfec-5ca557132dde'
      // repeatX: 'repeat',
      // repeatY: 'repeat'
      // cornerRadius: 100
    })
  );

  const svgImage = createImage({
    x: 300,
    y: 100,
    width: 100,
    height: 100,
    image: svg,
    stroke: 'green'
  });
  shapes.push(svgImage);

  const image = createImage({
    x: 500,
    y: 100,
    width: 100,
    height: 100,
    image: urlPng,
    cornerRadius: 100,
    // stroke: 'green',
    // lineWidth: 10,
    outerBorder: {
      distance: 50,
      lineWidth: 100,
      stroke: 'pink'
    }
  });
  shapes.push(image);

  // shapes.push(
  //   createImage({
  //     x: 100,
  //     y: 300,
  //     width: 100,
  //     height: 100,
  //     image: urlSvg
  //   })
  // );

  const stage = createStage({
    canvas: 'main',
    width: 1200,
    height: 600,
    viewWidth: 1200,
    viewHeight: 600
  });

  addShapesToStage(stage, shapes as any, true);
  stage.render();

  window.updateImage1 = () => {
    svgImage.setAttribute('image', svg1);
    (svgImage as any).loadImage(svgImage.attribute.image);
    stage.render();
  };

  window.updateImage0 = () => {
    svgImage.setAttribute('image', svg);
    (svgImage as any).loadImage(svgImage.attribute.image);
    stage.render();
  };

  window.updateImage2 = () => {
    image.setAttribute('image', base64);
    (image as any).loadImage(image.attribute.image);
    stage.render();
  };

  window.updateImage3 = () => {
    image.setAttribute('image', urlSvg);
    (image as any).loadImage(image.attribute.image);
    stage.render();
  };
};
