import type { IGraphic, IGroup, IGroupAttribute, IStage } from '../../interface';
import { getTheme } from '../../graphic';
import type { IPlugin, IPluginService } from '../../interface';
import { Generator } from '../../common/generator';
import { isNumber } from '../../canvas/util';
import { parsePadding } from '../../common/utils';
import type { IAABBBounds } from '@visactor/vutils';
import { AABBBounds, isArray } from '@visactor/vutils';
import { application } from '../../application';

const _tempBounds = new AABBBounds();

export class FlexLayoutPlugin implements IPlugin {
  name: 'FlexLayoutPlugin' = 'FlexLayoutPlugin';
  activeEvent: 'onRegister' = 'onRegister';
  pluginService: IPluginService;
  id: number = Generator.GenAutoIncrementId();
  key: string = this.name + this.id;
  tempBounds: AABBBounds = new AABBBounds();
  layouting: boolean;

  tryLayout(graphic: IGraphic) {
    if (this.layouting) {
      return;
    }
    this.layouting = true;
    const p = graphic.parent;
    if (!p || !graphic.needUpdateLayout()) {
      return;
    }
    const theme = getTheme(p).group;
    const { display = theme.display } = p.attribute;
    if (display !== 'flex') {
      return;
    }
    const {
      // width,
      // height,
      flexDirection = theme.flexDirection,
      flexWrap = theme.flexWrap,
      justifyContent = theme.justifyContent,
      alignItems = theme.alignItems,
      alignContent = theme.alignContent,
      clip = theme.clip
    } = p.attribute;
    // if (!(width && height)) {
    //   return;
    // }

    let childrenWidth = 0;
    let childrenHeight = 0;
    let boundsLegal = 0;
    p.forEachChildren((child: IGraphic) => {
      const bounds = child.AABBBounds;
      if (flexDirection === 'column' || flexDirection === 'column-reverse') {
        childrenHeight += bounds.height();
        childrenWidth = Math.max(childrenWidth, bounds.width());
      } else {
        childrenWidth += bounds.width();
        childrenHeight = Math.max(childrenHeight, bounds.height());
      }
      boundsLegal += bounds.x1;
      boundsLegal += bounds.y1;
      boundsLegal += bounds.x2;
      boundsLegal += bounds.y2;
    });
    // judgement children bounds legal
    if (!isFinite(boundsLegal)) {
      return;
    }
    const width = p.attribute.width || childrenWidth;
    const height = p.attribute.height || childrenHeight;
    if (!p.attribute.width) {
      p.attribute.width = 0;
    }
    if (!p.attribute.height) {
      p.attribute.height = 0;
    }

    // 这里使用p._AABBBounds可能会将非布局造成的bounds更新也会触发重新布局
    // TODO: 增加layout前预处理，在非递归布局前将子节点及其全部父节点_AABBBounds更新
    this.tempBounds.copy(p._AABBBounds);
    const result = {
      main: { len: width, field: 'x' },
      cross: { len: height, field: 'y' },
      dir: 1
    };
    const main = result.main;
    const cross = result.cross;
    if (flexDirection === 'row-reverse') {
      result.dir = -1;
    } else if (flexDirection === 'column') {
      main.len = height;
      cross.len = width;
      main.field = 'y';
      cross.field = 'x';
    } else if (flexDirection === 'column-reverse') {
      main.len = height;
      cross.len = width;
      main.field = 'y';
      cross.field = 'x';
      result.dir = -1;
    }

    // 计算宽度
    let mainLen = 0;
    let crossLen = 0;
    const mianLenArray: { mainLen: number; crossLen: number }[] = [];
    p.forEachChildren((c: IGraphic) => {
      const b = c.AABBBounds;
      const ml = main.field === 'x' ? b.width() : b.height();
      const cl = cross.field === 'x' ? b.width() : b.height();
      mianLenArray.push({ mainLen: ml, crossLen: cl });
      mainLen += ml;
      crossLen = Math.max(crossLen, cl);
    });
    // 解析main
    const mainList: { idx: number; mainLen: number; crossLen: number }[] = [];
    if (mainLen > main.len && flexWrap === 'wrap') {
      let tempMainL = 0;
      let tempCrossL = 0;
      mianLenArray.forEach(({ mainLen, crossLen }, i) => {
        if (tempMainL + mainLen > main.len) {
          if (tempMainL === 0) {
            mainList.push({ idx: i, mainLen: tempMainL + mainLen, crossLen });
            tempMainL = 0;
            tempCrossL = 0;
          } else {
            mainList.push({ idx: i - 1, mainLen: tempMainL, crossLen });
            tempMainL = mainLen;
            tempCrossL = crossLen;
          }
        } else {
          tempMainL += mainLen;
          tempCrossL = Math.max(tempCrossL, crossLen);
        }
      });
      mainList.push({ idx: mianLenArray.length - 1, mainLen: tempMainL, crossLen: tempCrossL });
    } else {
      mainList.push({ idx: mianLenArray.length - 1, mainLen: mainLen, crossLen });
    }

    const children = p.getChildren() as IGraphic[];

    // 布局main
    let lastIdx: number = 0;
    mainList.forEach(s => {
      this.layoutMain(p, children, justifyContent, main, mianLenArray, lastIdx, s);
      lastIdx = s.idx + 1;
    });

    crossLen = mainList.reduce((a, b) => a + b.crossLen, 0);

    // 布局cross
    if (mainList.length === 1) {
      if (alignItems === 'flex-end') {
        const anchorPos = cross.len;
        this.layoutCross(children, alignItems, cross, anchorPos, mianLenArray, mainList[0], 0);
      } else if (alignItems === 'center') {
        const anchorPos = cross.len / 2;
        this.layoutCross(children, alignItems, cross, anchorPos, mianLenArray, mainList[0], 0);
      } else {
        children.forEach(child => {
          child.attribute[cross.field] = getPadding(child, cross.field);
        });
      }
    } else {
      if (alignContent === 'flex-start') {
        lastIdx = 0;
        let anchorPos = 0;
        mainList.forEach((s, i) => {
          this.layoutCross(children, 'flex-start', cross, anchorPos, mianLenArray, mainList[i], lastIdx);
          lastIdx = s.idx + 1;
          anchorPos += s.crossLen;
        });
      } else if (alignContent === 'center') {
        lastIdx = 0;
        const padding = Math.max(0, (cross.len - crossLen) / 2);
        let anchorPos = padding;
        mainList.forEach((s, i) => {
          this.layoutCross(children, 'center', cross, anchorPos + s.crossLen / 2, mianLenArray, mainList[i], lastIdx);
          lastIdx = s.idx + 1;
          anchorPos += s.crossLen;
        });
      } else if (alignContent === 'space-around') {
        lastIdx = 0;
        const padding = Math.max(0, (cross.len - crossLen) / mainList.length / 2);
        let anchorPos = padding;
        mainList.forEach((s, i) => {
          this.layoutCross(children, 'flex-start', cross, anchorPos, mianLenArray, mainList[i], lastIdx);
          lastIdx = s.idx + 1;
          anchorPos += s.crossLen + padding * 2;
        });
      } else if (alignContent === 'space-between') {
        lastIdx = 0;
        const padding = Math.max(0, (cross.len - crossLen) / (mainList.length * 2 - 2));
        let anchorPos = 0;
        mainList.forEach((s, i) => {
          this.layoutCross(children, 'flex-start', cross, anchorPos, mianLenArray, mainList[i], lastIdx);
          lastIdx = s.idx + 1;
          anchorPos += s.crossLen + padding * 2;
        });
      }
    }

    // update children
    children.forEach((child, idx) => {
      child.addUpdateBoundTag();
      child.addUpdatePositionTag();
      child.clearUpdateLayoutTag();
    });

    p.addUpdateLayoutTag();
    // 更新父级元素的layout，直到存在clip
    if (!clip && !this.tempBounds.equals(p.AABBBounds)) {
      // 判断父元素包围盒是否发生变化
      this.tryLayout(p);
      this.layouting = false;
    }
  }

  layoutMain(
    p: IGroup,
    children: IGraphic[],
    justifyContent: IGroupAttribute['justifyContent'],
    main: { len: number; field: string },
    mianLenArray: { mainLen: number; crossLen: number }[],
    lastIdx: number,
    currSeg: { idx: number; mainLen: number; crossLen: number }
  ) {
    if (justifyContent === 'flex-start') {
      let pos = 0;
      for (let i = lastIdx; i <= currSeg.idx; i++) {
        children[i].attribute[main.field] = pos + getPadding(children[i], main.field);
        pos += mianLenArray[i].mainLen;
      }
    } else if (justifyContent === 'flex-end') {
      let pos = main.len;
      for (let i = lastIdx; i <= currSeg.idx; i++) {
        pos -= mianLenArray[i].mainLen;
        children[i].attribute[main.field] = pos + getPadding(children[i], main.field);
      }
    } else if (justifyContent === 'space-around') {
      if (currSeg.mainLen >= main.len) {
        let pos = 0;
        for (let i = lastIdx; i <= currSeg.idx; i++) {
          children[i].attribute[main.field] = pos + getPadding(children[i], main.field);
          pos += mianLenArray[i].mainLen;
        }
      } else {
        const size = currSeg.idx - lastIdx + 1;
        const padding = (main.len - currSeg.mainLen) / size / 2;
        let pos = padding;
        for (let i = lastIdx; i <= currSeg.idx; i++) {
          children[i].attribute[main.field] = pos + getPadding(children[i], main.field);
          pos += mianLenArray[i].mainLen + padding * 2;
        }
      }
    } else if (justifyContent === 'space-between') {
      if (currSeg.mainLen >= main.len) {
        let pos = 0;
        for (let i = lastIdx; i <= currSeg.idx; i++) {
          children[i].attribute[main.field] = pos + getPadding(children[i], main.field);
          pos += mianLenArray[i].mainLen;
        }
      } else {
        const size = currSeg.idx - lastIdx + 1;
        const padding = (main.len - currSeg.mainLen) / (size * 2 - 2);
        let pos = 0;
        for (let i = lastIdx; i <= currSeg.idx; i++) {
          children[i].attribute[main.field] = pos + getPadding(children[i], main.field);
          pos += mianLenArray[i].mainLen + padding * 2;
        }
      }
    } else if (justifyContent === 'center') {
      let pos = (main.len - currSeg.mainLen) / 2;
      for (let i = lastIdx; i <= currSeg.idx; i++) {
        children[i].attribute[main.field] = pos + getPadding(children[i], main.field);
        pos += mianLenArray[i].mainLen;
      }
    }
  }

  layoutCross(
    children: IGraphic[],
    alignItem: IGroupAttribute['alignItems'],
    cross: { len: number; field: string },
    anchorPos: number,
    lenArray: { mainLen: number; crossLen: number }[],
    currSeg: { idx: number; mainLen: number; crossLen: number },
    lastIdx: number
  ) {
    if (alignItem === 'flex-end') {
      for (let i = lastIdx; i <= currSeg.idx; i++) {
        children[i].attribute[cross.field] = anchorPos - lenArray[i].crossLen + getPadding(children[i], cross.field);
      }
    } else if (alignItem === 'center') {
      for (let i = lastIdx; i <= currSeg.idx; i++) {
        children[i].attribute[cross.field] =
          anchorPos - lenArray[i].crossLen / 2 + getPadding(children[i], cross.field);
      }
    } else {
      for (let i = lastIdx; i <= currSeg.idx; i++) {
        children[i].attribute[cross.field] = anchorPos + getPadding(children[i], cross.field);
      }
    }
  }

  activate(context: IPluginService): void {
    this.pluginService = context;
    application.graphicService.hooks.onAttributeUpdate.tap(this.key, graphic => {
      if (graphic.glyphHost) {
        graphic = graphic.glyphHost;
      }
      this.tryLayout(graphic);
      this.layouting = false;
    });
    application.graphicService.hooks.beforeUpdateAABBBounds.tap(
      this.key,
      (graphic: IGraphic, stage: IStage, willUpdate: boolean, bounds: IAABBBounds) => {
        if (graphic.glyphHost) {
          graphic = graphic.glyphHost;
        }
        if (!(stage && stage === this.pluginService.stage)) {
          return;
        }
        if (!graphic.isContainer) {
          return;
        }
        _tempBounds.copy(bounds);
      }
    );
    application.graphicService.hooks.afterUpdateAABBBounds.tap(
      this.key,
      (
        graphic: IGraphic,
        stage: IStage,
        bounds: IAABBBounds,
        params: { globalAABBBounds: IAABBBounds },
        selfChange: boolean
      ) => {
        if (!(stage && stage === this.pluginService.stage)) {
          return;
        }
        if (!graphic.isContainer) {
          return;
        }
        if (!_tempBounds.equals(bounds)) {
          this.tryLayout(graphic);
          this.layouting = false;
        }
      }
    );
    application.graphicService.hooks.onSetStage.tap(this.key, graphic => {
      if (graphic.glyphHost) {
        graphic = graphic.glyphHost;
      }
      this.tryLayout(graphic);
      this.layouting = false;
    });
  }
  deactivate(context: IPluginService): void {
    application.graphicService.hooks.onAttributeUpdate.taps =
      application.graphicService.hooks.onAttributeUpdate.taps.filter(item => {
        return item.name !== this.key;
      });
    application.graphicService.hooks.onSetStage.taps = application.graphicService.hooks.onSetStage.taps.filter(item => {
      return item.name !== this.key;
    });
  }
}

function getPadding(graphic: IGraphic, field: string): number {
  if (!graphic.attribute.boundsPadding) {
    return 0;
  } else if (isNumber(graphic.attribute.boundsPadding)) {
    return graphic.attribute.boundsPadding as number;
  } else if (isArray(graphic.attribute.boundsPadding) && graphic.attribute.boundsPadding.length === 1) {
    return graphic.attribute.boundsPadding[0];
  }
  const paddingArray = parsePadding(graphic.attribute.boundsPadding);
  if (field === 'x') {
    return paddingArray[3];
  } else if (field === 'y') {
    return paddingArray[0];
  }
  return 0;
}
