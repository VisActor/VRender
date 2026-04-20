declare module '@visactor/vrender' {
  export interface IGraphic {}

  export interface IGroupGraphic extends IGraphic {
    add: (graphic: unknown) => void;
  }

  export interface IDemoVRenderApp {
    createStage: (options?: Record<string, unknown>) => {
      defaultLayer: {
        add: (graphic: unknown) => void;
      };
    };
    release?: () => void;
  }

  export function createBrowserVRenderApp(options?: Record<string, unknown>): IDemoVRenderApp;
  export function createRect(options?: Record<string, unknown>): IGraphic;
  export function createGroup(options?: Record<string, unknown>): IGroupGraphic;
}
