import type { IAABBBounds, IPointLike } from '@visactor/vutils';
import { Graphic, GRAPHIC_UPDATE_TAG_KEY, NOWORK_ANIMATE_ATTR } from './graphic';
import type { IStar, IStarGraphicAttribute } from '../interface/graphic/star';
import { getTheme } from './theme';
import { application } from '../application';
import type { GraphicType } from '../interface';
import { CustomPath2D } from '../common/custom-path2d';
import { STAR_NUMBER_TYPE } from './constants';

const STAR_UPDATE_TAG_KEY = ['width', 'height', 'spikes', 'thickness', ...GRAPHIC_UPDATE_TAG_KEY];

export class Star extends Graphic<IStarGraphicAttribute> implements IStar {
  type: GraphicType = 'star';

  static NOWORK_ANIMATE_ATTR = NOWORK_ANIMATE_ATTR;

  _cachedPoints: IPointLike[] = [];

  constructor(params: IStarGraphicAttribute) {
    super(params);
    this.numberType = STAR_NUMBER_TYPE;
  }

  isValid(): boolean {
    return super.isValid() && this._isValid();
  }

  protected _isValid(): boolean {
    const { width, height, spikes } = this.attribute;
    return (
      (width == null || width > 0) &&
      (height == null || height > 0) &&
      (spikes == null || (spikes >= 3 && Number.isInteger(spikes)))
    );
  }

  getGraphicTheme(): Required<IStarGraphicAttribute> {
    return getTheme(this).star;
  }

  protected updateAABBBounds(
    attribute: IStarGraphicAttribute,
    rectTheme: Required<IStarGraphicAttribute>,
    aabbBounds: IAABBBounds
  ) {
    if (!this.updatePathProxyAABBBounds(aabbBounds)) {
      const { width = 0, height = 0 } = attribute;
      if (isFinite(width) || isFinite(height)) {
        aabbBounds.set(0, 0, width, height);
      }
    }

    const { tb1, tb2 } = application.graphicService.updateTempAABBBounds(aabbBounds);

    aabbBounds.union(tb1);
    tb1.setValue(tb2.x1, tb2.y1, tb2.x2, tb2.y2);

    this.widthWithoutTransform = aabbBounds.x2 - aabbBounds.x1;
    this.heightWithoutTransform = aabbBounds.y2 - aabbBounds.y1;

    application.graphicService.transformAABBBounds(attribute, aabbBounds, rectTheme, false, this);
    return aabbBounds;
  }

  getCachedPoints(): IPointLike[] {
    if (this.shouldUpdateShape()) {
      this._cachedPoints = this.getStarPoints(this.attribute, this.getGraphicTheme());
      this.clearUpdateShapeTag();
    }
    return this._cachedPoints;
  }

  /**
   * Calculate star points based on width, height, spikes, and thickness
   */
  private getStarPoints(attribute: IStarGraphicAttribute, starTheme: Required<IStarGraphicAttribute>): IPointLike[] {
    const {
      width = starTheme.width,
      height = starTheme.height,
      spikes = starTheme.spikes,
      thickness = starTheme.thickness
    } = attribute;

    // Ensure valid values
    const validSpikes = Math.max(3, Math.floor(spikes));
    const validThickness = Math.max(0, Math.min(1, thickness));

    const points: IPointLike[] = [];
    const outerRadius = Math.min(width, height) / 2;
    const innerRadius = outerRadius * (1 - validThickness);
    const centerX = width / 2;
    const centerY = height / 2;

    // Calculate points for the star
    for (let i = 0; i < validSpikes * 2; i++) {
      // Alternate between outer and inner radius
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (Math.PI / validSpikes) * i;

      // Scale X based on width and Y based on height
      const scaleX = width / (outerRadius * 2);
      const scaleY = height / (outerRadius * 2);

      points.push({
        x: centerX + Math.sin(angle) * radius * scaleX,
        y: centerY - Math.cos(angle) * radius * scaleY
      });
    }

    this._cachedPoints = points;

    return points;
  }

  protected _interpolate(key: string, ratio: number, lastStepVal: any, nextStepVal: any, nextAttributes: any): void {
    if (key === 'width' || key === 'height' || key === 'spikes' || key === 'thickness') {
      nextAttributes[key] = lastStepVal + (nextStepVal - lastStepVal) * ratio;
    }
  }

  protected needUpdateTags(keys: string[]): boolean {
    return super.needUpdateTags(keys, STAR_UPDATE_TAG_KEY);
  }

  protected needUpdateTag(key: string): boolean {
    return super.needUpdateTag(key, STAR_UPDATE_TAG_KEY);
  }

  toCustomPath() {
    const starTheme = this.getGraphicTheme();
    const points = this.getStarPoints(this.attribute, starTheme);
    const path = new CustomPath2D();

    points.forEach((point, index) => {
      if (index === 0) {
        path.moveTo(point.x, point.y);
      } else {
        path.lineTo(point.x, point.y);
      }
    });
    path.closePath();

    return path;
  }

  clone() {
    return new Star({ ...this.attribute });
  }

  getNoWorkAnimateAttr(): Record<string, number> {
    return Star.NOWORK_ANIMATE_ATTR;
  }
}

export function createStar(attributes: IStarGraphicAttribute): IStar {
  return new Star(attributes);
}
