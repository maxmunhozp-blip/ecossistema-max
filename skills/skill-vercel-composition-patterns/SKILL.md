---
name: skill-vercel-composition-patterns
description: React composition patterns that scale. Use when refactoring components with boolean prop proliferation, building flexible component libraries, or designing reusable APIs. Triggers on compound components, render props, context providers, or component architecture. Source: vercel-labs/agent-skills on skills.sh
---

# React Composition Patterns

Composition patterns for building flexible, maintainable React components. Avoid boolean prop proliferation by using compound components, lifting state, and composing internals.

## Rule Categories

| Priority | Category | Impact |
|----------|----------|--------|
| 1 | Component Architecture | HIGH |
| 2 | State Management | MEDIUM |
| 3 | Implementation Patterns | MEDIUM |
| 4 | React 19 APIs | MEDIUM |

## Key Rules

### 1. Component Architecture (HIGH)
- **Avoid boolean props** — Don't add boolean props to customize behavior; use composition instead
  - ❌ `<Button isLarge isPrimary isLoading />`
  - ✅ `<Button variant="primary" size="lg"><Spinner />Loading...</Button>`
- **Compound components** — Structure complex components with shared context
  - Use React.createContext() to share state between parent and child components
  - Parent component manages state, children consume it

### 2. State Management (MEDIUM)
- **Decouple implementation** — Provider is the only place that knows how state is managed
- **Context interface** — Define generic interface with state, actions, meta for dependency injection
- **Lift state** — Move state into provider components for sibling access

### 3. Implementation Patterns (MEDIUM)
- **Explicit variants** — Create explicit variant components instead of boolean modes
  - ❌ `<Card isHighlighted />`
  - ✅ `<HighlightedCard />` or `<Card variant="highlighted" />`
- **Children over render props** — Use children for composition instead of renderX props

### 4. React 19 APIs (MEDIUM)
- Don't use `forwardRef`; pass refs as props directly
- Use `use()` instead of `useContext()`

## How to Apply

When you see a component with 3+ boolean props, suggest refactoring to compound component or variant pattern. Always prefer composition over configuration.
