import { IPointLike, max } from '@visactor/vutils';

enum BrushType {
  Basic,
  Fluorescence,
  Rubber
}

interface IPosListType {
  type: BrushType;
  list: IPointLike[];
  speeds: number[];
  color: string;
  maxWidth: number;
}

class Brush {
  type: BrushType;
  posList: IPosListType[];
  currPosList: IPosListType;
  lastTime: number;
  ctx: CanvasRenderingContext2D;
  minWidth: number;
  maxSpeed: number;
  minSpeed: number;
  // 转折的更丝滑一点
  lastLineWidth: number;

  constructor(ctx: CanvasRenderingContext2D) {
    this.posList = [];
    this.lastTime = -1;
    this.ctx = ctx;
    this.minWidth = 1;
    this.maxSpeed = 10;
    this.minSpeed = 1;
    this.lastLineWidth = -1;
  }

  addPosition(pos: IPointLike) {
    this.currPosList.list.push(pos);
    if (this.currPosList.list.length === 1) {
      this.currPosList.speeds.push(0);
    } else {
      this.currPosList.speeds.push(this.computedSpeed(this.currPosList.list[this.currPosList.list.length - 2], pos));
    }

    this.drawDelta();
  }

  private computedSpeed(from: IPointLike, to: IPointLike) {
    const distance = Math.sqrt(Math.pow(from.x - to.x, 2) + Math.pow(from.y - to.y, 2));
    const now = Date.now();
    const duration = now - this.lastTime;
    this.lastTime = now;
    return distance / duration;
  }

  private computedLineWidthBySpeed(speed: number, maxWidth: number) {
    if (this.type === BrushType.Rubber) {
      return maxWidth;
    }
    const minWidth = this.minWidth;
    const _speed = Math.min(Math.max(speed, this.minSpeed), this.maxSpeed);
    const normalizeSpeed = (_speed - this.minSpeed) / (this.maxSpeed - this.minSpeed);
    let lineWidth = minWidth + (maxWidth - minWidth) * (1 - normalizeSpeed);
    if (this.lastLineWidth > 0) {
      lineWidth = (this.lastLineWidth + lineWidth) / 2;
    }
    this.lastLineWidth = lineWidth;
    return lineWidth;
  }

  private applyCommonStyle(type: BrushType, color: string) {
    const ctx = this.ctx;
    ctx.setTransform(2, 0, 0, 2, 0, 0);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    this.ctx.strokeStyle = color;
    if (type === BrushType.Basic) {
      // 跳过
    } else if (type === BrushType.Fluorescence) {
      this.ctx.shadowColor = color;
    }
  }

  start(type: BrushType, color: string, maxWidth: number) {
    this.currPosList = { type, list: [], speeds: [], color, maxWidth };
    this.posList.push(this.currPosList);
    this.lastTime = -1;

    this.applyCommonStyle(type, color);
    this.ctx.save();
  }

  end() {
    this.ctx.restore();
  }

  applySpecialStyle(type: BrushType, lineWidth: number) {
    if (type === BrushType.Fluorescence) {
      this.ctx.shadowBlur = lineWidth;
    }
  }

  drawDelta() {
    const p0 = this.currPosList.list[this.currPosList.list.length - 3];
    const p1 = this.currPosList.list[this.currPosList.list.length - 2];
    const p2 = this.currPosList.list[this.currPosList.list.length - 1];
    const ctx = this.ctx;
    const lineWidth = this.computedLineWidthBySpeed(
      this.currPosList.speeds[this.currPosList.list.length - 1],
      this.currPosList.maxWidth
    );
    ctx.lineWidth = lineWidth;
    if (this.currPosList.list.length === 1) {
      return;
    }
    ctx.beginPath();
    if (this.currPosList.list.length === 2) {
      ctx.moveTo(p2.x, p2.y);
      ctx.lineTo(p2.x, p2.y);
    } else {
      ctx.moveTo((p0.x + p1.x) / 2, (p0.y + p1.y) / 2);
      ctx.quadraticCurveTo(p1.x, p1.y, (p1.x + p2.x) / 2, (p1.y + p2.y) / 2);
    }

    this.applySpecialStyle(this.currPosList.type, lineWidth);

    ctx.stroke();
  }
}

export const page = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 1200;
  canvas.style.width = '600px';
  canvas.style.height = '600px';
  document.body.appendChild(canvas);
  canvas.style.position = 'absolute';
  canvas.style.left = '200px';
  canvas.style.top = '100px';
  canvas.style.border = '1px solid #cecece';

  const ctx = canvas.getContext('2d');

  const brush = new Brush(ctx);

  function getXY(e: any) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.touches[0].clientX - rect.left,
      y: e.touches[0].clientY - rect.top
    };
  }

  let color = 'red';
  let maxWidth = 10;
  let type = BrushType.Basic;
  const button1 = document.createElement('button');
  button1.innerText = '普通红色';
  button1.addEventListener('click', () => {
    type = BrushType.Basic;
    color = 'red';
    maxWidth = 10;
  });
  const button2 = document.createElement('button');
  button2.innerText = '荧光绿色';
  button2.addEventListener('click', () => {
    type = BrushType.Fluorescence;
    color = 'green';
    maxWidth = 10;
  });
  const button3 = document.createElement('button');
  button3.innerText = '橡皮';
  button3.addEventListener('click', () => {
    type = BrushType.Rubber;
    color = 'white';
    maxWidth = 20;
  });
  const div = document.createElement('div');
  div.appendChild(button1);
  div.appendChild(button2);
  div.appendChild(button3);
  document.body.appendChild(div);
  div.style.position = 'absolute';
  div.style.top = '20px';
  div.style.left = '200px';

  canvas.addEventListener('touchstart', e => {
    brush.start(type, color, maxWidth);
    console.log(e);
    brush.addPosition(getXY(e));
  });
  canvas.addEventListener('touchend', () => {
    brush.end();
  });
  canvas.addEventListener('touchmove', e => {
    brush.addPosition(getXY(e));
    console.log(getXY(e));
  });
};
