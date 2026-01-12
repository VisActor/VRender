/**
 * ContributionRegistry - 贡献/扩展注册表
 *
 * 替代 inversify 的 ContributionProvider + container.getAll() 机制
 * 支持按 token 注册多个实现，获取时返回列表
 */
import type { ServiceIdentifier } from './types';

export interface ContributionItem<T = any> {
  impl: T;
  order?: number; // 可选排序优先级，数字越小越靠前
}

export class ContributionRegistry {
  private contributions: Map<ServiceIdentifier, ContributionItem[]> = new Map();

  /**
   * 注册贡献（追加到列表）
   * @param id 贡献标识符
   * @param impl 贡献实现
   * @param order 可选排序优先级
   */
  register<T>(id: ServiceIdentifier<T>, impl: T, order?: number): void {
    let list = this.contributions.get(id);
    if (!list) {
      list = [];
      this.contributions.set(id, list);
    }
    list.push({ impl, order });
  }

  /**
   * 批量注册贡献
   */
  registerAll<T>(id: ServiceIdentifier<T>, items: Array<{ impl: T; order?: number }>): void {
    for (const item of items) {
      this.register(id, item.impl, item.order);
    }
  }

  /**
   * 获取所有贡献（按 order 排序）
   */
  get<T>(id: ServiceIdentifier<T>): T[] {
    const list = this.contributions.get(id);
    if (!list || list.length === 0) {
      return [];
    }

    // 按 order 排序（order 越小越靠前，undefined 排最后）
    const sorted = [...list].sort((a, b) => {
      const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
      const orderB = b.order ?? Number.MAX_SAFE_INTEGER;
      return orderA - orderB;
    });

    return sorted.map(item => item.impl);
  }

  /**
   * 获取所有贡献（不排序，保持注册顺序）
   */
  getUnsorted<T>(id: ServiceIdentifier<T>): T[] {
    const list = this.contributions.get(id);
    if (!list) {
      return [];
    }
    return list.map(item => item.impl);
  }

  /**
   * 检查是否有贡献
   */
  has(id: ServiceIdentifier): boolean {
    const list = this.contributions.get(id);
    return !!list && list.length > 0;
  }

  /**
   * 获取贡献数量
   */
  count(id: ServiceIdentifier): number {
    const list = this.contributions.get(id);
    return list ? list.length : 0;
  }

  /**
   * 移除某个贡献
   */
  unregister<T>(id: ServiceIdentifier<T>, impl: T): boolean {
    const list = this.contributions.get(id);
    if (!list) {
      return false;
    }
    const index = list.findIndex(item => item.impl === impl);
    if (index !== -1) {
      list.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * 清空某个 token 的所有贡献
   */
  clear(id: ServiceIdentifier): void {
    this.contributions.delete(id);
  }

  /**
   * 清空所有贡献
   */
  clearAll(): void {
    this.contributions.clear();
  }

  /**
   * 获取所有已注册的贡献标识符
   */
  keys(): IterableIterator<ServiceIdentifier> {
    return this.contributions.keys();
  }

  /**
   * 刷新某个 token 的贡献缓存（保留接口兼容）
   */
  refresh(id: ServiceIdentifier): void {
    // 当前实现不需要刷新，保留接口兼容
  }

  /**
   * 刷新所有贡献缓存（保留接口兼容）
   */
  refreshAll(): void {
    // 当前实现不需要刷新，保留接口兼容
  }
}

/**
 * 全局贡献注册表实例
 */
export const contributionRegistry = new ContributionRegistry();
