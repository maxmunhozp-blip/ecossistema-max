---
name: skill-tailwind-design-system
description: Tailwind CSS design system patterns and best practices. Use when building UI with Tailwind CSS, creating component libraries, or setting up design tokens with Tailwind. Triggers on Tailwind components, utility classes, design tokens, dark mode implementation. Source: wshobson/agents on skills.sh
---

# Tailwind Design System

Patterns and best practices for building maintainable, scalable design systems with Tailwind CSS.

## Core Principles

### 1. Design Tokens via tailwind.config
Always extend the default theme, never replace it:
```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        }
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      }
    }
  }
}
```

### 2. Component Composition
Use `@apply` sparingly — prefer component extraction over utility abstraction:
```css
/* ❌ Avoid — overly abstract */
.btn { @apply px-4 py-2 rounded font-medium; }

/* ✅ Prefer — use Tailwind directly in components */
<button class="px-4 py-2 rounded font-medium bg-blue-500 text-white">
```

### 3. Dark Mode
Use `class` strategy for user-controlled dark mode:
```js
// tailwind.config.js
module.exports = { darkMode: 'class' }
```
```html
<div class="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
```

### 4. Responsive Design (Mobile First)
- Default = mobile
- `sm:` = 640px+
- `md:` = 768px+
- `lg:` = 1024px+
- `xl:` = 1280px+

```html
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
```

### 5. Component Patterns

**Card:**
```html
<div class="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm hover:shadow-md transition-shadow">
```

**Button Variants:**
```html
<!-- Primary -->
<button class="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-colors">

<!-- Outline -->
<button class="px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors">

<!-- Ghost -->
<button class="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
```

**Badge:**
```html
<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
```

### 6. Animation Utilities
```html
<!-- Fade in -->
<div class="animate-fade-in">

<!-- Pulse loading skeleton -->
<div class="animate-pulse bg-gray-200 dark:bg-gray-700 rounded">
```

### 7. Typography Scale
```html
<h1 class="text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
<h2 class="text-2xl lg:text-3xl font-semibold text-gray-900 dark:text-white">
<p class="text-base leading-7 text-gray-600 dark:text-gray-400">
<span class="text-sm text-gray-500 dark:text-gray-500">
```

## Anti-patterns to Avoid
- `!important` overrides
- Arbitrary values without reason `[#ff0000]` — use design tokens instead
- Mixing Tailwind with conflicting CSS frameworks
- Purge config that removes needed classes in production
