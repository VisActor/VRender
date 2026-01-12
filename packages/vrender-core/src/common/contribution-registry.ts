/**
 * ContributionRegistry - 贡献/扩展注册表
 * 替代 ContributionProvider + container.getAll() 的多实现聚合能力
 */
import type { ServiceIdentifier } from './types';

export interface ContributionItem<T = any> {
  contribution: T;
  order?: number;
}

export class ContributionRegistry {
  private contributions: Map<ServiceIdentifier<any>, ContributionItem<any>[]> = new Map();

  /**
   * 注册一个贡献实现
   */
  register<T>(id: ServiceIdentifier<T>, contribution: T, order: number = 0): void {
    let list = this.contributions.get(id);
    if (!list) {
      list = [];
      this.contributions.set(id, list);
    }
    list.push({ contribution, order });
  }

  /**
   * 获取所有贡献（按 order 排序）
   */
  getContributions<T>(id: ServiceIdentifier<T>): T[] {
    const list = this.contributions.get(id);
    if (!list || list.length === 0) {
      return [];
    }
    // 按 order 升序排序
    return list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map(item => item.contribution);
  }

  /**
   * 检查是否有贡献注册
   */
  has(id: ServiceIdentifier<any>): boolean {
    const list = this.contributions.get(id);
    return list !== undefined && list.length > 0;
  }

  /**
   * 移除某个 token 下的所有贡献
   */
  remove(id: ServiceIdentifier<any>): void {
    this.contributions.delete(id);
  }

  /**
   * 移除某个具体的贡献实例
   */
  removeContribution<T>(id: ServiceIdentifier<T>, contribution: T): void {
    const list = this.contributions.get(id);
    if (list) {
      const index = list.findIndex(item => item.contribution === contribution);
      if (index !== -1) {
        list.splice(index, 1);
      }
    }
  }

  /**
   * 刷新指定 token 的贡献列表（清空缓存，下次 get 时重新排序）
   */
  refresh(id: ServiceIdentifier<any>): void {
    // 当前实现不需要特殊处理，因为每次 getContributions 都会重新排序
    // 保留此方法以兼容 ContributionProvider 的 refresh 语义
  }

  /**
   * 刷新所有贡献列表
   */
  refreshAll(): void {
    // 同上
  }

  /**
   * 清空所有注册
   */
  clear(): void {
    this.contributions.clear();
  }
}

export const contributionRegistry = new ContributionRegistry();
