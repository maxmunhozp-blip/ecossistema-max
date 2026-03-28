---
name: skill-animation-patterns
description: CSS and JavaScript animation patterns for web interfaces. Use when adding animations, transitions, scroll effects, micro-interactions, or motion design to web projects. Triggers on animate, transition, scroll reveal, GSAP, Framer Motion, CSS animation. Source: skills.sh community
---

# Animation Patterns for Web

Patterns and techniques for creating performant, accessible web animations.

## Core Principles

1. **Animate transform and opacity only** — other properties trigger layout reflow
2. **Use CSS transitions for simple state changes**
3. **Use CSS animations for looping/complex keyframes**
4. **Use JavaScript (GSAP/Framer Motion) for scroll-driven and complex sequences**
5. **Respect prefers-reduced-motion**

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## CSS Transition Patterns

### Hover Effects
```css
.card {
  transform: translateY(0);
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
}
```

### Button Press Effect
```css
.btn { transition: transform 0.1s ease, filter 0.1s ease; }
.btn:active { transform: scale(0.97); filter: brightness(0.9); }
```

### Color Fade
```css
.link { color: #666; transition: color 0.15s ease; }
.link:hover { color: #000; }
```

## CSS Animation Patterns

### Fade In Up (Scroll Reveal Base)
```css
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
}
.reveal {
  opacity: 0;
  animation: fadeInUp 0.6s ease forwards;
}
/* Stagger with animation-delay */
.reveal:nth-child(1) { animation-delay: 0s; }
.reveal:nth-child(2) { animation-delay: 0.1s; }
.reveal:nth-child(3) { animation-delay: 0.2s; }
```

### Shimmer Loading Skeleton
```css
@keyframes shimmer {
  from { background-position: -200% center; }
  to { background-position: 200% center; }
}
.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
```

### Pulse
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
.pulse { animation: pulse 2s ease infinite; }
```

### Spin (Loading)
```css
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.spinner { animation: spin 1s linear infinite; }
```

## IntersectionObserver Scroll Reveal
```javascript
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target); // animate only once
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
```

## GSAP Patterns

### Basic ScrollTrigger
```javascript
gsap.from('.hero-title', {
  scrollTrigger: { trigger: '.hero', start: 'top 80%' },
  y: 60, opacity: 0, duration: 0.8, ease: 'power3.out'
});
```

### Stagger Children
```javascript
gsap.from('.card', {
  scrollTrigger: { trigger: '.cards-grid', start: 'top 80%' },
  y: 40, opacity: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out'
});
```

### Pinned Section with Scrub
```javascript
gsap.to('.panel', {
  xPercent: -100 * (panels.length - 1),
  ease: 'none',
  scrollTrigger: {
    trigger: '.container',
    pin: true,
    scrub: 1,
    end: () => '+=' + container.offsetWidth
  }
});
```

## Framer Motion Patterns (React)

### Page Transition
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.3 }}
>
```

### Scroll Reveal with useInView
```tsx
const ref = useRef(null)
const inView = useInView(ref, { once: true })
return (
  <motion.div ref={ref} animate={inView ? "visible" : "hidden"}
    variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}
    transition={{ duration: 0.5 }}>
```

## Performance Rules
- Use `will-change: transform` sparingly (only when animating)
- Avoid animating `width`, `height`, `top`, `left` — use `transform` instead
- Use `transform: translateZ(0)` to force GPU layer (last resort)
- Keep animations under 300ms for micro-interactions
- Keep page transitions under 500ms
