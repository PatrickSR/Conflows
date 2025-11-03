# Conflows

[![NPM Version](https://img.shields.io/npm/v/conflows)](https://www.npmjs.com/package/conflows)
[![Test](https://github.com/PatrickSR/sync-workflow-cli/actions/workflows/test.yml/badge.svg)](https://github.com/PatrickSR/sync-workflow-cli/actions/workflows/test.yml)
[![License](https://img.shields.io/npm/l/conflows)](./LICENSE)

**Con**text + Work**flow**s - A centralized IDE workflow manager.

Conflows helps you manage and distribute AI-powered workflows across multiple IDEs (Cursor, Windsurf, etc.) from a single source of truth.

## Core Features

- **Centralized Management**: All workflows stored in `~/.conflows/` 
- **Zero Pollution**: No config files cluttering your project directories
- **IDE Agnostic**: Seamless conversion between IDE formats via adapters
- **Simple Distribution**: One command to sync workflows to your projects

## Quick Start

### 1. Initialize Central Directory

```bash
conflows init
```

This creates the `~/.conflows/` directory structure:
- `workflows/` - Store all your workflow markdown files here

### 2. Create Workflows

Create markdown files in `~/.conflows/workflows/`:

```bash
cd ~/.conflows/workflows
echo "# Code Review\n\nReview code changes..." > code-review.md
```

### 3. Distribute to Projects

```bash
# Navigate to your project directory
cd ~/my-project

# Sync all workflows
conflows sync

# Preview before syncing
conflows sync --dry-run

# Sync to specific IDEs only
conflows sync --ides cursor
```

## Commands

### `init` - Initialize Central Directory

```bash
conflows init
```

Creates the central directory at `~/.conflows/`.

### `sync` - Distribute Workflows

```bash
conflows sync [options]
```

**Options:**
- `--ides <ides>` - Specify target IDEs (comma-separated, default: cursor,windsurf)
- `--include <files>` - Additional files to include (comma-separated)
- `--exclude <files>` - Files to exclude (comma-separated)
- `--dry-run` - Preview without writing

**Examples:**

```bash
# Preview sync
conflows sync --dry-run

# Sync to Cursor only
conflows sync --ides cursor

# Exclude specific files
conflows sync --exclude old-workflow.md
```

### `list` - List All Workflows

```bash
conflows list
```

Shows all workflows in the central directory with their sizes and modification dates.

## Usage Step

### Step 1: First-Time Setup

```bash
# 1. Initialize
conflows init

# 2. Create workflows
cd ~/.conflows/workflows
vim code-review.md
vim refactor-helper.md

# 3. Navigate to your project
cd ~/my-project

# 4. Sync workflows
conflows sync
```

### Step 2: Update Workflows

```bash
# 1. Edit a workflow
vim ~/.conflows/workflows/code-review.md

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

Conflows uses an **intermediate representation (IR)** to convert workflows between different IDE formats:

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
