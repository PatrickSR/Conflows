# Conflow

**Con**text + Work**flow** - A centralized IDE workflow manager.

Conflow helps you manage and distribute AI-powered workflows across multiple IDEs (Cursor, Windsurf, etc.) from a single source of truth.

## Core Features

- **Centralized Management**: All workflows stored in `~/.conflow/` 
- **Zero Pollution**: No config files cluttering your project directories
- **IDE Agnostic**: Seamless conversion between IDE formats via adapters
- **Simple Distribution**: One command to sync workflows to your projects

## Quick Start

### 1. Initialize Central Directory

```bash
conflow init
```

This creates the `~/.conflow/` directory structure:
- `workflows/` - Store all your workflow markdown files here

### 2. Create Workflows

Create markdown files in `~/.conflow/workflows/`:

```bash
cd ~/.conflow/workflows
echo "# Code Review\n\nReview code changes..." > code-review.md
```

### 3. Distribute to Projects

```bash
# Navigate to your project directory
cd ~/my-project

# Sync all workflows
conflow sync

# Preview before syncing
conflow sync --dry-run

# Sync to specific IDEs only
conflow sync --ides cursor
```

## Commands

### `init` - Initialize Central Directory

```bash
conflow init
```

Creates the central directory at `~/.conflow/`.

### `sync` - Distribute Workflows

```bash
conflow sync [options]
```

**Options:**
- `--ides <ides>` - Specify target IDEs (comma-separated, default: cursor,windsurf)
- `--include <files>` - Additional files to include (comma-separated)
- `--exclude <files>` - Files to exclude (comma-separated)
- `--dry-run` - Preview without writing

**Examples:**

```bash
# Preview sync
conflow sync --dry-run

# Sync to Cursor only
conflow sync --ides cursor

# Exclude specific files
conflow sync --exclude old-workflow.md
```

### `list` - List All Workflows

```bash
conflow list
```

Shows all workflows in the central directory with their sizes and modification dates.

## Usage Scenarios

### Scenario 1: First-Time Setup

```bash
# 1. Initialize
conflow init

# 2. Create workflows
cd ~/.conflow/workflows
vim code-review.md
vim refactor-helper.md

# 3. Navigate to your project
cd ~/my-project

# 4. Sync workflows
conflow sync
```

### Scenario 2: Update Workflows

```bash
# 1. Edit a workflow
vim ~/.conflow/workflows/code-review.md

# 2. Sync to all your projects
cd ~/project-a && conflow sync
cd ~/project-b && conflow sync
```

### Scenario 3: New Project Setup

```bash
# Quick setup for a new project
cd ~/new-project
conflow sync
```

## How It Works

Conflow uses an **intermediate representation (IR)** to convert workflows between different IDE formats:

```
Central Storage (Cursor format) → IR → Target IDE Format
```

**Supported IDEs:**
- **Cursor**: Plain markdown format (`.cursor/commands/`)
- **Windsurf**: Markdown with YAML frontmatter (`.windsurf/workflows/`)

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
