# Animation
Animations in VRender are implemented using the `Animate` instance, which provides various interpolation methods such as `to`, `from`, `wait`, `loop`, `bounce`, `reverse`, `startAt`, and more. These methods can be chained together to create complex animation effects. We create an `Animate` instance using the element's API `animate()`. Before diving into this section, it is recommended to have a good understanding of the element's API to better grasp the usage of animations. You can refer to the [Element](./Graphic) section for the documentation of elements.

## Basic Usage

Here is a basic demo of creating animations:

```javascript livedemo template=vrender
const rect = VRender.createRect({ x: 100, y: 100, width: 100, height: 100, fill: 'red' });

const stage = new VRender.Stage({
  container: CONTAINER_ID,
  autoRender: true
});

stage.defaultLayer.add(rect);

// Create animation with chained calls
rect
 .animate()
 .to({ height: 200 }, 2000, 'quadIn')
 .to({ x: 300 }, 200, 'quadIn')
 .wait(2000)
 .to({ y: 300 }, 200, 'backInOut')
```

## Graphic.Animate

`graphic.animate` creates an animation and provides hooks like `onStart`, `onEnd`, `onFrame`.

```TypeScript
graphic
    .animate({
          onStart: () => {
            console.log('Start');
          },
          onEnd: () => {
            console.log('End');
          },
          onFrame: () => {
            console.log('Frame');
          }
    })
```

## Animate.to

The most common interpolation method, interpolates from the current value to the target value.

```TypeScript
graphic
    .animate()
    .to({ height: 200 }, 2000, 'quadIn')
```

## Animate.wait

Wait for a specified amount of time.

```TypeScript
graphic
    .animate()
    .wait(2000)
```

## Animate.from

Similar to `to`, but interpolates from the target value to the current value.

```TypeScript
graphic
    .animate()
    .from({ height: 200 }, 2000, 'quadIn')
```

## Animate.reverse

Execute the animation in reverse.

```TypeScript
graphic
    .animate()
    .from({ height: 200 }, 2000, 'quadIn')
    .reverse();
```

## Animate.loop

Loop the animation.

```TypeScript
graphic
    .animate()
    .to({ height: 200 }, 2000, 'quadIn')
    .loop(count);
```

## Animate.bounce

Bounce back and forth, needs to be used with `loop`.

```TypeScript
graphic
    .animate()
    .to({ height: 200 }, 2000, 'quadIn')
    .bounce()
    .loop(count);
```

## Animate.startAt

Start the animation from a specific time, unaffected by `loop`, only runs once.

```TypeScript
graphic
    .animate()
    .startAt(2000)
    .to({ height: 200 }, 2000, 'quadIn')
    .bounce()
    .loop(count);
```

## Sub Animation (subAnimate)

Sub animations divide the animation into different stages, each stage having independent `loop`, `bounce`, `reverse`, `startAt` states, and stages are executed sequentially.

```TypeScript
graphic
    .animate()
    .startAt(2000)
    .to({ height: 200 }, 200, 'quadIn')
    .to({ x: 200 }, 200, 'quadIn')
    .wait(200)
    .to({ y: 200 }, 200, 'backInOut')
    .to({ fillColor: 'green' }, 200, 'quadIn')
    .bounce(true)
    .loop(2)
    .subAnimate()
    .startAt(2000)
    .to({ x: 300 }, 200, 'quadIn')
    .to({ y: 300 }, 2000, 'backIn')
    .bounce(true)
    .loop(3);
```

## Animation Arrangement

`animate` supports some animation arrangement-related features, allowing users to link different animations without manually calculating the execution time.

## Animate.after

Execute after a specific animation ends.

```TypeScript
const a1 = graphic.animate()
    .startAt(2000)
    .to({ height: 200 }, 200, 'quadIn');
const a2 = graphic.animate()
    .after(a1)
    .startAt(2000)
    .to({ height: 200 }, 200, 'quadIn');
```

## Animate.afterAll

Execute after all animations in the provided array end.

```TypeScript
const a1 = graphic.animate()
    .startAt(2000)
    .to({ height: 200 }, 200, 'quadIn');
const a2 = graphic.animate()
    .to({ height: 200 }, 200, 'quadIn');
const a3 = graphic.animate()
    .afterAll([a1, a2])
    .to({ height: 200 }, 200, 'quadIn');
```

## Animate.parallel

Execute in parallel with a specific animation.

```TypeScript
const a1 = graphic.animate()
    .startAt(2000)
    .to({ height: 200 }, 200, 'quadIn');
const a2 = graphic.animate()
    .after(a1)
    .startAt(2000)
    .to({ height: 200 }, 200, 'quadIn');
const a3 = graphic.animate()
    .parallel(a2)
    .to({ height: 200 }, 200, 'quadIn');
```

## Custom Interpolation

## Animate.AddInterpolate

Provides the ability to customize interpolation for a specific key, registered functions are globally effective.

```TypeScript
Animate.AddInterpolate('text', (key, ratio, from, to, target, ret) => {
    const _from = parseInt(from);
    const _to = parseInt(to);
    ret.text = (_from + (_to - _from) * ratio).toString();
    return true;
  });

Animate.AddInterpolate('', (key, ratio, from, to, target, ret) => {
    if (key === 'text') {
        const _from = parseInt(from);
        const _to = parseInt(to);
        ret.text = (_from + (_to - _from) * ratio).toString();
        return true;
    }
    return false;
  });
```

## Animate parameter `interpolate` (higher priority)

Pass a function when creating an `animate`, this function only applies to this specific `animate`.

```TypeScript
text.animate({
    interpolate(key, ratio, from, to, nextAttributes) {
      if (key === 'text') {
        nextAttributes.text = parseFloat(from) + (parseFloat(to + 1000) - parseFloat(from)) * ratio;
        return true;
      }
      return false;
    },
  }).to({ text: '100' }, 1000, 'quartIn');
```

## Custom Animation

## Creation

Inherit `ACustomAnimate` and provide main methods as follows:

```TypeScript
export class IncreateCount extends ACustomAnimate {
  constructor(from: any, to: any, duration: number, ease: EaseType) {
    super(from, 0, duration, ease);
  }

  getEndProps(): Record<string, any> {
    return {
      text: this.to
    };
  }

  onBind(): void {
    this.to = parseFloat(this.target.getAnimatePropByName('text'));
  }

  onEnd(): void {
    return;
  }

  onUpdate(end: boolean, ratio: number, out: Record<string, any>): void {
    out.text = this.from + (this.to - this.from) * ratio;
  }
}
```

## Usage

Pass the custom animation in the `play` method.

```TypeScript
text
    .animate()
    .to({ fillColor: 'red' }, 1000, 'quadIn')
    .play(new IncreateCount(0, 0, 1000, 'quartIn'))
    .to({ fillColor: 'green' }, 1000, 'quadIn');
```
