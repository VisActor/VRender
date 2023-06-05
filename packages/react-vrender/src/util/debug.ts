declare const __DEV__: boolean;

export const log = __DEV__
  ? (...args: any[]) => {
      // eslint-disable-next-line no-console
      console.log(...args);
    }
  : () => {
      return;
    };

export const error = __DEV__
  ? (errorMsg: string) => {
      throw new Error(errorMsg);
    }
  : () => {
      return;
    };
