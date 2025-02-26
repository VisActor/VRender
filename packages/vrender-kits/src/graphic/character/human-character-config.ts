import type { HumanPartDefinition, PoseState, SkeletonDefinition } from './interface';

/**
 * Predefined human skeleton structure with common joints
 * All positions are relative offsets from parent joint [-0.5, 0.5]
 * where negative values mean left/up, positive values mean right/down
 * The skeleton is designed to fit within [0,1] coordinate space when rendered
 */
export const DEFAULT_HUMAN_SKELETON: SkeletonDefinition = {
  joints: [
    { name: 'root', position: [0.5, 0.5] as [number, number], rotation: 0, width: 0.2, height: 0.1 },
    // Torso
    { name: 'spine', parent: 'root', position: [0, -0.15] as [number, number], width: 0.15, height: 0.2 },
    { name: 'chest', parent: 'spine', position: [0, -0.1] as [number, number], width: 0.2, height: 0.15 },
    { name: 'neck', parent: 'chest', position: [0, -0.1] as [number, number], width: 0.08, height: 0.05 },
    // Head
    { name: 'head', parent: 'neck', position: [0, -0.08] as [number, number], width: 0.16, height: 0.16 },
    { name: 'face', parent: 'head', position: [0, 0] as [number, number], width: 0.16, height: 0.16 },
    // Left arm
    { name: 'leftShoulder', parent: 'chest', position: [-0.07, -0.03] as [number, number], width: 0.1, height: 0.08 },
    {
      name: 'leftElbow',
      parent: 'leftShoulder',
      rotation: 0,
      position: [0, 0.1] as [number, number],
      width: 0,
      height: 0
    },
    { name: 'leftHand', parent: 'leftElbow', position: [-0.003, 0.11] as [number, number], width: 0.06, height: 0.06 },
    // Right arm
    {
      name: 'rightShoulder',
      rotation: -2,
      parent: 'chest',
      position: [0.07, -0.03] as [number, number],
      width: 0.1,
      height: 0.08
    },
    {
      name: 'rightElbow',
      parent: 'rightShoulder',
      position: [0, 0.1] as [number, number],
      width: 0.08,
      height: 0.12
    },
    {
      name: 'rightHand',
      parent: 'rightElbow',
      position: [-0.003, 0.11] as [number, number],
      width: 0.06,
      height: 0.06
    },
    // Left leg
    { name: 'leftHip', parent: 'root', position: [-0.08, 0.02] as [number, number], width: 0.1, height: 0.12 },
    { name: 'leftKnee', parent: 'leftHip', position: [0, 0.12] as [number, number], width: 0.08, height: 0.15 },
    { name: 'leftFoot', parent: 'leftKnee', position: [0, 0.12] as [number, number], width: 0.1, height: 0.05 },
    // Right leg
    { name: 'rightHip', parent: 'root', position: [0.08, 0.02] as [number, number], width: 0.1, height: 0.12 },
    { name: 'rightKnee', parent: 'rightHip', position: [0, 0.12] as [number, number], width: 0.08, height: 0.15 },
    { name: 'rightFoot', parent: 'rightKnee', position: [0, 0.12] as [number, number], width: 0.1, height: 0.05 }
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

const headPath =
  'M-43-50M9-49.4C6.267-49.8 3.35-50 .25-50 .25-50-.1-50-.1-50-16.034-50.034-27.85-44.084-35.55-32.15-38.25-28.017-40.25-23.383-41.55-18.25-42.55-14.45-43.034-11.334-43-8.9-43-8.9-38.8 18.2-38.8 18.2-38.8 18.2-37.95 23.55-37.95 23.55-37.934 23.65-37.917 23.75-37.9 23.85-37.9 23.85-37.95 23.85-37.95 23.85-36.35 34.017-35.034 42.2-34 48.4-32 59.966-30.6 66.45-29.8 67.85-28.267 71.15-24.85 74.8-19.55 78.8-12.983 83.767-6.45 86.416.05 86.75 6.55 86.416 13.083 83.767 19.649 78.8 24.95 74.8 28.366 71.15 29.899 67.85 30.7 66.45 32.1 59.966 34.1 48.4 35.123 42.261 36.423 34.178 38 24.15 38 24.15 38.05 24.15 38.05 24.15 38.087 23.967 38.12 23.784 38.149 23.6 38.149 23.6 43.149-8.9 43.149-8.9 43.184-11.334 42.7-14.45 41.7-18.25 40.399-23.383 38.399-28.017 35.7-32.15 34.467-34.084 33.2-35.784 31.899-37.25 25.899-43.383 18.267-47.434 9-49.4z';

const rightEyePath = [
  {
    name: 'reyeball',
    path: 'M-9-5M-8.92 1.016C-8.487-.784-7.42-2.251-5.721-3.384-2.62-4.917.729-5.367 4.33-4.734 6.463-4.601 8.029-3.884 9.029-2.584 9.496-1.917 9.779-1.267 9.88-.634 9.68 1.566 8.529 3.149 6.43 4.116 4.363 5.149 1.463 5.499-2.271 5.166-3.537 5.066-4.687 4.849-5.721 4.516-8.254 3.516-9.32 2.349-8.92 1.016z',
    fill: 'rgb(255,255,255)',
    size: 0.023,
    offset: { position: [0.02, 0.025] }
  },
  {
    name: 'reyepupil1',
    path: 'circle',
    fill: '#933924',
    size: 0.01,
    offset: { position: [0.02, 0.025] }
  },
  {
    name: 'reyepupil2',
    path: 'circle',
    fill: '#3d1400',
    size: 0.006,
    offset: { position: [0.02, 0.025] }
  },
  {
    name: 'reyepupil3',
    path: 'circle',
    fill: 'rgb(255,255,255)',
    size: 0.003,
    offset: { position: [0.017, 0.023] }
  },
  {
    name: 'reyelashbrow1',
    path: 'M-8-2M10.75 1.099C9.15-1.534 5.75-2.501.55-1.801-4.717-1.101-7.566.849-8 4.049-6.366 2.149-3.583.932.351.399 4.15-.134 7.617.099 10.75 1.099z',
    fill: '#3F322B',
    size: 0.023,
    offset: { position: [0.02, 0.02] }
  }
];
const rEye: Record<string, any> = {};
rightEyePath.forEach(item => {
  rEye[item.name] = {
    jointName: 'face',
    graphic: {
      type: 'symbol',
      attributes: {
        symbolType: item.path,
        fill: item.fill,
        size: item.size
      }
    },
    offset: item.offset
  };
});

const lfetEyePath = [
  {
    name: 'leyeball',
    path: 'M-10-5M8.8 1.023C8.367-.777 7.3-2.244 5.6-3.377 2.5-4.91-.85-5.36-4.45-4.727-6.583-4.594-8.15-3.877-9.15-2.577-9.617-1.91-9.9-1.26-10-.627-9.8 1.573-8.65 3.156-6.55 4.123-4.483 5.156-1.583 5.506 2.15 5.173 3.417 5.073 4.567 4.856 5.6 4.523 8.133 3.523 9.2 2.356 8.8 1.023z',
    fill: 'rgb(255,255,255)',
    size: 0.023,
    offset: { position: [-0.02, 0.025] }
  },
  {
    name: 'leyepupil1',
    path: 'circle',
    fill: '#933924',
    size: 0.01,
    offset: { position: [-0.02, 0.025] }
  },
  {
    name: 'leyepupil2',
    path: 'circle',
    fill: '#3d1400',
    size: 0.006,
    offset: { position: [-0.02, 0.025] }
  },
  {
    name: 'leyepupil3',
    path: 'circle',
    fill: 'rgb(255,255,255)',
    size: 0.003,
    offset: { position: [-0.023, 0.023] }
  },
  {
    name: 'leyelashbrow1',
    path: 'M-10-2M.2-1.805C-5-2.505-8.4-1.538-10 1.095-6.867.095-3.4-.138.4.395 4.333.928 7.117 2.145 8.75 4.045 8.317.845 5.467-1.105.2-1.805z',
    fill: '#3F322B',
    size: 0.023,
    offset: { position: [-0.02, 0.02] }
  }
];

const lEye: Record<string, any> = {};
lfetEyePath.forEach(item => {
  lEye[item.name] = {
    jointName: 'face',
    graphic: {
      type: 'symbol',
      attributes: {
        symbolType: item.path,
        fill: item.fill,
        size: item.size
      }
    },
    offset: item.offset
  };
});

const rightBrowPath =
  'M-9-4M-8.5-2.816C-8.5-2.816-9-2.766-9-2.766-9-2.766-9 4.034-9 4.034-1.1 2.701 6.317 2.851 13.25 4.484 13.25 4.484 13.25 1.484 13.25 1.484 11.483-.882 8.5-2.516 4.301-3.416-.033-4.349-4.166-4.166-8.1-2.866-8.1-2.866-8.149 2.284-8.149 2.284-8.149 2.284-8.5-2.816-8.5-2.816z';
const leftBrowPath =
  'M-10-4M12.25-2.787C12.25-2.787 11.75-2.837 11.75-2.837 11.75-2.837 11.4 2.263 11.4 2.263 11.4 2.263 11.35-2.887 11.35-2.887 7.417-4.187 3.284-4.37-1.05-3.437-5.25-2.537-8.233-.903-10 1.463-10 1.463-10 4.463-10 4.463-3.066 2.83 4.35 2.68 12.25 4.013 12.25 4.013 12.25-2.787 12.25-2.787z';

const lEar: Record<string, any> = {};
const rEar: Record<string, any> = {};
const lEarPath = [
  {
    name: 'learskin1',
    path: 'M-7-12M6.4-9.072C5.533-10.239 4.57-11.03 3.5-11.422.867-12.388-1.583-12.172-3.85-10.772-6.95-8.805-7.75-4.855-6.25 1.078-4.85 5.845-2.513 9.172.75 11.078 3.717 12.811 6.95 13.095 10.45 11.928 10.45 11.928 7.75-6.222 7.75-6.222 7.683-7.055 7.233-8.005 6.4-9.072z',
    fill: '#e2b284',
    size: 0.036,
    offset: { position: [-0.056, 0.022] }
  },
  {
    name: 'learskin2',
    path: 'M-5-5M1.866-1.076C2.533-.227 3.199.714 3.866 1.744.833-4.867-2.117-6.641-4.984-3.578-2.717-4.943-.434-4.139 1.866-1.167.399-.833-.273.077-.134 1.563-.001 2.988.749 4.656 2.116 6.567.383 2.776.299.228 1.866-1.076z',
    fill: '#9f7f61',
    size: 0.02,
    offset: { position: [-0.056, 0.022] }
  }
];
const rEarPath = [
  {
    name: 'rearskin1',
    path: 'M-10-11M-5.95-8.056C-5.083-9.223-4.119-10.014-3.05-10.406-.417-11.372 2.033-11.156 4.3-9.756 7.401-7.789 8.2-3.839 6.7 2.094 5.3 6.861 2.963 10.187-.3 12.094-3.266 13.827-6.5 14.111-10 12.944-10 12.944-7.3-5.206-7.3-5.206-7.233-6.039-6.783-6.989-5.95-8.056z',
    fill: '#e2b284',
    size: 0.036,
    offset: { position: [0.056, 0.022] }
  },
  {
    name: 'rearskin2',
    path: 'M-4-3M-2 .939C-2.666 1.788-3.333 2.729-4 3.759-.967-2.852 1.983-4.625 4.851-1.562 2.584-2.927.301-2.123-2 .849-.533 1.183.139 2.091 0 3.578-.133 5.003-.883 6.671-2.25 8.582-.517 4.791-.433 2.243-2 .939z',
    fill: '#9f7f61',
    size: 0.02,
    offset: { position: [0.056, 0.022] }
  }
];

lEarPath.forEach(item => {
  lEar[item.name] = {
    jointName: 'head',
    graphic: {
      type: 'symbol',
      attributes: {
        symbolType: item.path,
        fill: item.fill,
        size: item.size
      }
    },
    offset: item.offset
  };
});
rEarPath.forEach(item => {
  rEar[item.name] = {
    jointName: 'head',
    graphic: {
      type: 'symbol',
      attributes: {
        symbolType: item.path,
        fill: item.fill,
        size: item.size
      }
    },
    offset: item.offset
  };
});

const nosePath =
  'M-9-16M2.6-16C2.629-15.622 2.647-15.255 2.65-14.9 2.939-9.245 3.705-4.461 4.95-.55 6.65 5.017 7.433 8.133 7.299 8.8 7.266 8.966 7.2 9.15 7.1 9.35 4.333 11.483 1.966 12.633 0 12.8-1.733 12.833-4.334 11.583-7.8 9.05-7.867 8.85-7.917 8.667-7.95 8.5-8.017 8.333-7.967 7.55-7.8 6.15-7.663 5.131-7.479 3.781-7.25 2.1-7.202 1.776-7.152 1.426-7.1 1.05-8.6 5.55-9.233 8.183-9 8.95-8.834 9.816-8.084 10.983-6.75 12.45-5.317 13.983-3.9 15.05-2.5 15.65-1.5 16.15-.584 16.35.25 16.25.75 16.15 1.283 15.966 1.85 15.7 1.983 15.667 2.1 15.633 2.2 15.6 3.6 15 4.983 13.95 6.35 12.45 7.683 10.983 8.433 9.816 8.6 8.95 8.9 8.083 8.049 4.883 6.049-.65 4.568-4.883 3.468-9.633 2.749-14.9 2.71-15.256 2.661-15.623 2.6-16z';

const mouthPath1 =
  'M-12.4-2M12.6-2C9.666-1.8 5.499-1.7.1-1.7-5.267-1.7-9.434-1.8-12.4-2-11.334-.633-9.617.433-7.25 1.2-4.917 1.933-2.467 2.233.1 2.1 2.666 2.233 5.117 1.933 7.45 1.2 9.817.433 11.533-.633 12.6-2z';
const mouthPath2 =
  'M-8.3-2M.05 1.3C3.117 1.3 5.9.2 8.4-2 5.767-.467 2.983.283.05.25-2.883.283-5.666-.467-8.3-2-5.8.2-3.016 1.3.05 1.3z';

const bodySkinPath =
  'M-53-100M54.322-2.966C54.322-6.737 52.148-10.003 48.991-11.596 48.991-11.6 48.99-11.605 48.989-11.609 42.644-14.608 16.651-25.285 11.183-27.53 11.183-27.53 10.933-32.43 10.933-32.43 10.933-32.43 10.034-89.65 10.034-89.65 10.034-89.65 9.984-89.9 9.984-89.9 9.984-89.9 9.984-90.6 9.984-90.6 9.984-92.966 9.167-95.1 7.534-97 7.534-97 7.234-97.299 7.234-97.299 5.392-99.01 3.009-99.843.084-100-2.249-99.841-4.299-98.941-6.066-97.299-6.066-97.299-6.366-97-6.366-97-8-95.1-8.816-92.966-8.816-90.6-8.816-90.6-8.816-89.9-8.816-89.9-8.816-89.9-8.866-89.65-8.866-89.65-8.866-89.65-9.766-32.43-9.766-32.43-9.766-32.43-10.016-27.53-10.016-27.53-16.144-24.822-42.061-14.597-47.761-11.559-47.762-11.556-47.763-11.552-47.763-11.549-50.869-9.939-53-6.699-53-2.965-53-.276-51.895 2.159-50.117 3.913-50.117 3.913-50.117 3.917-50.117 3.917-48.697 5.316-29.755 30.654-27.469 53.82-27.469 53.82-27.466 53.82-27.466 53.82-27.466 53.82-24.979 106.598-24.979 106.598-20.78 107.898-12.583 108.503-.216 108.47 12.084 108.47 20.734 107.842 25.767 106.576 25.767 106.576 28.634 53.82 28.634 53.82 30.921 30.654 49.974 5.358 51.395 3.959 51.395 3.957 51.394 3.955 51.394 3.953 53.198 2.195 54.322-.255 54.322-2.966z';

const tpinnerPath =
  'M-53-60M26.034-59.677C29.446-58.24 44.058-52.592 49.625-50.042 49.629-50.04 49.632-50.033 49.636-50.031 53.276-48.405 55.822-44.757 55.822-40.519 55.822-37.247 54.305-34.328 51.938-32.418 51.392-31.977 32.276-2.116 30.659 16.958 30.659 16.958 26.95 69.462 26.95 69.462 26.95 69.462 21.844 71.032.269 71.677-17.356 71.232-24.276 69.325-24.276 69.325-24.276 69.325-28.159 17.594-28.159 17.594-28.81 12.139-28.945 10.771-29.636 7.8-33.642-9.448-48.152-31.695-48.739-32.126-51.32-34.023-53-37.075-53-40.517-53-44.616-50.615-48.16-47.164-49.861-47.141-49.878-47.118-49.898-47.094-49.908-45.594-50.641-25.188-59.503-22.454-60 1.476-28.227 26.034-59.677 26.034-59.677z';

const lupperarmPath =
  'M-10-35M-.329-35C-5.662-35-10-30.662-10-25.329-10-22.381-7.632 28.845-7.632 28.845-7.632 33.242-4.055 36.819.343 36.819 4.74 36.819 8.317 33.242 8.317 28.845 8.317 28.845 9.341-24.265 9.341-25.329 9.341-30.662 5.004-35-.329-35z';
const llowerarmPath =
  'M-8-50M-.025-50C-4.422-50-8-46.422-8-42.024-8-39.716-2.4 50.754-2.4 50.754-2.4 52.821-.718 54.504 1.35 54.504 3.417 54.504 5.1 52.821 5.1 50.754 5.1 50.754 7.95-26.997 7.95-42.024 7.95-46.422 4.372-50-.025-50z';
const lhandPath =
  'M-10-22M7.95-.957C6.35-6.523 5.483-9.49 5.35-9.856 4.283-13.356 3.325-16.316 2.458-18.25 2.458-20.317.776-22-1.291-22-3.359-22-5.042-20.317-5.042-18.25-5.067-18.156-6.1-13.323-7.8-5.757-8.967-.623-9.7 3.427-10 6.394-9.567 10.36-8.95 13.31-8.15 15.243-7.584 16.644-6.667 18.26-5.4 20.093-4.067 21.993-2.85 23.41-1.75 24.343-1.584 24.443-1.3 24.51-.9 24.543-.467 24.576-.117 24.543.15 24.443.15 24.443.8 24.993.8 24.993 1 25.06 1.333 25.076 1.8 25.043 2.3 24.977 2.733 24.843 3.1 24.644 3.1 24.644 3.25 24.543 3.25 24.543 3.25 24.543 3.75 24.993 3.75 24.993 4.15 25.16 4.75 25.043 5.55 24.644 6.317 24.21 6.65 23.843 6.55 23.543 6.55 23.543 2.7 12.593 2.7 12.593 1.833 8.927 1.55 4.427 1.85-.907 2.516.16 3.067 2.093 3.5 4.894 4 7.927 4.65 9.693 5.45 10.193 5.75 10.394 6.333 10.377 7.2 10.144 8.1 9.877 8.617 9.576 8.75 9.243 7.75 6.443 7.483 3.043 7.95-.957z';
const rhandPath =
  'M-10-22M-9.2-.956C-7.6-6.523-6.733-9.49-6.6-9.856-5.533-13.356-4.575-16.316-3.709-18.25-3.709-20.317-2.026-22 .041-22 2.109-22 3.791-20.317 3.791-18.25 3.817-18.156 4.85-13.323 6.55-5.757 7.717-.623 8.45 3.427 8.75 6.394 8.317 10.36 7.7 13.311 6.9 15.243 6.333 16.644 5.417 18.26 4.15 20.094 2.817 21.993 1.6 23.41.5 24.344.333 24.443.05 24.51-.35 24.544-.783 24.577-1.134 24.544-1.4 24.443-1.4 24.443-2.05 24.993-2.05 24.993-2.25 25.061-2.583 25.077-3.05 25.044-3.55 24.977-3.983 24.844-4.35 24.644-4.35 24.644-4.5 24.544-4.5 24.544-4.5 24.544-5 24.993-5 24.993-5.4 25.16-6 25.044-6.8 24.644-7.566 24.21-7.9 23.844-7.8 23.544-7.8 23.544-3.95 12.594-3.95 12.594-3.083 8.927-2.8 4.427-3.1-.906-3.766.16-4.316 2.094-4.75 4.894-5.25 7.927-5.9 9.693-6.7 10.193-7 10.394-7.583 10.377-8.45 10.144-9.35 9.877-9.867 9.577-10 9.243-9 6.443-8.733 3.044-9.2-.956z';
/**
 * Default human parts configuration
 * All sizes and positions are normalized to [0, 1] range
 */
export const DEFAULT_HUMAN_PARTS: Record<string, any> = {
  faceShape: {
    jointName: 'face',
    graphic: {
      type: 'symbol',
      attributes: {
        symbolType: headPath,
        fill: '#e2b284'
      }
    }
  },
  ...rEye,
  ...lEye,
  rightBrow: {
    jointName: 'face',
    graphic: {
      type: 'symbol',
      attributes: {
        symbolType: rightBrowPath,
        fill: '#3F322B',
        size: 0.023
      }
    },
    offset: { position: [0.023, 0.008] }
  },
  leftBrow: {
    jointName: 'face',
    graphic: {
      type: 'symbol',
      attributes: {
        symbolType: leftBrowPath,
        fill: '#3F322B',
        size: 0.023
      }
    },
    offset: { position: [-0.023, 0.008] }
  },
  ...lEar,
  ...rEar,
  nose: {
    jointName: 'face',
    graphic: {
      type: 'symbol',
      attributes: {
        symbolType: nosePath,
        fill: '#9f7f61',
        size: 0.023,
        opacity: 0.2
      }
    },
    offset: { position: [0, 0.04] }
  },
  mouth1: {
    jointName: 'face',
    graphic: {
      type: 'symbol',
      attributes: {
        symbolType: mouthPath1,
        fill: '#9f7f61',
        size: 0.032,
        opacity: 0.2
      }
    },
    offset: { position: [0, 0.067] }
  },
  mouth2: {
    jointName: 'face',
    graphic: {
      type: 'symbol',
      attributes: {
        symbolType: mouthPath2,
        fill: '#9f7f61',
        size: 0.02,
        opacity: 0.2
      }
    },
    offset: { position: [0, 0.077] }
  },
  bodySkin: {
    jointName: 'chest',
    graphic: {
      type: 'symbol',
      attributes: {
        symbolType: bodySkinPath,
        fill: '#e2b284',
        size: 0.3,
        opacity: 0.2
      }
    },
    offset: { position: [0, -0.02] }
  },
  tpinner: {
    jointName: 'chest',
    graphic: {
      type: 'symbol',
      attributes: {
        symbolType: tpinnerPath,
        fill: '#EFEFEF',
        size: 0.2,
        opacity: 0.2
      }
    },
    offset: { position: [0, 0.04] }
  },
  lupperarm: {
    jointName: 'leftShoulder',
    graphic: {
      type: 'symbol',
      attributes: { symbolType: lupperarmPath, fill: '#E2B284', size: 0.1, opacity: 0.2 }
    },
    offset: { position: [0, 0.047] }
  },
  rupperarm: {
    jointName: 'rightShoulder',
    graphic: {
      type: 'symbol',
      attributes: { symbolType: lupperarmPath, fill: '#E2B284', size: 0.1, opacity: 0.2 }
    },
    offset: { position: [0, 0.047] }
  },
  llowerarm: {
    jointName: 'leftElbow',
    graphic: {
      type: 'symbol',
      attributes: { symbolType: llowerarmPath, fill: '#E2B284', size: 0.13, opacity: 0.2 }
    },
    offset: { position: [0, 0.05] }
  },
  rlowerarm: {
    jointName: 'rightElbow',
    graphic: {
      type: 'symbol',
      attributes: { symbolType: llowerarmPath, fill: '#E2B284', size: 0.13, opacity: 0.2 }
    },
    offset: { position: [0, 0.05] }
  },
  lhand: {
    jointName: 'leftHand',
    graphic: {
      type: 'symbol',
      attributes: { symbolType: lhandPath, fill: '#E2B284', size: 0.06, opacity: 0.2 }
    },
    offset: { position: [0.005, 0.027] }
  },
  rhand: {
    jointName: 'rightHand',
    graphic: {
      type: 'symbol',
      attributes: { symbolType: rhandPath, fill: '#E2B284', size: 0.06, opacity: 0.2 }
    },
    offset: { position: [0.005, 0.027] }
  }
};
