import matter from "gray-matter";
import type { IDEAdapter, WorkflowIR } from "../types/index.js";

/**
 * Windsurf adapter
 *
 * Windsurf uses markdown format with YAML frontmatter
 *
 * Format example:
 * ```markdown
 * ---
 * description: workflow description
 * auto_execution_mode: 3
 * ---
 *
 * Workflow content...
 * ```
 *
 * auto_execution_mode:
 * - 1 = Safe mode
 * - 3 = Turbo mode
 */
export class WindsurfAdapter implements IDEAdapter {
  name = "windsurf";
  dirPath = ".windsurf/workflows";
  
  installationPaths = {
    darwin: [
      '/Applications/Windsurf.app'
    ],
    win32: [
      '%PROGRAMFILES%\\Windsurf',
      '%PROGRAMFILES(X86)%\\Windsurf',
      '%LOCALAPPDATA%\\Programs\\Windsurf'
    ],
    linux: [
      '/usr/local/bin/windsurf',
      '/opt/windsurf',
      '~/.local/bin/windsurf',
      '~/.local/share/windsurf'
    ]
  };

  /**
   * Parse to intermediate representation
   */
  parse(content: string, filename: string): WorkflowIR {
    const parsed = matter(content);
    const data = parsed.data as {
      description?: string;
      auto_execution_mode?: number;
    };

    return {
      name: filename.replace(".md", ""),
      description: data.description || "",
      content: parsed.content.trim(),
      config: {
        executionMode: this.mapExecutionMode(data.auto_execution_mode),
      },
    };
  }

  /**
   * Serialize to frontmatter + markdown
   */
  serialize(workflow: WorkflowIR): string {
    const autoExecutionMode =
      workflow.config?.executionMode === "turbo" ? 3 : 1;

    return matter.stringify(workflow.content, {
      description: workflow.description,
      auto_execution_mode: autoExecutionMode,
    });
  }

  /** Map execution mode: 3=turbo, others=safe */
  private mapExecutionMode(mode?: number): "safe" | "turbo" {
    return mode === 3 ? "turbo" : "safe";
  }
}
