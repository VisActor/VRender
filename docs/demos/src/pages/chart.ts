import {
  createStage,
  createGroup,
  createLine,
  createText,
  createSymbol,
  createRect,
  createRect3d,
  createPath,
  createArc,
  createArea,
  createCircle,
  IArc,
  container,
  IGroup,
  GroupFadeIn,
  GroupFadeOut,
  AnimateGroup,
  AttributeAnimate
} from '@visactor/vrender';
// import { json } from './json';
// import { json3 } from './xtable';
import { roughModule } from '@visactor/vrender-kits';

const json = {"attribute":{},"_uid":83157,"type":"group","children":[{"attribute":{},"_uid":83161,"type":"group","children":[{"attribute":{"x":0,"y":0,"width":1043,"height":500,"sizeAttrs":{"x":0,"y":0,"width":1043,"height":500}},"_uid":83165,"type":"group","name":"root","children":[{"attribute":{"visible":true,"clip":false,"x":47,"y":12,"width":984,"height":460,"sizeAttrs":{"x":47,"y":12,"width":984,"height":460},"pickable":false,"zIndex":450},"_uid":83186,"type":"group","name":"regionGroup_15573","children":[{"attribute":{"visible":true,"x":0,"y":0,"clip":false,"sizeAttrs":{"x":0,"y":0},"pickable":false,"zIndex":0},"_uid":83187,"type":"group","name":"seriesGroup_bar_15574_15576","children":[{"attribute":{"pickable":false,"zIndex":300},"_uid":83230,"type":"group","name":"bar_15577","children":[{"attribute":{"visible":true,"cornerRadiusTopLeft":10,"cornerRadiusTopRight":10,"cornerRadiusBottomRight":10,"cornerRadiusBottomLeft":10,"stroke":"#fff","lineWidth":3,"x":0,"y":0,"fill":{"x0":0,"y0":0,"x1":1,"y1":1,"stops":[{"offset":1,"color":"#4CC9E4"},{"offset":0,"color":"rgba(76,201,228,0.6)"}],"gradient":"linear"},"y1":460,"width":25.23076923076923,"cornerAttrs":{"cornerRadiusTopLeft":10,"cornerRadiusTopRight":10,"cornerRadiusBottomRight":10,"cornerRadiusBottomLeft":10},"cornerRadius":[10,10,10,10],"strokeAttrs":{"stroke":"#fff"},"sizeAttrs":{"x":0,"y":0,"y1":460,"width":25.23076923076923},"height":460,"pickable":true},"_uid":83231,"type":"rect","children":[]},{"attribute":{"visible":true,"cornerRadiusTopLeft":10,"cornerRadiusTopRight":10,"cornerRadiusBottomRight":10,"cornerRadiusBottomLeft":10,"stroke":"#fff","lineWidth":3,"x":151.3846153846154,"y":156.39999999999998,"fill":{"x0":0,"y0":0,"x1":1,"y1":1,"stops":[{"offset":1,"color":"#4CC9E4"},{"offset":0,"color":"rgba(76,201,228,0.6)"}],"gradient":"linear"},"y1":460,"width":25.23076923076923,"cornerAttrs":{"cornerRadiusTopLeft":10,"cornerRadiusTopRight":10,"cornerRadiusBottomRight":10,"cornerRadiusBottomLeft":10},"cornerRadius":[10,10,10,10],"strokeAttrs":{"stroke":"#fff"},"sizeAttrs":{"x":151.3846153846154,"y":156.39999999999998,"y1":460,"width":25.23076923076923},"height":303.6,"pickable":true},"_uid":83232,"type":"rect","children":[]},{"attribute":{"visible":true,"cornerRadiusTopLeft":10,"cornerRadiusTopRight":10,"cornerRadiusBottomRight":10,"cornerRadiusBottomLeft":10,"stroke":"#fff","lineWidth":3,"x":302.7692307692308,"y":23.00000000000002,"fill":{"x0":0,"y0":0,"x1":1,"y1":1,"stops":[{"offset":1,"color":"#4CC9E4"},{"offset":0,"color":"rgba(76,201,228,0.6)"}],"gradient":"linear"},"y1":460,"width":25.23076923076923,"cornerAttrs":{"cornerRadiusTopLeft":10,"cornerRadiusTopRight":10,"cornerRadiusBottomRight":10,"cornerRadiusBottomLeft":10},"cornerRadius":[10,10,10,10],"strokeAttrs":{"stroke":"#fff"},"sizeAttrs":{"x":302.7692307692308,"y":23.00000000000002,"y1":460,"width":25.23076923076923},"height":437,"pickable":true},"_uid":83233,"type":"rect","children":[]},{"attribute":{"visible":true,"cornerRadiusTopLeft":10,"cornerRadiusTopRight":10,"cornerRadiusBottomRight":10,"cornerRadiusBottomLeft":10,"stroke":"#fff","lineWidth":3,"x":454.1538461538462,"y":220.79999999999998,"fill":{"x0":0,"y0":0,"x1":1,"y1":1,"stops":[{"offset":1,"color":"#4CC9E4"},{"offset":0,"color":"rgba(76,201,228,0.6)"}],"gradient":"linear"},"y1":460,"width":25.23076923076923,"cornerAttrs":{"cornerRadiusTopLeft":10,"cornerRadiusTopRight":10,"cornerRadiusBottomRight":10,"cornerRadiusBottomLeft":10},"cornerRadius":[10,10,10,10],"strokeAttrs":{"stroke":"#fff"},"sizeAttrs":{"x":454.1538461538462,"y":220.79999999999998,"y1":460,"width":25.23076923076923},"height":239.20000000000002,"pickable":true},"_uid":83234,"type":"rect","children":[]},{"attribute":{"visible":true,"cornerRadiusTopLeft":10,"cornerRadiusTopRight":10,"cornerRadiusBottomRight":10,"cornerRadiusBottomLeft":10,"stroke":"#fff","lineWidth":3,"x":605.5384615384615,"y":147.2,"fill":{"x0":0,"y0":0,"x1":1,"y1":1,"stops":[{"offset":1,"color":"#4CC9E4"},{"offset":0,"color":"rgba(76,201,228,0.6)"}],"gradient":"linear"},"y1":460,"width":25.23076923076923,"cornerAttrs":{"cornerRadiusTopLeft":10,"cornerRadiusTopRight":10,"cornerRadiusBottomRight":10,"cornerRadiusBottomLeft":10},"cornerRadius":[10,10,10,10],"strokeAttrs":{"stroke":"#fff"},"sizeAttrs":{"x":605.5384615384615,"y":147.2,"y1":460,"width":25.23076923076923},"height":312.8,"pickable":true},"_uid":83235,"type":"rect","children":[]},{"attribute":{"visible":true,"cornerRadiusTopLeft":10,"cornerRadiusTopRight":10,"cornerRadiusBottomRight":10,"cornerRadiusBottomLeft":10,"stroke":"#fff","lineWidth":3,"x":756.9230769230769,"y":220.79999999999998,"fill":{"x0":0,"y0":0,"x1":1,"y1":1,"stops":[{"offset":1,"color":"#4CC9E4"},{"offset":0,"color":"rgba(76,201,228,0.6)"}],"gradient":"linear"},"y1":460,"width":25.23076923076923,"cornerAttrs":{"cornerRadiusTopLeft":10,"cornerRadiusTopRight":10,"cornerRadiusBottomRight":10,"cornerRadiusBottomLeft":10},"cornerRadius":[10,10,10,10],"strokeAttrs":{"stroke":"#fff"},"sizeAttrs":{"x":756.9230769230769,"y":220.79999999999998,"y1":460,"width":25.23076923076923},"height":239.20000000000002,"pickable":true},"_uid":83236,"type":"rect","children":[]},{"attribute":{"visible":true,"cornerRadiusTopLeft":10,"cornerRadiusTopRight":10,"cornerRadiusBottomRight":10,"cornerRadiusBottomLeft":10,"stroke":"#fff","lineWidth":3,"x":908.3076923076924,"y":239.20000000000002,"fill":{"x0":0,"y0":0,"x1":1,"y1":1,"stops":[{"offset":1,"color":"#4CC9E4"},{"offset":0,"color":"rgba(76,201,228,0.6)"}],"gradient":"linear"},"y1":460,"width":25.23076923076923,"cornerAttrs":{"cornerRadiusTopLeft":10,"cornerRadiusTopRight":10,"cornerRadiusBottomRight":10,"cornerRadiusBottomLeft":10},"cornerRadius":[10,10,10,10],"strokeAttrs":{"stroke":"#fff"},"sizeAttrs":{"x":908.3076923076924,"y":239.20000000000002,"y1":460,"width":25.23076923076923},"height":220.79999999999998,"pickable":true},"_uid":83237,"type":"rect","children":[]},{"attribute":{"visible":true,"cornerRadiusTopLeft":10,"cornerRadiusTopRight":10,"cornerRadiusBottomRight":10,"cornerRadiusBottomLeft":10,"stroke":"#fff","lineWidth":3,"x":50.46153846153846,"y":262.20000000000005,"fill":{"x0":0,"y0":0,"x1":1,"y1":1,"stops":[{"offset":1,"color":"#4954E6"},{"offset":0,"color":"rgba(73,84,230,0.6)"}],"gradient":"linear"},"y1":460,"width":25.23076923076923,"cornerAttrs":{"cornerRadiusTopLeft":10,"cornerRadiusTopRight":10,"cornerRadiusBottomRight":10,"cornerRadiusBottomLeft":10},"cornerRadius":[10,10,10,10],"strokeAttrs":{"stroke":"#fff"},"sizeAttrs":{"x":50.46153846153846,"y":262.20000000000005,"y1":460,"width":25.23076923076923},"height":197.79999999999995,"pickable":true},"_uid":83238,"type":"rect","children":[]},{"attribute":{"visible":true,"cornerRadiusTopLeft":10,"cornerRadiusTopRight":10,"cornerRadiusBottomRight":10,"cornerRadiusBottomLeft":10,"stroke":"#fff","lineWidth":3,"x":201.84615384615384,"y":91.99999999999999,"fill":{"x0":0,"y0":0,"x1":1,"y1":1,"stops":[{"offset":1,"color":"#4954E6"},{"offset":0,"color":"rgba(73,84,230,0.6)"}],"gradient":"linear"},"y1":460,"width":25.23076923076923,"cornerAttrs":{"cornerRadiusTopLeft":10,"cornerRadiusTopRight":10,"cornerRadiusBottomRight":10,"cornerRadiusBottomLeft":10},"cornerRadius":[10,10,10,10],"strokeAttrs":{"stroke":"#fff"},"sizeAttrs":{"x":201.84615384615384,"y":91.99999999999999,"y1":460,"width":25.23076923076923},"height":368,"pickable":true},"_uid":83239,"type":"rect","children":[]},{"attribute":{"visible":true,"cornerRadiusTopLeft":10,"cornerRadiusTopRight":10,"cornerRadiusBottomRight":10,"cornerRadiusBottomLeft":10,"stroke":"#fff","lineWidth":3,"x":353.2307692307692,"y":147.2,"fill":{"x0":0,"y0":0,"x1":1,"y1":1,"stops":[{"offset":1,"color":"#4954E6"},{"offset":0,"color":"rgba(73,84,230,0.6)"}],"gradient":"linear"},"y1":460,"width":25.23076923076923,"cornerAttrs":{"cornerRadiusTopLeft":10,"cornerRadiusTopRight":10,"cornerRadiusBottomRight":10,"cornerRadiusBottomLeft":10},"cornerRadius":[10,10,10,10],"strokeAttrs":{"stroke":"#fff"},"sizeAttrs":{"x":353.2307692307692,"y":147.2,"y1":460,"width":25.23076923076923},"height":312.8,"pickable":true},"_uid":83240,"type":"rect","children":[]},{"attribute":{"visible":true,"cornerRadiusTopLeft":10,"cornerRadiusTopRight":10,"cornerRadiusBottomRight":10,"cornerRadiusBottomLeft":10,"stroke":"#fff","lineWidth":3,"x":504.61538461538464,"y":276,"fill":{"x0":0,"y0":0,"x1":1,"y1":1,"stops":[{"offset":1,"color":"#4954E6"},{"offset":0,"color":"rgba(73,84,230,0.6)"}],"gradient":"linear"},"y1":460,"width":25.23076923076923,"cornerAttrs":{"cornerRadiusTopLeft":10,"cornerRadiusTopRight":10,"cornerRadiusBottomRight":10,"cornerRadiusBottomLeft":10},"cornerRadius":[10,10,10,10],"strokeAttrs":{"stroke":"#fff"},"sizeAttrs":{"x":504.61538461538464,"y":276,"y1":460,"width":25.23076923076923},"height":184,"pickable":true},"_uid":83241,"type":"rect","children":[]},{"attribute":{"visible":true,"cornerRadiusTopLeft":10,"cornerRadiusTopRight":10,"cornerRadiusBottomRight":10,"cornerRadiusBottomLeft":10,"stroke":"#fff","lineWidth":3,"x":656,"y":216.2,"fill":{"x0":0,"y0":0,"x1":1,"y1":1,"stops":[{"offset":1,"color":"#4954E6"},{"offset":0,"color":"rgba(73,84,230,0.6)"}],"gradient":"linear"},"y1":460,"width":25.23076923076923,"cornerAttrs":{"cornerRadiusTopLeft":10,"cornerRadiusTopRight":10,"cornerRadiusBottomRight":10,"cornerRadiusBottomLeft":10},"cornerRadius":[10,10,10,10],"strokeAttrs":{"stroke":"#fff"},"sizeAttrs":{"x":656,"y":216.2,"y1":460,"width":25.23076923076923},"height":243.8,"pickable":true},"_uid":83242,"type":"rect","children":[]},{"attribute":{"visible":true,"cornerRadiusTopLeft":10,"cornerRadiusTopRight":10,"cornerRadiusBottomRight":10,"cornerRadiusBottomLeft":10,"stroke":"#fff","lineWidth":3,"x":807.3846153846154,"y":128.8,"fill":{"x0":0,"y0":0,"x1":1,"y1":1,"stops":[{"offset":1,"color":"#4954E6"},{"offset":0,"color":"rgba(73,84,230,0.6)"}],"gradient":"linear"},"y1":460,"width":25.23076923076923,"cornerAttrs":{"cornerRadiusTopLeft":10,"cornerRadiusTopRight":10,"cornerRadiusBottomRight":10,"cornerRadiusBottomLeft":10},"cornerRadius":[10,10,10,10],"strokeAttrs":{"stroke":"#fff"},"sizeAttrs":{"x":807.3846153846154,"y":128.8,"y1":460,"width":25.23076923076923},"height":331.2,"pickable":true},"_uid":83243,"type":"rect","children":[]},{"attribute":{"visible":true,"cornerRadiusTopLeft":10,"cornerRadiusTopRight":10,"cornerRadiusBottomRight":10,"cornerRadiusBottomLeft":10,"stroke":"#fff","lineWidth":3,"x":958.7692307692308,"y":133.4,"fill":{"x0":0,"y0":0,"x1":1,"y1":1,"stops":[{"offset":1,"color":"#4954E6"},{"offset":0,"color":"rgba(73,84,230,0.6)"}],"gradient":"linear"},"y1":460,"width":25.23076923076923,"cornerAttrs":{"cornerRadiusTopLeft":10,"cornerRadiusTopRight":10,"cornerRadiusBottomRight":10,"cornerRadiusBottomLeft":10},"cornerRadius":[10,10,10,10],"strokeAttrs":{"stroke":"#fff"},"sizeAttrs":{"x":958.7692307692308,"y":133.4,"y1":460,"width":25.23076923076923},"height":326.6,"pickable":true},"_uid":83244,"type":"rect","children":[]}]}]}]},{"attribute":{"pickable":false,"zIndex":100},"_uid":83166,"type":"group","name":"axis-bottom_15585","children":[{"attribute":{"title":{"space":4,"padding":0,"textStyle":{"fontSize":12,"fill":"#333333","fontWeight":"normal","fillOpacity":1},"autoRotate":false,"angle":null,"shape":{},"background":{},"state":{"text":null,"shape":null,"background":null},"text":"x","maxWidth":null},"label":{"visible":true,"inside":false,"space":4,"padding":0,"style":{"fontSize":12,"fill":"#6F6F6F","fontWeight":"normal","fillOpacity":1},"formatMethod":null,"state":null},"tick":{"visible":false,"inside":false,"alignWithLabel":true,"length":4,"style":{"lineWidth":1,"stroke":"#D8DCE3","strokeOpacity":1},"state":null},"subTick":{"visible":false,"inside":false,"count":4,"length":2,"style":{"lineWidth":1,"stroke":"#D8DCE3","strokeOpacity":1},"state":null},"line":{"visible":false,"style":{"lineWidth":1,"stroke":"#dfdfdf","strokeOpacity":1}},"grid":{"style":{"lineWidth":1,"stroke":"#dfdfdf","strokeOpacity":1,"lineDash":[4,4]},"visible":false,"length":460,"type":"line","depth":0},"subGrid":{"visible":false,"style":{"lineWidth":1,"stroke":"#dfdfdf","strokeOpacity":1,"lineDash":[4,4]},"type":"line"},"x":47,"y":472,"start":{"x":0,"y":0},"end":{"x":984,"y":0},"items":[[{"id":"Mon","label":"Mon","value":0.038461538461538464,"rawValue":"Mon"},{"id":"Tues","label":"Tues","value":0.1923076923076923,"rawValue":"Tues"},{"id":"Wed","label":"Wed","value":0.3461538461538462,"rawValue":"Wed"},{"id":"Thus","label":"Thus","value":0.5000000000000001,"rawValue":"Thus"},{"id":"Fri","label":"Fri","value":0.6538461538461539,"rawValue":"Fri"},{"id":"Sat","label":"Sat","value":0.8076923076923076,"rawValue":"Sat"},{"id":"sun","label":"sun","value":0.9615384615384616,"rawValue":"sun"}]],"visible":true,"pickable":true,"panel":{"state":null},"verticalFactor":1},"_uid":83167,"type":"group","name":"axis","children":[{"attribute":{"x":0,"y":0,"pickable":false},"_uid":83209,"type":"group","children":[{"attribute":{"x":0,"y":0,"zIndex":1},"_uid":83210,"type":"group","name":"axis-container","children":[{"attribute":{"x":0,"y":0,"pickable":false},"_uid":83211,"type":"group","name":"axis-label-container","children":[{"attribute":{"x":0,"y":0,"pickable":false},"_uid":83212,"type":"group","name":"axis-label-container-layer-0","children":[{"attribute":{"x":37.84615384615385,"y":4,"text":"Mon","lineHeight":12,"textAlign":"center","textBaseline":"top","fontSize":12,"fill":"#6F6F6F","fontWeight":"normal","fillOpacity":1},"_uid":83213,"type":"text","name":"axis-label","children":[]},{"attribute":{"x":189.23076923076923,"y":4,"text":"Tues","lineHeight":12,"textAlign":"center","textBaseline":"top","fontSize":12,"fill":"#6F6F6F","fontWeight":"normal","fillOpacity":1},"_uid":83214,"type":"text","name":"axis-label","children":[]},{"attribute":{"x":340.61538461538464,"y":4,"text":"Wed","lineHeight":12,"textAlign":"center","textBaseline":"top","fontSize":12,"fill":"#6F6F6F","fontWeight":"normal","fillOpacity":1},"_uid":83215,"type":"text","name":"axis-label","children":[]},{"attribute":{"x":492.0000000000001,"y":4,"text":"Thus","lineHeight":12,"textAlign":"center","textBaseline":"top","fontSize":12,"fill":"#6F6F6F","fontWeight":"normal","fillOpacity":1},"_uid":83216,"type":"text","name":"axis-label","children":[]},{"attribute":{"x":643.3846153846154,"y":4,"text":"Fri","lineHeight":12,"textAlign":"center","textBaseline":"top","fontSize":12,"fill":"#6F6F6F","fontWeight":"normal","fillOpacity":1},"_uid":83217,"type":"text","name":"axis-label","children":[]},{"attribute":{"x":794.7692307692307,"y":4,"text":"Sat","lineHeight":12,"textAlign":"center","textBaseline":"top","fontSize":12,"fill":"#6F6F6F","fontWeight":"normal","fillOpacity":1},"_uid":83218,"type":"text","name":"axis-label","children":[]},{"attribute":{"x":946.1538461538462,"y":4,"text":"sun","lineHeight":12,"textAlign":"center","textBaseline":"top","fontSize":12,"fill":"#6F6F6F","fontWeight":"normal","fillOpacity":1},"_uid":83219,"type":"text","name":"axis-label","children":[]}]}]}]}]}]}]},{"attribute":{"pickable":false,"zIndex":100},"_uid":83176,"type":"group","name":"axis-left_15588","children":[{"attribute":{"title":{"space":4,"padding":0,"textStyle":{"fontSize":12,"fill":"#333333","fontWeight":"normal","fillOpacity":1,"textAlign":"center","textBaseline":"bottom"},"autoRotate":false,"angle":-1.5707963267948966,"shape":{},"background":{},"state":{"text":null,"shape":null,"background":null},"text":"y","maxWidth":null},"label":{"visible":true,"inside":false,"space":4,"padding":0,"style":{"fontSize":12,"fill":"#6F6F6F","fontWeight":"normal","fillOpacity":1},"formatMethod":null,"state":null},"tick":{"visible":false,"inside":false,"alignWithLabel":true,"length":4,"style":{"lineWidth":1,"stroke":"#D8DCE3","strokeOpacity":1},"state":null},"subTick":{"visible":false,"inside":false,"count":4,"length":2,"style":{"lineWidth":1,"stroke":"#D8DCE3","strokeOpacity":1},"state":null},"line":{"visible":false,"style":{"lineWidth":1,"stroke":"#dfdfdf","strokeOpacity":1}},"grid":{"style":{"lineWidth":1,"stroke":"#dfdfdf","strokeOpacity":1,"lineDash":[4,4]},"visible":false,"length":984,"type":"line","depth":0},"subGrid":{"visible":false,"style":{"lineWidth":1,"stroke":"#dfdfdf","strokeOpacity":1,"lineDash":[4,4]},"type":"line"},"x":47,"y":12,"start":{"x":0,"y":0},"end":{"x":0,"y":460},"items":[[{"id":0,"label":0,"value":1,"rawValue":0},{"id":20,"label":20,"value":0.8,"rawValue":20},{"id":40,"label":40,"value":0.6,"rawValue":40},{"id":60,"label":60,"value":0.4,"rawValue":60},{"id":80,"label":80,"value":0.19999999999999996,"rawValue":80},{"id":100,"label":100,"value":0,"rawValue":100}]],"visible":true,"pickable":true,"panel":{"state":null},"verticalFactor":1},"_uid":83177,"type":"group","name":"axis","children":[{"attribute":{"x":0,"y":0,"pickable":false},"_uid":83220,"type":"group","children":[{"attribute":{"x":0,"y":0,"zIndex":1},"_uid":83221,"type":"group","name":"axis-container","children":[{"attribute":{"x":0,"y":0,"pickable":false},"_uid":83222,"type":"group","name":"axis-label-container","children":[{"attribute":{"x":0,"y":0,"pickable":false},"_uid":83223,"type":"group","name":"axis-label-container-layer-0","children":[{"attribute":{"x":-4,"y":460,"text":"0%","lineHeight":12,"textAlign":"end","textBaseline":"middle","fontSize":12,"fill":"#6F6F6F","fontWeight":"normal","fillOpacity":1},"_uid":83224,"type":"text","name":"axis-label","children":[]},{"attribute":{"x":-4,"y":368,"text":"20%","lineHeight":12,"textAlign":"end","textBaseline":"middle","fontSize":12,"fill":"#6F6F6F","fontWeight":"normal","fillOpacity":1},"_uid":83225,"type":"text","name":"axis-label","children":[]},{"attribute":{"x":-4,"y":276,"text":"40%","lineHeight":12,"textAlign":"end","textBaseline":"middle","fontSize":12,"fill":"#6F6F6F","fontWeight":"normal","fillOpacity":1},"_uid":83226,"type":"text","name":"axis-label","children":[]},{"attribute":{"x":-4,"y":184,"text":"60%","lineHeight":12,"textAlign":"end","textBaseline":"middle","fontSize":12,"fill":"#6F6F6F","fontWeight":"normal","fillOpacity":1},"_uid":83227,"type":"text","name":"axis-label","children":[]},{"attribute":{"x":-4,"y":91.99999999999999,"text":"80%","lineHeight":12,"textAlign":"end","textBaseline":"middle","fontSize":12,"fill":"#6F6F6F","fontWeight":"normal","fillOpacity":1},"_uid":83228,"type":"text","name":"axis-label","children":[]},{"attribute":{"x":-4,"y":0,"text":"100%","lineHeight":12,"textAlign":"end","textBaseline":"middle","fontSize":12,"fill":"#6F6F6F","fontWeight":"normal","fillOpacity":1},"_uid":83229,"type":"text","name":"axis-label","children":[]}]}]}]}]}]}]}]}]}]}

container.load(roughModule);

let arcList = [];
function _add(group, json) {
  if (json.type === 'group') {
    const g = createGroup(json.attribute);
    group.add(g);
    json.children &&
      json.children.forEach(item => {
        _add(g, item);
      });
  } else if (json.type === 'line') {
    console.log(json.points);
    group.add(createLine({ ...json.attribute, keepDirIn3d: false }));
  } else if (json.type === 'text') {
    const t = createText({ ...json.attribute, z: json.attribute.z || 0, keepDirIn3d: false });
    group.add(t);
    t.addEventListener('mousemove', () => {
      t.setAttribute('fill', 'red');
    });
  } else if (json.type === 'symbol') {
    const s = createSymbol({ ...json.attribute, keepDirIn3d: true });
    // s.animate().to({ scaleX: 0.5, scaleY: 0.5 }, 1000, 'linear');
    s.addEventListener('mouseenter', () => {
      s.setAttribute('fill', 'red');
    });
    console.log(s);
    group.add(s);
  } else if (json.type === 'rect') {
    group.add(createRect(json.attribute));
  } else if (json.type === 'rect3d') {
    group.setMode('3d');
    group.add(createRect3d({ ...json.attribute, length: 6 }));
  } else if (json.type === 'path') {
    group.add(createPath(json.attribute));
  } else if (json.type === 'arc') {
    const arc = createArc(json.attribute);
    arcList.push(arc);
    group.add(arc);
  } else if (json.type === 'area') {
    group.add(createArea(json.attribute));
  } else if (json.type === 'circle') {
    group.add(createCircle(json.attribute));
  }
}

export const page = () => {
  const c = document.getElementById('main') as HTMLCanvasElement;

  const stage = createStage({
    canvas: c as HTMLCanvasElement,
    width: 802,
    height: 500,
    disableDirtyBounds: true,
    canvasControled: true,
    autoRender: true
  });

  const layer = stage.at(0);

  json.children[0].children.forEach(item => {
    _add(layer, item);
  });
  stage.set3dOptions({
    alpha: 0,
    // beta: 0,
    enable: true
  });

  stage.children[0].children[0].setMode('3d');

  const group = stage.defaultLayer.getChildren()[0] as IGroup;
  // group.setAttribute('fill', 'green');

  // group
  //   .animate()
  //   .play(
  //     new AnimateGroup(2000, [
  //       new AttributeAnimate({ fill: 'red' }, 2000, 'quadIn'),
  //       new GroupFadeIn(1000, 'quadIn')
  //     ])
  //   )
  //   .wait(1000)
  //   .play(new GroupFadeIn(1000, 'quadIn'))
  //   .wait(3000)
  //   .play(new GroupFadeOut(1000, 'quadIn'));

  stage.render(undefined, {});

  const button = document.createElement('button');
  button.innerHTML = 'click';
  document.body.appendChild(button);
  button.addEventListener('click', () => {
    stage.getElementsByType('rect').forEach(r => {
      r.setAttribute('fill', 'red');
    });
    stage.render(undefined, {});
  });

  stage.enableView3dTransform();
};
