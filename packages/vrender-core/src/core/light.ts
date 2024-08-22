import type { vec4 } from '@visactor/vutils';
import { isString, max, min, sqrt } from '@visactor/vutils';
import type { vec3 } from '../interface';
import { ColorStore, ColorType } from '../color-string';
import { Factory } from '../factory';

export class DirectionalLight {
  declare dir: vec3;
  declare color: string;
  declare colorRgb: vec4;
  declare formatedDir: vec3;
  declare ambient: number;

  constructor(dir: vec3, color: string, ambient: number = 0.8) {
    this.dir = dir;
    this.color = color;
    this.colorRgb = ColorStore.Get(color, ColorType.Color1);
    this.ambient = ambient;
    const length = sqrt(dir[0] * dir[0] + dir[1] * dir[1] + dir[2] * dir[2]);
    this.formatedDir = [dir[0] / length, dir[1] / length, dir[2] / length];
  }

  computeColor(normal: vec3, color: string | vec3): string {
    const lightDir = this.formatedDir;
    const brightness = min(
      max((normal[0] * lightDir[0] + normal[1] * lightDir[1] + normal[2] * lightDir[2]) * (1 - this.ambient / 2), 0) +
        this.ambient,
      1
    );

    let colorArray: vec3;
    if (isString(color)) {
      colorArray = ColorStore.Get(color, ColorType.Color1) as any;
    } else {
      colorArray = color;
    }

    const lightColorArray = this.colorRgb;

    return `rgb(${lightColorArray[0] * colorArray[0] * brightness}, ${
      lightColorArray[1] * colorArray[1] * brightness
    }, ${lightColorArray[2] * colorArray[2] * brightness})`;
  }
}

export const registerDirectionalLight = () => {
  Factory.registerPlugin('DirectionalLight', DirectionalLight);
};
