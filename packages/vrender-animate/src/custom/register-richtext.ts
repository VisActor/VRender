import { AnimateExecutor } from '../executor/animate-executor';
import { InputText } from './input-text';
import { InputRichText } from './richtext/input-richtext';
import { OutputRichText } from './richtext/output-richtext';
import { SlideOutRichText } from './richtext/slide-out-richtext';
import { SlideRichText } from './richtext/slide-richtext';

export const registerRichTextCustomAnimate = () => {
  AnimateExecutor.registerBuiltInAnimate('inputText', InputText);
  AnimateExecutor.registerBuiltInAnimate('inputRichText', InputRichText);
  AnimateExecutor.registerBuiltInAnimate('outputRichText', OutputRichText);
  AnimateExecutor.registerBuiltInAnimate('slideRichText', SlideRichText);
  AnimateExecutor.registerBuiltInAnimate('slideOutRichText', SlideOutRichText);
};

export { InputText, InputRichText, OutputRichText, SlideRichText, SlideOutRichText };
