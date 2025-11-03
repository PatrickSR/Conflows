# IDE Setup Guide

This guide helps you configure your IDE for the best experience when editing `.mdc` files.

## Enable IntelliSense for .mdc Files

### Prerequisites

Install the YAML extension for your IDE:

**VSCode:**
```bash
code --install-extension redhat.vscode-yaml
```

**Cursor:**
```bash
cursor --install-extension redhat.vscode-yaml
```

**Windsurf:**
```bash
windsurf --install-extension redhat.vscode-yaml
```

Or search for "YAML" in your IDE's extension marketplace and install the Red Hat YAML extension.

## Configuration Method: Schema Comment (Recommended)

The simplest and most reliable method is to add a schema comment at the top of each `.mdc` file:

```yaml
# yaml-language-server: $schema=https://raw.githubusercontent.com/PatrickSR/Conflows/main/schema/conflows-mdc.schema.json
---
description: "Your description"
# ... rest of your configuration
---

Your content here...
```

**Advantages:**
- ✅ Works immediately, no configuration needed
- ✅ Portable across different machines
- ✅ Included in example files
- ✅ Works in any IDE with YAML extension

**Usage:**
Simply copy this line to the top of your `.mdc` files:
```
# yaml-language-server: $schema=https://raw.githubusercontent.com/PatrickSR/Conflows/main/schema/conflows-mdc.schema.json
```

## What You Get

Once configured, editing `.mdc` files will provide:

### 1. Field Auto-Completion
Type a few characters and get suggestions:
```yaml
des|    # Suggests: description
cur|    # Suggests: cursor
```

### 2. Inline Documentation
Hover over fields to see descriptions:
```yaml
description: "..."  # Shows: "Description of the command or rule"
```

### 3. Type Checking
Invalid values are highlighted:
```yaml
vscode:
  mode: invalid  # ⚠️ Error: Must be 'agent', 'ask', or 'edit'
```

### 4. Enum Value Suggestions
Get a list of valid values:
```yaml
vscode:
  mode: |  # Suggests: agent, ask, edit
```

### 5. Pattern Examples
See example patterns for fields:
```yaml
vscode:
  applyTo: |  # Shows examples: **/*.ts, **/*.{ts,tsx}, src/**/*.js
```

## Troubleshooting

### IntelliSense Not Working?

1. **Check YAML extension is installed**
   - Open Extensions panel
   - Search for "YAML"
   - Ensure Red Hat's YAML extension is installed and enabled

2. **Verify schema comment is correct**
   - Must be on the first line
   - Must start with `# yaml-language-server: $schema=`
   - URL must be exact (including https://)

3. **Reload the window**
   - VSCode/Cursor: Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows)
   - Type "Reload Window"
   - Press Enter

4. **Check file is recognized as YAML**
   - Look at the language mode in the status bar (bottom right)
   - Should show "YAML" or "Markdown"
   - If not, click it and select "YAML" from the list

### Schema Not Found Error?

The schema URL points to GitHub. If you see a "schema not found" error:

1. **Check internet connection**
   - The IDE needs to download the schema from GitHub
   
2. **Use local schema (offline alternative)**
   - If you installed conflows via npm:
   ```yaml
   # yaml-language-server: $schema=../node_modules/conflows/schema/conflows-mdc.schema.json
   ```

3. **Wait for GitHub to update**
   - If the schema was just added, GitHub's CDN may take a few minutes to update

## Additional Tips

### Syntax Highlighting

For better syntax highlighting in Markdown sections, some IDEs can treat `.mdc` files as Markdown:

**VSCode/Cursor/Windsurf settings:**
```json
{
  "files.associations": {
    "*.mdc": "markdown"
  }
}
```

This enables Markdown syntax highlighting in the content section while keeping YAML IntelliSense in the frontmatter.

### Snippets

You can create custom snippets for faster `.mdc` file creation. See your IDE's documentation for snippet creation.

## Need Help?

If you're still having issues, please:
1. Check that you're using the latest version of the YAML extension
2. Open an issue on GitHub with your IDE version and error message
