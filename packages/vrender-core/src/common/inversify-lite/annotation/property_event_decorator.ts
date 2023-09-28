import { Metadata } from '../planning/metadata';
import Reflect from '../../Reflect-metadata';

function propertyEventDecorator(eventKey: string, errorMessage: string) {
  return () => {
    return (target: { constructor: NewableFunction }, propertyKey: string) => {
      const metadata = new Metadata(eventKey, propertyKey);

      if ((Reflect as any).hasOwnMetadata(eventKey, target.constructor)) {
        throw new Error(errorMessage);
      }
      (Reflect as any).defineMetadata(eventKey, metadata, target.constructor);
    };
  };
}

export { propertyEventDecorator };
