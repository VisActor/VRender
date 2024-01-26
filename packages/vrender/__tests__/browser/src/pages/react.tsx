import { createStage, VGroup, VSymbol, VText, VImage, VRichText, Fragment, jsx } from '@visactor/vrender';
import { VTag } from '@visactor/vrender-components';
import { roughModule } from '@visactor/vrender-kits';
import { addShapesToStage, colorPools } from '../utils';
import React, { Component } from 'react';
import ReactDOM from 'react-dom/client';
import { decodeReactDom } from '@visactor/vrender-kits';
import { IGroup } from '@visactor/vrender';
import { IFederatedEvent } from '@visactor/vrender';

// container.load(roughModule);
const svg =
  '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="6" cy="6" r="6" fill="#FD9C87"></circle><circle opacity="0.6" cx="6" cy="6" r="1" stroke="white" stroke-width="2"></circle></svg>';

function App() {
  return (
    <div>
      <span>abc</span>
    </div>
  );
}

export const page = () => {
  ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
  const stage = createStage({
    canvas: 'main',
    autoRender: true,
    poptip: true,
    enableLayout: true
  });
  const dom = decodeReactDom(
    <VGroup
      attribute={{
        width: 100,
        height: 100,
        background: 'green',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <VRichText attribute={{ x: 600, y: 600, width: 60, height: 60, textAlign: 'right' }}>
        <VRichText.Text attribute={{ fill: 'red', text: 'aaa' }}>富文本全局</VRichText.Text>
        <VRichText.Image attribute={{ image: svg, width: 30, height: 30, id: 'circle-0' }}></VRichText.Image>
      </VRichText>
    </VGroup>
  );
  console.log(dom);
  stage.defaultLayer.add(dom);
};
