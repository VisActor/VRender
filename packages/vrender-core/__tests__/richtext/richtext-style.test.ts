import type { IContext2d, IRichTextParagraphCharacter } from '../../src/interface';
import { applyStrokeStyle } from '../../src/graphic/richtext/utils';

describe('richtext stroke style', () => {
  const createContext = () =>
    ({
      setLineDash: jest.fn(),
      setTextStyle: jest.fn(),
      lineDashOffset: 10
    }) as unknown as IContext2d;

  it('applies the line dash configured on a richtext character', () => {
    const context = createContext();
    const character: IRichTextParagraphCharacter = {
      text: 'richtext',
      stroke: '#000',
      lineDash: [4, 2],
      lineDashOffset: 3
    };

    applyStrokeStyle(context, character);

    expect(context.setLineDash).toHaveBeenCalledWith([4, 2]);
    expect(context.lineDashOffset).toBe(3);
  });

  it('clears a line dash inherited from the previously rendered graphic', () => {
    const context = createContext();
    const character: IRichTextParagraphCharacter = {
      text: 'richtext',
      stroke: '#000'
    };

    applyStrokeStyle(context, character);

    expect(context.setLineDash).toHaveBeenCalledWith([]);
    expect(context.lineDashOffset).toBe(0);
  });
});
