import type { IOption3D, IPlugin, IPluginService } from '../../interface';
import { Generator } from '../../common/generator';
import { Factory } from '../../factory';

export class ViewTransform3dPlugin implements IPlugin {
  name: 'ViewTransform3dPlugin' = 'ViewTransform3dPlugin';
  activeEvent: 'onRegister' = 'onRegister';
  pluginService: IPluginService;
  _uid: number = Generator.GenAutoIncrementId();
  key: string = this.name + this._uid;
  mousedown?: boolean;
  pageX?: number;
  pageY?: number;
  option3d?: IOption3D;

  onMouseDown = (e: MouseEvent | any) => {
    if (!this.option3d) {
      this.option3d = this.pluginService.stage.option3d;
    }
    if (!this.option3d) {
      return;
    }
    this.mousedown = true;
    this.pageX = e.page.x;
    this.pageY = e.page.y;
  };
  onMouseUp = (e: MouseEvent | any) => {
    if (!this.option3d) {
      this.option3d = this.pluginService.stage.option3d;
    }
    if (!this.option3d) {
      return;
    }
    this.mousedown = false;
  };
  onMouseMove = (e: MouseEvent | any) => {
    const stage = this.pluginService.stage;
    if (!this.option3d) {
      this.option3d = stage.option3d;
    }
    if (!this.option3d) {
      return;
    }
    if (this.mousedown) {
      if (!this.pageX || !this.pageY) {
        this.pageX = e.page.x;
        this.pageY = e.page.y;
      } else {
        const deltaX = e.page.x - this.pageX;
        const deltaY = e.page.y - this.pageY;
        this.pageX = e.page.x;
        this.pageY = e.page.y;

        const angle1 = deltaX / 100;
        const angle2 = deltaY / 100;
        this.option3d.alpha = (this.option3d.alpha ?? 0) + angle1;
        this.option3d.beta = (this.option3d.beta ?? 0) + angle2;
        stage.set3dOptions(this.option3d);
        stage.renderNextFrame();
      }
    }
  };

  activate(context: IPluginService): void {
    this.pluginService = context;
    const stage = context.stage;
    this.option3d = stage.option3d;
    stage.addEventListener('mousedown', this.onMouseDown);
    stage.addEventListener('mouseup', this.onMouseUp);
    stage.addEventListener('mousemove', this.onMouseMove);
  }
  deactivate(context: IPluginService): void {
    const stage = context.stage;
    stage.removeEventListener('mousedown', this.onMouseDown);
    stage.removeEventListener('mouseup', this.onMouseUp);
    stage.removeEventListener('mousemove', this.onMouseMove);
  }
}

export const registerViewTransform3dPlugin = () => {
  Factory.registerPlugin('ViewTransform3dPlugin', ViewTransform3dPlugin);
};
