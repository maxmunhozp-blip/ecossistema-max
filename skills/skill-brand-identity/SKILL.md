---
name: brand-system
description: "Builds brand identity systems — color palettes, typography, design tokens, logo guidelines, and visual language with usage rules and component specs. Produces `.agents/design/brand-system.md`. Not for writing marketing copy (use content-create) or mapping user flows (use user-flow)."
argument-hint: "[product or brand to design]"
license: MIT
metadata:
  author: hungv47
  version: "5.0.0"
---

# Brand Identity & Design System — Orchestrator

*Design — Step 1 of 2. Coordinates specialized agents to transform product artifacts into a complete brand identity and design system.*

**Core Question:** "Does every visual decision trace back to who we are?"

## Critical Gates — Read First

- **Do NOT choose colors or fonts before strategy.** Visual-agent runs in parallel with strategy-agent but the orchestrator must verify coherence in the merge step. Visual choices without strategy justification get flagged by critic-agent.
- **Do NOT dispatch Layer 2 before Layer 1 completes.** Token-architect-agent needs visual-agent output. Component-token-agent needs token-architect-agent output. The chain is strict.
- **Do NOT skip the critic's cross-element coherence check.** Radius must map to archetype. Typography must match personality. Color must align with brand emotion. The critic checks the matrix that no individual agent can see.
- **Stale upstream data (>30 days) produces generic archetypes.** Recommend re-running `icp-research` before proceeding if artifact dates are old.

## Inputs Required
- Product description or PRD (what the product does, who it serves)
- Target audience profile (demographics, psychographics, context of use)
- Competitive context (who else serves this audience, how they're positioned)

## Output
- `.agents/design/brand-system.md` (brand identity, voice, visual system, design tokens)
- Visual brand guideline artboards (if Paper MCP available)

## Quality Gate
Before delivering, the **critic agent** verifies:
- [ ] Every visual, verbal, and token decision traces back to strategy and archetype
- [ ] Values have real tradeoffs (not generic "innovation, quality, integrity")
- [ ] Voice chart has Do/Don't examples for every attribute
- [ ] All semantic tokens have both light and dark mode values
- [ ] Every token pair meets WCAG AA contrast (4.5:1 normal text, 3:1 large/UI)
- [ ] Background/foreground convention used consistently (`bg-primary text-primary-foreground`)
- [ ] One global `--radius` value — all components derive from it
- [ ] Cross-element coherence: radius maps to archetype (see `references/token-templates.md`), type personality matches archetype (see `references/typography-psychology.md`), color emotion aligns with brand personality (see `references/color-emotion.md`), and imagery direction reflects the archetype's visual world. Flag any element that contradicts the others.
- [ ] AI slop check: run `references/ai-slop-detection.md` checklist against all visual outputs — 0-1 items is clean, 2-3 needs review, 4+ needs regeneration

## Chain Position
Previous: none | Next: `user-flow`

**Re-run triggers:** After major product pivots, when entering new markets, after significant audience shifts, or annually for brand refresh.

**Related skills (non-chain):** `icp-research` (audience data for brand strategy), `content-create` (consumes voice guidelines), `humanize` (uses voice adjectives)

### Skill Deference
- **Need audience research first?** Run `icp-research` (from comms-skills) — brand strategy without audience research produces generic archetypes.
- **Need user flows after brand?** Run `user-flow` next — it consumes design tokens and component context.
- **Need marketing copy?** Run `content-create` or `copywriting` — they consume voice guidelines.

---

## Agent Manifest

| Agent | Layer | File | Focus |
|-------|-------|------|-------|
| Strategy Agent | 1 (parallel) | `agents/strategy-agent.md` | Purpose, mission, vision, values, positioning, competitive landscape |
| Personality Agent | 1 (parallel) | `agents/personality-agent.md` | Jungian archetype (70/30 blend), personality traits, emotional journey |
| Voice Agent | 1 (parallel) | `agents/voice-agent.md` | Voice chart, tone spectrum, messaging architecture, on-brand examples |
| Visual Agent | 1 (parallel) | `agents/visual-agent.md` | Logo, color system (OKLCH 60/30/10), typography, imagery |
| Token Architect Agent | 2 (sequential) | `agents/token-architect-agent.md` | 3-layer W3C token system, semantic map, radius-to-archetype |
| Component Token Agent | 2 (sequential) | `agents/component-token-agent.md` | Button 6 variants, input specs, card specs, motion tokens |
| Accessibility Agent | 2 (sequential) | `agents/accessibility-agent.md` | WCAG AA contrast, touch targets, dark mode audit, focus states |
| Critic Agent | 2 (final) | `agents/critic-agent.md` | Cross-element coherence, token correctness, PASS/FAIL |

### Shared References (read by multiple agents)
- `references/brand-archetypes.md` — 12 Jungian archetypes with visual/verbal mappings
- `references/brand-voice.md` — Voice frameworks, tone dimensions, messaging architecture
- `references/visual-identity.md` — Logo systems, imagery, iconography, graphic elements
- `references/color-emotion.md` — Color psychology, OKLCH values, audience palettes
- `references/typography-psychology.md` — Font personality mappings and pairing rules
- `references/token-architecture.md` — Three-layer token system, semantic token map
- `references/token-templates.md` — Primitive scales, radius-archetype mapping, mapping example
- `references/component-tokens.md` — Component token map, button/input/card specs, motion tokens
- `references/component-patterns.md` — Extended UI component patterns with token consumption maps
- `references/implementation-rules.md` — Accessibility baseline, dark mode rules, brand applications
- `references/artboard-generation.md` — Paper MCP artboard specs and workflow
- `references/paper-artboard-templates.md` — Paper MCP HTML/CSS templates
- `references/ai-slop-detection.md` — AI-generated design anti-patterns checklist

---

## Routing Logic

### Mode Selection

Ask: *"Full brand system or quick brand for MVP?"*

### Route A: Quick Brand (MVP)
**When:** MVP, early-stage, need to ship fast with basic brand foundations.

```
1. Pre-dispatch: Gather context (Step 0)
2. LAYER 1 — Dispatch IN PARALLEL:
   - strategy-agent (purpose, values, positioning)
   - visual-agent (color + typography only — logo deferred)
3. Dispatch: critic-agent (coherence check — strategy-to-visual only)
4. If FAIL → re-dispatch named agent(s) with feedback (max 2 cycles)
5. Deliver Quick Brand artifact
```

**Quick Brand scope:** Purpose/mission/vision, core values, positioning, primary color + neutrals, display + body font, basic type hierarchy. Defers: archetype analysis, voice/tone system, messaging architecture, full visual identity, token architecture, component tokens, accessibility audit, dark mode, artboards.

**Quick Brand output includes a note:** "Run full brand-system when ready to build the design system."

### Route B: Full Brand System
**When:** Established product, full rebrand, comprehensive guidelines needed.

```
1. Pre-dispatch: Gather context (Step 0)
2. LAYER 1 — Dispatch IN PARALLEL:
   - strategy-agent
   - personality-agent
   - voice-agent
   - visual-agent
3. MERGE: Assemble Layer 1 outputs into brand identity sections
4. LAYER 2 — Dispatch SEQUENTIALLY:
   - token-architect-agent (receives visual-agent + personality-agent output)
   - component-token-agent (receives token-architect-agent output)
   - accessibility-agent (receives token-architect + component-token outputs)
5. Dispatch: critic-agent (receives complete brand system)
6. If FAIL → re-dispatch named agent(s) with feedback (max 2 cycles)
7. Artboard generation (Step 9 — if Paper MCP available)
8. Deliver artifact
```

---

## Step 0: Pre-Dispatch Context Gathering

### Product Context Check
Check for `.agents/product-context.md` and `.agents/mkt/icp-research.md`. If `date` fields are older than 30 days, **warn the user** and recommend re-running upstream skills.

### Required Inputs — Interview If Missing
- Product description or PRD
- Target audience profile
- Competitive context

### Strongly Recommended
- Existing brand assets (logos, colors, fonts, past guidelines)
- Founder/team values and origin story
- Key differentiators

### Helpful
- Admired brands (aspirational and anti-aspirational)
- Market positioning intent (premium, accessible, disruptive, trusted)

### Optional Artifacts
| Artifact | Source | Benefit |
|----------|--------|---------|
| `.agents/product-context.md` | icp-research (from `hungv47/comms-skills`) | Product positioning, audience, and voice adjectives — grounds brand strategy in audience research |
| `.agents/mkt/icp-research.md` | icp-research (from `hungv47/comms-skills`) | Audience personas, pain profiles, and VoC quotes — brand strategy without audience research produces generic archetypes |

**Strongly recommended:** Run `icp-research` (from comms-skills) first if audience research hasn't been done.

### Context to Pass to All Agents
1. **Product:** description, audience, competitive landscape
2. **Existing assets:** any logos, colors, fonts, guidelines to preserve or evolve
3. **Positioning intent:** premium, accessible, disruptive, trusted
4. **Upstream artifacts:** excerpts from product-context.md and icp-research.md if available

Missing product details are not guessable — interview for them.

---

## Dispatch Protocol

### How to spawn a sub-agent

1. **Read** the agent instruction file — include its FULL content in the Agent prompt
2. **Append** the context (product, audience, competitive landscape, existing assets) after the instructions
3. **Resolve file paths to absolute**: replace relative paths with absolute paths rooted at this skill's directory
4. **Pass upstream artifacts by content**: the orchestrator reads `.agents/` files FIRST, then includes relevant excerpts in context. Sub-agents should NOT read artifact files directly.
5. If **feedback** exists (from critic FAIL), append with header "## Critic Feedback — Address Every Point"

### Single-agent fallback

If multi-agent dispatch is unavailable, execute each agent's instructions sequentially in-context:
- Layer 1: define strategy, select archetype, write voice chart, design visual identity
- Layer 2: build token architecture, map component tokens, audit accessibility
- Final: evaluate with critic rubric, check cross-element coherence

---

## Layer 1: Parallel Foundation

Spawn **IN PARALLEL**:

| Agent | Instruction File | Pass These Inputs | Reference Files |
|-------|-----------------|-------------------|-----------------|
| Strategy Agent | `agents/strategy-agent.md` | brief (product + audience + competitors) | — |
| Personality Agent | `agents/personality-agent.md` | brief (product + audience) | `references/brand-archetypes.md` |
| Voice Agent | `agents/voice-agent.md` | brief (product + audience) | `references/brand-voice.md` |
| Visual Agent | `agents/visual-agent.md` | brief (product + audience + existing assets) | `references/color-emotion.md`, `references/typography-psychology.md`, `references/visual-identity.md` |

Wait for all to complete. Their outputs feed the merge step and Layer 2.

---

## Merge Step

Assemble Layer 1 outputs into the artifact template:

| Section | Owner Agent |
|---------|-----------|
| Part I: Strategy (purpose, values, positioning, landscape) | Strategy Agent |
| Part II: Personality (archetype, traits, emotional journey) | Personality Agent |
| Part II: Voice & Messaging (voice chart, tone, messaging, examples) | Voice Agent |
| Part III: Visual Identity (logo, color, typography, imagery) | Visual Agent |

**Coherence check before Layer 2:** Verify that the archetype selected by personality-agent aligns with the visual choices made by visual-agent. If they contradict (e.g., Caregiver archetype with sharp/aggressive typography), resolve before dispatching Layer 2.

---

## Layer 2: Sequential Chain

Dispatch **ONE AT A TIME, IN ORDER**:

| Step | Agent | Instruction File | Receives |
|------|-------|-----------------|----------|
| 1 | Token Architect Agent | `agents/token-architect-agent.md` | Visual-agent output (colors, fonts) + personality-agent output (archetype for radius) |
| 2 | Component Token Agent | `agents/component-token-agent.md` | Token-architect-agent output (semantic token map) |
| 3 | Accessibility Agent | `agents/accessibility-agent.md` | Token-architect + component-token outputs |
| 4 | Critic Agent | `agents/critic-agent.md` | Complete assembled brand system |

---

## Critic Gate

- **PASS:** Deliver the artifact. Proceed to artboard generation (Step 9) if Paper MCP available.
- **FAIL:** Re-dispatch named agent(s) with critic feedback. Max 2 rewrite cycles. After 2 failures, deliver with critic annotations and flag to user.

---

## Step 9: Visual Artboard Generation (Paper MCP)

Render brand guidelines as 5 presentation-ready artboards if Paper MCP is available. Reference `references/artboard-generation.md` for complete specs, workflow, and prerequisites.

After generating artboards, run the AI slop detection checklist (`references/ai-slop-detection.md`). Artboards are the highest-risk output for AI default patterns.

Artboards: Color Palette | Typography System | Spacing & Tokens | UI Style Principles | Logo System

Skip this step if Paper MCP tools are unavailable.

---

## Artifact Template

Save to `.agents/design/brand-system.md`.

On re-run: rename existing artifact to `brand-system.v[N].md` and create new with incremented version.

```markdown
---
skill: brand-system
version: 1
date: {{today}}
status: draft
---

# Brand System: [Brand Name]

## Part I: Strategy
- Purpose, positioning, competitive landscape

## Part II: Personality
- Primary archetype, voice framework, messaging examples

## Part III: Visual Identity
- Logo, color palette (OKLCH + hex), typography, imagery direction

## Part IV: Design Tokens
- Primitive scales, semantic map, component tokens (see references/)

## Part V: Implementation
- Accessibility, dark mode, brand applications (see references/)
```

---

## Worked Example (Condensed) — Route B: Full Brand System

**Input**: FinLit — a personal finance app for young professionals (22-30), positioned against intimidating banking apps.

### Step 0: Pre-Dispatch
Product: personal finance app. Audience: young professionals 22-30. Competitors: traditional banking apps (Mint, bank mobile apps).

### Layer 1: Parallel Foundation
All 4 agents dispatched in parallel:
- **Strategy agent** returns: Purpose "make finance empowering, not shameful." Positioning: "the only finance app that feels like a supportive friend." Values: transparency over comfort, simplicity over completeness, progress over perfection.
- **Personality agent** returns: Caregiver (70%) + Explorer (30%). Traits: encouraging but not patronizing, clear but not dumbed-down, warm but not saccharine.
- **Voice agent** returns: Voice chart with 3 attributes (straight-talking, encouraging, honest). Tagline: "Money, minus the shame." Boilerplate in 4 lengths.
- **Visual agent** returns: Primary warm teal `oklch(0.65 0.15 180)` / `#2cbaa0`. Neutral base: Stone. Display: Plus Jakarta Sans. Body: Inter. Radius: 0.5rem (Caregiver). Imagery: real people, natural light, warm tones.

### Merge
Assembled into Parts I-III. Coherence check: Caregiver archetype aligns with warm teal (trust + growth), humanist-leaning typography (approachable), 0.5rem radius (soft). PASS — proceed to Layer 2.

### Layer 2: Sequential Chain
- **Token architect** returns: Stone 50-950 neutral scale, teal 50-950 primary scale, `--radius: 0.5rem`, 19 semantic tokens with light + dark values.
- **Component token** returns: 6 button variants mapped to semantic tokens, input specs with blur validation, card specs, motion tokens (100-500ms).
- **Accessibility** returns: All token pairs pass 4.5:1. Dark mode surface hierarchy (stone.950 → stone.900 → stone.800). Primary shifts to teal.400 in dark mode. Touch targets ≥44px.
- **Critic** returns: PASS. Cross-element coherence verified. Radius matches Caregiver. Typography matches warmth. Color matches archetype. AI slop score: 1 item (clean).

### Deliver
Artifact saved to `.agents/design/brand-system.md`.

---

## Worked Example (Condensed) — Route A: Quick Brand

**Input**: TaskFlow — a new project management tool, pre-MVP, needs basic brand to start building.

### Step 0: Pre-Dispatch
Product: project management tool. Audience: small team leads. Quick Brand selected.

### Layer 1: Parallel (reduced)
- **Strategy agent** returns: Purpose, values (clarity over complexity, speed over ceremony), positioning.
- **Visual agent** returns: Primary blue `oklch(0.623 0.214 259)` / `#3b82f6`. Neutral: Slate. Display: Inter. Body: Inter.

### Critic (reduced)
Checks strategy-to-visual coherence only. PASS.

### Deliver
Artifact saved with note: "Run full brand-system when ready to build the design system."

---

## Anti-Patterns

**Aesthetics without strategy** — Picking colors or fonts because they "look nice" without tracing back to archetype and positioning. INSTEAD: Every visual choice must have a strategy justification in the change log.

**Generic values** — "Innovation, quality, integrity" have no tradeoff; they guide nothing. INSTEAD: Use "X over Y" format where Y is a legitimate alternative: "transparency over comfort."

**Archetype confusion** — Selecting contradictory archetypes (Outlaw + Ruler, Hero + Innocent). INSTEAD: Primary and secondary should complement each other; the secondary adds nuance, not contradiction.

**Voice without examples** — "We're friendly" is meaningless without a concrete error message example. INSTEAD: Every voice attribute has a Do and Don't example from a real brand context.

**Token soup** — Creating 40+ semantic tokens when ~20 covers an entire component library. INSTEAD: Keep the semantic layer tight. If you're inventing `--subtle-muted-foreground-alt`, the system is too granular.

**Skipping semantic layer** — Components referencing primitives (`oklch(0.546...)`) instead of semantic tokens (`var(--primary)`). INSTEAD: Always reference semantic tokens. The three-layer chain is Primitive -> Semantic -> Component.

**Mismatched bg/fg pairs** — `bg-primary text-primary` is wrong; use `bg-primary text-primary-foreground`. INSTEAD: Every semantic color role is a pair. Base = background. `-foreground` = text on that surface.

**Dark mode as inversion** — Simply swapping black/white produces unusable surfaces. INSTEAD: Deliberate surface hierarchy (background -> card -> popover), reduced saturation, shifted primary lightness.

**Dispatching all agents for Quick Brand** — Route A exists for MVPs. INSTEAD: Quick Brand uses only strategy + visual + critic. No archetype analysis, no tokens, no components.

---

## Agent Files

### Sub-Agent Instructions (agents/)
- [agents/strategy-agent.md](agents/strategy-agent.md) — Purpose, mission, vision, values, positioning
- [agents/personality-agent.md](agents/personality-agent.md) — Jungian archetype blend, personality traits, emotional journey
- [agents/voice-agent.md](agents/voice-agent.md) — Voice chart, tone spectrum, messaging architecture
- [agents/visual-agent.md](agents/visual-agent.md) — Logo, color system, typography, imagery
- [agents/token-architect-agent.md](agents/token-architect-agent.md) — 3-layer W3C token system, semantic map
- [agents/component-token-agent.md](agents/component-token-agent.md) — Button variants, input/card specs, motion tokens
- [agents/accessibility-agent.md](agents/accessibility-agent.md) — WCAG AA, dark mode, touch targets, focus states
- [agents/critic-agent.md](agents/critic-agent.md) — Cross-element coherence, PASS/FAIL

### Shared References (references/)
- [references/brand-archetypes.md](references/brand-archetypes.md) — 12 Jungian archetypes with visual and verbal mappings
- [references/brand-voice.md](references/brand-voice.md) — Voice frameworks, tone dimensions, messaging architecture
- [references/visual-identity.md](references/visual-identity.md) — Logo systems, imagery direction, iconography, graphic elements
- [references/token-architecture.md](references/token-architecture.md) — Three-layer token system, semantic token map, neutral presets
- [references/token-templates.md](references/token-templates.md) — Primitive scales, semantic token map, radius-archetype mapping, mapping example
- [references/component-tokens.md](references/component-tokens.md) — Component token map, button/input/card specs, motion tokens
- [references/implementation-rules.md](references/implementation-rules.md) — Accessibility baseline, dark mode rules, brand applications
- [references/artboard-generation.md](references/artboard-generation.md) — Paper MCP artboard specs and workflow
- [references/typography-psychology.md](references/typography-psychology.md) — Font personality mappings and pairing rules
- [references/color-emotion.md](references/color-emotion.md) — Color psychology, OKLCH values, audience palettes
- [references/component-patterns.md](references/component-patterns.md) — Extended UI component patterns with token consumption maps
- [references/paper-artboard-templates.md](references/paper-artboard-templates.md) — Paper MCP HTML/CSS templates
- [references/ai-slop-detection.md](references/ai-slop-detection.md) — AI-generated design anti-patterns checklist
