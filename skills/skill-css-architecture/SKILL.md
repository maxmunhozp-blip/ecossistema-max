---
name: skill-css-architecture
description: CSS architecture patterns and best practices for maintainable stylesheets. Use when organizing CSS, setting up design tokens, implementing BEM, CSS Modules, or CSS-in-JS. Triggers on CSS organization, design tokens, variables, naming conventions, scalable CSS. Source: skills.sh community
---

# CSS Architecture

Patterns for writing scalable, maintainable CSS.

## CSS Custom Properties (Design Tokens)

Define all design decisions as CSS variables at the root level:

```css
:root {
  /* Color Palette */
  --color-primary-50: #eff6ff;
  --color-primary-500: #3b82f6;
  --color-primary-900: #1e3a8a;

  /* Semantic Colors */
  --color-bg: #ffffff;
  --color-surface: #f8fafc;
  --color-text: #0f172a;
  --color-text-muted: #64748b;
  --color-border: #e2e8f0;
  --color-accent: #3b82f6;

  /* Typography */
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-4xl: 2.25rem;

  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  --space-12: 48px;
  --space-16: 64px;

  /* Borders */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.07);
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
  --shadow-xl: 0 20px 25px rgba(0,0,0,0.1);

  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-base: 200ms ease;
  --transition-slow: 300ms ease;

  /* Z-Index Scale */
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-modal: 300;
  --z-toast: 400;
}

/* Dark Mode */
.dark, [data-theme="dark"] {
  --color-bg: #0f172a;
  --color-surface: #1e293b;
  --color-text: #f1f5f9;
  --color-text-muted: #94a3b8;
  --color-border: #334155;
}
```

## BEM Naming Convention

Block__Element--Modifier:

```css
/* Block */
.card {}

/* Elements */
.card__header {}
.card__body {}
.card__footer {}
.card__title {}
.card__image {}

/* Modifiers */
.card--featured {}
.card--compact {}
.card--dark {}

/* State (use is-/has- prefix) */
.card.is-active {}
.card.is-loading {}
.card.has-error {}
```

## CSS Layers (Modern Architecture)

```css
@layer reset, tokens, base, components, utilities, overrides;

@layer reset {
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
}

@layer tokens {
  :root { /* CSS custom properties */ }
}

@layer base {
  body { font-family: var(--font-sans); color: var(--color-text); }
  h1, h2, h3, h4, h5, h6 { line-height: 1.2; font-weight: 700; }
}

@layer components {
  .btn { /* button base styles */ }
  .card { /* card base styles */ }
}

@layer utilities {
  .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0); }
  .truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
}
```

## Container Pattern

```css
.container {
  width: 100%;
  max-width: var(--max-width, 1280px);
  margin-inline: auto;
  padding-inline: clamp(var(--space-4), 5vw, var(--space-12));
}
```

## Component Architecture

```css
/* Each component in its own file */
/* components/button.css */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: var(--text-sm);
  cursor: pointer;
  border: none;
  transition: background var(--transition-fast), transform var(--transition-fast);
}

.btn:active { transform: scale(0.97); }
.btn:disabled { opacity: 0.5; cursor: not-allowed; pointer-events: none; }

/* Variants */
.btn--primary { background: var(--color-accent); color: white; }
.btn--primary:hover { filter: brightness(1.1); }
.btn--outline { background: transparent; border: 1px solid var(--color-border); color: var(--color-text); }
.btn--ghost { background: transparent; color: var(--color-text-muted); }
.btn--ghost:hover { background: var(--color-surface); }

/* Sizes */
.btn--sm { padding: var(--space-1) var(--space-3); font-size: var(--text-xs); }
.btn--lg { padding: var(--space-3) var(--space-6); font-size: var(--text-base); }
```

## Anti-patterns to Avoid
- ❌ `!important` (signals specificity problems)
- ❌ IDs in selectors (too specific)
- ❌ Deep nesting > 3 levels
- ❌ Global classes like `.red`, `.big`
- ❌ Magic numbers without comments
- ❌ Inline styles for theming
