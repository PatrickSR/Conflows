# Conflow

集中管理和分发 IDE workflow 的 CLI 工具。

## 核心理念

- **集中管理**：所有 workflow 在 `~/.conflow/` 统一管理
- **零污染**：项目目录不存放配置文件
- **灵活配置**：通过 tags 灵活组合 workflows
- **批量操作**：一次更新，多个项目同步
- **IDE 无关**：通过适配器支持多种 IDE

## 快速开始

### 1. 初始化中心目录

```bash
conflow init
```

这会创建 `~/.conflow/` 目录结构：
- `workflows/` - 存放所有 workflow markdown 文件
- `config.json` - 全局配置（tags 定义）
- `projects.json` - 项目映射配置

### 2. 创建 Workflow

在 `~/.conflow/workflows/` 中创建 markdown 文件：

```bash
cd ~/.conflow/workflows
echo "# Code Review\n\nReview code changes..." > code-review.md
```

### 3. 配置 Tags

编辑 `~/.conflow/config.json`，定义 tags：

```json
{
  "tags": {
    "common": {
      "description": "通用工作流",
      "workflows": [
        "code-review.md",
        "refactor-code.md"
      ]
    },
    "frontend": {
      "description": "前端开发",
      "workflows": [
        "component-generator.md"
      ]
    }
  }
}
```

### 4. 下发到项目

```bash
# 临时指定 tags
conflow sync ~/project-a --tags common,frontend

# 保存配置，下次直接使用
conflow sync ~/project-a --tags common,frontend --save

# 后续直接同步
conflow sync ~/project-a
```

## 命令说明

### `init` - 初始化中心目录

```bash
conflow init
```

### `sync` - 下发 workflows 到项目

```bash
conflow sync <project-dir> [options]

选项:
  --tags <tags>         指定 tags（逗号分隔）
  --ides <ides>         指定 IDE（逗号分隔，默认: cursor,windsurf）
  --include <files>     额外包含的文件
  --exclude <files>     排除的文件
  --save               保存配置
  --dry-run            预览模式
  --all                同步所有已配置的项目
```

示例：

```bash
# 预览将要同步的内容
conflow sync ~/project --tags common --dry-run

# 指定并保存配置
conflow sync ~/project --tags common,frontend --save

# 批量同步所有项目
conflow sync --all
```

### `projects` - 管理项目配置

```bash
# 列出所有项目
conflow projects list

# 查看项目配置
conflow projects show <project-dir>

# 设置项目配置
conflow projects set <project-dir> --tags <tags>

# 删除项目配置
conflow projects remove <project-dir>
```

### `list` - 列出 workflows

```bash
# 列出所有 workflows
conflow list

# 按 tag 筛选
conflow list --tag common
```

### `tags` - 管理 tags

```bash
# 列出所有 tags
conflow tags list

# 查看 tag 详情
conflow tags show <tag-name>
```

## 使用场景

### 场景 1: 首次设置

```bash
# 1. 初始化
conflow init

# 2. 创建 workflows
cd ~/.conflow/workflows
vim code-review.md

# 3. 编辑 config.json 定义 tags
vim ~/.conflow/config.json

# 4. 下发到项目
conflow sync ~/project-a --tags common --save
```

### 场景 2: 更新 Workflow

```bash
# 1. 编辑 workflow
vim ~/.conflow/workflows/code-review.md

# 2. 批量同步到所有项目
conflow sync --all
```

### 场景 3: 新项目快速配置

```bash
# 方式 A: 临时指定
conflow sync ~/new-project --tags common,frontend

# 方式 B: 保存配置
conflow sync ~/new-project --tags common,frontend --save
```

## 配置文件

### 全局配置 (`~/.conflow/config.json`)

```json
{
  "version": "1.0.0",
  "defaultIDEs": ["cursor", "windsurf"],
  "tags": {
    "common": {
      "description": "通用工作流",
      "workflows": ["code-review.md", "refactor-code.md"]
    }
  },
  "workflowMeta": {
    "code-review.md": {
      "description": "代码审查工作流",
      "executionMode": "safe"
    }
  }
}
```

### 项目映射 (`~/.conflow/projects.json`)

```json
{
  "projects": {
    "/Users/patrick/project-a": {
      "tags": ["common", "frontend"],
      "ides": ["cursor", "windsurf"],
      "lastSync": "2024-11-02T09:00:00Z"
    }
  }
}
```

## 开发

```bash
# 安装依赖
bun install

# 开发模式
bun run dev

# 构建
bun run build

# 测试
bun test
```

## 版本历史

### v0.0.2 (Current)

- 🎉 **集中管理**：实现中心目录管理 workflows
- ✨ 新增 `init` 命令：初始化中心目录
- ✨ 重构 `sync` 命令：从中心目录下发到项目
- ✨ 新增 `projects` 命令组：管理项目配置
- ✨ 新增 `tags` 命令组：管理 tags
- ✨ 重构 `list` 命令：列出中心目录的 workflows
- 🧪 添加完整的单元测试（21 个测试用例）

### v0.0.1

- 初始版本：支持 Cursor 和 Windsurf 之间的双向同步