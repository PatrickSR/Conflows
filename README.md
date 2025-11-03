# Conflows

[![NPM Version](https://img.shields.io/npm/v/conflows)](https://www.npmjs.com/package/conflows)
[![Test](https://github.com/PatrickSR/sync-workflow-cli/actions/workflows/test.yml/badge.svg)](https://github.com/PatrickSR/sync-workflow-cli/actions/workflows/test.yml)
[![License](https://img.shields.io/npm/l/conflows)](./LICENSE)

**Con**text + Work**flow**s - A centralized IDE workflow manager.

Conflows helps you manage and distribute AI-powered commands and rules across multiple IDEs (Cursor, Windsurf, VSCode) from a single source of truth.

## Core Features

- **Centralized Management**: All commands and rules stored in `~/.conflows/` 
- **Zero Pollution**: No config files cluttering your project directories
- **IDE Agnostic**: Seamless conversion between IDE formats via adapters
- **Multi-Type Support**: Sync both commands (workflows) and rules
- **Simple Distribution**: One command to sync to your projects

## Quick Start

### 1. Initialize Central Directory

```bash
conflows init
```

This creates the `~/.conflows/` directory structure:
- `commands/` - Store your command files here (.mdc format)
- `rules/` - Store your rule files here (.mdc format)

### 2. Create Commands and Rules

Create `.mdc` files in `~/.conflows/commands/` and `~/.conflows/rules/`:

**Command Example** (`~/.conflows/commands/code-review.mdc`):
```markdown
---
description: "AI code review assistant"

vscode:
  mode: agent
  tools: ["edit", "search"]

windsurf:
  auto_execution_mode: 3
---

# Code Review

Review the code changes carefully...
```

**Rule Example** (`~/.conflows/rules/typescript-style.mdc`):
```markdown
---
description: "TypeScript coding guidelines"

cursor:
  alwaysApply: true

windsurf:
  mode: always

vscode:
  applyTo: "**/*.{ts,tsx}"
---

Use TypeScript for all new files.
Prefer const over let.
```

### 3. Distribute to Projects

```bash
# Navigate to your project directory
cd ~/my-project

# Sync everything (commands + rules)
conflows sync

# Sync only commands
conflows sync --type commands

# Sync only rules
conflows sync --type rules

# Preview before syncing
conflows sync --dry-run

# Sync to specific IDEs
conflows sync --ides cursor,vscode
```

## Commands

### `init` - Initialize Central Directory

```bash
conflows init
```

Creates the central directory at `~/.conflows/`.

### `sync` - Distribute Commands and Rules

```bash
conflows sync [options]
```

**Options:**
- `--type <type>` - Sync type: `commands`, `rules`, or `all` (default: all)
- `--ides <ides>` - Specify target IDEs (comma-separated, default: cursor,windsurf,vscode)
- `--include <files>` - Additional files to include (comma-separated)
- `--exclude <files>` - Files to exclude (comma-separated)
- `--dry-run` - Preview without writing

**Examples:**

```bash
# Sync everything to all IDEs
conflows sync

# Sync only commands
conflows sync --type commands

# Sync only rules
conflows sync --type rules

# Preview sync
conflows sync --dry-run

# Sync to specific IDEs
conflows sync --ides cursor,vscode

# Exclude specific files
conflows sync --exclude old-file.mdc
```

### `list` - List All Commands and Rules

```bash
conflows list
```

Shows all commands and rules in the central directory with their sizes and modification dates.

## Usage Step

### Step 1: First-Time Setup

```bash
# 1. Initialize
conflows init

# 2. Create commands and rules
cd ~/.conflows/commands
vim code-review.mdc
vim refactor-helper.mdc

cd ~/.conflows/rules
vim typescript-style.mdc

# 3. Navigate to your project
cd ~/my-project

# 4. Sync everything
conflows sync
```

### Step 2: Update Workflows

```bash
# 1. Edit a command or rule
vim ~/.conflows/commands/code-review.mdc
vim ~/.conflows/rules/typescript-style.mdc

# 2. Sync to all your projects
cd ~/project-a && conflows sync
cd ~/project-b && conflows sync
```

### Step 3: New Project Setup

```bash
# Quick setup for a new project
cd ~/new-project
conflows sync
```

## How It Works

Conflows uses an **intermediate representation (IR)** to convert between different IDE formats:

```
Central Storage (.mdc) → Parse → IR → Serialize → Target IDE Format
```

**Central Storage Format**: Independent `.mdc` format (not tied to any specific IDE)
- YAML frontmatter with namespace-based IDE configurations
- Serves as the single source of truth
- Future-proof: Changes to IDE formats won't affect central storage

### File Format

Central storage uses `.mdc` (Markdown with Context) format:
- YAML frontmatter for IDE-specific configurations
- Markdown content for the actual command/rule
- Namespace-based config (cursor, windsurf, vscode)

### Supported IDEs

| IDE | Commands | Rules |
|-----|----------|-------|
| **Cursor** | `.cursor/commands/*.md` | `.cursor/rules/*.mdc` |
| **Windsurf** | `.windsurf/workflows/*.md` | `.windsurf/rules/*.md` |
| **VSCode** | `.github/prompts/*.prompt.md` | `.github/instructions/*.instructions.md` |

### Configuration Examples

**Command Config:**
```yaml
---
description: "Command description"

cursor:
  # Cursor commands don't need special config

windsurf:
  auto_execution_mode: 3  # 1=safe, 3=turbo

vscode:
  mode: agent  # agent | ask | edit
  model: "GPT-4.1"
  tools: ["edit", "search"]
---
```

**Rule Config:**
```yaml
---
description: "Rule description"

cursor:
  alwaysApply: true
  patterns: ["**/*.ts"]

windsurf:
  mode: always  # always | auto | specific | disabled
  patterns: ["**/*.ts"]

vscode:
  applyTo: "**/*.ts"  # glob pattern
---
```

## Documentation

- 📖 [Usage Guide](docs/USAGE.md) - Complete guide to creating and using commands/rules
- 📋 [Configuration Reference](docs/REFERENCE.md) - Full reference for all configuration fields
- 🛠️ [IDE Setup Guide](docs/IDE-SETUP.md) - Enable IntelliSense for .mdc files
- 📁 [Examples](examples/) - Sample command and rule files

## IDE IntelliSense

Get auto-completion and type checking for `.mdc` files by adding this line to the top:

```yaml
# yaml-language-server: $schema=https://raw.githubusercontent.com/PatrickSR/Conflows/main/schema/conflows-mdc.schema.json
```

See [IDE Setup Guide](docs/IDE-SETUP.md) for details.

## Development

```bash
# Install dependencies
bun install

# Development mode
bun run dev

# Build
bun run build

# Test
bun test
```

## License

MIT
