import { defineRule } from '@cursor-io/rules';

export default defineRule({
  name: 'cursor_rules_location',
  description: 'Enforces that Cursor rules are located in the .cursor/rules directory',
  validate: (context) => {
    const ruleLocation = context.file.path;
    if (!ruleLocation.startsWith('.cursor/rules/')) {
      return {
        valid: false,
        message: 'Cursor rules must be located in the .cursor/rules directory'
      };
    }
    return { valid: true };
  }
}); 