import { assertionError } from '../assertions.mjs';

const min = 199579;
const max = 1318683096;
const railWidth = 200;
const narrowSelection = [400000000, 500000000];
const blue = '#0055cc';
const red = '#b32329';

/** 检查缩小、扩大选区和交叉手柄时的标签布局与样式。 */
export function createSpec(v, stage) {
  const attrs = {
    x: 55,
    min,
    max,
    railWidth,
    railHeight: 8,
    title: { visible: true, text: 'Population' },
    handlerText: { visible: true, style: { fill: '#505968', fontFamily: 'Arial', fontSize: 12 } }
  };
  const defaults = new v.SizeContinuousLegend({ ...attrs, y: 45 });
  const dynamic = new v.SizeContinuousLegend({
    ...attrs,
    y: 155,
    title: { visible: true, text: 'Population (value-based style)' },
    handlerText: {
      visible: true,
      style: value => ({ fill: Number(value) > 200e6 ? blue : red, fontFamily: 'Arial', fontSize: 12 })
    }
  });
  const endpoint = new v.SizeContinuousLegend({
    ...attrs,
    y: 265,
    align: 'bottom',
    value: narrowSelection,
    title: { visible: true, text: 'Population (larger endpoint label)' },
    handlerText: {
      visible: true,
      style: (value, position) => ({
        fill: attrs.handlerText.style.fill,
        fontSize: value === max && position === 'end' ? 36 : 12
      })
    }
  });
  endpoint.setTheme({ text: { fontFamily: 'Courier New, monospace' } });
  const crossed = new v.SizeContinuousLegend({
    ...attrs,
    y: 390,
    align: 'bottom',
    value: [min, max],
    title: { visible: true, text: 'Population (crossed handles)' },
    handlerText: {
      visible: true,
      style: (value, position) => ({
        ...attrs.handlerText.style,
        fontSize: (value === max && position === 'start') || (value === min && position === 'end') ? 36 : 12
      })
    }
  });
  const legends = { defaults, dynamic, endpoint, crossed };
  const events = {};
  for (const [key, legend] of Object.entries(legends)) {
    events[key] = null;
    legend.addEventListener('change', event => {
      events[key] = event.detail;
    });
    stage.defaultLayer.add(legend);
  }
  return { ...legends, events };
}

async function readLegend(page, key) {
  return page.evaluate(key => {
    const { events, [key]: legend } = window.__visualObjects;
    const canvas = document.querySelector('#chart canvas').getBoundingClientRect();
    const find = name => {
      const graphic = legend.find(node => node.name === name, true);
      if (!graphic) throw new Error(`Missing legend graphic ${name}`);
      return graphic;
    };
    const point = name => {
      const { x1, x2, y1, y2 } = find(name).globalAABBBounds;
      return { x: canvas.left + (x1 + x2) / 2, y: canvas.top + (y1 + y2) / 2 };
    };
    const label = name => {
      const {
        attribute,
        globalAABBBounds: { x1, x2, y1, y2 }
      } = find(name);
      return {
        value: Number(attribute.text),
        fill: attribute.fill,
        fontSize: attribute.fontSize,
        visible: attribute.visible !== false,
        x1,
        x2,
        y1,
        y2
      };
    };
    const { x, y, width, height } = legend.attribute;
    return {
      start: label('startHandlerText'),
      end: label('sliderEndHandlerText'),
      startHandle: point('sliderStartHandler'),
      endHandle: point('sliderEndHandler'),
      endLabel: point('sliderEndHandlerText'),
      track: point('sliderTrack'),
      layoutBounds: { x1: x, y1: y, x2: x + width, y2: y + height },
      event: events[key]
    };
  }, key);
}

async function drag(page, from, x) {
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(x, from.y, { steps: 12 });
}

function assertSelection(state, previous, endOnly = true) {
  const { start, end, event } = state;
  const moved =
    end.value !== previous.end.value &&
    (endOnly ? start.value === previous.start.value : start.value !== previous.start.value);
  if (!moved || !event || Math.abs(event.value[0] - start.value) > 0.5 || Math.abs(event.value[1] - end.value) > 0.5) {
    throw assertionError('拖动后的标签值与选区变化事件不一致');
  }
  if (Math.abs(event.position[1] - event.position[0] - (state.endHandle.x - state.startHandle.x)) > 0.01) {
    throw assertionError('事件中的轨道选区与实际手柄位置不一致');
  }
}

function assertSeparated(state) {
  const { start, end } = state;
  if (!start.visible || !end.visible || start.x2 >= end.x1) {
    throw assertionError('靠近的尺寸图例手柄必须保留两个可见、互不重叠的标签');
  }
}

function assertWithinLayout(label, bounds, description) {
  const overflow = [bounds.x1 - label.x1, bounds.y1 - label.y1, label.x2 - bounds.x2, label.y2 - bounds.y2].map(distance =>
    Math.max(0, distance)
  );
  if (overflow.some(distance => !(distance <= 1e-6))) {
    throw assertionError(`${description}应在图例初始布局内，左、上、右、下的超出量为 ${overflow.join(', ')}px`);
  }
}

/** 通过真实鼠标覆盖拖手柄、拖标签、拖区间轨道及点击未选中的轨道。 */
export async function exercise(page) {
  // 先记录两项结果，再统一断言，使旧版基线可报告两条独立的失败。
  const defaultBefore = await readLegend(page, 'defaults');
  await drag(page, defaultBefore.endHandle, defaultBefore.startHandle.x + 22);
  const defaultDuring = await readLegend(page, 'defaults');
  await page.mouse.up();

  const dynamicBefore = await readLegend(page, 'dynamic');
  await drag(page, dynamicBefore.endHandle, dynamicBefore.startHandle.x + 22);
  const dynamicDuring = await readLegend(page, 'dynamic');
  await page.mouse.up();
  const dynamicAfter = await readLegend(page, 'dynamic');

  assertSelection(defaultDuring, defaultBefore);
  assertSelection(dynamicDuring, dynamicBefore);
  const defaultAfter = await readLegend(page, 'defaults');
  const failures = [];
  if (defaultDuring.start.x2 >= defaultDuring.end.x1 || defaultAfter.start.x2 >= defaultAfter.end.x1) {
    failures.push('默认数值标签重叠');
  }
  if (dynamicBefore.end.fill !== blue || dynamicDuring.end.fill !== red || dynamicAfter.end.fill !== red) {
    failures.push('按值配置的文字颜色没有随拖动从蓝色变为红色');
  }
  if (failures.length) throw assertionError(failures.join('，'));

  await drag(page, dynamicAfter.endLabel, dynamicAfter.endLabel.x + 50);
  await page.mouse.up();
  const textDrag = await readLegend(page, 'dynamic');
  assertSelection(textDrag, dynamicAfter);
  if (textDrag.end.fill !== blue || Math.abs(textDrag.endHandle.x - dynamicAfter.endHandle.x - 50) > 1) {
    throw assertionError('直接拖标签后，关联手柄位置和颜色应更新');
  }

  await drag(page, textDrag.track, textDrag.track.x + 20);
  await page.mouse.up();
  const trackDrag = await readLegend(page, 'dynamic');
  assertSelection(trackDrag, textDrag, false);
  await page.mouse.click(trackDrag.endHandle.x + 50, trackDrag.endHandle.y);
  assertSelection(await readLegend(page, 'dynamic'), trackDrag);

  await page.evaluate(([min, max]) => window.__visualObjects.dynamic.setSelected([min, max]), [min, max]);
  const reset = await readLegend(page, 'dynamic');
  await drag(page, reset.endHandle, reset.startHandle.x + 22);
  await page.mouse.up();

  const endpointBefore = await readLegend(page, 'endpoint');
  if (
    endpointBefore.start.value !== narrowSelection[0] ||
    endpointBefore.end.value !== narrowSelection[1] ||
    endpointBefore.end.fontSize !== 12
  ) {
    throw assertionError('尺寸图例应从窄选区和 12px 标签开始');
  }
  await drag(page, endpointBefore.endHandle, endpointBefore.endHandle.x + railWidth);
  await page.mouse.up();
  const endpointAfter = await readLegend(page, 'endpoint');
  assertSelection(endpointAfter, endpointBefore);
  const { end } = endpointAfter;
  if (!end.visible || end.value !== max || endpointAfter.event.value[1] !== max || end.fontSize !== 36) {
    throw assertionError('应拖到最大值并显示 36px 的端点标签');
  }
  assertWithinLayout(end, endpointBefore.layoutBounds, '端点标签');

  const crossedBefore = await readLegend(page, 'crossed');
  if (
    crossedBefore.start.value !== min ||
    crossedBefore.end.value !== max ||
    crossedBefore.start.fontSize !== 12 ||
    crossedBefore.end.fontSize !== 12
  ) {
    throw assertionError('交叉手柄用例应从全选和两个 12px 标签开始');
  }
  // 先把起始手柄拖入区间，让结束手柄能越过它，最后将起始手柄拖到另一端。
  await drag(page, crossedBefore.startHandle, crossedBefore.endHandle.x - 35);
  await page.mouse.up();
  await drag(page, crossedBefore.endHandle, crossedBefore.startHandle.x - 25);
  await page.mouse.up();
  const crossedDuring = await readLegend(page, 'crossed');
  await drag(page, crossedDuring.startHandle, crossedBefore.endHandle.x + 25);
  await page.mouse.up();
  const crossedAfter = await readLegend(page, 'crossed');
  if (
    crossedAfter.start.value !== max ||
    crossedAfter.end.value !== min ||
    crossedAfter.start.fontSize !== 36 ||
    crossedAfter.end.fontSize !== 36 ||
    !crossedAfter.event ||
    crossedAfter.event.value[0] !== min ||
    crossedAfter.event.value[1] !== max
  ) {
    throw assertionError('两个手柄应交换端点，选区事件仍为全选，两个标签均为 36px');
  }
  assertSeparated({ start: crossedAfter.end, end: crossedAfter.start });
  assertWithinLayout(crossedAfter.start, crossedBefore.layoutBounds, '交叉后的起始标签');
  assertWithinLayout(crossedAfter.end, crossedBefore.layoutBounds, '交叉后的结束标签');
}

/** 验证截图对应的真实选区与无重叠的两组标签。 */
export async function verify(page) {
  const defaults = await readLegend(page, 'defaults');
  const dynamic = await readLegend(page, 'dynamic');
  for (const state of [defaults, dynamic]) {
    assertSeparated(state);
    if (state.end.value >= 200e6 || !state.event || state.endHandle.x - state.startHandle.x > 23) {
      throw assertionError('最终截图必须保留拖动后的窄选区');
    }
  }
  if (dynamic.end.fill !== red) throw assertionError('最终截图中的终点标签应是红色');
}
