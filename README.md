# Sync Workflow

同步 Cursor 和 Windsurf 工作流的 CLI 工具。

## 功能特性

- ✅ 支持 Cursor 和 Windsurf 工作流双向同步
- ✅ 自动格式转换（Windsurf frontmatter ↔ Cursor 纯 markdown）
- ✅ 智能冲突检测和解决
- ✅ 项目级别配置（通过 Git 共享团队工作流）

## 安装

```bash
bun install
bun run build
```

## 使用

### 检测项目工作流

```bash
sync-workflow detect
```

### 单向同步

```bash
# 从一个 IDE 同步到另一个 IDE
sync-workflow sync --from windsurf --to cursor
sync-workflow sync --from cursor --to windsurf
```

### 双向同步

```bash
# 两个 IDE 之间双向同步
sync-workflow sync --from cursor --to windsurf --both
```

### 列出所有工作流

```bash
sync-workflow list
```

### 支持的 IDE

当前支持的 IDE：
- `cursor` - Cursor 编辑器
- `windsurf` - Windsurf 编辑器

更多 IDE 支持正在开发中...

## 工作流格式

### Windsurf 格式

```markdown
---
description: 工作流描述
auto_execution_mode: 3
---

工作流内容...
```

### Cursor 格式

```markdown
工作流内容...
```

## 项目结构

```
.
├── .cursor/
│   └── commands/          # Cursor 工作流
├── .windsurf/
│   └── workflows/         # Windsurf 工作流
└── ...
```

## 开发

```bash
# 开发模式
bun run dev

# 构建
bun run build

# 测试
bun run test
```

## 贡献

欢迎贡献！请查看 [CONTRIBUTING.md](./CONTRIBUTING.md) 了解详细信息。

## 安全

请查看 [SECURITY.md](./SECURITY.md) 了解安全相关信息。

## License

MIT
