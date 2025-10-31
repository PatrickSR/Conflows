import path from 'path';
import { Scanner } from './scanner.js';
import { Transformer } from './transformer.js';
import { ConflictResolver } from './conflict.js';
import { getAdapter } from '../adapters/index.js';
import { fs } from '../utils/fs.js';
import { logger } from '../utils/logger.js';
import type { SyncOptions } from '../types/index.js';

/**
 * 文件同步器
 * 
 * 负责执行工作流文件的同步操作
 * 支持单向同步和双向同步两种模式
 */
export class Syncer {
  private scanner = new Scanner();
  private transformer = new Transformer();
  private conflictResolver = new ConflictResolver();
  private cwd = process.cwd();
  
  /**
   * 执行同步
   * 
   * 根据选项执行单向或双向同步
   * 
   * @param options 同步选项
   * @throws 如果选项不完整则抛出异常
   */
  async sync(options: SyncOptions): Promise<void> {
    if (options.both) {
      await this.syncBoth(options.force || false);
    } else if (options.from && options.to) {
      await this.syncOneWay(options.from, options.to, options.force || false);
    } else {
      throw new Error('请指定 --from 和 --to，或使用 --both');
    }
  }
  
  /**
   * 单向同步
   * 
   * 将文件从源 IDE 同步到目标 IDE
   * 
   * 流程：
   * 1. 检查源目录是否存在
   * 2. 扫描源文件
   * 3. 检测冲突（如果不是 force 模式）
   * 4. 转换格式并写入目标目录
   * 
   * @param from 源 IDE 名称
   * @param to 目标 IDE 名称
   * @param force 是否强制覆盖，不提示冲突
   */
  async syncOneWay(from: string, to: string, force: boolean): Promise<void> {
    const fromAdapter = getAdapter(from);
    const toAdapter = getAdapter(to);
    
    const fromDir = path.join(this.cwd, fromAdapter.dirPath);
    const toDir = path.join(this.cwd, toAdapter.dirPath);
    
    // 检查源目录
    if (!await fs.exists(fromDir)) {
      logger.error(`❌ ${from} 目录不存在: ${fromDir}`);
      return;
    }
    
    // 确保目标目录存在
    await fs.ensureDir(toDir);
    
    // 扫描源文件
    const fromFiles = await this.scanner.scan(from);
    
    if (fromFiles.length === 0) {
      logger.warn(`⚠️  ${from} 目录中没有工作流文件`);
      return;
    }
    
    logger.info(`\n发现 ${fromFiles.length} 个工作流\n`);
    
    // 如果不是强制模式，检查冲突
    if (!force) {
      const toFiles = await this.scanner.scan(to);
      const conflicts = this.conflictResolver.findConflicts(fromFiles, toFiles);
      
      if (conflicts.length > 0) {
        logger.warn(`\n发现 ${conflicts.length} 个冲突文件`);
        const choices = await this.conflictResolver.resolve(conflicts, from, to);
        
        // 根据用户选择处理冲突
        for (const [filename, choice] of choices) {
          if (choice === 'skip') {
            logger.info(`⊘ 跳过: ${filename}`);
            // 从待同步列表中移除
            const index = fromFiles.findIndex(f => f.name === filename);
            if (index >= 0) {
              fromFiles.splice(index, 1);
            }
          } else if (choice === 'to') {
            // 保留目标版本 = 不同步此文件
            const index = fromFiles.findIndex(f => f.name === filename);
            if (index >= 0) {
              fromFiles.splice(index, 1);
            }
          }
          // choice === 'from' 时继续同步
        }
        
        if (fromFiles.length === 0) {
          logger.info('\n没有需要同步的文件');
          return;
        }
        
        logger.info('');
      }
    }
    
    // 同步文件
    let syncCount = 0;
    for (const file of fromFiles) {
      const toPath = path.join(toDir, file.name);
      
      // 转换格式
      const converted = this.transformer.transform(file.content, file.name, from, to);
      
      // 写入目标文件
      await fs.writeFile(toPath, converted, 'utf-8');
      logger.success(`✓ ${file.name}`);
      syncCount++;
    }
    
    logger.success(`\n✓ 已同步 ${syncCount} 个工作流到 ${to}\n`);
  }
  
  /**
   * 双向同步
   * 
   * 将 Cursor 和 Windsurf 的工作流文件进行双向同步
   * 
   * 流程：
   * 1. 扫描两个 IDE 的文件
   * 2. 找出只在一个 IDE 中存在的文件
   * 3. 检测冲突文件
   * 4. 让用户确认同步计划
   * 5. 执行同步
   * 
   * @param force 是否强制同步，跳过确认和冲突检测
   */
  async syncBoth(force: boolean): Promise<void> {
    const cursorFiles = await this.scanner.scan('cursor');
    const windsurfFiles = await this.scanner.scan('windsurf');
    
    // 检查是否有文件
    if (cursorFiles.length === 0 && windsurfFiles.length === 0) {
      logger.warn('⚠️  两边都没有工作流文件');
      return;
    }
    
    logger.info('\n扫描结果:');
    logger.info(`  Cursor: ${cursorFiles.length} 个工作流`);
    logger.info(`  Windsurf: ${windsurfFiles.length} 个工作流\n`);
    
    // 查找需要同步的文件
    const cursorOnly = cursorFiles.filter(cf => !windsurfFiles.some(wf => wf.name === cf.name));
    const windsurfOnly = windsurfFiles.filter(wf => !cursorFiles.some(cf => cf.name === wf.name));
    const conflicts = this.conflictResolver.findConflicts(cursorFiles, windsurfFiles);
    
    // 处理冲突
    const conflictChoices = new Map<string, 'from' | 'to' | 'skip'>();
    if (conflicts.length > 0 && !force) {
      logger.warn(`发现 ${conflicts.length} 个冲突文件`);
      const choices = await this.conflictResolver.resolve(conflicts, 'cursor', 'windsurf');
      for (const [filename, choice] of choices) {
        conflictChoices.set(filename, choice);
      }
    }
    
    // 显示同步计划
    logger.info('\n同步计划:');
    if (windsurfOnly.length > 0) {
      logger.info(`  Windsurf → Cursor: ${windsurfOnly.length} 个文件`);
      windsurfOnly.forEach(f => logger.info(`    + ${f.name}`));
    }
    if (cursorOnly.length > 0) {
      logger.info(`  Cursor → Windsurf: ${cursorOnly.length} 个文件`);
      cursorOnly.forEach(f => logger.info(`    + ${f.name}`));
    }
    if (conflicts.length > 0) {
      const resolvedConflicts = conflicts.filter(c => {
        const choice = conflictChoices.get(c.filename);
        return choice && choice !== 'skip';
      });
      if (resolvedConflicts.length > 0) {
        logger.info(`  冲突文件: ${resolvedConflicts.length} 个`);
      }
    }
    
    // 确认执行
    if (!force && (windsurfOnly.length > 0 || cursorOnly.length > 0 || conflicts.length > 0)) {
      const { confirm } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: '执行同步?',
          default: true,
        },
      ]);
      
      if (!confirm) {
        logger.info('已取消');
        return;
      }
    }
    
    logger.info('');
    
    // 执行同步
    let syncCount = 0;
    
    // Windsurf → Cursor
    for (const file of windsurfOnly) {
      const converted = this.transformer.transform(file.content, file.name, 'windsurf', 'cursor');
      const toPath = path.join(this.cwd, '.cursor/commands', file.name);
      await fs.ensureDir(path.dirname(toPath));
      await fs.writeFile(toPath, converted, 'utf-8');
      logger.success(`✓ ${file.name} (Windsurf → Cursor)`);
      syncCount++;
    }
    
    // Cursor → Windsurf
    for (const file of cursorOnly) {
      const converted = this.transformer.transform(file.content, file.name, 'cursor', 'windsurf');
      const toPath = path.join(this.cwd, '.windsurf/workflows', file.name);
      await fs.ensureDir(path.dirname(toPath));
      await fs.writeFile(toPath, converted, 'utf-8');
      logger.success(`✓ ${file.name} (Cursor → Windsurf)`);
      syncCount++;
    }
    
    // 处理冲突
    for (const conflict of conflicts) {
      const choice = conflictChoices.get(conflict.filename);
      if (choice === 'from') {
        // Cursor → Windsurf
        const converted = this.transformer.transform(conflict.fromFile.content, conflict.filename, 'cursor', 'windsurf');
        const toPath = path.join(this.cwd, '.windsurf/workflows', conflict.filename);
        await fs.writeFile(toPath, converted, 'utf-8');
        logger.success(`✓ ${conflict.filename} (Cursor → Windsurf)`);
        syncCount++;
      } else if (choice === 'to') {
        // Windsurf → Cursor
        const converted = this.transformer.transform(conflict.toFile.content, conflict.filename, 'windsurf', 'cursor');
        const toPath = path.join(this.cwd, '.cursor/commands', conflict.filename);
        await fs.writeFile(toPath, converted, 'utf-8');
        logger.success(`✓ ${conflict.filename} (Windsurf → Cursor)`);
        syncCount++;
      }
    }
    
    const totalFiles = new Set([...cursorFiles.map(f => f.name), ...windsurfFiles.map(f => f.name)]).size;
    logger.success(`\n✓ 完成！Cursor 和 Windsurf 现在都有 ${totalFiles} 个工作流\n`);
  }
}

// 需要导入 inquirer
import inquirer from 'inquirer';
