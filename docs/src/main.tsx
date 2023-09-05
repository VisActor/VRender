import ReactDOM from 'react-dom/client';
import * as VRender from '@visactor/vrender';
import { App } from './app';

import '@arco-design/web-react/dist/css/arco.css';

(window as any).VRender = VRender;
(window as any).Stage = VRender.Stage;
(window as any).createGroup = VRender.createGroup;
(window as any).createText = VRender.createText;
(window as any).createArc = VRender.createArc;
(window as any).createArea = VRender.createArea;
(window as any).createCircle = VRender.createCircle;
(window as any).createGlyph = VRender.createGlyph;
(window as any).createImage = VRender.createImage;
(window as any).createLine = VRender.createLine;
(window as any).createPath = VRender.createPath;
(window as any).createPolygon = VRender.createPolygon;
(window as any).createRect = VRender.createRect;
(window as any).createRichText = VRender.createRichText;
(window as any).CONTAINER_ID = 'chart';

ReactDOM.createRoot(document.getElementById('root')!).render(
  // <React.StrictMode>
  <App />
  // </React.StrictMode>
);
