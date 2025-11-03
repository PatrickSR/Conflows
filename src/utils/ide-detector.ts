import os from 'os';
import path from 'path';
import fs from 'fs';
import { getAllIDENames, getAdapter } from '../adapters/index.js';

/** IDE detection result */
export interface DetectionResult {
  ide: string;
  installed: boolean;
  path?: string;
}

/** IDE detector utility */
export class IDEDetector {
  /** Detect installed IDEs from a given list */
  static detectInstalledIDEs(ides: string[]): DetectionResult[] {
    return ides.map(ide => {
      const installed = this.isIDEInstalled(ide);
      const idePath = this.getIDEPath(ide);

      return {
        ide,
        installed,
        path: idePath ?? undefined,  // Convert null to undefined
      };
    });
  }

  /** Check if an IDE is installed */
  private static isIDEInstalled(ide: string): boolean {
    try {
      const path = this.getIDEPath(ide);
      return path !== null;
    } catch {
      return false;
    }
  }

  /** Get IDE installation path */
  private static getIDEPath(ide: string): string | null {
    try {
      const adapter = getAdapter(ide);
      const platform = os.platform() as 'darwin' | 'win32' | 'linux';
      
      // Get paths from adapter configuration
      const paths = adapter.installationPaths?.[platform];
      if (!paths || paths.length === 0) {
        return null;
      }

      // Check each path
      for (const p of paths) {
        const resolvedPath = this.resolvePath(p);
        if (this.pathExists(resolvedPath)) {
          return resolvedPath;
        }
      }

      return null;
    } catch {
      return null;
    }
  }

  /** Check if a path exists */
  private static pathExists(p: string): boolean {
    try {
      return fs.existsSync(p);
    } catch {
      return false;
    }
  }

  /** Resolve path with environment variables and ~ expansion */
  private static resolvePath(p: string): string {
    // Expand environment variables (Windows style: %VAR%)
    let resolved = p.replace(/%([^%]+)%/g, (_, varName) => {
      return process.env[varName] || '';
    });

    // Expand ~ to home directory
    if (resolved.startsWith('~')) {
      resolved = path.join(os.homedir(), resolved.slice(1));
    }

    return resolved;
  }


  /** Filter out uninstalled IDEs and return installed ones */
  static filterInstalledIDEs(ides: string[]): string[] {
    const results = this.detectInstalledIDEs(ides);
    return results.filter(r => r.installed).map(r => r.ide);
  }

  /** Get detection summary for logging */
  static getDetectionSummary(ides: string[]): { installed: string[]; skipped: string[] } {
    const results = this.detectInstalledIDEs(ides);
    const installed = results.filter(r => r.installed).map(r => r.ide);
    const skipped = results.filter(r => !r.installed).map(r => r.ide);

    return { installed, skipped };
  }
}

/** Convenience function to detect installed IDEs from the default list */
export async function detectInstalledIDEs(): Promise<string[]> {
  const availableIDEs = getAllIDENames();
  return IDEDetector.filterInstalledIDEs(availableIDEs);
}
