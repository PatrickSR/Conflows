import type { IDEAdapter } from '../types/index.js';
import { WindsurfAdapter } from './windsurf.js';
import { CursorAdapter } from './cursor.js';

/**
 * 所有可用的适配器
 */
export const ADAPTERS: Record<string, IDEAdapter> = {
  windsurf: new WindsurfAdapter(),
  cursor: new CursorAdapter(),
};

/**
 * 获取指定 IDE 的适配器
 */
export function getAdapter(name: string): IDEAdapter {
  const adapter = ADAPTERS[name];
  if (!adapter) {
    const available = Object.keys(ADAPTERS).join(', ');
    throw new Error(`未知的 IDE: ${name}。支持的 IDE: ${available}`);
  }
  return adapter;
}

/**
 * 获取所有适配器
 */
export function getAllAdapters(): IDEAdapter[] {
  return Object.values(ADAPTERS);
}
