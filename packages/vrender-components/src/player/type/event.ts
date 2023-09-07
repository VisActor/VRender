export enum PlayerEventEnum {
  change = 'change',
  play = 'play',
  pause = 'pause',
  backward = 'backward',
  forward = 'forward',
  end = 'end',

  /**
   * @deprecated please use `change` instead.
   */
  OnChange = 'change',
  /**
   * @deprecated please use `play` instead.
   */
  OnPlay = 'play',
  /**
   * @deprecated please use `pause` instead.
   */
  OnPause = 'pause',
  /**
   * @deprecated please use `backward` instead.
   */
  OnBackward = 'backward',
  /**
   * @deprecated please use `forward` instead.
   */
  OnForward = 'forward',
  /**
   * @deprecated please use `end` instead.
   */
  OnEnd = 'end'
}
