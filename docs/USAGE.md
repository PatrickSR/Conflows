# Conflows Usage Guide

Complete guide to using Conflows for managing IDE commands and rules.

## Table of Contents

- [Quick Start](#quick-start)
- [Central Storage Format](#central-storage-format)
- [Creating Commands](#creating-commands)
- [Creating Rules](#creating-rules)
- [Syncing to Projects](#syncing-to-projects)
- [Best Practices](#best-practices)

## Quick Start

### 1. Initialize

```bash
conflows init
```

This creates:
- `~/.conflows/commands/` - Store command files
- `~/.conflows/rules/` - Store rule files

### 2. Create Your First Command

Create `~/.conflows/commands/code-review.mdc`:

```yaml
# yaml-language-server: $schema=https://raw.githubusercontent.com/PatrickSR/Conflows/main/schema/conflows-mdc.schema.json
---
description: "AI code review assistant"
---

# Code Review

Please review the code for:
- Quality and maintainability
- Best practices
- Potential bugs
```

### 3. Sync to Your Project

```bash
cd /path/to/your/project
conflows sync
```

Your command is now available in:
- Cursor: `.cursor/commands/code-review.md`
- Windsurf: `.windsurf/workflows/code-review.md`
- VSCode: `.github/prompts/code-review.prompt.md`

## Central Storage Format

### The .mdc Format

Conflows uses `.mdc` (Markdown with Context) format for central storage:

```yaml
# yaml-language-server: $schema=<schema-url>
---
# YAML frontmatter with configuration
description: "..."
tags: ["..."]

cursor:
  # Cursor-specific config

windsurf:
  # Windsurf-specific config

vscode:
  # VSCode-specific config
---

# Markdown content
Your actual command or rule content here...
```

### Key Concepts

**Independent Format**
- Central storage is independent of any IDE
- Each IDE has its own adapter
- Changes to IDE formats don't affect your central files

**Namespace-Based Config**
- `cursor:` - Configuration for Cursor IDE
- `windsurf:` - Configuration for Windsurf IDE
- `vscode:` - Configuration for VSCode

**Optional Namespaces**
- Include only the IDEs you use
- Omit namespaces that don't need special configuration

## Creating Commands

### Minimal Command

```yaml
# yaml-language-server: $schema=https://raw.githubusercontent.com/PatrickSR/Conflows/main/schema/conflows-mdc.schema.json
---
description: "Simple helper"
---

Help me with this task.
```

### Cursor Command

Cursor commands don't need special configuration:

```yaml
---
description: "Cursor command"

cursor:
  # No special fields needed
---

Command content...
```

### Windsurf Command

Configure execution mode:

```yaml
---
description: "Fast refactoring"

windsurf:
  auto_execution_mode: 3  # Options: 1 (safe) or 3 (turbo)
---

Refactor this code...
```

**Execution Modes:**
- `1` = Safe mode - More careful, asks for confirmation
- `3` = Turbo mode - Faster execution, fewer confirmations

### VSCode Command

Configure mode, model, and tools:

```yaml
---
description: "AI code assistant"

vscode:
  mode: agent       # Options: agent, ask, edit
  model: "GPT-4.1"  # Model name
  tools:            # Available tools
    - edit
    - search
---

Your command...
```

**Mode Options:**
- `agent` - AI acts autonomously with tools
- `ask` - Interactive Q&A mode
- `edit` - Direct code editing mode

**Available Tools:**
- `edit` - Edit files
- `search` - Search codebase
- `run` - Execute commands
- `read` - Read files

### Multi-IDE Command

Combine configurations for all IDEs:

```yaml
---
description: "Universal code review"
tags: ["review", "quality"]

cursor:
  # Cursor uses default settings

windsurf:
  auto_execution_mode: 3

vscode:
  mode: agent
  model: "GPT-4.1"
  tools: ["edit", "search"]
---

# Code Review

Review for quality, bugs, and best practices.
```

## Creating Rules

### Minimal Rule

```yaml
# yaml-language-server: $schema=https://raw.githubusercontent.com/PatrickSR/Conflows/main/schema/conflows-mdc.schema.json
---
description: "Basic standards"
---

Follow the project's coding standards.
```

### Cursor Rule

```yaml
---
description: "TypeScript rules"

cursor:
  alwaysApply: true           # Always apply this rule
  patterns:                    # File patterns (optional)
    - "**/*.ts"
    - "**/*.tsx"
---

Use TypeScript for all new files.
```

### Windsurf Rule

```yaml
---
description: "Testing standards"

windsurf:
  mode: always     # Options: always, auto, specific, disabled
  patterns:
    - "**/*.test.ts"
    - "**/*.spec.ts"
---

Write unit tests for business logic.
```

**Mode Options:**
- `always` - Always apply rule
- `auto` - Apply intelligently based on context
- `specific` - Apply only to files matching patterns
- `disabled` - Rule is disabled

### VSCode Rule

```yaml
---
description: "Style guide"

vscode:
  applyTo: "**/*.{ts,tsx}"  # Glob pattern
---

Follow TypeScript style guide.
```

### Multi-IDE Rule

```yaml
---
description: "Comprehensive TypeScript guide"
tags: ["typescript", "style"]

cursor:
  alwaysApply: true
  patterns: ["**/*.ts", "**/*.tsx"]

windsurf:
  mode: always
  patterns: ["**/*.ts", "**/*.tsx"]

vscode:
  applyTo: "**/*.{ts,tsx}"
---

# TypeScript Style Guide

- Use const over let
- Add JSDoc for public APIs
- Prefer explicit types
```

## Syncing to Projects

### Basic Sync

Sync everything to all detected IDEs:

```bash
conflows sync
```

### Sync Specific Type

Sync only commands or rules:

```bash
# Commands only
conflows sync --type commands

# Rules only
conflows sync --type rules

# Everything (default)
conflows sync --type all
```

### Sync to Specific IDEs

```bash
# Single IDE
conflows sync --ides cursor

# Multiple IDEs
conflows sync --ides cursor,vscode

# All three
conflows sync --ides cursor,windsurf,vscode
```

### Include/Exclude Files

```bash
# Include additional files
conflows sync --include extra-command.mdc

# Exclude specific files
conflows sync --exclude old-command.mdc

# Combine both
conflows sync --include new.mdc --exclude old.mdc
```

### Dry Run

Preview changes without writing:

```bash
conflows sync --dry-run
```

This shows what would be synced without creating any files.

## Best Practices

### Naming Conventions

**Commands:**
- Use descriptive names: `code-review.mdc`, `refactor-helper.mdc`
- Use kebab-case for filenames
- Avoid special characters

**Rules:**
- Indicate scope: `typescript-style.mdc`, `testing-standards.mdc`
- Use specific names over generic ones

### Organization

**By Purpose:**
```
~/.conflows/
├── commands/
│   ├── code-review.mdc
│   ├── refactor-assistant.mdc
│   └── debug-helper.mdc
└── rules/
    ├── typescript-style.mdc
    ├── testing-standards.mdc
    └── documentation-guide.mdc
```

**Keep It Simple:**
- Start with a few essential commands/rules
- Add more as needed
- Remove unused files

### Multi-IDE Strategy

**Option 1: Universal Content**
- Write content that works in all IDEs
- Use minimal IDE-specific config
- Best for general-purpose commands

**Option 2: IDE-Specific Optimization**
- Leverage each IDE's unique features
- Add detailed IDE-specific configuration
- Best for power users

### Content Guidelines

**Be Specific:**
```yaml
# ❌ Vague
---
description: "Helper"
---
Help me.

# ✅ Clear
---
description: "Code review assistant"
---
Review code for quality, bugs, and best practices.
Provide specific, actionable feedback.
```

**Provide Context:**
- Explain what the command/rule does
- Include examples when helpful
- Mention important constraints

**Keep It Concise:**
- Focus on essential information
- Break complex commands into smaller ones
- Use bullet points for clarity

### Version Control

**Track Your Central Directory:**
```bash
cd ~/.conflows
git init
git add .
git commit -m "Initial conflows setup"
```

**Benefits:**
- Version history for your commands/rules
- Easy backup and restore
- Share configurations across teams

**Gitignore in Projects:**
```gitignore
# In your project's .gitignore
.cursor/
.windsurf/
.vscode/prompts/
.github/instructions/
```

These are generated files and shouldn't be committed.

### Team Collaboration

**Share Central Configs:**
1. Create a team repository for central configs
2. Each team member clones to `~/.conflows/`
3. Pull updates regularly
4. Contribute improvements back

**Example Workflow:**
```bash
# Initial setup
git clone git@github.com:your-team/conflows-config.git ~/.conflows

# Get updates
cd ~/.conflows
git pull

# Contribute changes
git add .
git commit -m "Add new review command"
git push
```

### Maintenance

**Regular Review:**
- Periodically review your commands/rules
- Remove outdated ones
- Update descriptions and content

**Test Before Syncing:**
- Use `--dry-run` to preview changes
- Test new commands in one project first
- Verify IDE-specific features work

## Need More Help?

- [Configuration Reference](./REFERENCE.md) - Complete field reference
- [IDE Setup Guide](./IDE-SETUP.md) - Enable IntelliSense
- [Examples](../examples/) - Sample files
- [GitHub Issues](https://github.com/PatrickSR/Conflows/issues) - Report problems or ask questions
