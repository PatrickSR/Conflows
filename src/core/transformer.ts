import { getAdapter } from '../adapters/index.js';
import type { CommandIR, RuleIR } from '../types/index.js';

/**
 * Format transformer
 * Implements IDE-to-IDE conversion via intermediate representation: A → IR → B
 */
export class Transformer {
  /** Transform command format: from → to */
  transformCommand(content: string, filename: string, from: string, to: string): string {
    const fromAdapter = getAdapter(from);
    const ir = fromAdapter.parseCommand(content, filename);
    const toAdapter = getAdapter(to);
    return toAdapter.serializeCommand(ir);
  }
  
  /** Transform rule format: from → to */
  transformRule(content: string, filename: string, from: string, to: string): string {
    const fromAdapter = getAdapter(from);
    const toAdapter = getAdapter(to);
    
    if (!fromAdapter.parseRule || !toAdapter.serializeRule) {
      throw new Error(`Rule transformation not supported for ${from} → ${to}`);
    }
    
    const ir = fromAdapter.parseRule(content, filename);
    return toAdapter.serializeRule(ir);
  }
  
  /** @deprecated Use transformCommand instead */
  transform(content: string, filename: string, from: string, to: string): string {
    return this.transformCommand(content, filename, from, to);
  }
}
