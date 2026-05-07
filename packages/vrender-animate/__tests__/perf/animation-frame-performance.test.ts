import { performance } from 'perf_hooks';
import { createRect } from '@visactor/vrender-core';
import { Animate } from '../../src/animate';
import { commitAnimationStaticAttrs } from '../../src/custom/static-truth';
import { applyAnimationFrameAttributes, applyAnimationTransientAttributes } from '../../src/custom/transient';
import { Step } from '../../src/step';

const runPerf = process.env.VRENDER_ANIMATE_PERF === '1' ? describe : describe.skip;
const fakeTimeline = {
  addAnimate() {
    // benchmark no-op
  },
  removeAnimate() {
    // benchmark no-op
  }
} as any;

function createTarget() {
  return {
    attribute: { x: 0, width: 10 },
    applyTransientAttributes(attrs: Record<string, any>) {
      Object.assign(this.attribute, attrs);
    },
    addUpdateBoundTag() {
      // benchmark no-op
    },
    addUpdatePositionTag() {
      // benchmark no-op
    },
    addUpdateShapeAndBoundsTag() {
      // benchmark no-op
    },
    onAttributeUpdate() {
      // benchmark no-op
    }
  } as any;
}

function createPreparedStep(target: any) {
  const step = new Step('to' as any, { x: 100, width: 20 }, 100, 'linear') as any;
  step.target = target;
  step.animate = {
    target,
    interpolateUpdateFunction: null,
    validAttr: () => true,
    getStartProps: () => ({ x: 0, width: 10 })
  };
  step.props = { x: 100, width: 20 };
  step.propKeys = ['x', 'width'];
  step.fromProps = { x: 0, width: 10 };
  step.determineInterpolateUpdateFunction();
  return step;
}

function timeLoop(label: string, fn: () => void): number {
  const start = performance.now();
  fn();
  const duration = performance.now() - start;
  process.stdout.write(`${label}: ${duration.toFixed(3)}ms\n`);
  return duration;
}

function runLegacyDirectInterpolation(step: any, target: any, iterations: number) {
  const funcs = step.interpolateUpdateFunctions;
  const propKeys = step.propKeys;
  const from = step.fromProps;
  const to = step.props;

  for (let i = 0; i < iterations; i++) {
    const ratio = (i % 100) / 100;
    for (let j = 0; j < funcs.length; j++) {
      const key = propKeys[j];
      funcs[j](key, from[key], to[key], ratio, step, target);
    }
  }
}

function runCurrentFastInterpolation(step: any, iterations: number) {
  for (let i = 0; i < iterations; i++) {
    step.runInterpolateUpdate(step.fromProps, step.props, (i % 100) / 100);
  }
}

function createPreventStep(keys: string[]) {
  const props: Record<string, number> = {};
  const fromProps: Record<string, number> = {};
  keys.forEach((key, index) => {
    props[key] = index + 100;
    fromProps[key] = index;
  });

  const step = new Step('to' as any, props, 100, 'linear') as any;
  step.props = props;
  step.fromProps = fromProps;
  step.propKeys = keys.slice();
  step.interpolateUpdateFunctions = keys.map(() => () => {
    // benchmark no-op
  });
  return step;
}

function createPreventAnimate(keys: string[], stepCount: number) {
  const animate = new Animate(undefined, fakeTimeline, true) as any;
  animate._startProps = {};
  animate._endProps = {};
  keys.forEach((key, index) => {
    animate._startProps[key] = index;
    animate._endProps[key] = index + 100;
  });

  let firstStep: any = null;
  let lastStep: any = null;
  for (let i = 0; i < stepCount; i++) {
    const step = createPreventStep(keys);
    if (!firstStep) {
      firstStep = step;
    }
    if (lastStep) {
      lastStep.next = step;
    }
    lastStep = step;
  }
  animate._firstStep = firstStep;
  animate._lastStep = lastStep;
  return animate as Animate;
}

function createCommitTarget() {
  const finalAttrs = {
    x: 100,
    y: 20,
    y1: 200,
    width: 30,
    fillOpacity: 0.8,
    lineWidth: 2
  };
  return {
    attribute: {},
    baseAttributes: {},
    finalAttribute: finalAttrs,
    context: { finalAttrs },
    getFinalAttribute() {
      return this.finalAttribute;
    },
    setAttributes(attrs: Record<string, any>) {
      const baseAttributes = this.baseAttributes as Record<string, any>;
      const attribute = this.attribute as Record<string, any>;
      const finalAttribute = this.finalAttribute as Record<string, any>;
      for (const key in attrs) {
        if (Object.prototype.hasOwnProperty.call(attrs, key)) {
          baseAttributes[key] = attrs[key];
          attribute[key] = attrs[key];
          finalAttribute[key] = attrs[key];
        }
      }
    }
  } as any;
}

runPerf('animation frame performance baseline', () => {
  test('default numeric interpolation fast path stays within the configured baseline ratio', () => {
    const iterations = Number(process.env.VRENDER_ANIMATE_PERF_ITERATIONS ?? 1_000_000);
    const maxRatio =
      process.env.VRENDER_ANIMATE_PERF_MAX_RATIO == null
        ? Number.POSITIVE_INFINITY
        : Number(process.env.VRENDER_ANIMATE_PERF_MAX_RATIO);

    const directTarget = createTarget();
    const directStep = createPreparedStep(directTarget);
    const currentTarget = createTarget();
    const currentStep = createPreparedStep(currentTarget);

    runLegacyDirectInterpolation(directStep, directTarget, Math.min(iterations, 50_000));
    runCurrentFastInterpolation(currentStep, Math.min(iterations, 50_000));

    const direct = timeLoop('legacy-direct-frame-write', () => {
      runLegacyDirectInterpolation(directStep, directTarget, iterations);
    });
    const current = timeLoop('current-fast-frame-write', () => {
      runCurrentFastInterpolation(currentStep, iterations);
    });
    const ratio = current / direct;

    process.stdout.write(
      JSON.stringify({
        benchmark: 'animation-frame-default-interpolation',
        iterations,
        directMs: Number(direct.toFixed(3)),
        currentMs: Number(current.toFixed(3)),
        ratio: Number(ratio.toFixed(3)),
        maxRatio: Number.isFinite(maxRatio) ? maxRatio : null
      }) + '\n'
    );

    expect(ratio).toBeLessThanOrEqual(maxRatio);
  });

  test('batched conflict prevention reports ownership cleanup cost', () => {
    const animateCount = Number(process.env.VRENDER_ANIMATE_PERF_ANIMATES ?? 20_000);
    const stepCount = Number(process.env.VRENDER_ANIMATE_PERF_STEPS ?? 3);
    const maxMs =
      process.env.VRENDER_ANIMATE_PERF_MAX_CONFLICT_MS == null
        ? Number.POSITIVE_INFINITY
        : Number(process.env.VRENDER_ANIMATE_PERF_MAX_CONFLICT_MS);
    const keys = ['x', 'width', 'fillOpacity', 'lineWidth'];
    const preventedKeys = ['x', 'width'];

    const warmupAnimates = Array.from({ length: 100 }, () => createPreventAnimate(keys, stepCount));
    warmupAnimates.forEach(animate => animate.preventAttrs(preventedKeys));

    const animates = Array.from({ length: animateCount }, () => createPreventAnimate(keys, stepCount));
    const duration = timeLoop('batched-conflict-prevent', () => {
      animates.forEach(animate => animate.preventAttrs(preventedKeys));
    });

    process.stdout.write(
      JSON.stringify({
        benchmark: 'animation-conflict-prevent',
        animateCount,
        stepCount,
        preventedKeyCount: preventedKeys.length,
        durationMs: Number(duration.toFixed(3)),
        maxMs: Number.isFinite(maxMs) ? maxMs : null
      }) + '\n'
    );

    expect(duration).toBeLessThanOrEqual(maxMs);
  });

  test('static end commit reports final truth commit cost', () => {
    const iterations = Number(process.env.VRENDER_ANIMATE_PERF_COMMIT_ITERATIONS ?? 200_000);
    const maxMs =
      process.env.VRENDER_ANIMATE_PERF_MAX_COMMIT_MS == null
        ? Number.POSITIVE_INFINITY
        : Number(process.env.VRENDER_ANIMATE_PERF_MAX_COMMIT_MS);
    const target = createCommitTarget();
    const keys = ['x', 'y', 'y1', 'width', 'fillOpacity', 'lineWidth'];
    const animate = {
      validAttr: (key: string) => key !== 'lineWidth'
    } as any;

    for (let i = 0; i < 10_000; i++) {
      commitAnimationStaticAttrs(target, keys, animate);
    }

    const duration = timeLoop('static-end-commit', () => {
      for (let i = 0; i < iterations; i++) {
        commitAnimationStaticAttrs(target, keys, animate);
      }
    });

    process.stdout.write(
      JSON.stringify({
        benchmark: 'animation-static-end-commit',
        iterations,
        keyCount: keys.length,
        durationMs: Number(duration.toFixed(3)),
        maxMs: Number.isFinite(maxMs) ? maxMs : null
      }) + '\n'
    );

    expect(duration).toBeLessThanOrEqual(maxMs);
  });

  test('custom animation frame helper avoids the core transient wrapper cost', () => {
    const iterations = Number(process.env.VRENDER_ANIMATE_PERF_FRAME_HELPER_ITERATIONS ?? 200_000);
    const maxRatio =
      process.env.VRENDER_ANIMATE_PERF_MAX_FRAME_HELPER_RATIO == null
        ? Number.POSITIVE_INFINITY
        : Number(process.env.VRENDER_ANIMATE_PERF_MAX_FRAME_HELPER_RATIO);
    const wrapperRect = createRect({ x: 0, y: 0, y1: 100, width: 10 });
    const frameRect = createRect({ x: 0, y: 0, y1: 100, width: 10 });
    const attrs = { x: 10, width: 20 };

    for (let i = 0; i < 10_000; i++) {
      applyAnimationTransientAttributes(wrapperRect, attrs);
      applyAnimationFrameAttributes(frameRect, attrs);
    }

    const wrapper = timeLoop('core-transient-frame-helper', () => {
      for (let i = 0; i < iterations; i++) {
        attrs.x = i % 100;
        attrs.width = 20 + (i % 10);
        applyAnimationTransientAttributes(wrapperRect, attrs);
      }
    });
    const frame = timeLoop('direct-frame-helper', () => {
      for (let i = 0; i < iterations; i++) {
        attrs.x = i % 100;
        attrs.width = 20 + (i % 10);
        applyAnimationFrameAttributes(frameRect, attrs);
      }
    });
    const ratio = frame / wrapper;

    process.stdout.write(
      JSON.stringify({
        benchmark: 'animation-custom-frame-helper',
        iterations,
        wrapperMs: Number(wrapper.toFixed(3)),
        frameMs: Number(frame.toFixed(3)),
        ratio: Number(ratio.toFixed(3)),
        maxRatio: Number.isFinite(maxRatio) ? maxRatio : null
      }) + '\n'
    );

    expect(ratio).toBeLessThanOrEqual(maxRatio);
  });
});
