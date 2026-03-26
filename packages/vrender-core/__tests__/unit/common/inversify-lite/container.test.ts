import * as ERROR_MSGS from '../../../../src/common/inversify-lite/constants/error_msgs';
import * as METADATA_KEY from '../../../../src/common/inversify-lite/constants/metadata_keys';
import { BindingScopeEnum } from '../../../../src/common/inversify-lite/constants/literal_types';
import { Container } from '../../../../src/common/inversify-lite/container/container';
import { Metadata } from '../../../../src/common/inversify-lite/planning/metadata';
import type { interfaces } from '../../../../src/common/inversify-lite/interfaces/interfaces';

describe('inversify-lite Container', () => {
  test('constructor validates options', () => {
    expect(() => new Container(1 as any)).toThrow(ERROR_MSGS.CONTAINER_OPTIONS_MUST_BE_AN_OBJECT);

    expect(() => new Container({ defaultScope: 'invalid' as any })).toThrow(ERROR_MSGS.CONTAINER_OPTIONS_INVALID_DEFAULT_SCOPE);
    expect(() => new Container({ autoBindInjectable: 'x' as any })).toThrow(
      ERROR_MSGS.CONTAINER_OPTIONS_INVALID_AUTO_BIND_INJECTABLE
    );
    expect(() => new Container({ skipBaseClassChecks: 'x' as any })).toThrow(ERROR_MSGS.CONTAINER_OPTIONS_INVALID_SKIP_BASE_CHECK);

    const c = new Container();
    expect(c.options.defaultScope).toBe(BindingScopeEnum.Transient);
    expect(c.options.autoBindInjectable).toBe(false);
    expect(c.options.skipBaseClassChecks).toBe(false);
  });

  test('isBound checks parent container', () => {
    const parent = new Container();
    const child = new Container();

    (child as any).parent = parent;

    parent.bind('svc').toConstantValue(1);

    expect(child.isBound('svc' as any)).toBe(true);
    expect(child.isBound('missing' as any)).toBe(false);
  });

  test('isBoundNamed works with whenTargetNamed', () => {
    const container = new Container();

    container.bind('svc').toConstantValue(1).whenTargetNamed('n1');

    expect(container.isBoundNamed('svc' as any, 'n1')).toBe(true);
    expect(container.isBoundNamed('svc' as any, 'n2')).toBe(false);
  });

  test('isBoundTagged can be tested by customizing binding constraint', () => {
    const container = new Container();
    const bindingToSyntax = container.bind('svc').toConstantValue(1);

    const key = 'k1';
    const value = 'v1';

    const constraint: interfaces.ConstraintFunction = (req: interfaces.Request | null) => {
      return !!req?.target?.matchesTag(key)(value);
    };
    (constraint as any).metaData = new Metadata(key, value);

    (bindingToSyntax as any)._binding.constraint = constraint;

    expect(container.isBoundTagged('svc' as any, key, value)).toBe(true);
    expect(container.isBoundTagged('svc' as any, key, 'other')).toBe(false);
  });

  test('isBoundTagged checks parent container', () => {
    const parent = new Container();
    const child = new Container();

    (child as any).parent = parent;

    const bindingToSyntax = parent.bind('svc').toConstantValue(1);

    const key = METADATA_KEY.NAMED_TAG;
    const value = 'foo';

    const constraint: interfaces.ConstraintFunction = (req: interfaces.Request | null) => {
      return !!req?.target?.matchesTag(key)(value);
    };
    (constraint as any).metaData = new Metadata(key, value);

    (bindingToSyntax as any)._binding.constraint = constraint;

    expect(child.isBoundTagged('svc' as any, key, value)).toBe(true);
  });
});
