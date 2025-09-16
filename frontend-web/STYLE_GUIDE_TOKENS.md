# UI Style Guide Tokens & Usage

This project defines a cohesive token set and utility classes to keep login, registration, and onboarding consistent.

## Tokens (CSS Variables)
Defined in `src/components/ui/index.tsx` (GlobalStyles):

- Colors
  - `--color-primary: #E63946` (Crimson)
  - `--color-primary-700: #C82F3A`
  - `--color-primary-50: #FDECEF`
  - `--color-ink: #0E1116`, `--color-ink-muted: #4A5568`
  - `--color-bg: #0F1626` (Deep navy)
  - Neutrals: `--neutral-0`, `--neutral-50`, `--neutral-200`, `--neutral-300`
  - Semantic: `--success`, `--warning`, `--danger`, `--info`
  - Focus: `--focus-ring: #7C3AED`
- Radii: `--radius-input: 16px`, `--radius-card: 24px`, `--radius-pill: 999px`
- Shadows: `--shadow-card: 0 12px 30px rgba(0,0,0,0.25)`

Fonts are injected globally (Inter for UI, Montserrat for headlines). Body background is navy with subtle gradient overlays.

## Utilities
- Buttons
  - `.btn`: min-height 48px, bold
  - `.btn-primary`: crimson fill, white text, hover lift
  - `.btn-outline`: white outline on glass
  - `.btn-gradient`: brand gradient fill
- Cards
  - `.card-frost`: frosted glass card with blur + border + shadow

## Recommended Usage
- Primary CTAs: `.btn btn-primary`
- Secondary/Back: `.btn btn-outline`
- Demo CTA: `.btn btn-gradient`
- Frosted containers: `.card-frost`

## Accessibility
- Focus rings always visible using `--focus-ring`
- Input text, caret, and placeholder colors adjusted for readability on glass

## Where Defined
- Global tokens and utilities: `src/components/ui/index.tsx`
- Theme references: `src/styles/theme.ts`

Update or extend tokens there to evolve the system. For new components, prefer utilities/tokens over ad-hoc styles.
