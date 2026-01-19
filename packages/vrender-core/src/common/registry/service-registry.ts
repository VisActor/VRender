/**
 * ServiceRegistry - 服务注册表
 *
 * 管理单例服务与工厂服务，替代 inversify 的 container.get() 机制
 * - 单例服务：全局唯一实例（如 global、graphicService）
 * - 工厂服务：每次获取都创建新实例的工厂函数（如 windowFactory、renderServiceFactory）
 */
import type { ServiceIdentifier } from './types';

export type ServiceFactory<T> = (...args: any[]) => T;

interface ServiceBinding<T = any> {
  type: 'singleton' | 'factory';
  value?: T; // singleton 的缓存实例
  factory?: ServiceFactory<T>; // factory 函数
  creator?: ServiceFactory<T>; // singleton 的创建函数（延迟创建）
}

export class ServiceRegistry {
  private bindings: Map<ServiceIdentifier, ServiceBinding> = new Map();

  /**
   * 注册单例服务（立即提供实例）
   */
  registerSingleton<T>(id: ServiceIdentifier<T>, instance: T): void {
    this.bindings.set(id, {
      type: 'singleton',
      value: instance
    });
  }

  /**
   * 注册单例服务（延迟创建）
   */
  registerSingletonFactory<T>(id: ServiceIdentifier<T>, creator: ServiceFactory<T>): void {
    this.bindings.set(id, {
      type: 'singleton',
      creator
    });
  }

  /**
   * 注册工厂服务（每次调用都创建新实例）
   */
  registerFactory<T>(id: ServiceIdentifier<T>, factory: ServiceFactory<T>): void {
    this.bindings.set(id, {
      type: 'factory',
      factory
    });
  }

  /**
   * 获取单例服务
   */
  get<T>(id: ServiceIdentifier<T>): T | undefined {
    const binding = this.bindings.get(id);
    if (!binding) {
      return undefined;
    }

    if (binding.type === 'singleton') {
      // 延迟创建单例
      if (binding.value === undefined && binding.creator) {
        binding.value = binding.creator();
      }
      return binding.value as T;
    }

    // factory 类型不应该通过 get 获取，使用 getFactory
    return undefined;
  }

  /**
   * 获取工厂函数
   */
  getFactory<T>(id: ServiceIdentifier<T>): ServiceFactory<T> | undefined {
    const binding = this.bindings.get(id);
    if (!binding || binding.type !== 'factory') {
      return undefined;
    }
    return binding.factory as ServiceFactory<T>;
  }

  /**
   * 调用工厂创建实例
   */
  createInstance<T>(id: ServiceIdentifier<T>, ...args: any[]): T | undefined {
    const factory = this.getFactory<T>(id);
    if (factory) {
      return factory(...args);
    }
    return undefined;
  }

  /**
   * 检查是否已注册
   */
  has(id: ServiceIdentifier): boolean {
    return this.bindings.has(id);
  }

  /**
   * 移除注册
   */
  unregister(id: ServiceIdentifier): boolean {
    return this.bindings.delete(id);
  }

  /**
   * 清空所有注册
   */
  clear(): void {
    this.bindings.clear();
  }

  /**
   * 获取所有已注册的服务标识符
   */
  keys(): IterableIterator<ServiceIdentifier> {
    return this.bindings.keys();
  }
}

/**
 * 全局服务注册表实例
 */
export const serviceRegistry = new ServiceRegistry();
