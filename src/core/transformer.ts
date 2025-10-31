import { getAdapter } from '../adapters/index.js';

/**
 * 格式转换器
 * 通过中间格式实现 IDE 间转换：A → IR → B
 */
export class Transformer {
  /** 转换格式：from → to */
  transform(content: string, filename: string, from: string, to: string): string {
    const fromAdapter = getAdapter(from);
    const ir = fromAdapter.parse(content, filename);
    const toAdapter = getAdapter(to);
    return toAdapter.serialize(ir);
  }
}
