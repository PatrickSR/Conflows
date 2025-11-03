# Conflows Examples

This directory contains example `.mdc` files demonstrating various configurations and use cases.

## Directory Structure

```
examples/
├── commands/          # Command examples
│   ├── simple-command.mdc
│   └── multi-ide-command.mdc
└── rules/            # Rule examples
    ├── simple-rule.mdc
    └── multi-ide-rule.mdc
```

## Using These Examples

### Copy to Your Central Directory

```bash
# Copy commands
cp examples/commands/*.mdc ~/.conflows/commands/

# Copy rules
cp examples/rules/*.mdc ~/.conflows/rules/

# Sync to your project
cd /path/to/your/project
conflows sync
```

### Customize for Your Needs

1. Open the `.mdc` files in your favorite editor (VSCode, Cursor, or Windsurf)
2. The schema comment at the top enables IntelliSense
3. Modify the configuration and content as needed
4. Save and sync to your projects

## Example Descriptions

### Commands

**simple-command.mdc**
- Minimal command with no IDE-specific configuration
- Good starting point for basic commands

**multi-ide-command.mdc**
- Demonstrates IDE-specific configurations
- Includes Windsurf turbo mode and VSCode tools
- Shows how to organize complex commands

### Rules

**simple-rule.mdc**
- Basic rule without IDE-specific settings
- Applies to all files

**multi-ide-rule.mdc**
- TypeScript style guide with IDE-specific patterns
- Demonstrates file pattern matching
- Shows different rule application modes

## Schema IntelliSense

All example files include the schema comment:

```yaml
# yaml-language-server: $schema=https://raw.githubusercontent.com/PatrickSR/Conflows/main/schema/conflows-mdc.schema.json
```

This enables:
- ✅ Field auto-completion
- ✅ Type checking
- ✅ Inline documentation
- ✅ Enum value suggestions

Make sure you have the YAML extension installed in your IDE.

## Creating Your Own

When creating new `.mdc` files, always include the schema comment at the top for the best editing experience.
