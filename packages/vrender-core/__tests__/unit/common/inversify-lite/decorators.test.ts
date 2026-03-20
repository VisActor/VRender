import ReflectMetadata from '../../../../src/common/Reflect-metadata';
import * as ERROR_MSGS from '../../../../src/common/inversify-lite/constants/error_msgs';
import * as METADATA_KEY from '../../../../src/common/inversify-lite/constants/metadata_keys';
import { createTaggedDecorator, tagParameter } from '../../../../src/common/inversify-lite/annotation/decorator_utils';
import { injectable } from '../../../../src/common/inversify-lite/annotation/injectable';
import { injectBase } from '../../../../src/common/inversify-lite/annotation/inject_base';
import { Metadata } from '../../../../src/common/inversify-lite/planning/metadata';
import { getFirstArrayDuplicate } from '../../../../src/common/inversify-lite/utils/js';

describe('inversify-lite decorators', () => {
  test('injectable throws when applied multiple times', () => {
    const R = ReflectMetadata as any;

    class Foo {}

    R.defineMetadata(METADATA_KEY.PARAM_TYPES, [], Foo);

    expect(() => injectable()(Foo as any)).toThrow(ERROR_MSGS.DUPLICATED_INJECTABLE_DECORATOR);
  });

  test('injectable copies design:paramtypes into inversify:paramtypes', () => {
    const R = ReflectMetadata as any;

    class Bar {}

    const types = [String, Number];
    R.defineMetadata(METADATA_KEY.DESIGN_PARAM_TYPES, types, Bar);

    injectable()(Bar as any);

    expect(R.getMetadata(METADATA_KEY.PARAM_TYPES, Bar)).toEqual(types);
  });

  test('injectable defines empty paramtypes when no design metadata exists', () => {
    const R = ReflectMetadata as any;

    class NoParam {}

    injectable()(NoParam as any);

    expect(R.getMetadata(METADATA_KEY.PARAM_TYPES, NoParam)).toEqual([]);
  });

  test('injectBase throws when serviceIdentifier is undefined', () => {
    class Baz {}

    expect(() => {
      injectBase(METADATA_KEY.INJECT_TAG)(undefined as any)(Baz as any, undefined, 0);
    }).toThrow(ERROR_MSGS.UNDEFINED_INJECT_ANNOTATION('Baz'));
  });

  test('injectBase applies tagged metadata when valid', () => {
    const R = ReflectMetadata as any;

    class Injected {}

    const decorator = injectBase(METADATA_KEY.INJECT_TAG)('svc');
    decorator(Injected as any, undefined, 0);

    const tagged = R.getMetadata(METADATA_KEY.TAGGED, Injected);
    expect(tagged['0'][0].value).toBe('svc');
  });

  test('createTaggedDecorator stores metadata on constructor parameters', () => {
    const R = ReflectMetadata as any;

    class Qux {}

    const decorator = createTaggedDecorator(new Metadata(METADATA_KEY.INJECT_TAG, 'svc'));
    decorator(Qux as any, undefined, 0);

    const tagged = R.getMetadata(METADATA_KEY.TAGGED, Qux);
    expect(tagged['0']).toHaveLength(1);
    expect(tagged['0'][0].key).toBe(METADATA_KEY.INJECT_TAG);
    expect(tagged['0'][0].value).toBe('svc');
  });

  test('createTaggedDecorator stores metadata on instance properties', () => {
    const R = ReflectMetadata as any;

    class WithProp {
      public p = 1;
    }

    const decorator = createTaggedDecorator(new Metadata('k', 'v'));
    decorator(WithProp.prototype as any, 'p');

    const taggedProps = R.getMetadata(METADATA_KEY.TAGGED_PROP, WithProp);
    expect(taggedProps.p).toHaveLength(1);
    expect(taggedProps.p[0].key).toBe('k');
  });

  test('tagParameter rejects method parameter decoration', () => {
    class Bad {}

    expect(() => tagParameter(Bad as any, 'm', 0, new Metadata('k', 1) as any)).toThrow(
      ERROR_MSGS.INVALID_DECORATOR_OPERATION
    );
  });

  test('createTaggedDecorator rejects duplicate metadata keys in array form', () => {
    class DupArr {}

    const md1 = new Metadata('k', 1);
    const md2 = new Metadata('k', 2);

    expect(() => createTaggedDecorator([md1, md2] as any)(DupArr as any, undefined, 0)).toThrow(
      `${ERROR_MSGS.DUPLICATED_METADATA} k`
    );
  });

  test('createTaggedDecorator rejects duplicated metadata on same param', () => {
    class DupParam {}

    const decorator = createTaggedDecorator(new Metadata('k', 1));

    decorator(DupParam as any, undefined, 0);
    expect(() => decorator(DupParam as any, undefined, 0)).toThrow(`${ERROR_MSGS.DUPLICATED_METADATA} k`);
  });

  test('createTaggedDecorator rejects decorating property on constructor', () => {
    class InvalidProp {}

    const decorator = createTaggedDecorator(new Metadata('k', 1));

    expect(() => decorator(InvalidProp as any, 'p')).toThrow(ERROR_MSGS.INVALID_DECORATOR_OPERATION);
  });

  test('getFirstArrayDuplicate returns undefined when no duplicates', () => {
    expect(getFirstArrayDuplicate([1, 2, 3])).toBeUndefined();
  });
});
