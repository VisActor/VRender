import type { Character } from '../character';
import type { MorphConfig, MorphState } from '../interface';
import { BaseAnimation } from './base-animation';

interface IMorphAnimateOption {
  duration: number;
  targetState: string;
  loop?: boolean;
  speakingAnimation?: boolean;
}

/**
 * 形变动画
 */
export class MorphAnimation extends BaseAnimation<MorphState, IMorphAnimateOption> {
  private _config: MorphConfig;
  private _partName: string;
  private _speakingStates: string[] = ['closed', 'halfOpen', 'fullyOpen', 'halfOpen'];
  private _currentSpeakingIndex: number = 0;
  private _onEndCallback?: () => void;

  constructor(character: Character, partName: string, config: MorphConfig) {
    super(character, 'morph');
    this._config = config;
    this._partName = partName;
    this._state = {
      isPlaying: false,
      progress: 0,
      duration: 0,
      targetPath: config.states[config.defaultState],
      weight: 1
    };
  }

  playTo(targetState: string, duration: number, loop?: boolean) {
    if (!this._config.states[targetState]) {
      console.warn(`Invalid morph state: ${targetState}`);
      return;
    }

    if (targetState === 'speaking') {
      this.playSpeakingAnimation(duration);
    } else {
      this.play({
        duration,
        targetState,
        loop
      });
    }
  }

  playSpeakingAnimation(duration: number) {
    this._currentSpeakingIndex = 0;
    this.play({
      duration: duration / 4, // 将总时长平均分配给每个状态
      targetState: this._speakingStates[0],
      loop: true,
      speakingAnimation: true
    });
  }

  protected updateState(ratio: number, option: IMorphAnimateOption): void {
    const part = this._character.getPart(this._partName);
    if (!part) {
      return;
    }

    if (option.speakingAnimation && ratio === 1) {
      // 当前状态完成，切换到下一个状态
      this._currentSpeakingIndex = (this._currentSpeakingIndex + 1) % this._speakingStates.length;
      this.play({
        duration: option.duration,
        targetState: this._speakingStates[this._currentSpeakingIndex],
        loop: true,
        speakingAnimation: true
      });
      return;
    }

    this._state.targetPath = this._config.states[option.targetState];
    this._state.weight = ratio;

    // 更新部件的形变状态
    part.graphic.setAttribute('morphPath', this._state.targetPath);
    part.graphic.setAttribute('morphWeight', this._state.weight);
  }

  onEnd(): void {
    super.onEnd();
    if (this._state.isPlaying) {
      const option = {
        duration: this._duration,
        targetState: this._speakingStates[this._currentSpeakingIndex],
        loop: true,
        speakingAnimation: true
      };
      this.play(option);
    }
  }
}
