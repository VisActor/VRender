import type { ICustomAnimate } from '../intreface/animate';
import type { IAnimateStepType } from '../intreface/type';
import { Step } from '../step';

export abstract class ACustomAnimate extends Step implements ICustomAnimate {
  type: IAnimateStepType = 'customAnimate';

  get from() {
    return this.getFromProps();
  }

  get to() {
    return this.getEndProps();
  }

  protected setProps(props: Record<string, any>) {
    this.props = props;
    this.propKeys = Object.keys(props);
    this.animate.reSyncProps();
  }
}
