import type { IDEAdapter } from '../types/index.js';
import { WindsurfAdapter } from './windsurf.js';
import { CursorAdapter } from './cursor.js';
import { VscodeAdapter } from './vscode.js';

/** Registered adapters */
export const ADAPTERS: Record<string, IDEAdapter> = {
  cursor: new CursorAdapter(),
  windsurf: new WindsurfAdapter(),
  vscode: new VscodeAdapter(),
};

/** Get adapter by name */
export function getAdapter(name: string): IDEAdapter {
  const adapter = ADAPTERS[name];
  if (!adapter) {
    const available = Object.keys(ADAPTERS).join(', ');
    throw new Error(`Unknown IDE: ${name}. Supported: ${available}`);
  }
  return adapter;
}

/** Get all adapters */
export function getAllAdapters(): IDEAdapter[] {
  return Object.values(ADAPTERS);
}

/** Get all IDE names */
export function getAllIDENames(): string[] {
  return Object.keys(ADAPTERS);
}
