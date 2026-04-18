@AGENTS.md

## Response Style
- Be concise. Skip preambles ("Okay, I can help with that") and summaries.
- If a fix is small, provide only the affected code block or a git diff.
- Use "Thinking" only for complex logic or debugging; skip for routine tasks.
- If unsure of the tech stack, check `package.json`, `requirements.txt`, or `Go.mod`.

## Coding Standards
- Prioritize readability and standard patterns for the detected language.
- Keep functions small and focused.
- Maintain existing naming conventions and directory structure.
- Add comments only for non-obvious logic.

## Command Execution
- Always check the current directory before suggesting file paths.
- Suggest one-liner commands where possible.
- Use `ls`, `grep`, or `find` to explore the codebase if context is missing.

## Token Management
- When asked to `/compact`, prioritize the "Current Task" and "Last Known State."
- Reference files by `@filename` to pull them into context only when needed.

# SYSTEM: MAX_EFFICIENCY
## RESPONSE RULES
- NO preambles, NO intros, NO conversational filler.
- Code-only responses for implementation. 
- Use Git Diffs for updates; never rewrite entire files.
- If logic is obvious, skip "Thinking" tokens. Max 2 sentences for explanations.
- ENFORCE MODULARITY: Extract logic into reusable, single-responsibility components/functions.

## BEHAVIOR
- Auto-detect stack via manifest files (package.json, etc.).
- Use `ls -R` to map structure before asking for context.
- Reference files via @filename only when active.
- Prioritize current task state during `/compact`.

## CODE STYLE
- Match existing project patterns exactly.
- Prefer small, composable modules over monolithic files.
- No comments unless logic is non-standard.
- Minimal dependencies; use built-ins first.