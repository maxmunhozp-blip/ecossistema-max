---
name: skill-seo-performance
description: SEO and web performance optimization patterns. Use when optimizing Core Web Vitals, implementing SEO metadata, improving page speed, or auditing web performance. Triggers on SEO, Core Web Vitals, LCP, CLS, FID, INP, meta tags, structured data. Source: skills.sh community
---

# SEO & Performance Optimization

Comprehensive guide for optimizing web pages for search engines and performance metrics.

## Core Web Vitals Targets

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| LCP (Largest Contentful Paint) | < 2.5s | 2.5s–4s | > 4s |
| INP (Interaction to Next Paint) | < 200ms | 200–500ms | > 500ms |
| CLS (Cumulative Layout Shift) | < 0.1 | 0.1–0.25 | > 0.25 |

## SEO Meta Tags (Essential)

```html
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Page Title (50-60 chars) | Brand Name</title>
  <meta name="description" content="Compelling description 150-160 chars with target keyword.">
  <link rel="canonical" href="https://example.com/page">

  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="Page Title">
  <meta property="og:description" content="Description">
  <meta property="og:image" content="https://example.com/og-image.jpg"> <!-- 1200x630 -->
  <meta property="og:url" content="https://example.com/page">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Page Title">
  <meta name="twitter:description" content="Description">
  <meta name="twitter:image" content="https://example.com/og-image.jpg">
</head>
```

## Structured Data (Schema.org)

### Local Business
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Business Name",
  "description": "Description",
  "url": "https://example.com",
  "telephone": "+55-11-99999-9999",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "São Paulo",
    "addressCountry": "BR"
  }
}
</script>
```

### SaaS/Software
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "App Name",
  "applicationCategory": "BusinessApplication",
  "offers": {
    "@type": "Offer",
    "price": "197",
    "priceCurrency": "BRL"
  }
}
</script>
```

## LCP Optimization

```html
<!-- Preload critical hero image -->
<link rel="preload" as="image" href="/hero.webp" fetchpriority="high">

<!-- Hero image: NO lazy loading -->
<img src="/hero.webp" alt="..." width="1200" height="600" fetchpriority="high">

<!-- Below fold: lazy loading -->
<img src="/feature.webp" alt="..." width="800" height="400" loading="lazy">
```

## CLS Prevention

```css
/* Always set explicit dimensions on images/videos */
img, video { width: 100%; height: auto; aspect-ratio: 16/9; }

/* Reserve space for dynamic content */
.ad-slot { min-height: 250px; }

/* Avoid inserting content above existing content */
```

## JavaScript Performance

```html
<!-- Non-critical scripts: defer or async -->
<script src="/analytics.js" defer></script>
<script src="/widget.js" async></script>

<!-- Critical scripts: inline for smallest payload -->
<script>/* tiny critical script inline */</script>
```

## Font Optimization

```html
<!-- Preconnect to font origin -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

<!-- Preload critical font -->
<link rel="preload" as="font" href="/fonts/brand.woff2" type="font/woff2" crossorigin>
```

```css
/* Prevent FOUT with font-display */
@font-face {
  font-family: 'Brand';
  src: url('/fonts/brand.woff2') format('woff2');
  font-display: swap; /* or 'optional' for minimal CLS */
}
```

## Image Optimization

```html
<!-- WebP with fallback -->
<picture>
  <source srcset="/image.webp" type="image/webp">
  <img src="/image.jpg" alt="..." width="800" height="400">
</picture>

<!-- Responsive images -->
<img
  src="/image-800.webp"
  srcset="/image-400.webp 400w, /image-800.webp 800w, /image-1200.webp 1200w"
  sizes="(max-width: 768px) 100vw, 800px"
  alt="..."
>
```

## Semantic HTML (SEO Critical)
```html
<main>
  <article>
    <header>
      <h1>One H1 per page</h1>
      <p>Published <time datetime="2024-01-15">January 15, 2024</time></p>
    </header>
    <section>
      <h2>Section heading</h2>
      <h3>Subsection</h3>
    </section>
  </article>
</main>
```

## Checklist
- [ ] Title tag 50-60 chars with primary keyword
- [ ] Meta description 150-160 chars, compelling, keyword included
- [ ] One H1 per page
- [ ] All images have descriptive alt text
- [ ] Core Web Vitals: LCP < 2.5s, CLS < 0.1, INP < 200ms
- [ ] Mobile-friendly (test with PageSpeed Insights)
- [ ] HTTPS enabled
- [ ] Canonical tags on all pages
- [ ] XML sitemap submitted to Search Console
- [ ] robots.txt configured
