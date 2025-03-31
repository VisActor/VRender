import { array, last, merge } from '@visactor/vutils';
import type { IGroup, INode } from '@visactor/vrender-core';
import { DEFAULT_STATES } from '../../constant';
import type { TagAttributes } from '../../tag';
import { Tag } from '../../tag';

export interface MarkLabelMixin<T extends { label?: any; state?: any }> {
  attribute: T;
  setLabelPos: (labelNode: IGroup, labelAttrs: any) => any;
}

export class MarkLabelMixin<T> {
  _label!: Tag | Tag[];
  getLabel() {
    return this._label;
  }
  _addMarkLabels(container: IGroup, labelName: string, defaultLabelAttrs: TagAttributes) {
    const { label, state } = this.attribute as T;
    const labelStates = array(state?.label);
    const labelBackgroundStates = array(state?.labelBackground);
    // add label
    const labelShapes = array(label).map((labelAttrs, index) => {
      const finalLabelAttrs = merge({}, defaultLabelAttrs, labelAttrs as TagAttributes);
      const markLabel = new Tag({
        ...finalLabelAttrs,
        state: {
          panel: merge({}, DEFAULT_STATES, labelBackgroundStates[index] ?? last(labelBackgroundStates)),
          text: merge({}, DEFAULT_STATES, labelStates[index] ?? last(labelStates))
        }
      });
      markLabel.name = labelName;
      container.add(markLabel as unknown as INode);
      this.setLabelPos(markLabel, finalLabelAttrs);

      return markLabel;
    });
    this._label = array(labelShapes).length === 1 ? labelShapes[0] : labelShapes;
  }

  _updateMarkLabels(defaultLabelAttrs: TagAttributes) {
    const { label, state } = this.attribute as T;

    const labelShapes = array(this._label);
    const labelStates = array(state?.label);
    const labelBackgroundStates = array(state?.labelBackground);
    if (labelShapes.length) {
      const labels = array(label);
      labelShapes.forEach((labelItem: Tag, index: number) => {
        const finalLabelAttrs = merge({}, defaultLabelAttrs, labels[index] as TagAttributes);
        labelItem.setAttributes({
          dx: 0,
          dy: 0, // 需要进行复位
          ...finalLabelAttrs,
          state: {
            panel: merge({}, DEFAULT_STATES, labelBackgroundStates[index] ?? last(labelBackgroundStates)),
            text: merge({}, DEFAULT_STATES, labelStates[index] ?? last(labelStates))
          }
        });
        this.setLabelPos(labelItem, finalLabelAttrs);
      });
    }
  }
}
