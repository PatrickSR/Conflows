import inquirer from 'inquirer';
import matter from 'gray-matter';
import type { WorkflowFile, Conflict } from '../types/index.js';
import { logger } from '../utils/logger.js';

/** 冲突解决器 */
export class ConflictResolver {
  /** 查找同名但内容不同的文件（忽略 frontmatter） */
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
  
  /** 交互式解决冲突，返回用户选择 */
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
  
  /** 提取正文（去除 frontmatter） */
  private extractBody(content: string): string {
    const parsed = matter(content);
    return parsed.content.trim();
  }
}
