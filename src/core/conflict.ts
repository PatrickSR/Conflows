import inquirer from 'inquirer';
import matter from 'gray-matter';
import type { WorkflowFile, Conflict } from '../types/index.js';
import { logger } from '../utils/logger.js';

/**
 * 冲突解决器
 * 
 * 负责检测和解决工作流文件冲突
 * 
 * 冲突定义：
 * - 同名文件在两个 IDE 中都存在
 * - 文件内容不同（忽略 frontmatter 差异）
 */
export class ConflictResolver {
  /**
   * 查找冲突文件
   * 
   * 检查两个文件列表，找出同名但内容不同的文件
   * 注意：比较时会忽略 frontmatter 差异，只比较正文内容
   * 
   * @param fromFiles 源文件列表
   * @param toFiles 目标文件列表
   * @returns 冲突文件列表
   */
  findConflicts(fromFiles: WorkflowFile[], toFiles: WorkflowFile[]): Conflict[] {
    const conflicts: Conflict[] = [];
    
    for (const fromFile of fromFiles) {
      const toFile = toFiles.find(f => f.name === fromFile.name);
      
      if (toFile) {
        // 对比内容（忽略可能的 frontmatter 差异）
        const fromBody = this.extractBody(fromFile.content);
        const toBody = this.extractBody(toFile.content);
        
        if (fromBody !== toBody) {
          conflicts.push({
            filename: fromFile.name,
            fromFile,
            toFile,
          });
        }
      }
    }
    
    return conflicts;
  }
  
  /**
   * 解决冲突（交互式）
   * 
   * 对每个冲突文件，显示两个版本的元数据，让用户选择保留哪个
   * 
   * @param conflicts 冲突文件列表
   * @param fromIde 源 IDE 名称（用于显示）
   * @param toIde 目标 IDE 名称（用于显示）
   * @returns Map，key 为文件名，value 为用户选择（'from' | 'to' | 'skip'）
   */
  async resolve(conflicts: Conflict[], fromIde: string, toIde: string): Promise<Map<string, 'from' | 'to' | 'skip'>> {
    const choices = new Map<string, 'from' | 'to' | 'skip'>();
    
    for (const conflict of conflicts) {
      logger.warn(`\n⚠️  冲突: ${conflict.filename}`);
      
      logger.info(`\n${fromIde} 版本:`);
      logger.info(`  大小: ${conflict.fromFile.size} bytes`);
      logger.info(`  修改: ${conflict.fromFile.mtime.toLocaleString('zh-CN')}`);
      
      logger.info(`\n${toIde} 版本:`);
      logger.info(`  大小: ${conflict.toFile.size} bytes`);
      logger.info(`  修改: ${conflict.toFile.mtime.toLocaleString('zh-CN')}`);
      
      const answer = await inquirer.prompt([
        {
          type: 'list',
          name: 'choice',
          message: '保留哪个版本?',
          choices: [
            { name: `${fromIde} 版本`, value: 'from' },
            { name: `${toIde} 版本`, value: 'to' },
            { name: '跳过此文件', value: 'skip' },
          ],
        },
      ]);
      
      choices.set(conflict.filename, answer.choice);
    }
    
    return choices;
  }
  
  /**
   * 提取正文内容（去除 frontmatter）
   * 
   * 用于比较文件内容时忽略 frontmatter 差异
   * 
   * @param content 原始文件内容
   * @returns 去除 frontmatter 后的正文
   */
  private extractBody(content: string): string {
    const parsed = matter(content);
    return parsed.content.trim();
  }
}
