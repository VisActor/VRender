// import { loadFeishuContributions } from '@visactor/vrender';
import { createCircle, createText } from '@visactor/vrender';
import { renderArc } from '../interactive/arc';
import { renderArea } from '../interactive/area';
import { renderCircle } from '../interactive/circle';
import { renderImage } from '../interactive/image';
import { renderLine } from '../interactive/line';
import { renderPath } from '../interactive/path';
import { renderRect } from '../interactive/rect';
import { renderSymbol } from '../interactive/symbol';
import { renderText } from '../interactive/text';
import { colorPools } from '../utils';
import { isSmokeMode } from '../harness';
import { createBrowserPageStage } from '../page-stage';

// loadFeishuContributions();

const renderSmokeInteractiveScene = () => {
  const stage = createBrowserPageStage({
    canvas: 'main',
    width: 900,
    height: 600,
    autoRender: true,
    background: '#0b1020',
    event: {
      clickInterval: 400
    }
  });
  const label = createText({
    x: 450,
    y: 72,
    text: 'Smoke: pointer + click event binding',
    fontSize: 20,
    fill: '#ffffff',
    textAlign: 'center'
  });
  const circle = createCircle({
    x: 450,
    y: 280,
    radius: 72,
    fill: colorPools[2],
    cursor: 'pointer'
  });
  const hint = createText({
    x: 450,
    y: 392,
    text: 'interactive harness baseline',
    fontSize: 14,
    fill: '#d0d6e2',
    textAlign: 'center'
  });

  circle.addEventListener('pointerenter', () => {
    circle.setAttribute('fill', colorPools[5]);
    stage.renderNextFrame();
  });
  circle.addEventListener('pointerleave', () => {
    circle.setAttribute('fill', colorPools[2]);
    stage.renderNextFrame();
  });
  circle.addEventListener('click', () => {
    circle.setAttribute('radius', circle.attribute.radius === 72 ? 86 : 72);
    stage.renderNextFrame();
  });

  stage.defaultLayer.add(label);
  stage.defaultLayer.add(circle);
  stage.defaultLayer.add(hint);
  stage.render();
};

export const page = () => {
  if (isSmokeMode()) {
    renderSmokeInteractiveScene();
    return;
  }

  renderCircle(20);
  renderRect(20);
  renderArc(20);
  renderArea(20);
  renderImage(20);
  renderLine(20);
  renderPath(20);
  renderSymbol(20);
  renderText(20);
};
