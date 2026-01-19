/**
 * 服务标识符类型 - 用于标识服务/贡献的唯一 key
 * 支持 Symbol、字符串、类构造函数
 */
export type ServiceIdentifier<T = any> = symbol | string | (new (...args: any[]) => T);
