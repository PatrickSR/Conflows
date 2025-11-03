import { describe, it, expect } from 'bun:test';
import { CentralAdapter } from '../../src/adapters/central';

describe('CentralAdapter', () => {
  const adapter = new CentralAdapter();

  describe('parseCommand', () => {
    it('should parse command with multi-IDE config', () => {
      const content = `---
description: "Multi-IDE command"
tags: ["test", "demo"]

cursor:
  customField: value

windsurf:
  auto_execution_mode: 3

vscode:
  mode: agent
  model: "GPT-4.1"
  tools: ["edit", "search"]
---

# Test Command

This is a test command.`;

      const ir = adapter.parseCommand(content, 'test.mdc');
      
      expect(ir.name).toBe('test');
      expect(ir.description).toBe('Multi-IDE command');
      expect(ir.tags).toEqual(['test', 'demo']);
      expect(ir.content).toBe('# Test Command\n\nThis is a test command.');
      expect(ir.cursor?.customField).toBe('value');
      expect(ir.windsurf?.auto_execution_mode).toBe(3);
      expect(ir.vscode?.mode).toBe('agent');
      expect(ir.vscode?.model).toBe('GPT-4.1');
    });

    it('should parse command with minimal config', () => {
      const content = `---
description: "Simple command"
---

Simple content`;

      const ir = adapter.parseCommand(content, 'simple.mdc');
      
      expect(ir.name).toBe('simple');
      expect(ir.description).toBe('Simple command');
      expect(ir.content).toBe('Simple content');
      expect(ir.cursor).toBeUndefined();
      expect(ir.windsurf).toBeUndefined();
      expect(ir.vscode).toBeUndefined();
    });

    it('should handle .md extension', () => {
      const content = `---
description: "Test"
---

Content`;

      const ir = adapter.parseCommand(content, 'test.md');
      
      expect(ir.name).toBe('test');
    });
  });

  describe('serializeCommand', () => {
    it('should serialize command with all IDE configs', () => {
      const ir = {
        name: 'test',
        description: 'Test command',
        content: 'Test content',
        tags: ['tag1', 'tag2'],
        cursor: { field1: 'value1' },
        windsurf: { auto_execution_mode: 3 as const },
        vscode: { mode: 'agent' as const }
      };

      const result = adapter.serializeCommand(ir);
      
      expect(result).toContain('description: Test command');
      expect(result).toContain('tags:');
      expect(result).toContain('- tag1');
      expect(result).toContain('- tag2');
      expect(result).toContain('cursor:');
      expect(result).toContain('field1: value1');
      expect(result).toContain('windsurf:');
      expect(result).toContain('auto_execution_mode: 3');
      expect(result).toContain('vscode:');
      expect(result).toContain('mode: agent');
      expect(result).toContain('Test content');
    });

    it('should serialize minimal command', () => {
      const ir = {
        name: 'simple',
        description: 'Simple',
        content: 'Content'
      };

      const result = adapter.serializeCommand(ir);
      
      expect(result).toContain('description: Simple');
      expect(result).toContain('Content');
      expect(result).not.toContain('cursor:');
      expect(result).not.toContain('windsurf:');
      expect(result).not.toContain('vscode:');
    });

    it('should omit empty tags array', () => {
      const ir = {
        name: 'test',
        description: 'Test',
        content: 'Content',
        tags: []
      };

      const result = adapter.serializeCommand(ir);
      
      expect(result).not.toContain('tags:');
    });
  });

  describe('parseRule', () => {
    it('should parse rule with multi-IDE config', () => {
      const content = `---
description: "TypeScript style rule"
tags: ["style"]

cursor:
  alwaysApply: true

windsurf:
  mode: always

vscode:
  applyTo: "**/*.ts"
---

Use TypeScript`;

      const ir = adapter.parseRule(content, 'ts-style.mdc');
      
      expect(ir.name).toBe('ts-style');
      expect(ir.description).toBe('TypeScript style rule');
      expect(ir.cursor?.alwaysApply).toBe(true);
      expect(ir.windsurf?.mode).toBe('always');
      expect(ir.vscode?.applyTo).toBe('**/*.ts');
    });
  });

  describe('serializeRule', () => {
    it('should serialize rule with all IDE configs', () => {
      const ir = {
        name: 'test-rule',
        description: 'Test rule',
        content: 'Rule content',
        cursor: { alwaysApply: true },
        windsurf: { mode: 'always' as const },
        vscode: { applyTo: '**/*.ts' }
      };

      const result = adapter.serializeRule(ir);
      
      expect(result).toContain('description: Test rule');
      expect(result).toContain('cursor:');
      expect(result).toContain('alwaysApply: true');
      expect(result).toContain('windsurf:');
      expect(result).toContain('mode: always');
      expect(result).toContain('vscode:');
      expect(result).toContain("applyTo: '**/*.ts'");
      expect(result).toContain('Rule content');
    });
  });

  describe('adapter properties', () => {
    it('should have correct paths', () => {
      expect(adapter.commandDirPath).toBe('commands');
      expect(adapter.ruleDirPath).toBe('rules');
    });

    it('should have correct file extensions', () => {
      expect(adapter.commandFileExtension).toBe('.mdc');
      expect(adapter.ruleFileExtension).toBe('.mdc');
    });

    it('should have correct name', () => {
      expect(adapter.name).toBe('central');
    });

    it('should not have installation paths', () => {
      expect(adapter.installationPaths).toBeUndefined();
    });
  });
});
