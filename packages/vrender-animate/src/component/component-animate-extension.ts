// import type { IGraphic } from '@visactor/vrender-core';
// import type { IAnimationConfig } from '../executor/executor';
// import { ComponentAnimator } from './component-animator';

// /**
//  * Component animation extension that can be mixed in to component classes
//  */
// export class ComponentAnimateExtension {
//   private _componentAnimator: ComponentAnimator;

//   /**
//    * Get the component animator for this component
//    * @returns The ComponentAnimator instance
//    */
//   getComponentAnimator(): ComponentAnimator {
//     if (!this._componentAnimator) {
//       this._componentAnimator = new ComponentAnimator(this as unknown as IGraphic);
//     }
//     return this._componentAnimator;
//   }

//   /**
//    * Create a new animation sequence for this component
//    * @returns A new ComponentAnimator instance
//    */
//   createAnimationSequence(): ComponentAnimator {
//     return new ComponentAnimator(this as unknown as IGraphic);
//   }

//   /**
//    * Create an animation for the component with the given preset
//    * @param preset Animation preset name ('appear', 'disappear', etc.)
//    * @param options Animation options
//    * @returns The ComponentAnimator instance
//    */
//   animate(preset: string, options?: Record<string, any>): ComponentAnimator {
//     const animator = this.getComponentAnimator();

//     // Call the appropriate animation setup method based on preset
//     switch (preset) {
//       case 'appear':
//         this.setupAppearAnimation(animator, options);
//         break;
//       case 'disappear':
//         this.setupDisappearAnimation(animator, options);
//         break;
//       default:
//         throw new Error(`Unknown animation preset: ${preset}`);
//     }

//     // Start the animation immediately
//     animator.start();

//     return animator;
//   }

//   /**
//    * Create an appear animation
//    * @param options Animation options
//    * @returns The ComponentAnimator instance (not started)
//    */
//   createAppearAnimation(options?: Record<string, any>): ComponentAnimator {
//     const animator = this.createAnimationSequence();
//     this.setupAppearAnimation(animator, options);
//     return animator;
//   }

//   /**
//    * Create a disappear animation
//    * @param options Animation options
//    * @returns The ComponentAnimator instance (not started)
//    */
//   createDisappearAnimation(options?: Record<string, any>): ComponentAnimator {
//     const animator = this.createAnimationSequence();
//     this.setupDisappearAnimation(animator, options);
//     return animator;
//   }

//   /**
//    * Execute an animation with the given config directly on the component
//    * @param config Animation configuration
//    * @returns This component
//    */
//   executeAnimation(config: IAnimationConfig): this {
//     this.getComponentAnimator()
//       .animate(this as unknown as IGraphic, config)
//       .start();
//     return this;
//   }

//   /**
//    * Set up appear animation for this component
//    * This is a placeholder method that component classes should override
//    * @param animator The ComponentAnimator to set up
//    * @param options Animation options
//    */
//   protected setupAppearAnimation(animator: ComponentAnimator, options?: Record<string, any>): void {
//     // To be overridden by concrete component classes
//     console.warn('setupAppearAnimation not implemented for this component');
//   }

//   /**
//    * Set up disappear animation for this component
//    * This is a placeholder method that component classes should override
//    * @param animator The ComponentAnimator to set up
//    * @param options Animation options
//    */
//   protected setupDisappearAnimation(animator: ComponentAnimator, options?: Record<string, any>): void {
//     // To be overridden by concrete component classes
//     console.warn('setupDisappearAnimation not implemented for this component');
//   }
// }

// /**
//  * Type for components that can be animated
//  */
// export interface IAnimatableComponent {
//   animate: (preset: string, options?: Record<string, any>) => ComponentAnimator;
//   createAppearAnimation: (options?: Record<string, any>) => ComponentAnimator;
//   createDisappearAnimation: (options?: Record<string, any>) => ComponentAnimator;
//   executeAnimation: (config: IAnimationConfig) => IAnimatableComponent;
// }
