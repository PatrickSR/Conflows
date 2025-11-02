import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import { CentralManager } from '../../src/core/central-manager.js';
import { fs } from '../../src/utils/fs.js';
import path from 'path';
import os from 'os';

describe('CentralManager', () => {
  let testDir: string;
  let manager: CentralManager;

  beforeEach(async () => {
    // 创建临时测试目录
    testDir = path.join(os.tmpdir(), `sync-workflow-test-${Date.now()}`);
    manager = new CentralManager(testDir);
  });

  afterEach(async () => {
    // 清理测试目录
    if (await fs.exists(testDir)) {
      await fs.remove(testDir);
    }
  });

  describe('init', () => {
    test('应该创建中心目录结构', async () => {
      await manager.init();

      expect(await fs.exists(testDir)).toBe(true);
      expect(await fs.exists(manager.getWorkflowsPath())).toBe(true);
      expect(await fs.exists(path.join(testDir, 'config.json'))).toBe(true);
    });

    test('应该创建默认配置', async () => {
      await manager.init();

      const config = await manager.getConfig();
      expect(config.version).toBe('1.0.0');
      expect(config.defaultIDEs).toEqual(['cursor', 'windsurf']);
      expect(config.tags).toHaveProperty('common');
    });
  });

  describe('isInitialized', () => {
    test('未初始化时应该返回 false', async () => {
      expect(await manager.isInitialized()).toBe(false);
    });

    test('初始化后应该返回 true', async () => {
      await manager.init();
      expect(await manager.isInitialized()).toBe(true);
    });
  });

  describe('scanWorkflows', () => {
    test('应该扫描所有 markdown 文件', async () => {
      await manager.init();

      const workflowsPath = manager.getWorkflowsPath();
      await fs.writeFile(path.join(workflowsPath, 'test1.md'), '# Test 1', 'utf-8');
      await fs.writeFile(path.join(workflowsPath, 'test2.md'), '# Test 2', 'utf-8');
      await fs.writeFile(path.join(workflowsPath, 'readme.txt'), 'Not a workflow', 'utf-8');

      const workflows = await manager.scanWorkflows();
      expect(workflows.length).toBe(2);
      expect(workflows.map(w => w.name)).toEqual(['test1.md', 'test2.md']);
    });

    test('空目录应该返回空数组', async () => {
      await manager.init();
      const workflows = await manager.scanWorkflows();
      expect(workflows).toEqual([]);
    });
  });

  describe('resolveWorkflowsByTags', () => {
    test('应该根据 tags 解析 workflow 列表', async () => {
      await manager.init();

      const config = await manager.getConfig();
      config.tags = {
        common: {
          description: '通用',
          workflows: ['a.md', 'b.md'],
        },
        frontend: {
          description: '前端',
          workflows: ['c.md'],
        },
      };
      await manager.saveConfig(config);

      const workflows = manager.resolveWorkflowsByTags(config, ['common', 'frontend']);
      expect(workflows).toEqual(['a.md', 'b.md', 'c.md']);
    });

    test('应该去重重复的 workflow', async () => {
      const config = {
        version: '1.0.0',
        defaultIDEs: ['cursor'],
        tags: {
          tag1: {
            description: 'Tag 1',
            workflows: ['a.md', 'b.md'],
          },
          tag2: {
            description: 'Tag 2',
            workflows: ['b.md', 'c.md'],
          },
        },
        workflowMeta: {},
      };

      const workflows = manager.resolveWorkflowsByTags(config, ['tag1', 'tag2']);
      expect(workflows.sort()).toEqual(['a.md', 'b.md', 'c.md']);
    });
  });

  describe('getWorkflow', () => {
    test('应该获取指定的 workflow 文件', async () => {
      await manager.init();

      const workflowsPath = manager.getWorkflowsPath();
      await fs.writeFile(path.join(workflowsPath, 'test.md'), '# Test Content', 'utf-8');

      const workflow = await manager.getWorkflow('test.md');
      expect(workflow).not.toBeNull();
      expect(workflow?.name).toBe('test.md');
      expect(workflow?.content).toBe('# Test Content');
    });

    test('不存在的文件应该返回 null', async () => {
      await manager.init();
      const workflow = await manager.getWorkflow('nonexistent.md');
      expect(workflow).toBeNull();
    });
  });
});
