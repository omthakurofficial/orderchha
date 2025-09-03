# VS Code Tailwind CSS Configuration

This project uses Tailwind CSS for styling. The CSS files contain Tailwind directives like `@tailwind` and `@apply` which are valid Tailwind syntax but may show as warnings in the CSS linter.

## Configuration Applied:

1. **VS Code Settings** (`.vscode/settings.json`):
   - Disabled default CSS validation 
   - Configured Tailwind CSS IntelliSense
   - Added support for Tailwind in React files

2. **PostCSS Configuration** (`postcss.config.mjs`):
   - Tailwind CSS processing
   - Autoprefixer for browser compatibility

## Tailwind Directives Used:

- `@tailwind base` - Tailwind's base styles
- `@tailwind components` - Component classes  
- `@tailwind utilities` - Utility classes
- `@apply` - Apply utility classes to custom CSS

These are valid Tailwind CSS directives and should not be treated as errors.
