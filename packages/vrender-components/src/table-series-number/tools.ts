/**
 * 生成excel的列标题，规则和excel一致，如A~Z,AA~AZ,AB~AZ,AA~ZZ,AAA~ZZZ
 * @param index 从0开始
 * @returns
 */
export function generateColField(index: number): string {
  // 处理0-25的情况（A-Z）
  if (index < 26) {
    return String.fromCharCode(65 + index);
  }

  const title = [];
  index++; // 调整索引，使得第一个26变成AA

  while (index > 0) {
    index--; // 每次循环前减1，以正确处理进位
    title.unshift(String.fromCharCode(65 + (index % 26)));
    index = Math.floor(index / 26);
  }

  return title.join('');
}
