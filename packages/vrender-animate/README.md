# VRender Animation Module

This module provides a graph-based animation system for VRender.

## Features

- Graph-based animation system
- Support for simple property animations
- Support for sequence and parallel animations
- Support for composite animations
- Support for custom animations
- Support for path animations
- Compatible with the legacy animation system
- Advanced composition capabilities for nested animations
- Proper propagation of animation events in complex choreography

## Recent Updates

- **Improved Animation Node Composition**: Fixed issues with propagation in `GraphAdapterNode` to ensure proper animation sequencing
- **Enhanced Duration Calculation**: Better handling of duration for sequence and parallel animations
- **Better Event Handling**: Improved monitoring of animation completion and successor activation

## Usage

### Basic Property Animation

```typescript
import { createAnimationNode, createGraphManager } from '@visactor/vrender-animate';

// Create a simple animation node
const moveNode = createAnimationNode({
  id: 'move',
  target: myRect,
  propertyName: 'x',
  toValue: 200,
  duration: 1000
});

// Create a graph manager
const graphManager = createGraphManager(moveNode, stage);

// Start the animation
graphManager.start();
```

### Sequence Animation

```typescript
import { createAnimationNode, createSequence, createGraphManager } from '@visactor/vrender-animate';

// Create animation nodes
const moveNode = createAnimationNode({
  id: 'move',
  target: myRect,
  propertyName: 'x',
  toValue: 200,
  duration: 1000
});

const colorNode = createAnimationNode({
  id: 'color',
  target: myRect,
  propertyName: 'fill',
  toValue: 'blue',
  duration: 1000
});

// Create a sequence
const sequence = createSequence([moveNode, colorNode]);

// Create a graph manager
const graphManager = createGraphManager(sequence, stage);

// Start the animation
graphManager.start();
```

### Nested Animations (Advanced Composition)

The animation system supports nesting of animations, allowing complex choreography:

```typescript
import { createAnimationNode, createSequence, createParallel, createGraphManager } from '@visactor/vrender-animate';

// Create simple animations for rectangle 1
const moveRect1 = createAnimationNode({
  target: rect1,
  propertyName: 'x',
  toValue: 500,
  duration: 2000
});

const colorRect1 = createAnimationNode({
  target: rect1,
  propertyName: 'fill',
  toValue: 'red',
  duration: 1000
});

// Create simple animations for rectangle 2
const moveRect2 = createAnimationNode({
  target: rect2,
  propertyName: 'y',
  toValue: 300,
  duration: 1500
});

const colorRect2 = createAnimationNode({
  target: rect2,
  propertyName: 'fill',
  toValue: 'blue',
  duration: 800
});

// Create sequences for each rectangle
const sequence1 = createSequence([moveRect1, colorRect1]);
const sequence2 = createSequence([moveRect2, colorRect2]);

// Run both sequences in parallel
const parallelAnimation = createParallel([sequence1, sequence2]);

// Create additional animations
const finalAnimation = createAnimationNode({
  target: rect3,
  propertyName: 'opacity',
  toValue: 0,
  duration: 1000
});

// Create a final sequence that runs the parallel animations and then the final animation
const fullAnimation = createSequence([parallelAnimation, finalAnimation]);

// Create graph manager and start the animation
const graphManager = createGraphManager(fullAnimation, stage);
graphManager.start();
```

### Cleanup Completed Animations

The animation system includes a mechanism to clean up completed animations to free memory and resources:

```typescript
import { createAnimationNode, createSequence, createGraphManager } from '@visactor/vrender-animate';

// Create animation nodes (as shown in previous examples)
// ...

// Create a graph manager
const graphManager = createGraphManager(myAnimationGraph, stage);

// Start the animation
graphManager.start();

// Later, when animations have completed, you can clean up:
graphManager.onAllComplete = () => {
  console.log('All animations completed');

  // Remove completed animation nodes
  const removed = graphManager.cleanupCompletedNodes();
  console.log(`Cleaned up ${removed} completed nodes`);
};

// You can also manually trigger cleanup at any time:
function handleCleanupButtonClick() {
  const removed = graphManager.cleanupCompletedNodes();
  console.log(`Cleaned up ${removed} completed nodes`);
}

// By default, the cleanup is performed in "safe mode", which only removes nodes
// that have no successors or whose successors have also completed.
// To forcibly remove all completed nodes:
graphManager.cleanupCompletedNodes(false);
```

## API

See the API documentation for more details.
