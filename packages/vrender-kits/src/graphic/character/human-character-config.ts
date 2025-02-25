import type { HumanPartDefinition, PoseState, SkeletonDefinition } from './interface';

/**
 * Predefined human skeleton structure with common joints
 * Positions use [-0.5, 0.5] range for relative offsets from parent joint
 * where negative values mean left/up, positive values mean right/down
 */
export const DEFAULT_HUMAN_SKELETON: SkeletonDefinition = {
  joints: [
    { name: 'root', position: [0.5, 0.5] as [number, number], rotation: 0, width: 0.2, height: 0.1 },
    // Torso
    { name: 'spine', parent: 'root', position: [0, -0.3] as [number, number], width: 0.15, height: 0.3 },
    { name: 'chest', parent: 'spine', position: [0, -0.15] as [number, number], width: 0.2, height: 0.2 },
    { name: 'neck', parent: 'chest', position: [0, -0.15] as [number, number], width: 0.08, height: 0.1 },
    // Head
    { name: 'head', parent: 'neck', position: [0, -0.1] as [number, number], width: 0.16, height: 0.16 },
    { name: 'face', parent: 'head', position: [0, 0] as [number, number], width: 0.16, height: 0.16 },
    // Left arm
    { name: 'leftShoulder', parent: 'chest', position: [-0.15, -0.15] as [number, number], width: 0.1, height: 0.1 },
    { name: 'leftElbow', parent: 'leftShoulder', position: [-0.1, 0] as [number, number], width: 0.08, height: 0.15 },
    { name: 'leftHand', parent: 'leftElbow', position: [-0.1, 0] as [number, number], width: 0.06, height: 0.06 },
    // Right arm
    { name: 'rightShoulder', parent: 'chest', position: [0.15, -0.15] as [number, number], width: 0.1, height: 0.1 },
    { name: 'rightElbow', parent: 'rightShoulder', position: [0.1, 0] as [number, number], width: 0.08, height: 0.15 },
    { name: 'rightHand', parent: 'rightElbow', position: [0.1, 0] as [number, number], width: 0.06, height: 0.06 },
    // Left leg
    { name: 'leftHip', parent: 'root', position: [-0.08, 0] as [number, number], width: 0.1, height: 0.15 },
    { name: 'leftKnee', parent: 'leftHip', position: [0, 0.15] as [number, number], width: 0.08, height: 0.2 },
    { name: 'leftFoot', parent: 'leftKnee', position: [0, 0.15] as [number, number], width: 0.1, height: 0.05 },
    // Right leg
    { name: 'rightHip', parent: 'root', position: [0.08, 0] as [number, number], width: 0.1, height: 0.15 },
    { name: 'rightKnee', parent: 'rightHip', position: [0, 0.15] as [number, number], width: 0.08, height: 0.2 },
    { name: 'rightFoot', parent: 'rightKnee', position: [0, 0.15] as [number, number], width: 0.1, height: 0.05 }
  ]
};

/**
 * Predefined human poses
 */
export const DEFAULT_HUMAN_POSES: Record<string, PoseState> = {
  stand: {
    root: { position: [0, 0], rotation: 0 },
    spine: { rotation: 0 },
    leftHip: { rotation: 0 },
    rightHip: { rotation: 0 },
    leftKnee: { rotation: 0 },
    rightKnee: { rotation: 0 },
    leftShoulder: { rotation: 0 },
    rightShoulder: { rotation: 0 },
    leftElbow: { rotation: 0 },
    rightElbow: { rotation: 0 }
  },
  sit: {
    root: { position: [0, -20] },
    spine: { rotation: -0.1 },
    leftHip: { rotation: -1.5 },
    rightHip: { rotation: -1.5 },
    leftKnee: { rotation: 1.5 },
    rightKnee: { rotation: 1.5 },
    leftShoulder: { rotation: 0.2 },
    rightShoulder: { rotation: 0.2 }
  },
  walk: {
    leftHip: { rotation: 0.5 },
    rightHip: { rotation: -0.5 },
    leftKnee: { rotation: -0.3 },
    rightKnee: { rotation: 0.3 },
    leftShoulder: { rotation: -0.5 },
    rightShoulder: { rotation: 0.5 },
    leftElbow: { rotation: 0.3 },
    rightElbow: { rotation: -0.3 }
  }
};

/**
 * Default human parts configuration
 * All sizes and positions are normalized to [0, 1] range
 */
export const DEFAULT_HUMAN_PARTS: Record<string, HumanPartDefinition> = {
  faceShape: {
    jointName: 'face',
    graphic: {
      type: 'circle',
      attributes: {
        radius: 0.08,
        fill: '#FFE0BD'
      }
    }
  },
  hair: {
    jointName: 'head',
    graphic: {
      type: 'rect',
      attributes: {
        fill: '#4A4A4A',
        cornerRadius: 0.02
      }
    },
    offset: { position: [0, -0.05] }
  },
  leftEye: {
    jointName: 'face',
    graphic: {
      type: 'circle',
      attributes: {
        radius: 0.015,
        fill: '#4B4B4B'
      }
    },
    offset: { position: [-0.04, -0.01] }
  },
  rightEye: {
    jointName: 'face',
    graphic: {
      type: 'circle',
      attributes: {
        radius: 0.015,
        fill: '#4B4B4B'
      }
    },
    offset: { position: [0.04, -0.01] }
  },
  leftEyebrow: {
    jointName: 'face',
    graphic: {
      type: 'rect',
      attributes: {
        fill: '#4A4A4A'
      }
    },
    offset: { position: [-0.04, -0.04] }
  },
  rightEyebrow: {
    jointName: 'face',
    graphic: {
      type: 'rect',
      attributes: {
        fill: '#4A4A4A'
      }
    },
    offset: { position: [0.04, -0.04] }
  },
  nose: {
    jointName: 'face',
    graphic: {
      type: 'circle',
      attributes: {
        radius: 0.01,
        fill: '#E6B89C'
      }
    },
    offset: { position: [0, 0.01] }
  },
  lips: {
    jointName: 'face',
    graphic: {
      type: 'rect',
      attributes: {
        fill: '#D35D6E',
        cornerRadius: 0.01
      }
    },
    offset: { position: [0, 0.04] }
  },
  leftEar: {
    jointName: 'head',
    graphic: {
      type: 'circle',
      attributes: {
        radius: 0.02,
        fill: '#FFE0BD'
      }
    },
    offset: { position: [-0.075, 0] }
  },
  rightEar: {
    jointName: 'head',
    graphic: {
      type: 'circle',
      attributes: {
        radius: 0.02,
        fill: '#FFE0BD'
      }
    },
    offset: { position: [0.075, 0] }
  },
  topwear: {
    jointName: 'chest',
    graphic: {
      type: 'rect',
      attributes: {
        fill: '#3498DB',
        cornerRadius: 0.025
      }
    },
    offset: { position: [0, 0] }
  },
  bottomwear: {
    jointName: 'root',
    graphic: {
      type: 'rect',
      attributes: {
        fill: '#2C3E50',
        cornerRadius: 0.025
      }
    },
    offset: { position: [0, 0.05] }
  }
};
