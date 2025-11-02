import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { ConfigManager } from './config-manager.js';
import { fs } from '../utils/fs.js';
import path from 'path';
import os from 'os';

describe('ConfigManager', () => {
  let testDir: string;
  let manager: ConfigManager;

  beforeEach(async () => {
    // 创建临时测试目录
    testDir = path.join(os.tmpdir(), `sync-workflow-test-${Date.now()}`);
    manager = new ConfigManager(testDir);
    
    // 初始化中心目录
    const centralManager = manager.getCentralManager();
    await centralManager.init();
  });

  afterEach(async () => {
    // 清理测试目录
    if (await fs.exists(testDir)) {
      await fs.remove(testDir);
    }
  });

  describe('getProjects', () => {
    test('应该读取项目映射', async () => {
      const projects = await manager.getProjects();
      expect(projects).toHaveProperty('projects');
      expect(projects.projects).toEqual({});
    });
  });

  describe('saveProjectConfig', () => {
    test('应该保存项目配置', async () => {
      const projectPath = '/test/project';
      const config = {
        tags: ['common', 'frontend'],
        ides: ['cursor'],
      };

      await manager.saveProjectConfig(projectPath, config);

      const saved = await manager.getProjectConfig(projectPath);
      expect(saved).not.toBeNull();
      if (saved) {
        expect(saved.tags).toEqual(['common', 'frontend']);
        expect(saved.ides).toEqual(['cursor']);
        expect(saved.lastSync).toBeDefined();
      }
    });

    test('应该使用绝对路径作为 key', async () => {
      const relativePath = 'relative/path';
      const config = {
        tags: ['common'],
      };

      await manager.saveProjectConfig(relativePath, config);

      const projects = await manager.getProjects();
      const keys = Object.keys(projects.projects);
      
      // 应该转换为绝对路径
      expect(keys.length).toBe(1);
      if (keys[0]) {
        expect(path.isAbsolute(keys[0])).toBe(true);
      }
    });
  });

  describe('getProjectConfig', () => {
    test('不存在的项目应该返回 null', async () => {
      const config = await manager.getProjectConfig('/nonexistent');
      expect(config).toBeNull();
    });

    test('应该返回已保存的配置', async () => {
      const projectPath = '/test/project';
      const config = {
        tags: ['backend'],
        ides: ['windsurf'],
      };

      await manager.saveProjectConfig(projectPath, config);
      const retrieved = await manager.getProjectConfig(projectPath);

      expect(retrieved).not.toBeNull();
      if (retrieved) {
        expect(retrieved.tags).toEqual(['backend']);
        expect(retrieved.ides).toEqual(['windsurf']);
      }
    });
  });

  describe('removeProjectConfig', () => {
    test('应该删除项目配置', async () => {
      const projectPath = '/test/project';
      const config = {
        tags: ['common'],
      };

      await manager.saveProjectConfig(projectPath, config);
      expect(await manager.getProjectConfig(projectPath)).not.toBeNull();

      await manager.removeProjectConfig(projectPath);
      expect(await manager.getProjectConfig(projectPath)).toBeNull();
    });
  });

  describe('resolveConfig', () => {
    beforeEach(async () => {
      // 设置测试配置
      const centralManager = manager.getCentralManager();
      const config = await centralManager.getConfig();
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
      await centralManager.saveConfig(config);
    });

    test('应该使用命令行选项', async () => {
      const resolved = await manager.resolveConfig('/test/project', {
        tags: ['common'],
        ides: ['cursor'],
      });

      expect(resolved.tags).toEqual(['common']);
      expect(resolved.ides).toEqual(['cursor']);
      expect(resolved.workflows).toEqual(['a.md', 'b.md']);
    });

    test('应该使用项目配置', async () => {
      await manager.saveProjectConfig('/test/project', {
        tags: ['frontend'],
        ides: ['windsurf'],
      });

      const resolved = await manager.resolveConfig('/test/project');

      expect(resolved.tags).toEqual(['frontend']);
      expect(resolved.ides).toEqual(['windsurf']);
      expect(resolved.workflows).toEqual(['c.md']);
    });

    test('应该使用全局默认配置', async () => {
      const resolved = await manager.resolveConfig('/test/project');

      // 没有配置时，tags 为空，ides 使用全局默认
      expect(resolved.tags).toEqual([]);
      expect(resolved.ides).toEqual(['cursor', 'windsurf']);
    });

    test('命令行选项应该覆盖项目配置', async () => {
      await manager.saveProjectConfig('/test/project', {
        tags: ['frontend'],
        ides: ['windsurf'],
      });

      const resolved = await manager.resolveConfig('/test/project', {
        tags: ['common'],
      });

      expect(resolved.tags).toEqual(['common']);
      expect(resolved.workflows).toEqual(['a.md', 'b.md']);
    });

    test('应该处理 include 和 exclude', async () => {
      const resolved = await manager.resolveConfig('/test/project', {
        tags: ['common'],
        include: ['extra.md'],
        exclude: ['a.md'],
      });

      expect(resolved.include).toEqual(['extra.md']);
      expect(resolved.exclude).toEqual(['a.md']);
    });
  });
});
