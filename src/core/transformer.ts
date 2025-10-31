import { getAdapter } from '../adapters/index.js';

/**
 * 格式转换器
 * 
 * 通过中间格式 (WorkflowIR) 实现任意 IDE 之间的转换
 * 
 * 转换流程：
 * IDE A 格式 → 中间格式 (WorkflowIR) → IDE B 格式
 * 
 * 这样设计的好处：
 * - 支持 n 个 IDE 只需 2n 个转换方法，而不是 n² 个
 * - 扩展新 IDE 只需实现一个适配器
 */
export class Transformer {
  /**
   * 转换工作流格式
   * @param content 源文件内容
   * @param filename 文件名（用于提取元数据）
   * @param from 源 IDE 名称
   * @param to 目标 IDE 名称
   * @returns 转换后的目标格式内容
   */
  transform(content: string, filename: string, from: string, to: string): string {
    // 1. 获取源适配器
    const fromAdapter = getAdapter(from);
    
    // 2. 解析为中间格式
    const ir = fromAdapter.parse(content, filename);
    
    // 3. 获取目标适配器
    const toAdapter = getAdapter(to);
    
    // 4. 序列化为目标格式
    return toAdapter.serialize(ir);
  }
}
