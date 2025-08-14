import { createStage, createSymbol, container, IGraphic, XMLParser, createText, vglobal } from '@visactor/vrender';
import { roughModule } from '@visactor/vrender-kits';
import { AStageAnimate } from '@visactor/vrender-animate';
// import { addShapesToStage, colorPools } from '../utils';
// import { XMLParser, XMLValidator } from 'fast-xml-parser';
import { AABBBounds } from '@visactor/vutils';

container.load(roughModule);

class TestStageAnimate extends AStageAnimate<any> {
  protected afterStageRender(stage: any, canvas: HTMLCanvasElement): HTMLCanvasElement | void | null | false {
    const c = vglobal.createCanvas({
      width: canvas.width,
      height: canvas.height,
      dpr: vglobal.devicePixelRatio
    });
    const ctx = c.getContext('2d');
    if (!ctx) {
      return false;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(canvas, 0, 0);
    ctx.fillStyle = `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(
      Math.random() * 255
    )}, 0.2)`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    return c;
  }
}

export const page = () => {
  console.time();
  const parser = new XMLParser({ ignoreAttributes: false });
  const result = parser.parse(
    // `<?xml version="1.0" encoding="utf-8"?><!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools -->
    // <svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    // <path d="M3 13.6493C3 16.6044 5.41766 19 8.4 19L16.5 19C18.9853 19 21 16.9839 21 14.4969C21 12.6503 19.8893 10.9449 18.3 10.25C18.1317 7.32251 15.684 5 12.6893 5C10.3514 5 8.34694 6.48637 7.5 8.5C4.8 8.9375 3 11.2001 3 13.6493Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    // </svg>`

    `<svg width="800px" height="800px" viewBox="0 0 1024 1024" class="icon"  version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M824 215l-65-18 65-17 18-65 18 65 64 17-64 18-18 65-18-65zM124 784l-41-10 41-10 9-41 10 41 41 10-41 10-10 41-9-41z" fill="#FDCD60" /><path d="M901 283l-26-6 26-6 5-26 6 26 26 6-26 6-6 25-5-25zM113 446l-24-5 24-6 5-24 6 24 24 6-24 5-6 24-5-24z" fill="#FDCD60" /><path d="M114 255m-9 0a9 9 0 1 0 18 0 9 9 0 1 0-18 0Z" fill="#5546CB" /><path d="M912 769a25 25 0 1 1 25-25 25 25 0 0 1-25 25z m0-36a10 10 0 1 0 10 10 10 10 0 0 0-10-10z" fill="#5546CB" /><path d="M913 542c-19-15-45-28-78-40-2 7-6 14-13 21v6a54 54 0 0 1 19 10c7 6 10 13 9 19s-7 11-16 14h-25c3 8 5 16 5 22s-4 16-10 19l-7 2c-5 0-10-2-15-6a55 55 0 0 1-13-15l-8 2c-7 12-17 19-26 19h-7a15 15 0 0 1-7-7 1000 1000 0 0 1-140 24c-31 3-62 5-92 5-91 0-177-14-255-42-18-6-30-24-30-45v-55c-43 13-77 29-99 47s-31 34-31 53 10 37 31 53 56 34 99 47c81 25 189 39 304 39s223-14 304-39c44-13 77-29 99-47s31-34 31-53-9-37-29-53z" fill="#AFBCF3" /><path d="M925 526c-23-19-57-35-101-49 4-100-14-175-53-227-49-65-131-95-256-94-111-1-194 28-246 86-39 44-61 103-64 177a514 514 0 0 0 1 55h-5c-46 14-81 31-106 50s-39 44-39 69 13 48 39 69 60 36 106 50c83 26 193 40 310 40s227-14 310-40c46-14 81-31 106-50s39-44 39-69-15-46-41-67z m-115 32l-13-5a35 35 0 0 0 5-14h12c7 2 13 5 18 8s4 5 4 6-2 3-7 4-12 3-19 1z m-8 37c0 5-1 7-3 8s-4 0-8-3-9-9-12-16a52 52 0 0 1-5-14 35 35 0 0 0 14-7h1a54 54 0 0 1 7 11c4 8 5 15 5 21z m-66 8c-3-1-4-12 3-26a49 49 0 0 1 8-12 35 35 0 0 0 13 5 48 48 0 0 1-5 15c-8 14-17 20-20 18z m-5-64h1a35 35 0 0 0 5 14l-13 5c-7 2-14 2-19 1s-6-3-7-4 1-4 4-6 11-6 18-8z m-19-45h8c5 1 12 4 17 9l7 7a36 36 0 0 0-9 14l-9-6c-14-10-18-21-16-23z m56-27c3 0 9 9 9 24a53 53 0 0 1-1 9h-18a53 53 0 0 1-1-9c0-13 6-23 9-23z m0 45a22 22 0 1 1-22 22 23 23 0 0 1 20-21z m42 4l-9 6a36 36 0 0 0-9-14l7-7c6-5 12-8 17-9s7 0 8 1-4 15-16 24zM284 256c48-54 126-81 231-79h5c116 0 191 27 235 86 27 35 42 82 48 141-70 27-140 46-210 54a746 746 0 0 1-174 1c-100-11-167-40-191-52h-3c6-63 25-114 59-151z m-59 171c29 14 96 40 192 51a766 766 0 0 0 179-1c68-8 137-26 205-52v60l-11 7h-1c0-21-9-37-22-37s-22 16-22 37h-1c-7-6-15-10-23-12s-16 0-20 5-1 27 15 41c-9 2-17 6-23 11s-10 13-9 19 7 11 16 14h11l14-2a62 62 0 0 0-5 17 980 980 0 0 1-139 24c-30 3-61 5-90 5-88 0-172-14-248-41-10-3-16-14-17-27z m688 221c-22 18-56 34-99 47-81 25-189 39-304 39s-223-14-304-39c-44-13-77-29-99-47s-31-34-31-53 10-37 31-53 55-33 99-47v54c0 21 12 39 30 45 79 28 164 42 255 42 30 0 61-2 92-5a1000 1000 0 0 0 140-24 15 15 0 0 0 7 7h7c9 0 18-7 26-19l8-2a55 55 0 0 0 13 15c5 4 10 6 15 6l7-2c6-3 10-10 10-19s-2-15-5-22h23c9-2 15-7 16-14s-2-13-9-19a54 54 0 0 0-19-10v-6c7-7 11-14 13-21 33 12 60 25 78 40s31 34 31 53-11 38-31 54z" fill="#5546CB" /><path d="M419 459a746 746 0 0 0 174-1c70-8 140-27 210-54-5-59-21-106-48-141-45-59-119-86-235-86h-5c-105-1-183 26-231 79-33 37-53 88-58 150h3c23 13 90 41 190 53z" fill="#FDCD60" /><path d="M226 549c0 12 7 23 17 27 76 27 160 41 248 41 29 0 60-2 90-5a980 980 0 0 0 139-24 62 62 0 0 1 5-17l-14 2h-11c-9-2-15-7-16-14s2-13 9-19 14-9 23-11c-17-13-23-31-15-41s12-7 20-5 15 6 23 12h1c0-21 9-37 22-37s22 16 22 37h1l11-7v-62c-68 26-137 43-205 52a766 766 0 0 1-179 1c-96-11-162-38-192-51z" fill="#F97744" /><path d="M733 523a36 36 0 0 1 9-14l-7-7c-6-5-12-8-17-9h-8c-2 2 2 13 13 22zM697 555c0 1 2 3 7 4s12 1 19 0l13-5a35 35 0 0 1-5-14h-13c-7 2-13 5-18 8s-4 6-3 7zM758 570a35 35 0 0 1-13-5 49 49 0 0 0-8 12c-7 14-5 25-3 26s12-4 19-18a48 48 0 0 0 5-15zM789 564h-1a35 35 0 0 1-14 7 52 52 0 0 0 5 14c3 7 8 13 12 16s7 3 8 3 3-3 3-8-2-13-5-20a54 54 0 0 0-8-12zM829 559c4-1 6-3 7-4s-1-4-4-6-11-6-18-8h-13a35 35 0 0 1-5 14l13 5c8 0 15 0 20-1zM822 495c-1-1-3-1-8-1s-12 4-17 9l-7 7a36 36 0 0 1 9 14l9-6c12-10 16-21 14-23zM757 493a53 53 0 0 0 1 9h17a53 53 0 0 0 1-9c0-15-6-24-9-24s-10 9-10 24z" fill="#FFFFFF" /><path d="M766 558a22 22 0 1 0-22-22 23 23 0 0 0 22 22z" fill="#FDCD60" /></svg>`
  );
  console.log(result, parser);

  // const isSvg = XMLValidator.validate(
  //   `<?xml version="1.0" encoding="utf-8"?><!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools -->
  // <svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  // <path d="M3 13.6493C3 16.6044 5.41766 19 8.4 19L16.5 19C18.9853 19 21 16.9839 21 14.4969C21 12.6503 19.8893 10.9449 18.3 10.25C18.1317 7.32251 15.684 5 12.6893 5C10.3514 5 8.34694 6.48637 7.5 8.5C4.8 8.9375 3 11.2001 3 13.6493Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  // </svg>`,
  //   {
  //     allowBooleanAttributes: true
  //   }
  // );
  // console.log(isSvg);
  // const result = parser.parse(
  //   `<svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  //   <path d="M3 13.6493C3 16.6044 5.41766 19 8.4 19L16.5 19C18.9853 19 21 16.9839 21 14.4969C21 12.6503 19.8893 10.9449 18.3 10.25C18.1317 7.32251 15.684 5 12.6893 5C10.3514 5 8.34694 6.48637 7.5 8.5C4.8 8.9375 3 11.2001 3 13.6493Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  //   </svg>`
  // );
  console.timeEnd();
  // console.log(result);
  const symbolList = [
    // 'circle',
    // 'cross',
    // 'diamond',
    // 'square',
    // 'arrow',
    // 'arrow2Left',
    // 'arrow2Right',
    // 'arrow2Up',
    // 'arrow2Down',
    // 'wedge',
    // 'thinTriangle',
    // 'triangle',
    // 'triangleUp',
    // 'triangleDown',
    // 'triangleRight',
    // 'triangleLeft',
    // 'stroke',
    // 'star',
    // 'wye',
    // 'rect',
    // 'lineH',
    // 'lineV',
    // 'close',
    // 'arrowLeft',
    // 'arrowRight',
    // 'rectRound',
    // 'roundLine',
    'M -2 2 L 4 -5 L 7 -6 L 6 -3 L -1 3 C 0 4 0 5 1 4 C 1 5 2 6 1 6 A 1.42 1.42 0 0 1 0 7 A 5 5 0 0 0 -2 4 Q -2.5 3.9 -2.5 4.5 T -4 5.8 T -4.8 5 T -3.5 3.5 T -3 3 A 5 5 90 0 0 -6 1 A 1.42 1.42 0 0 1 -5 0 C -5 -1 -4 0 -3 0 C -4 1 -3 1 -2 2 M 4 -5 L 4 -3 L 6 -3 L 5 -4 L 4 -5',
    // `<svg t="1694424698284" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="13305" width="200" height="200"><path d="M915.393939 217.212121c0 119.963152-180.596364 217.212121-403.393939 217.212121S108.606061 337.175273 108.606061 217.212121s180.596364-217.212121 403.393939-217.212121 403.393939 97.24897 403.393939 217.212121z" fill="#C1D0FF" p-id="13306"></path><path d="M884.363636 372.363636c0 119.963152-166.725818 217.212121-372.363636 217.212122S139.636364 492.326788 139.636364 372.363636s166.725818-217.212121 372.363636-217.212121 372.363636 97.24897 372.363636 217.212121z" fill="#0F62FE" p-id="13307"></path><path d="M915.393939 217.212121c0 119.963152-180.596364 217.212121-403.393939 217.212121S108.606061 337.175273 108.606061 217.212121s180.596364-217.212121 403.393939-217.212121 403.393939 97.24897 403.393939 217.212121z" fill="#E8E8E8" fill-opacity=".1" p-id="13308"></path><path d="M782.522182 343.505455C714.876121 379.87297 619.302788 403.393939 512 403.393939c-107.271758 0-202.876121-23.489939-270.522182-59.888484C172.528485 306.331152 139.636364 260.282182 139.636364 217.212121c0-43.101091 32.892121-89.150061 101.841454-126.293333C309.123879 54.551273 404.697212 31.030303 512 31.030303c107.271758 0 202.876121 23.489939 270.522182 59.888485C851.471515 128.093091 884.363636 174.142061 884.363636 217.212121c0 43.101091-32.892121 89.150061-101.841454 126.293334zM512 434.424242c222.797576 0 403.393939-97.24897 403.393939-217.212121s-180.596364-217.212121-403.393939-217.212121S108.606061 97.24897 108.606061 217.212121s180.596364 217.212121 403.393939 217.212121z" fill="#FFFFFF" fill-opacity=".6" p-id="13309"></path><path d="M451.677091 341.147152a13.498182 13.498182 0 0 0 13.777454-13.591273 14.149818 14.149818 0 0 0-13.777454-13.994667c-51.106909-1.768727-99.483152-13.312-135.912727-32.581818-39.718788-21.038545-62.060606-49.555394-62.060606-79.282424 0-29.72703 22.341818-58.243879 62.060606-79.251394 36.429576-19.300848 84.805818-30.844121 135.912727-32.581818a14.149818 14.149818 0 0 0 13.777454-14.025697 13.467152 13.467152 0 0 0-13.777454-13.591273c-64.915394 1.799758-126.510545 16.259879-172.714667 40.711757C229.500121 129.148121 201.69697 164.677818 201.69697 201.69697c0 37.019152 27.803152 72.548848 77.265454 98.738424 46.204121 24.451879 107.799273 38.912 172.714667 40.711758z m61.967515 0a13.560242 13.560242 0 0 0 13.870546-13.591273v-0.775758a13.34303 13.34303 0 0 0-13.001697-13.218909 13.28097 13.28097 0 0 0-13.467152 10.395152l-0.155151 0.713697a13.560242 13.560242 0 0 0 12.753454 16.44606z" fill="#FFFFFF" p-id="13310"></path><path d="M870.710303 542.782061c-48.593455 86.667636-189.843394 149.348848-356.507151 149.348848-166.632727 0-307.882667-62.681212-356.507152-149.348848-11.729455 20.914424-18.059636 43.225212-18.059636 66.404848 0 119.125333 167.718788 215.691636 374.566788 215.691636 206.87903 0 374.597818-96.566303 374.597818-215.722666 0-23.148606-6.330182-45.459394-18.059637-66.373818z" fill="#0F62FE" p-id="13311"></path><path d="M870.710303 741.934545c-48.593455 86.636606-189.843394 149.317818-356.507151 149.317819-166.632727 0-307.882667-62.681212-356.507152-149.348849-11.729455 20.914424-18.059636 43.225212-18.059636 66.404849C139.636364 927.402667 307.355152 1024 514.203152 1024c206.87903 0 374.597818-96.566303 374.597818-215.722667 0-23.148606-6.330182-45.459394-18.059637-66.373818z" fill="#0F62FE" p-id="13312"></path></svg>`
    `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M 3.9994 16.4992 L 11.9993 16.4998 C 13.1039 16.4999 13.9993 17.3954 13.9992 18.5 S 13.1036 20.4999 11.999 20.4998 L 10.499 20.4997" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M 3.0003 11.499 L 19.0003 11.5003 C 20.1049 11.5004 21.0003 12.3959 21.0002 13.5005 C 21.0001 14.605 20.1046 15.5004 19 15.5003 L 18 15.5002" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M 7 7.4997 L 14.5 7.5003 C 15.6046 7.5004 16.5001 6.605 16.5002 5.5005 S 15.6049 3.5004 14.5003 3.5003 L 13.0003 3.5002" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M 4.0003 14.0002 L 12.0003 14.0008 M 12.0003 14.0008 C 13.1049 14.0009 14.0003 14.8964 14.0002 16.001 C 14.0001 17.1055 13.1046 18.0009 12 18.0008 L 10.5 18.0007" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M 7 10.0002 L 14.5 10.0008 C 15.6046 10.0009 16.5001 9.1055 16.5002 8.001 C 16.5003 6.8964 15.6049 6.0009 14.5003 6.0008 L 13.0003 6.0007" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`
    // 'M -1 1 L 0 0 L 1 1',
    // 'm 415.0625,28.75 -47.375,13.71875 -39.75,8.625 13.875,77.6875 7.59375,-14.96875 4.5,-3 c 0,0 0.0602,0.27071 0.0625,0.28125 l 11.9375,-10.28125 17.5,-6 16,-1 0,-0.5 23,15.5 3.53125,5.21875 2.875,-1.53125 -13.75,-83.75 z'
  ];
  const graphics: IGraphic[] = [];

  // const circle = createSymbol({
  //   symbolType: 'circle',
  //   x: 120,
  //   y: 120,
  //   stroke: 'red',
  //   lineWidth: 3,
  //   lineCap: 'round',
  //   size: 60,
  //   fill: 'green'
  // });

  // circle.addEventListener('mouseenter', e => {
  //   circle.setAttributes({ globalZIndex: 1 });
  // });

  // circle.addEventListener('mouseleave', e => {
  //   circle.setAttributes({ globalZIndex: 0 });
  // });

  // graphics.push(circle);

  symbolList.forEach((st, i) => {
    const x = ((i % 6) + 0.5) * 100;
    const y = (Math.floor(i / 6) + 0.5) * 100;
    const symbol = createSymbol({
      symbolType: st,
      x: x,
      y: y,
      stroke: 'black',
      lineWidth: 2,
      lineCap: 'round',
      lineJoin: 'round',
      // fill: 'pink',
      fillStrokeOrder: 1,
      clipRange: 0,
      size: 60
    });

    const text = createText({
      x: x,
      y: y + 60,
      textAlign: 'center',
      textBaseline: 'top',
      fill: 'black',
      fontSize: 20,
      text: st,
      maxLineWidth: 100
    });
    // symbol.setMode('3d');
    graphics.push(symbol);
    graphics.push(text);
  });

  const stage = createStage({
    canvas: 'main',
    autoRender: true
    // background:
    //   'https://s3-alpha-sig.figma.com/img/4747/5f86/562da50af0c51b61008385ba3547c61e?Expires=1699228800&Signature=AZA8zspJv2JOj2m6ICzBiybvIEfzvQV90JZ2QRvyNdOZ8zUv0u9CG2A85tRln~1x8JpNsetdaxj8iY8XnIstKSFrxiXuUvbjgZk8U0wlBqv5ruJgwvIcI3UjPIgr5dB9sxPQG9LGeA9SnpsxMVNLDkq9xV0Vl-7sSJ0aJYdN~uvFISfWvShXvrZoExGdVRMcEuXPQrO1rd-1nSl1VX~RLD1tQhqrftpYxHU0bkalR~Wz6ygCHdLX9VCJ4CuGIyjYVDq7Xl4Lasq-xQMTMLWyYts~SmIRL5BjffsgXRSD9DAI7I4Tm2W7aSsItuUZks7xdrD155Cq3cnvdzuKFdI1wA__&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4'
  });
  // stage.set3dOptions({
  //   enable: true,
  //   alpha: 0.3
  // });

  graphics.forEach(g => {
    stage.defaultLayer.add(g);
    g.animate().to({ clipRange: 1 }, 1000, 'linear');
  });
  console.log(stage);

  const c = stage.toCanvas(false, new AABBBounds().set(100, 100, 300, 360));
  document.body.appendChild(c);

  stage.animate().play(new TestStageAnimate(null, null, 1000, 'linear'));
};
