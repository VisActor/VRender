declare const __DEV__: boolean;
declare const __VERSION__: string;
declare namespace Reflect {
  function decorate(decorator: any, target: any, parameterIndexOrProperty?: number | string): void;
  function hasOwnMetadata(metadataKey: string, target: any, propertyKey?: any): boolean;
  function getMetadata(metadataKey: string, target: any, propertyKey?: any): any;
  function hasMetadata(metadataKey: string, target: any, propertyKey?: any): boolean;
  function defineMetadata(metadataKey: string, metadataValue: any, target: any, propertyKey?: any): number;
}
// declare interface Reflect {
//   hasOwnMetadata(metadataKey: string, target: any, propertyKey?: any): boolean;
//   getMetadata(metadataKey: string, target: any, propertyKey?: any): any;
//   defineMetadata(metadataKey: string, metadataValue: any, target: any, propertyKey?: any): number;
// }

// declare global {
//   interface Window {
//     Reflect: Reflect;
//   }
//   interface Reflect {
//     hasOwnMetadata(metadataKey: string, target: any, propertyKey?: any): boolean;
//     getMetadata(metadataKey: string, target: any, propertyKey?: any): any;
//     hasMetadata(metadataKey: string, target: any, propertyKey?: any): boolean;
//     defineMetadata(metadataKey: string, metadataValue: any, target: any, propertyKey?: any): number;
//   }
// }
