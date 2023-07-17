import type { IGroup, INode, IPolygon } from '@visactor/vrender';
import { createPolygon } from '@visactor/vrender';
import { merge } from '@visactor/vutils';
import { Tag } from '../tag';
import { Marker } from './base';
import { DEFAULT_MARK_AREA_TEXT_STYLE_MAP, DEFAULT_MARK_AREA_THEME } from './config';
import type { MarkAreaAttrs } from './type';

export class MarkArea extends Marker<MarkAreaAttrs> {
  static defaultAttributes = DEFAULT_MARK_AREA_THEME;
  private _area!: IPolygon;

  constructor(attributes: MarkAreaAttrs) {
    super(merge({}, MarkArea.defaultAttributes, attributes));
  }

  protected getLeftPos() {
    return {
      x: this._area.AABBBounds.x1,
      y: (this._area.AABBBounds.y1 + this._area.AABBBounds.y2) / 2
    };
  }

  protected getRightPos() {
    return {
      x: this._area.AABBBounds.x2,
      y: (this._area.AABBBounds.y1 + this._area.AABBBounds.y2) / 2
    };
  }

  protected getTopPos() {
    return {
      x: (this._area.AABBBounds.x1 + this._area.AABBBounds.x2) / 2,
      y: this._area.AABBBounds.y1
    };
  }

  protected getBottomPos() {
    return {
      x: (this._area.AABBBounds.x1 + this._area.AABBBounds.x2) / 2,
      y: this._area.AABBBounds.y2
    };
  }

  protected getMiddlePos() {
    return {
      x: (this._area.AABBBounds.x1 + this._area.AABBBounds.x2) / 2,
      y: (this._area.AABBBounds.y1 + this._area.AABBBounds.y2) / 2
    };
  }

  protected setLabelPos() {
    const { label } = this.attribute as MarkAreaAttrs;
    const labelPosition = label?.position ?? 'middle';
    if (labelPosition.includes('left') || labelPosition.includes('Left')) {
      this._label.setAttributes({
        ...this.getLeftPos()
      });
    } else if (labelPosition.includes('right') || labelPosition.includes('Right')) {
      this._label.setAttributes({
        ...this.getRightPos()
      });
    } else if (labelPosition.includes('top') || labelPosition.includes('Top')) {
      this._label.setAttributes({
        ...this.getTopPos()
      });
    } else if (labelPosition.includes('bottom') || labelPosition.includes('Bottom')) {
      this._label.setAttributes({
        ...this.getBottomPos()
      });
    } else {
      this._label.setAttributes({
        ...this.getMiddlePos()
      });
    }
    this._label.setAttributes({
      textStyle: {
        ...DEFAULT_MARK_AREA_TEXT_STYLE_MAP[labelPosition],
        ...label.textStyle
      }
    });
  }

  protected initMarker(container: IGroup) {
    const { points, label, areaStyle } = this.attribute as MarkAreaAttrs;
    const area = createPolygon({
      points: points,
      ...areaStyle
    });
    area.name = 'mark-area-area';
    this._area = area;
    container.add(area);

    const markLabel = new Tag({
      ...label
    });
    markLabel.name = 'mark-area-label';
    this._label = markLabel;
    container.add(markLabel as unknown as INode);
    this.setLabelPos();
  }

  protected updateMarker() {
    const { points, label, areaStyle } = this.attribute as MarkAreaAttrs;
    this._area.setAttributes({
      points: points,
      ...areaStyle
    });
    this._label.setAttributes({
      ...label
    });
    this.setLabelPos();
  }
}
