# 贡献指南

## 代码规范

### 1. 注释要求

所有公共 API（类、方法、接口）都需要添加清晰的 JSDoc 注释：

```typescript
/**
 * 方法简短描述
 * 
 * 详细说明（可选）
 * 
 * @param paramName 参数说明
 * @returns 返回值说明
 */
export function methodName(paramName: string): ReturnType {
  // 实现
}
```

### 2. 敏感信息

**禁止在代码中包含任何敏感信息：**

❌ 不要包含：
- 公司内部域名或 IP
- 内部系统名称
- 真实的业务数据
- API 密钥或凭证

✅ 使用通用示例：
```typescript
// ❌ 错误示例
description: "访问 internal.company.com 的内容"

// ✅ 正确示例  
description: "工作流描述"
```

### 3. 文件命名

- 使用 kebab-case：`file-scanner.ts`
- 类文件使用功能名称：`scanner.ts`
- 类型文件统一为 `index.ts`

### 4. 代码组织

```
src/
├── adapters/     # IDE 适配器（扩展点）
├── core/         # 核心业务逻辑
├── commands/     # CLI 命令
├── types/        # TypeScript 类型定义
└── utils/        # 工具函数
```

## 添加新 IDE 支持

1. 在 `src/adapters/` 创建新适配器文件
2. 实现 `IDEAdapter` 接口
3. 在 `src/adapters/index.ts` 注册适配器

示例：

```typescript
// src/adapters/new-ide.ts
export class NewIDEAdapter implements IDEAdapter {
  name = 'new-ide';
  dirPath = '.new-ide/workflows';
  
  parse(content: string, filename: string): WorkflowIR {
    // 实现解析逻辑
  }
  
  serialize(workflow: WorkflowIR): string {
    // 实现序列化逻辑
  }
}

// src/adapters/index.ts
import { NewIDEAdapter } from './new-ide.js';

export const ADAPTERS = {
  windsurf: new WindsurfAdapter(),
  cursor: new CursorAdapter(),
  'new-ide': new NewIDEAdapter(), // 添加这里
};
```

## 测试

在提交 PR 之前，请确保：

1. 代码可以成功构建：`bun run build`
2. 手动测试所有命令：
   - `bun run dev detect`
   - `bun run dev list`
   - `bun run dev sync --from X --to Y`
   - `bun run dev sync --both`

## 提交规范

使用 Conventional Commits 格式：

- `feat: 添加新功能`
- `fix: 修复问题`
- `docs: 更新文档`
- `refactor: 重构代码`
- `test: 添加测试`
