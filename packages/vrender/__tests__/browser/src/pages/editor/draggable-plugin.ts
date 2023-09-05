import { injectable } from 'inversify';
import type { FederatedPointerEvent, IGraphic, IPlugin, IPluginService } from '@visactor/vrender';
import { Generator, DragNDrop } from '@visactor/vrender';

// _showPoptip: 0-没有，1-添加，2-删除

@injectable()
export class DraggablePlugin implements IPlugin {
  name: 'DraggablePlugin' = 'DraggablePlugin';
  activeEvent: 'onRegister' = 'onRegister';
  pluginService: IPluginService;
  _uid: number = Generator.GenAutoIncrementId();
  key: string = this.name + this._uid;
  activeGraphic: IGraphic;

  activate(context: IPluginService): void {
    this.pluginService = context;
    const { stage } = this.pluginService;
    new DragNDrop(stage as any);
    stage.addEventListener('drag', this.onDrag);
  }

  onDrag = (e: DragEvent) => {
    const attribute = (e.target as any).attribute ?? {};
    if (attribute.dragable) {
      this.update(e);
    }
  };

  update(e: DragEvent) {
    console.log(e);
    const graphic: IGraphic = e.target as any;
    const parent = graphic.parent;
    let x = e.offset.x;
    let y = e.offset.y;
    if (parent) {
      const pm = parent.globalTransMatrix;
      const p = { x, y };
      pm.transformPoint(p, p);
      x = p.x;
      y = p.y;
    }

    graphic.setAttributes({
      x,
      y
    });
  }

  deactivate(context: IPluginService): void {
    const { stage } = this.pluginService;
    stage.removeEventListener('drag', this.onDrag);
  }
}
