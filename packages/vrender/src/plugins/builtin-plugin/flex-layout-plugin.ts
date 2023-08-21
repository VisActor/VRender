import type { IGraphic, IGroup, IGroupAttribute } from '../../interface';
import { getTheme } from '../../graphic';
import { graphicService } from '../../modules';
import type { IPlugin, IPluginService } from '../../interface';
import { Generator } from '../../common/generator';
import { isNumber } from '../../canvas/util';
import { parsePadding } from '../../common/utils';
import { isArray } from '@visactor/vutils';

export class FlexLayoutPlugin implements IPlugin {
  name: 'FlexLayoutPlugin' = 'FlexLayoutPlugin';
  activeEvent: 'onRegister' = 'onRegister';
  pluginService: IPluginService;
  id: number = Generator.GenAutoIncrementId();
  key: string = this.name + this.id;

  tryLayout(graphic: IGraphic) {
    const p = graphic.parent;
    if (!p || !graphic.needUpdateLayout()) {
      return;
    }
    p.isLayout = true;
    const theme = getTheme(p).group;
    const { display = theme.display } = p.attribute;
    if (display !== 'flex') {
      return;
    }
    const {
      width,
      height,
      flexDirection = theme.flexDirection,
      flexWrap = theme.flexWrap,
      justifyContent = theme.justifyContent,
      alignItems = theme.alignItems,
      alignContent = theme.alignContent
    } = p.attribute;
    if (!(width && height)) {
      return;
    }

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
    p.isLayout = false;
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
    graphicService.hooks.onAttributeUpdate.tap(this.key, graphic => {
      if (graphic.glyphHost) {
        graphic = graphic.glyphHost;
      }
      this.tryLayout(graphic);
    });
    graphicService.hooks.onSetStage.tap(this.key, graphic => {
      if (graphic.glyphHost) {
        graphic = graphic.glyphHost;
      }
      this.tryLayout(graphic);
    });
    graphicService.hooks.afterUpdateAABBBounds.tap(this.key, graphic => {
      if (graphic.glyphHost) {
        graphic = graphic.glyphHost;
      }
      if (graphic.isContainer && !graphic.parent.isLayout) {
        this.tryLayout(graphic);
      }
    });
  }
  deactivate(context: IPluginService): void {
    graphicService.hooks.onAttributeUpdate.taps = graphicService.hooks.onAttributeUpdate.taps.filter(item => {
      return item.name !== this.key;
    });
    graphicService.hooks.onSetStage.taps = graphicService.hooks.onSetStage.taps.filter(item => {
      return item.name !== this.key;
    });
    graphicService.hooks.afterUpdateAABBBounds.taps = graphicService.hooks.afterUpdateAABBBounds.taps.filter(item => {
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
