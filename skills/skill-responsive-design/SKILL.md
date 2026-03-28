---
name: skill-responsive-design
description: Mobile-first responsive design patterns and best practices. Use when building responsive layouts, implementing breakpoints, or optimizing for different screen sizes. Triggers on mobile design, responsive grid, viewport, media queries. Source: skills.sh community
---

# Responsive Design Patterns

Mobile-first responsive design principles and implementation patterns.

## Core Philosophy: Mobile First

Always design for the smallest viewport first, then enhance for larger screens.

```css
/* Mobile first: base styles target mobile */
.container { padding: 16px; }

/* Enhance for tablet */
@media (min-width: 768px) { .container { padding: 24px; } }

/* Enhance for desktop */
@media (min-width: 1024px) { .container { padding: 32px; max-width: 1280px; margin: 0 auto; } }
```

## Standard Breakpoints

| Name | Width | Use Case |
|------|-------|----------|
| xs | 0px | Base/mobile |
| sm | 640px | Large phones, landscape |
| md | 768px | Tablets |
| lg | 1024px | Laptops |
| xl | 1280px | Desktops |
| 2xl | 1536px | Large screens |

## Layout Patterns

### 1. Responsive Grid
```css
.grid {
  display: grid;
  grid-template-columns: 1fr; /* 1 col mobile */
  gap: 16px;
}

@media (min-width: 640px) {
  .grid { grid-template-columns: repeat(2, 1fr); }
}

@media (min-width: 1024px) {
  .grid { grid-template-columns: repeat(3, 1fr); gap: 24px; }
}
```

### 2. Fluid Typography (clamp)
```css
h1 { font-size: clamp(2rem, 5vw, 4rem); }
p { font-size: clamp(0.875rem, 2vw, 1.125rem); }
```

### 3. Container with Padding
```css
.container {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding-inline: clamp(16px, 5vw, 48px);
}
```

### 4. Navigation Pattern
```css
/* Mobile: hamburger menu */
.nav-mobile { display: flex; }
.nav-desktop { display: none; }

@media (min-width: 768px) {
  .nav-mobile { display: none; }
  .nav-desktop { display: flex; }
}
```

### 5. Card Layout
```css
/* Stack on mobile, side-by-side on desktop */
.card-row {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

@media (min-width: 768px) {
  .card-row {
    flex-direction: row;
    align-items: flex-start;
  }
  .card-row .image { width: 40%; flex-shrink: 0; }
  .card-row .content { flex: 1; }
}
```

## CSS Custom Properties for Responsive Spacing
```css
:root {
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;
  --space-3xl: 64px;
}
```

## Touch-Friendly Interactions
- Touch targets: minimum 44x44px (Apple) or 48x48px (Google)
- Spacing between tappable elements: minimum 8px
- No hover-only interactions on mobile
- Support swipe gestures for carousels/drawers

## Performance for Mobile
- Lazy load images below the fold
- Responsive images with srcset
- Avoid large JS bundles (budget: < 150kb gzipped)
- Use system fonts when possible
- CSS animations > JS animations

## Testing Checklist
- [ ] Test at 320px (smallest iPhone SE)
- [ ] Test at 375px (iPhone 12/13/14)
- [ ] Test at 768px (iPad)
- [ ] Test at 1024px (iPad landscape)
- [ ] Test at 1440px (standard desktop)
- [ ] Test landscape orientation on mobile
- [ ] Test with browser zoom at 200%
