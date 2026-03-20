import ReflectMetadata from '../../../../src/common/Reflect-metadata';
import { propertyEventDecorator } from '../../../../src/common/inversify-lite/annotation/property_event_decorator';

describe('inversify-lite propertyEventDecorator', () => {
  test('defines metadata on constructor for instance property', () => {
    const R = ReflectMetadata as any;

    const eventKey = 'my:event';

    class Foo {
      public p = 1;
    }

    const decoratorFactory = propertyEventDecorator(eventKey, 'duplicated');
    const decorator = decoratorFactory();

    decorator(Foo.prototype as any, 'p');

    expect(R.hasOwnMetadata(eventKey, Foo)).toBe(true);

    const md = R.getMetadata(eventKey, Foo);
    expect(md.key).toBe(eventKey);
    expect(md.value).toBe('p');
  });

  test('throws when decorating twice with same eventKey', () => {
    const eventKey = 'my:event';
    const errorMessage = 'duplicated';

    class Bar {
      public p1 = 1;
      public p2 = 2;
    }

    const decorator = propertyEventDecorator(eventKey, errorMessage)();

    decorator(Bar.prototype as any, 'p1');
    expect(() => decorator(Bar.prototype as any, 'p2')).toThrow(errorMessage);
  });
});
