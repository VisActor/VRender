/**
 * 通用类型定义
 */

/**
 * 服务标识符类型 - 用于在注册表中标识服务
 * 支持 Symbol、字符串、类构造函数
 */
export type ServiceIdentifier<T = any> = symbol | string | (new (...args: any[]) => T);
