---
name: skill-gsap-scroll
description: GSAP ScrollTrigger and Lenis smooth scroll implementation patterns. Use when building scroll-driven animations, pinned sections, parallax effects, or cinematic scroll experiences. Triggers on GSAP, ScrollTrigger, Lenis, scroll animation, parallax, pinned section. Source: skills.sh community
---

# GSAP + ScrollTrigger + Lenis Patterns

Complete patterns for scroll-driven animations and cinematic web experiences.

## Setup (CDN)

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@studio-freight/lenis@1.0.42/dist/lenis.min.js"></script>
```

## Lenis + GSAP Integration

```javascript
// Initialize Lenis smooth scroll
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smooth: true,
})

// Integrate Lenis with GSAP ticker
gsap.ticker.add((time) => {
  lenis.raf(time * 1000)
})
gsap.ticker.lagSmoothing(0)

// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger)

// ScrollerProxy for Lenis (if needed)
ScrollTrigger.scrollerProxy(document.body, {
  scrollTop(value) {
    if (arguments.length) { lenis.scrollTo(value, { immediate: true }) }
    return lenis.scroll
  },
  getBoundingClientRect() {
    return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight }
  }
})

lenis.on('scroll', ScrollTrigger.update)
```

## Common Patterns

### Fade In from Below (with stagger)
```javascript
gsap.from('.card', {
  scrollTrigger: { trigger: '.cards', start: 'top 80%' },
  y: 40,
  opacity: 0,
  duration: 0.7,
  stagger: 0.1,
  ease: 'power2.out',
})
```

### Pinned Horizontal Scroll
```javascript
const sections = gsap.utils.toArray('.panel')
gsap.to(sections, {
  xPercent: -100 * (sections.length - 1),
  ease: 'none',
  scrollTrigger: {
    trigger: '.horizontal-container',
    pin: true,
    scrub: 1,
    snap: 1 / (sections.length - 1),
    end: () => '+=' + document.querySelector('.horizontal-container').offsetWidth,
  }
})
```

### Pinned Section (Before/After)
```javascript
gsap.to('.after-panel', {
  x: 0,
  scrollTrigger: {
    trigger: '.split-section',
    pin: true,
    scrub: 1,
    start: 'top top',
    end: '+=500vh',
  }
})
```

### SVG Path Draw (Stroke Animation)
```javascript
gsap.set('.path', { strokeDasharray: '1000', strokeDashoffset: '1000' })
gsap.to('.path', {
  strokeDashoffset: 0,
  scrollTrigger: { trigger: '.path', start: 'top 80%', scrub: true },
  duration: 2,
  ease: 'power2.inOut',
})
```

### Character Split Text Reveal
```javascript
function splitText(el) {
  const text = el.textContent
  el.innerHTML = text.split('').map(c =>
    c === ' ' ? ' ' : `<span class="char">${c}</span>`
  ).join('')
  return el.querySelectorAll('.char')
}

const chars = splitText(document.querySelector('.headline'))
gsap.from(chars, {
  scrollTrigger: { trigger: '.headline', start: 'top 80%' },
  y: '100%',
  opacity: 0,
  stagger: 0.02,
  duration: 0.5,
  ease: 'power3.out',
})
```

### Counter Animation
```javascript
function animateCounter(el, end, duration = 2) {
  gsap.to({ val: 0 }, {
    val: end,
    duration,
    ease: 'power2.out',
    scrollTrigger: { trigger: el, start: 'top 85%', once: true },
    onUpdate: function() { el.textContent = Math.round(this.targets()[0].val).toLocaleString() }
  })
}
```

### Parallax
```javascript
gsap.to('.parallax-bg', {
  yPercent: -30,
  ease: 'none',
  scrollTrigger: {
    trigger: '.section',
    scrub: true,
    start: 'top bottom',
    end: 'bottom top',
  }
})
```

### Scale + Fade Hero on Scroll
```javascript
gsap.to('.hero', {
  scale: 0.85,
  opacity: 0,
  ease: 'none',
  scrollTrigger: {
    trigger: '.hero',
    start: 'top top',
    end: 'bottom top',
    scrub: true,
  }
})
```

## Custom Cursor with Lerp Lag
```javascript
let mouseX = 0, mouseY = 0
let cursorX = 0, cursorY = 0
const cursor = document.querySelector('.cursor')

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX
  mouseY = e.clientY
})

gsap.ticker.add(() => {
  cursorX += (mouseX - cursorX) * 0.12
  cursorY += (mouseY - cursorY) * 0.12
  gsap.set(cursor, { x: cursorX, y: cursorY })
})
```

## Magnetic Button Effect
```javascript
document.querySelectorAll('.magnetic').forEach(btn => {
  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    gsap.to(btn, { x: x * 0.3, y: y * 0.3, duration: 0.3, ease: 'power2.out' })
  })
  btn.addEventListener('mouseleave', () => {
    gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' })
  })
})
```
