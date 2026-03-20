import * as ERROR_MSGS from '../../../../src/common/inversify-lite/constants/error_msgs';
import * as METADATA_KEY from '../../../../src/common/inversify-lite/constants/metadata_keys';
import { Target } from '../../../../src/common/inversify-lite/planning/target';
import { Metadata } from '../../../../src/common/inversify-lite/planning/metadata';
import {
  circularDependencyToException,
  getFunctionName,
  getServiceIdentifierAsString,
  getSymbolDescription,
  listMetadataForTarget,
  listRegisteredBindingsForServiceIdentifier
} from '../../../../src/common/inversify-lite/utils/serialization';

describe('inversify-lite planning & serialization', () => {
  test('getServiceIdentifierAsString supports function/symbol/string', () => {
    class Foo {}

    expect(getServiceIdentifierAsString(Foo)).toBe('Foo');
    expect(getServiceIdentifierAsString(Symbol('s'))).toBe('Symbol(s)');
    expect(getServiceIdentifierAsString('x')).toBe('x');
  });

  test('getFunctionName falls back to parsing function string and supports anonymous fallback', () => {
    expect(getFunctionName({ name: 'Named' })).toBe('Named');

    const anonFuncLike: any = {
      name: null as any,
      toString: () => 'function helloWorld() { return 1; }'
    };

    expect(getFunctionName(anonFuncLike as any)).toBe('helloWorld');

    const noMatchFuncLike: any = {
      name: null as any,
      toString: () => '() => 1'
    };

    expect(getFunctionName(noMatchFuncLike as any)).toContain('Anonymous function: () => 1');
  });

  test('listRegisteredBindingsForServiceIdentifier returns empty string when no bindings', () => {
    const getBindings = jest.fn(() => []);
    expect(listRegisteredBindingsForServiceIdentifier({} as any, 'SVC', getBindings as any)).toBe('');
  });

  test('listRegisteredBindingsForServiceIdentifier builds info string when bindings exist', () => {
    class Impl {}

    const binding1: any = { implementationType: Impl, constraint: { metaData: 'named: foo' } };
    const binding2: any = { implementationType: null, constraint: {} };

    const getBindings = jest.fn(() => [binding1, binding2]);

    const info = listRegisteredBindingsForServiceIdentifier({} as any, 'SVC', getBindings as any);

    expect(info).toContain('Registered bindings:');
    expect(info).toContain('Impl');
    expect(info).toContain('named: foo');
    expect(info).toContain('Object');
    expect(info).not.toContain('Object - ');
  });

  test('listMetadataForTarget includes named and custom tags, and supports no-tag default', () => {
    const namedTarget = new Target('ConstructorArgument' as any, 'arg0', 'SVC', 'foo');
    const namedInfo = listMetadataForTarget('SVC', namedTarget as any);
    expect(namedInfo).toContain('named: foo');

    const customTarget = new Target('ConstructorArgument' as any, 'arg1', 'SVC', new Metadata('custom', 'x'));
    const customInfo = listMetadataForTarget('SVC', customTarget as any);
    expect(customInfo).toContain('tagged:');
    expect(customInfo).not.toContain('named:');

    const plainTarget = new Target('ConstructorArgument' as any, 'arg2', 'SVC');
    expect(listMetadataForTarget('SVC', plainTarget as any)).toBe(' SVC');
  });

  test('Target constructor supports symbol identifier without description', () => {
    const t = new Target('ConstructorArgument' as any, Symbol() as any, 'SVC');
    const nameObj: any = t.name;
    const value = typeof nameObj.value === 'function' ? nameObj.value() : nameObj.toString();
    expect(value).toBe('');
  });

  test('Target isTagged is false when only non-custom tags present', () => {
    const t = new Target('ConstructorArgument' as any, 'a', 'SVC', 'foo');
    expect(t.isNamed()).toBe(true);
    expect(t.isTagged()).toBe(false);
    expect(t.getCustomTags()).toBeNull();
  });

  test('Target helpers: isArray/isOptional/matchesTag, plus getNamedTag/getCustomTags', () => {
    const t = new Target('ConstructorArgument' as any, 'a', 'SVC');

    // array injection
    t.metadata.push(new Metadata(METADATA_KEY.MULTI_INJECT_TAG, 'ARR'));
    expect(t.isArray()).toBe(true);
    expect(t.matchesArray('ARR')).toBe(true);

    // optional injection
    t.metadata.push(new Metadata(METADATA_KEY.OPTIONAL_TAG, true));
    expect(t.isOptional()).toBe(true);

    // named
    t.metadata.push(new Metadata(METADATA_KEY.NAMED_TAG, 'foo'));
    expect(t.isNamed()).toBe(true);
    expect(t.getNamedTag()?.value).toBe('foo');
    expect(t.matchesNamedTag('foo')).toBe(true);

    // custom tags
    expect(t.getCustomTags()).toBeNull();
    t.metadata.push(new Metadata('custom', 'x'));
    expect(t.isTagged()).toBe(true);
    expect(t.getCustomTags()).toHaveLength(1);

    expect(t.matchesTag(METADATA_KEY.MULTI_INJECT_TAG)('ARR')).toBe(true);
    expect(t.matchesTag(METADATA_KEY.MULTI_INJECT_TAG)('OTHER')).toBe(false);
    expect(t.hasTag('NOT_EXIST')).toBe(false);
  });

  test('circularDependencyToException throws with dependency chain', () => {
    const reqA: any = { serviceIdentifier: 'A', parentRequest: null, childRequests: [] };
    const reqB: any = { serviceIdentifier: 'B', parentRequest: reqA, childRequests: [] };
    const reqA2: any = { serviceIdentifier: 'A', parentRequest: reqB, childRequests: [] };

    reqA.childRequests.push(reqB);
    reqB.childRequests.push(reqA2);

    expect(() => circularDependencyToException(reqA as any)).toThrow(
      `${ERROR_MSGS.CIRCULAR_DEPENDENCY} A --> B --> A`
    );
  });

  test('getSymbolDescription extracts description from symbol', () => {
    expect(getSymbolDescription(Symbol('abc'))).toBe('abc');
    expect(getSymbolDescription(Symbol())).toBe('');
  });
});
