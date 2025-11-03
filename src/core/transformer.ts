import { getAdapter } from '../adapters/index.js';

/**
 * Format transformer
 * Implements IDE-to-IDE conversion via intermediate representation: A → IR → B
 */
export class Transformer {
  /** Transform format: from → to */
  transform(content: string, filename: string, from: string, to: string): string {
    const fromAdapter = getAdapter(from);
    const ir = fromAdapter.parse(content, filename);
    const toAdapter = getAdapter(to);
    return toAdapter.serialize(ir);
  }
}
