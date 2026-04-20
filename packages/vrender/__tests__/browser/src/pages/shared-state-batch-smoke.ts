import { createGroup, createRect, createText } from '@visactor/vrender';
import { createBrowserPageStage } from '../page-stage';

export const page = () => {
  const stage = createBrowserPageStage({
    canvas: 'main',
    width: 960,
    height: 540,
    autoRender: true,
    background: '#f7f8fa'
  });
  stage.statePerfConfig = {
    enabled: true
  };
  stage.deferredStateConfig = {
    deferred: {
      enabled: true,
      frameBudget: 8,
      maxGraphicsPerFrame: 1
    }
  };

  const title = createText({
    x: 480,
    y: 56,
    text: 'Smoke: shared-state + batch-state',
    fontSize: 20,
    fontWeight: 'bold',
    fill: '#111',
    textAlign: 'center'
  });

  const sharedOwner = createGroup({});
  sharedOwner.sharedStateDefinitions = {
    hover: {
      fill: '#ff7a00',
      stroke: '#111',
      lineWidth: 2
    }
  };

  const sharedRectA = createRect({
    x: 180,
    y: 150,
    width: 140,
    height: 84,
    fill: '#d9d9d9',
    cornerRadius: 12
  });
  const sharedRectB = createRect({
    x: 360,
    y: 150,
    width: 140,
    height: 84,
    fill: '#d9d9d9',
    cornerRadius: 12
  });

  sharedOwner.add(sharedRectA);
  sharedOwner.add(sharedRectB);
  stage.defaultLayer.add(sharedOwner);

  const sharedLabel = createText({
    x: 340,
    y: 126,
    text: 'shared-state owner',
    fontSize: 14,
    fill: '#666',
    textAlign: 'center'
  });

  const batchLabel = createText({
    x: 620,
    y: 126,
    text: 'batch-state scheduler',
    fontSize: 14,
    fill: '#666',
    textAlign: 'center'
  });

  const batchRectA = createRect({
    x: 560,
    y: 150,
    width: 140,
    height: 84,
    fill: '#d9d9d9',
    cornerRadius: 12
  });
  const batchRectB = createRect({
    x: 740,
    y: 150,
    width: 140,
    height: 84,
    fill: '#d9d9d9',
    cornerRadius: 12
  });

  batchRectA.states = {
    focus: {
      fill: '#1664ff'
    }
  };
  batchRectB.states = {
    focus: {
      fill: '#1664ff'
    }
  };

  stage.defaultLayer.add(title);
  stage.defaultLayer.add(sharedLabel);
  stage.defaultLayer.add(batchLabel);
  stage.defaultLayer.add(batchRectA);
  stage.defaultLayer.add(batchRectB);

  sharedRectA.useStates(['hover'], false);
  sharedRectB.useStates(['hover'], false);

  stage.render();
  stage.scheduleStateBatch([batchRectA, batchRectB], ['focus']);
};
