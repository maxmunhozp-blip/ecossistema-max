---
name: skill-vercel-react-best-practices
description: React and Next.js performance optimization guidelines from Vercel Engineering. Use when writing, reviewing, or refactoring React/Next.js code. Triggers on tasks involving React components, Next.js pages, data fetching, bundle optimization, or performance improvements. Source: vercel-labs/agent-skills on skills.sh
---

# Vercel React Best Practices

Comprehensive performance optimization guide for React and Next.js applications, maintained by Vercel. Contains 64 rules across 8 categories, prioritized by impact.

## Rule Categories by Priority

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | Eliminating Waterfalls | CRITICAL | `async-` |
| 2 | Bundle Size Optimization | CRITICAL | `bundle-` |
| 3 | Server-Side Performance | HIGH | `server-` |
| 4 | Client-Side Data Fetching | MEDIUM-HIGH | `client-` |
| 5 | Re-render Optimization | MEDIUM | `rerender-` |
| 6 | Rendering Performance | MEDIUM | `rendering-` |
| 7 | JavaScript Performance | LOW-MEDIUM | `js-` |
| 8 | Advanced Patterns | LOW | `advanced-` |

## Quick Reference

### 1. Eliminating Waterfalls (CRITICAL)
- `async-defer-await` - Move await into branches where actually used
- `async-parallel` - Use Promise.all() for independent operations
- `async-suspense-boundaries` - Use Suspense to stream content

### 2. Bundle Size Optimization (CRITICAL)
- `bundle-barrel-imports` - Import directly, avoid barrel files
- `bundle-dynamic-imports` - Use next/dynamic for heavy components
- `bundle-preload` - Preload on hover/focus for perceived speed

### 3. Server-Side Performance (HIGH)
- `server-cache-react` - Use React.cache() for per-request deduplication
- `server-parallel-fetching` - Restructure components to parallelize fetches
- `server-after-nonblocking` - Use after() for non-blocking operations

### 4. Client-Side Data Fetching (MEDIUM-HIGH)
- `client-swr-dedup` - Use SWR for automatic request deduplication
- `client-passive-event-listeners` - Use passive listeners for scroll

### 5. Re-render Optimization (MEDIUM)
- `rerender-memo` - Extract expensive work into memoized components
- `rerender-derived-state` - Subscribe to derived booleans, not raw values
- `rerender-no-inline-components` - Don't define components inside components

### 6. Rendering Performance (MEDIUM)
- `rendering-content-visibility` - Use content-visibility for long lists
- `rendering-hydration-suppress-warning` - Suppress expected mismatches
- `rendering-conditional-render` - Use ternary, not && for conditionals

### 7. JavaScript Performance (LOW-MEDIUM)
- `js-index-maps` - Build Map for repeated lookups
- `js-early-exit` - Return early from functions
- `js-set-map-lookups` - Use Set/Map for O(1) lookups

### 8. Advanced Patterns (LOW)
- `advanced-event-handler-refs` - Store event handlers in refs
- `advanced-init-once` - Initialize app once per app load

## Usage
Apply these rules when generating, reviewing, or refactoring React/Next.js code. Prioritize CRITICAL rules first, then work down by priority.
