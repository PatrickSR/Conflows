import { describe, it, expect } from 'bun:test';
import { VscodeAdapter } from '../../src/adapters/vscode';

describe('VscodeAdapter', () => {
  const adapter = new VscodeAdapter();

  describe('parseCommand', () => {
    it('should parse command with vscode config', () => {
      const content = `---
description: "Test command"
mode: agent
model: "GPT-4.1"
tools:
  - edit
  - search
---

Test content`;

      const ir = adapter.parseCommand(content, 'test.md');
      
      expect(ir.name).toBe('test');
      expect(ir.description).toBe('Test command');
      expect(ir.content).toBe('Test content');
      expect(ir.vscode?.mode).toBe('agent');
      expect(ir.vscode?.model).toBe('GPT-4.1');
      expect(ir.vscode?.tools).toEqual(['edit', 'search']);
    });

    it('should parse command with multi-IDE config', () => {
      const content = `---
description: "Multi IDE"
vscode:
  mode: ask
  tools: ["edit"]
windsurf:
  auto_execution_mode: 3
---

Content`;

      const ir = adapter.parseCommand(content, 'multi.md');
      
      expect(ir.vscode?.mode).toBe('ask');
      expect(ir.windsurf?.auto_execution_mode).toBe(3);
    });
  });

  describe('serializeCommand', () => {
    it('should serialize command to vscode format', () => {
      const ir = {
        name: 'test',
        description: 'Test',
        content: 'Test content',
        vscode: {
          mode: 'agent' as const,
          model: 'GPT-4.1',
          tools: ['edit']
        }
      };

      const result = adapter.serializeCommand(ir);
      
      expect(result).toContain('mode: agent');
      expect(result).toContain('description: Test');
      expect(result).toContain('model: GPT-4.1');
      expect(result).toContain('Test content');
    });

    it('should use default values when config missing', () => {
      const ir = {
        name: 'test',
        description: 'Test',
        content: 'Content',
        vscode: {} // empty config, should use defaults
      };

      const result = adapter.serializeCommand(ir);
      
      expect(result).toContain('mode: agent'); // default
      expect(result).toContain('tools: []'); // default
    });
  });

  describe('parseRule', () => {
    it('should parse rule with applyTo pattern', () => {
      const content = `---
description: "TS Rule"
applyTo: "**/*.ts"
---

Use TypeScript`;

      const ir = adapter.parseRule(content, 'ts-rule.md');
      
      expect(ir.name).toBe('ts-rule');
      expect(ir.description).toBe('TS Rule');
      expect(ir.vscode?.applyTo).toBe('**/*.ts');
    });
  });

  describe('serializeRule', () => {
    it('should serialize rule to vscode format', () => {
      const ir = {
        name: 'test',
        description: 'Test rule',
        content: 'Rule content',
        vscode: {
          applyTo: '**/*.ts'
        }
      };

      const result = adapter.serializeRule(ir);
      
      expect(result).toContain("applyTo: '**/*.ts'"); // js-yaml uses single quotes
      expect(result).toContain('description: Test rule');
      expect(result).toContain('Rule content');
    });
  });

  describe('adapter properties', () => {
    it('should have correct paths', () => {
      expect(adapter.commandDirPath).toBe('.vscode/prompts');
      expect(adapter.ruleDirPath).toBe('.github/instructions');
    });

    it('should have correct name', () => {
      expect(adapter.name).toBe('vscode');
    });
  });
});
