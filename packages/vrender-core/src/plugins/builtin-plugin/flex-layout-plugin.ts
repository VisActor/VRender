import type { IGraphic, IGroup, IGroupAttribute, IStage } from '../../interface';
import { getTheme } from '../../graphic/theme';
import type { IPlugin, IPluginService } from '../../interface';
import { Generator } from '../../common/generator';
import type { IAABBBounds } from '@visactor/vutils';
import { AABBBounds } from '@visactor/vutils';
import { application } from '../../application';
import { Factory } from '../../factory';

const _tempBounds = new AABBBounds();

type IAnchorPosMap = {
  'flex-start': number;
  'flex-end': number;
  center: number;
};

export class FlexLayoutPlugin implements IPlugin {
  name: 'FlexLayoutPlugin' = 'FlexLayoutPlugin';
  activeEvent: 'onRegister' = 'onRegister';
  pluginService: IPluginService;
  id: number = Generator.GenAutoIncrementId();
  key: string = this.name + this.id;
  tempBounds: AABBBounds = new AABBBounds();
  pause: boolean;
  skipBoundsTrigger: boolean;

  pauseLayout(p: boolean) {
    this.pause = p;
  }

  tryLayoutChildren(graphic: IGraphic) {
    if (graphic.firstChild) {
      this.tryLayout(graphic.firstChild as IGraphic);
    }
  }

  tryLayout(graphic: IGraphic, force: boolean = true) {
    if (this.pause) {
      return;
    }
    const p = graphic.parent;
    if (!(force || (p && graphic.needUpdateLayout()))) {
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
      alignItems = theme.alignItems,
      clip = theme.clip
    } = p.attribute;
    const { alignContent = alignItems ?? theme.alignContent } = p.attribute;
    // if (!(width && height)) {
    //   return;
    // }

    let { width, height, justifyContent = theme.justifyContent } = p.attribute;
    const children = p.getChildren() as IGraphic[];
    if (width == null || height == null) {
      // 计算子节点flex排列后的宽高
      let childrenWidth = 0;
      let childrenHeight = 0;
      let boundsLegal = 0;
      children.forEach((child: IGraphic) => {
        const bounds = this.getAABBBounds(child);
        if (bounds.empty()) {
          return;
        }
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
      width = childrenWidth;
      height = childrenHeight;
    }

    if (p.attribute.width == null) {
      p.attribute.width = width;
    } else {
      width = p.attribute.width;
    }
    if (p.attribute.height == null) {
      p.attribute.height = height;
    } else {
      height = p.attribute.height;
    }

    // 这里使用p._AABBBounds可能会将非布局造成的bounds更新也会触发重新布局
    // TODO: 增加layout前预处理，在非递归布局前将子节点及其全部父节点_AABBBounds更新
    this.tempBounds.copy(p._AABBBounds);
    const result = {
      main: { len: width, field: 'x' },
      cross: { len: height, field: 'y' }
    };
    const main = result.main;
    const cross = result.cross;
    if (flexDirection === 'column' || flexDirection === 'column-reverse') {
      main.len = height;
      cross.len = width;
      main.field = 'y';
      cross.field = 'x';
    }
    if (flexDirection === 'row-reverse' || flexDirection === 'column-reverse') {
      if (justifyContent === 'flex-start') {
        justifyContent = 'flex-end';
      } else if (justifyContent === 'flex-end') {
        justifyContent = 'flex-start';
      } else {
        children.reverse();
      }
    }

    // 计算宽度
    let mainLen = 0;
    let crossLen = 0;
    const mianLenArray: { mainLen: number; crossLen: number }[] = [];
    children.forEach((c: IGraphic) => {
      const b = this.getAABBBounds(c);
      if (b.empty()) {
        return;
      }
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
            mainList.push({ idx: i - 1, mainLen: tempMainL, crossLen: tempCrossL });
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

    // 布局main
    let lastIdx: number = 0;
    mainList.forEach(s => {
      this.layoutMain(p, children, justifyContent, main, mianLenArray, lastIdx, s);
      lastIdx = s.idx + 1;
    });

    crossLen = mainList.reduce((a, b) => a + b.crossLen, 0);

    // 布局cross

    if (mainList.length === 1) {
      const anchorPosMap: IAnchorPosMap = {
        'flex-start': 0,
        'flex-end': cross.len,
        center: cross.len / 2
      };
      this.layoutCross(children, alignItems, cross, anchorPosMap, mianLenArray, mainList[0], 0);
    } else {
      if (alignContent === 'flex-start') {
        lastIdx = 0;
        let anchorPos = 0;
        mainList.forEach((s, i) => {
          const anchorPosMap: IAnchorPosMap = {
            'flex-start': anchorPos,
            'flex-end': anchorPos + s.crossLen,
            center: anchorPos + s.crossLen / 2
          };
          this.layoutCross(children, 'flex-start', cross, anchorPosMap, mianLenArray, mainList[i], lastIdx);
          lastIdx = s.idx + 1;
          anchorPos += s.crossLen;
        });
      } else if (alignContent === 'center') {
        lastIdx = 0;
        const padding = Math.max(0, (cross.len - crossLen) / 2);
        let anchorPos = padding;
        mainList.forEach((s, i) => {
          const anchorPosMap: IAnchorPosMap = {
            'flex-start': anchorPos,
            'flex-end': anchorPos + s.crossLen,
            center: anchorPos + s.crossLen / 2
          };
          this.layoutCross(children, 'center', cross, anchorPosMap, mianLenArray, mainList[i], lastIdx);
          lastIdx = s.idx + 1;
          anchorPos += s.crossLen;
        });
      } else if (alignContent === 'space-around') {
        lastIdx = 0;
        const padding = Math.max(0, (cross.len - crossLen) / mainList.length / 2);
        let anchorPos = padding;
        mainList.forEach((s, i) => {
          const anchorPosMap: IAnchorPosMap = {
            'flex-start': anchorPos,
            'flex-end': anchorPos + s.crossLen,
            center: anchorPos + s.crossLen / 2
          };
          this.layoutCross(children, 'flex-start', cross, anchorPosMap, mianLenArray, mainList[i], lastIdx);
          lastIdx = s.idx + 1;
          anchorPos += s.crossLen + padding * 2;
        });
      } else if (alignContent === 'space-between') {
        lastIdx = 0;
        const padding = Math.max(0, (cross.len - crossLen) / (mainList.length * 2 - 2));
        let anchorPos = 0;
        mainList.forEach((s, i) => {
          const anchorPosMap: IAnchorPosMap = {
            'flex-start': anchorPos,
            'flex-end': anchorPos + s.crossLen,
            center: anchorPos + s.crossLen / 2
          };
          this.layoutCross(children, 'flex-start', cross, anchorPosMap, mianLenArray, mainList[i], lastIdx);
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
    const b = this.getAABBBounds(p);
    if (!clip && !this.tempBounds.equals(b)) {
      // 判断父元素包围盒是否发生变化
      this.tryLayout(p, false);
    }
  }

  // 避免获取bounds的时候递归进行布局
  getAABBBounds(graphic: IGraphic) {
    this.skipBoundsTrigger = true;
    const b = graphic.AABBBounds;
    this.skipBoundsTrigger = false;
    return b;
  }

  // 锚点并不一定总在左上角，根据位置和bounds的偏移进行定位
  private updateChildPos(posBaseLeftTop: number, lastP: number | undefined, lastBP: number): number {
    return posBaseLeftTop + (lastP ?? 0) - lastBP;
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
        const posBaseLeftTop = pos + getPadding(children[i], main.field);
        const b = this.getAABBBounds(children[i]);
        !b.empty() &&
          (children[i].attribute[main.field] = this.updateChildPos(
            posBaseLeftTop,
            children[i].attribute[main.field],
            b[`${main.field}1`]
          ));
        pos += mianLenArray[i].mainLen;
      }
    } else if (justifyContent === 'flex-end') {
      let pos = main.len;
      for (let i = currSeg.idx; i >= lastIdx; i--) {
        pos -= mianLenArray[i].mainLen;
        const posBaseLeftTop = pos + getPadding(children[i], main.field);
        const b = this.getAABBBounds(children[i]);
        !b.empty() &&
          (children[i].attribute[main.field] = this.updateChildPos(
            posBaseLeftTop,
            children[i].attribute[main.field],
            b[`${main.field}1`]
          ));
      }
    } else if (justifyContent === 'space-around') {
      if (currSeg.mainLen >= main.len) {
        let pos = 0;
        for (let i = lastIdx; i <= currSeg.idx; i++) {
          const posBaseLeftTop = pos + getPadding(children[i], main.field);
          const b = this.getAABBBounds(children[i]);
          !b.empty() &&
            (children[i].attribute[main.field] = this.updateChildPos(
              posBaseLeftTop,
              children[i].attribute[main.field],
              b[`${main.field}1`]
            ));
          pos += mianLenArray[i].mainLen;
        }
      } else {
        const size = currSeg.idx - lastIdx + 1;
        const padding = (main.len - currSeg.mainLen) / size / 2;
        let pos = padding;
        for (let i = lastIdx; i <= currSeg.idx; i++) {
          const posBaseLeftTop = pos + getPadding(children[i], main.field);
          const b = this.getAABBBounds(children[i]);
          !b.empty() &&
            (children[i].attribute[main.field] = this.updateChildPos(
              posBaseLeftTop,
              children[i].attribute[main.field],
              b[`${main.field}1`]
            ));
          pos += mianLenArray[i].mainLen + padding * 2;
        }
      }
    } else if (justifyContent === 'space-between') {
      if (currSeg.mainLen >= main.len) {
        let pos = 0;
        for (let i = lastIdx; i <= currSeg.idx; i++) {
          const posBaseLeftTop = pos + getPadding(children[i], main.field);
          const b = this.getAABBBounds(children[i]);
          !b.empty() &&
            (children[i].attribute[main.field] = this.updateChildPos(
              posBaseLeftTop,
              children[i].attribute[main.field],
              b[`${main.field}1`]
            ));
          pos += mianLenArray[i].mainLen;
        }
      } else {
        const size = currSeg.idx - lastIdx + 1;
        const padding = (main.len - currSeg.mainLen) / (size * 2 - 2);
        let pos = 0;
        for (let i = lastIdx; i <= currSeg.idx; i++) {
          const posBaseLeftTop = pos + getPadding(children[i], main.field);
          const b = this.getAABBBounds(children[i]);
          !b.empty() &&
            (children[i].attribute[main.field] = this.updateChildPos(
              posBaseLeftTop,
              children[i].attribute[main.field],
              b[`${main.field}1`]
            ));
          pos += mianLenArray[i].mainLen + padding * 2;
        }
      }
    } else if (justifyContent === 'center') {
      let pos = (main.len - currSeg.mainLen) / 2;
      for (let i = lastIdx; i <= currSeg.idx; i++) {
        const posBaseLeftTop = pos + getPadding(children[i], main.field);
        const b = this.getAABBBounds(children[i]);
        !b.empty() &&
          (children[i].attribute[main.field] = this.updateChildPos(
            posBaseLeftTop,
            children[i].attribute[main.field],
            b[`${main.field}1`]
          ));
        pos += mianLenArray[i].mainLen;
      }
    }
  }

  layoutCross(
    children: IGraphic[],
    alignItem: IGroupAttribute['alignItems'],
    cross: { len: number; field: string },
    anchorPosMap: IAnchorPosMap,
    lenArray: { mainLen: number; crossLen: number }[],
    currSeg: { idx: number; mainLen: number; crossLen: number },
    lastIdx: number
  ) {
    for (let i = lastIdx; i <= currSeg.idx; i++) {
      const child = children[i];
      let { alignSelf } = child.attribute;
      if (!alignSelf || alignSelf === 'auto') {
        alignSelf = alignItem;
      }
      const b = this.getAABBBounds(child);
      const anchorPos = anchorPosMap[alignSelf] ?? anchorPosMap['flex-start'];
      if (alignSelf === 'flex-end') {
        !b.empty() &&
          (child.attribute[cross.field] = this.updateChildPos(
            anchorPos - lenArray[i].crossLen + getPadding(child, cross.field),
            child.attribute[cross.field],
            b[`${cross.field}1`]
          ));
      } else if (alignSelf === 'center') {
        !b.empty() &&
          (child.attribute[cross.field] = this.updateChildPos(
            anchorPos - lenArray[i].crossLen / 2 + getPadding(child, cross.field),
            child.attribute[cross.field],
            b[`${cross.field}1`]
          ));
      } else {
        !b.empty() &&
          (child.attribute[cross.field] = this.updateChildPos(
            anchorPos + getPadding(child, cross.field),
            child.attribute[cross.field],
            b[`${cross.field}1`]
          ));
      }
    }
    // if (alignItem === 'flex-end') {
    //   for (let i = lastIdx; i <= currSeg.idx; i++) {
    //     children[i].attribute[cross.field] = this.updateChildPos(
    //       anchorPos - lenArray[i].crossLen + getPadding(children[i], cross.field),
    //       children[i].attribute[cross.field],
    //       children[i].AABBBounds[`${cross.field}1`]
    //     );
    //   }
    // } else if (alignItem === 'center') {
    //   for (let i = lastIdx; i <= currSeg.idx; i++) {
    //     children[i].attribute[cross.field] = this.updateChildPos(
    //       anchorPos - lenArray[i].crossLen / 2 + getPadding(children[i], cross.field),
    //       children[i].attribute[cross.field],
    //       children[i].AABBBounds[`${cross.field}1`]
    //     );
    //   }
    // } else {
    //   for (let i = lastIdx; i <= currSeg.idx; i++) {
    //     children[i].attribute[cross.field] = this.updateChildPos(
    //       anchorPos + getPadding(children[i], cross.field),
    //       children[i].attribute[cross.field],
    //       children[i].AABBBounds[`${cross.field}1`]
    //     );
    //   }
    // }
  }

  activate(context: IPluginService): void {
    this.pluginService = context;
    // 属性更新
    application.graphicService.hooks.onAttributeUpdate.tap(this.key, graphic => {
      if (graphic.glyphHost) {
        graphic = graphic.glyphHost;
      }
      if (!(graphic.stage && graphic.stage === this.pluginService.stage)) {
        return;
      }
      this.tryLayout(graphic, false);
    });
    // 包围盒更新（如果包围盒发生变化，就重新布局
    application.graphicService.hooks.beforeUpdateAABBBounds.tap(
      this.key,
      (graphic: IGraphic, stage: IStage, willUpdate: boolean, bounds: IAABBBounds) => {
        if (graphic.glyphHost) {
          graphic = graphic.glyphHost;
        }
        if (!(stage && stage === this.pluginService.stage)) {
          return;
        }
        if (!graphic.isContainer || this.skipBoundsTrigger) {
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
        if (!graphic.isContainer || this.skipBoundsTrigger) {
          return;
        }
        if (!_tempBounds.equals(bounds)) {
          this.tryLayout(graphic, false);
        }
      }
    );
    // 添加到场景树
    application.graphicService.hooks.onSetStage.tap(this.key, graphic => {
      if (graphic.glyphHost) {
        graphic = graphic.glyphHost;
      }
      this.tryLayout(graphic, false);
    });
  }
  deactivate(context: IPluginService): void {
    application.graphicService.hooks.onAttributeUpdate.taps =
      application.graphicService.hooks.onAttributeUpdate.taps.filter(item => {
        return item.name !== this.key;
      });
    application.graphicService.hooks.beforeUpdateAABBBounds.taps =
      application.graphicService.hooks.beforeUpdateAABBBounds.taps.filter(item => {
        return item.name !== this.key;
      });
    application.graphicService.hooks.afterUpdateAABBBounds.taps =
      application.graphicService.hooks.afterUpdateAABBBounds.taps.filter(item => {
        return item.name !== this.key;
      });
    application.graphicService.hooks.onSetStage.taps = application.graphicService.hooks.onSetStage.taps.filter(item => {
      return item.name !== this.key;
    });
  }
}

function getPadding(graphic: IGraphic, field: string): number {
  // if (!graphic.attribute.boundsPadding) {
  //   return 0;
  // } else if (isNumber(graphic.attribute.boundsPadding)) {
  //   return graphic.attribute.boundsPadding as number;
  // } else if (isArray(graphic.attribute.boundsPadding) && graphic.attribute.boundsPadding.length === 1) {
  //   return graphic.attribute.boundsPadding[0];
  // }
  // const paddingArray = parsePadding(graphic.attribute.boundsPadding);
  // if (field === 'x') {
  //   return paddingArray[3];
  // } else if (field === 'y') {
  //   return paddingArray[0];
  // }
  return 0;
}

export const registerFlexLayoutPlugin = () => {
  Factory.registerPlugin('FlexLayoutPlugin', FlexLayoutPlugin);
};
