import inquirer from 'inquirer';
import matter from 'gray-matter';
import type { WorkflowFile, Conflict } from '../types/index.js';
import { logger } from '../utils/logger.js';

/** Conflict resolver */
export class ConflictResolver {
  /** Find files with same name but different content (ignoring frontmatter) */
  findConflicts(fromFiles: WorkflowFile[], toFiles: WorkflowFile[]): Conflict[] {
    const conflicts: Conflict[] = [];
    
    for (const fromFile of fromFiles) {
      const toFile = toFiles.find(f => f.name === fromFile.name);
      
      if (toFile) {
        // Compare content (ignoring potential frontmatter differences)
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
  
  /** Interactively resolve conflicts, return user choices */
  async resolve(conflicts: Conflict[], fromIde: string, toIde: string): Promise<Map<string, 'from' | 'to' | 'skip'>> {
    const choices = new Map<string, 'from' | 'to' | 'skip'>();
    
    for (const conflict of conflicts) {
      logger.warn(`\n⚠️  Conflict: ${conflict.filename}`);
      
      logger.info(`\n${fromIde} version:`);
      logger.info(`  Size: ${conflict.fromFile.size} bytes`);
      logger.info(`  Modified: ${conflict.fromFile.mtime.toLocaleString('en-US')}`);
      
      logger.info(`\n${toIde} version:`);
      logger.info(`  Size: ${conflict.toFile.size} bytes`);
      logger.info(`  Modified: ${conflict.toFile.mtime.toLocaleString('en-US')}`);
      
      const answer = await inquirer.prompt([
        {
          type: 'list',
          name: 'choice',
          message: 'Which version to keep?',
          choices: [
            { name: `${fromIde} version`, value: 'from' },
            { name: `${toIde} version`, value: 'to' },
            { name: 'Skip this file', value: 'skip' },
          ],
        },
      ]);
      
      choices.set(conflict.filename, answer.choice);
    }
    
    return choices;
  }
  
  /** Extract body (remove frontmatter) */
  private extractBody(content: string): string {
    const parsed = matter(content);
    return parsed.content.trim();
  }
}
