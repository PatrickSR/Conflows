# Configuration Reference

Complete reference for all configuration fields in `.mdc` files.

## Table of Contents

- [File Structure](#file-structure)
- [Common Fields](#common-fields)
- [Commands Configuration](#commands-configuration)
- [Rules Configuration](#rules-configuration)
- [Output Formats](#output-formats)

## File Structure

```yaml
# yaml-language-server: $schema=<schema-url>
---
# Common fields
description: string
tags: string[]

# IDE-specific namespaces
cursor: { }
windsurf: { }
vscode: { }
---

# Markdown content
```

## Common Fields

Fields that apply to both commands and rules.

### description

**Type:** `string`  
**Required:** Recommended  
**Description:** Human-readable description of the command or rule

**Example:**
```yaml
description: "AI code review assistant"
```

### tags

**Type:** `string[]`  
**Required:** No  
**Description:** Tags for categorization (reserved for future features)

**Example:**
```yaml
tags: ["review", "quality", "typescript"]
```

**Note:** Tags are currently preserved but not used for filtering. Future versions will support tag-based commands like `conflows sync --tags review`.

## Commands Configuration

Configuration fields for commands (workflows/prompts).

### cursor (Commands)

Cursor commands use plain markdown format and don't require special configuration.

**Type:** `object`  
**Fields:** None currently defined  
**Example:**
```yaml
cursor:
  # No special fields needed for commands
```

### windsurf (Commands)

**Type:** `object`

#### windsurf.auto_execution_mode

**Type:** `1 | 3`  
**Description:** Execution mode for Windsurf

**Values:**
- `1` - Safe mode: More careful, asks for confirmation
- `3` - Turbo mode: Faster execution, fewer confirmations

**Example:**
```yaml
windsurf:
  auto_execution_mode: 3
```

### vscode (Commands)

**Type:** `object`

#### vscode.mode

**Type:** `'agent' | 'ask' | 'edit'`  
**Default:** `'agent'`  
**Description:** Command execution mode

**Values:**
- `agent` - AI acts autonomously with available tools
- `ask` - Interactive question and answer mode
- `edit` - Direct code editing mode

**Example:**
```yaml
vscode:
  mode: agent
```

#### vscode.model

**Type:** `string`  
**Description:** AI model to use for this command

**Examples:**
```yaml
vscode:
  model: "GPT-4.1"
  # or
  model: "Claude-3.5"
```

#### vscode.tools

**Type:** `string[]`  
**Default:** `[]`  
**Description:** Available tools the AI can use

**Available Tools:**
- `edit` - Edit files
- `search` - Search codebase  
- `run` - Execute commands
- `read` - Read files

**Example:**
```yaml
vscode:
  tools:
    - edit
    - search
```

### Complete Command Example

```yaml
# yaml-language-server: $schema=https://raw.githubusercontent.com/PatrickSR/Conflows/main/schema/conflows-mdc.schema.json
---
description: "Universal code review assistant"
tags: ["review", "quality"]

cursor:
  # Cursor uses default settings

windsurf:
  auto_execution_mode: 3

vscode:
  mode: agent
  model: "GPT-4.1"
  tools:
    - edit
    - search
---

# Code Review

Please review the code for:
1. Code quality and maintainability
2. Best practices adherence
3. Potential bugs and edge cases
```

## Rules Configuration

Configuration fields for rules (coding standards, guidelines).

### cursor (Rules)

**Type:** `object`

#### cursor.alwaysApply

**Type:** `boolean`  
**Default:** `false`  
**Description:** Whether to always apply this rule

**Example:**
```yaml
cursor:
  alwaysApply: true
```

#### cursor.patterns

**Type:** `string[]`  
**Description:** File patterns to match (glob format)

**Example:**
```yaml
cursor:
  patterns:
    - "**/*.ts"
    - "**/*.tsx"
```

### windsurf (Rules)

**Type:** `object`

#### windsurf.mode

**Type:** `'always' | 'auto' | 'specific' | 'disabled'`  
**Default:** `'auto'`  
**Description:** Rule application mode

**Values:**
- `always` - Always apply rule
- `auto` - Apply intelligently based on context
- `specific` - Apply only to files matching patterns
- `disabled` - Rule is disabled

**Example:**
```yaml
windsurf:
  mode: always
```

#### windsurf.patterns

**Type:** `string[]`  
**Description:** File patterns to match (glob format)

**Example:**
```yaml
windsurf:
  patterns:
    - "**/*.test.ts"
    - "**/*.spec.ts"
```

### vscode (Rules)

**Type:** `object`

#### vscode.applyTo

**Type:** `string`  
**Description:** File pattern to apply (glob format)

**Examples:**
```yaml
vscode:
  applyTo: "**/*.ts"
  # or
  applyTo: "**/*.{ts,tsx,js,jsx}"
  # or
  applyTo: "src/**/*.ts"
```

### Complete Rule Example

```yaml
# yaml-language-server: $schema=https://raw.githubusercontent.com/PatrickSR/Conflows/main/schema/conflows-mdc.schema.json
---
description: "TypeScript coding style guidelines"
tags: ["style", "typescript"]

cursor:
  alwaysApply: true
  patterns:
    - "**/*.ts"
    - "**/*.tsx"

windsurf:
  mode: always
  patterns:
    - "**/*.ts"
    - "**/*.tsx"

vscode:
  applyTo: "**/*.{ts,tsx}"
---

# TypeScript Style Guide

## Type Safety
- Avoid `any` type
- Use explicit return types
- Leverage union types

## Code Organization
- One component per file
- Group related files
- Keep files under 300 lines
```

## Output Formats

How `.mdc` files are converted to each IDE's format.

### Cursor

**Commands:**
- Location: `.cursor/commands/`
- Extension: `.md`
- Format: Plain Markdown (no frontmatter)
- Content: Only the markdown content is written

**Rules:**
- Location: `.cursor/rules/`
- Extension: `.mdc`
- Format: YAML frontmatter + Markdown
- Frontmatter: `alwaysApply`, `patterns`

### Windsurf

**Commands:**
- Location: `.windsurf/workflows/`
- Extension: `.md`
- Format: YAML frontmatter + Markdown
- Frontmatter: `description`, `auto_execution_mode`

**Rules:**
- Location: `.windsurf/rules/`
- Extension: `.md`
- Format: YAML frontmatter + Markdown
- Frontmatter: `description`, `mode`, `patterns`

### VSCode

**Commands:**
- Location: `.github/prompts/`
- Extension: `.prompt.md`
- Format: YAML frontmatter + Markdown
- Frontmatter: `mode`, `description`, `model`, `tools`

**Rules:**
- Location: `.github/instructions/`
- Extension: `.instructions.md`
- Format: YAML frontmatter + Markdown
- Frontmatter: `applyTo`, `description`

## Glob Patterns

Pattern matching syntax used in `patterns` and `applyTo` fields.

### Basic Patterns

```yaml
"*.ts"           # All .ts files in current directory
"**/*.ts"        # All .ts files recursively
"src/*.ts"       # All .ts files in src/
"src/**/*.ts"    # All .ts files under src/ recursively
```

### Multiple Extensions

```yaml
"**/*.{ts,tsx}"          # TypeScript files
"**/*.{js,jsx,ts,tsx}"   # All JavaScript and TypeScript files
"**/*.{test,spec}.ts"    # Test files
```

### Exclusions

Note: Exclusion patterns are not supported in current version. Use file-level inclusion patterns instead.

## IDE-Specific Notes

### Cursor
- Commands are stored as plain Markdown without any metadata
- Rules support frontmatter with `alwaysApply` and `patterns`
- The most minimal configuration among all IDEs

### Windsurf
- All files use frontmatter
- Commands support execution modes (safe vs turbo)
- Rules support four application modes

### VSCode
- Uses special file extensions (`.prompt.md`, `.instructions.md`)
- Commands stored in `.github/prompts/` (not `.vscode/prompts/`)
- Rules stored in `.github/instructions/`
- Most configuration options for commands

## Extensibility

All namespace objects (`cursor`, `windsurf`, `vscode`) support additional custom fields through `additionalProperties: true` in the schema. This allows for future extensions without breaking existing files.

**Example:**
```yaml
vscode:
  mode: agent
  customField: "value"  # Will be preserved but not used
```

Custom fields are:
- ✅ Parsed and preserved
- ✅ Written back when converting
- ❌ Not validated
- ❌ Not used by current IDE adapters

## See Also

- [Usage Guide](./USAGE.md) - How to create and use commands/rules
- [IDE Setup](./IDE-SETUP.md) - Enable IntelliSense
- [Examples](../examples/) - Sample files
