/**
 * ServiceRegistry - 服务注册表
 * 替代 inversify Container 的单例/工厂管理能力
 */
import type { ServiceIdentifier } from './types';

export type ServiceFactory<T> = () => T;

interface ServiceBinding<T> {
  type: 'singleton' | 'factory';
  instance?: T;
  factory?: ServiceFactory<T>;
}

export class ServiceRegistry {
  private bindings: Map<ServiceIdentifier<any>, ServiceBinding<any>> = new Map();

  /**
   * 注册单例服务
   */
  registerSingleton<T>(id: ServiceIdentifier<T>, instance: T): void {
    this.bindings.set(id, {
      type: 'singleton',
      instance
    });
  }

  /**
   * 注册工厂服务（每次 get 返回新实例）
   */
  registerFactory<T>(id: ServiceIdentifier<T>, factory: ServiceFactory<T>): void {
    this.bindings.set(id, {
      type: 'factory',
      factory
    });
  }

  /**
   * 注册延迟单例（首次 get 时创建并缓存）
   */
  registerLazySingleton<T>(id: ServiceIdentifier<T>, factory: ServiceFactory<T>): void {
    const binding: ServiceBinding<T> = {
      type: 'singleton',
      factory
    };
    this.bindings.set(id, binding);
  }

  /**
   * 获取服务
   */
  get<T>(id: ServiceIdentifier<T>): T {
    const binding = this.bindings.get(id);
    if (!binding) {
      throw new Error(`Service not found: ${String(id)}`);
    }

    if (binding.type === 'singleton') {
      if (binding.instance === undefined && binding.factory) {
        binding.instance = binding.factory();
      }
      return binding.instance as T;
    }

    // factory type
    if (!binding.factory) {
      throw new Error(`Factory not found for service: ${String(id)}`);
    }
    return binding.factory();
  }

  /**
   * 检查服务是否已注册
   */
  has(id: ServiceIdentifier<any>): boolean {
    return this.bindings.has(id);
  }

  /**
   * 移除服务
   */
  remove(id: ServiceIdentifier<any>): void {
    this.bindings.delete(id);
  }

  /**
   * 清空所有注册
   */
  clear(): void {
    this.bindings.clear();
  }
}

export const serviceRegistry = new ServiceRegistry();
