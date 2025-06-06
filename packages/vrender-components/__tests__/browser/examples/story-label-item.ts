import '@visactor/vrender';
import render from '../../util/render';
import { StoryLabelItem } from '../../../src';
import { registerAnimate, registerCustomAnimate } from '@visactor/vrender-animate';

registerAnimate();
registerCustomAnimate();

export function run() {
  const labels: StoryLabelItem[] = [];
  labels.push(
    new StoryLabelItem({
      x: 50,
      y: 100,
      contentOffsetX: 200,
      contentOffsetY: -60,
      titleSpace: [0, 3],
      titleTop: 'Powered By VisActor'
    })
  );
  labels.push(
    new StoryLabelItem({
      x: 50,
      y: 200,
      contentOffsetX: 200,
      contentOffsetY: -60,
      titleSpace: [0, 3],
      titleTop: 'Powered By VisActor',
      titleBottom: 'this is the VStory label',
      titleBottomStyle: {
        fontSize: 10
      }
    })
  );
  labels.push(
    new StoryLabelItem({
      x: 260,
      y: 100,
      contentOffsetX: 200,
      contentOffsetY: -60,
      titleSpace: [6, 6],
      titleTop: 'Powered By VisActor',
      titleTopStyle: {
        fontSize: 12,
        fill: 'black'
      },
      titleTopPanelStyle: {
        fill: 'white',
        visible: true,
        padding: { top: 3, bottom: 3 }
      }
    })
  );
  labels.push(
    new StoryLabelItem({
      x: 260,
      y: 200,
      contentOffsetX: 200,
      contentOffsetY: -60,
      titleSpace: [6, 6],
      titleTop: 'Powered By VisActor',
      titleTopStyle: {
        fontSize: 12,
        fill: 'black'
      },
      titleBottom: 'this is the VStory label',
      titleBottomStyle: {
        fontSize: 10,
        fill: 'black'
      },
      titleTopPanelStyle: {
        fill: 'white',
        visible: true,
        padding: { top: 3, bottom: 3 }
      },
      titleBottomPanelStyle: {
        fill: 'white',
        visible: true,
        padding: { top: 3, bottom: 6 }
      }
    })
  );
  labels.push(
    new StoryLabelItem({
      x: 60,
      y: 300,
      contentOffsetX: 200,
      contentOffsetY: -60,
      titleTop: 'Powered By VisActor',
      titleTopStyle: {
        fontSize: 12
      },
      titleTopPanelStyle: {
        stroke: 'white',
        visible: true
        // padding: { top: 3, bottom: 3 }
      },
      theme: 'simple'
    })
  );

  const stage = render(labels, 'main', { background: 'black' });

  stage.render();
  labels.forEach((label, index) => {
    label.applyAppearState({
      type: 'labelItemAppear',
      duration: 1000,
      easing: 'cubicIn',
      selfOnly: true,
      customParameters: {
        symbolStartOuterType: 'scale',
        titleType: 'typewriter',
        titlePanelType: index > 3 ? 'stroke' : 'scale'
      }
    });
  });

  setTimeout(() => {
    labels.forEach(label => {
      label.applyDisappearState({
        type: 'labelItemDisappear',
        duration: 1000,
        easing: 'cubicIn',
        selfOnly: true,
        customParameters: {}
      });
    });
  }, 3000);
}
