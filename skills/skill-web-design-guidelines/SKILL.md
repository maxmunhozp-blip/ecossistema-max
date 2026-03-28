---
name: skill-web-design-guidelines
description: Review UI code for Web Interface Guidelines compliance. Use when asked to review UI, check accessibility, audit design, review UX, or check a site against best practices. Source: vercel-labs/agent-skills on skills.sh
---

# Web Interface Guidelines

Review files for compliance with Web Interface Guidelines.

## How It Works

1. Fetch the latest guidelines from the source URL below
2. Read the specified files (or prompt user for files/pattern)
3. Check against all rules in the fetched guidelines
4. Output findings in the terse `file:line` format

## Guidelines Source

Fetch fresh guidelines before each review:
```
https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md
```

Use WebFetch to retrieve the latest rules. The fetched content contains all the rules and output format instructions.

## Core Principles (Quick Reference)

### Visual Hierarchy
- Use consistent spacing scale (4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px)
- Typography scale: body 14-16px, heading 20-32px, display 40px+
- Contrast ratio min 4.5:1 for body text, 3:1 for large text

### Layout & Composition
- Max content width 1280px, comfortable reading width 65-75ch
- Grid: 12-column for desktop, 4-column for mobile
- Generous whitespace — content should breathe

### Color & Theming
- Define CSS custom properties for all colors
- Support both light and dark modes
- Limit primary palette to 2-3 colors + neutrals

### Interactivity
- All interactive elements must have visible focus states
- Touch targets min 44x44px
- Hover states on all clickable elements
- Loading states for async actions

### Performance
- Images must have width/height to prevent layout shift
- Lazy load images below the fold
- Preload critical fonts

### Accessibility (WCAG 2.2)
- All images need alt text
- Form inputs need labels
- Sufficient color contrast
- Keyboard navigable
- Screen reader compatible

## Usage
When reviewing UI code, fetch guidelines from source URL above, then audit the specified files and report issues as `file:line: rule-description`.
