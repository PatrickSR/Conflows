import type { IDEAdapter } from '../types/index.js';
import { WindsurfAdapter } from './windsurf.js';
import { CursorAdapter } from './cursor.js';

/** 已注册的适配器 */
export const ADAPTERS: Record<string, IDEAdapter> = {
  windsurf: new WindsurfAdapter(),
  cursor: new CursorAdapter(),
};

/** 获取适配器 */
export function getAdapter(name: string): IDEAdapter {
  const adapter = ADAPTERS[name];
  if (!adapter) {
    const available = Object.keys(ADAPTERS).join(', ');
    throw new Error(`未知的 IDE: ${name}。支持: ${available}`);
  }
  return adapter;
}

/** 获取所有适配器 */
export function getAllAdapters(): IDEAdapter[] {
  return Object.values(ADAPTERS);
}

/** 获取所有 IDE 名称 */
export function getAllIDENames(): string[] {
  return Object.keys(ADAPTERS);
}
