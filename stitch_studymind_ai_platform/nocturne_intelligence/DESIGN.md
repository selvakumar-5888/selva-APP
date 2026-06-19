---
name: Nocturne Intelligence
colors:
  surface: '#131410'
  surface-dim: '#131410'
  surface-bright: '#3a3935'
  surface-container-lowest: '#0e0e0b'
  surface-container-low: '#1c1c18'
  surface-container: '#20201c'
  surface-container-high: '#2a2a26'
  surface-container-highest: '#353530'
  on-surface: '#e5e2db'
  on-surface-variant: '#c7c6cc'
  inverse-surface: '#e5e2db'
  inverse-on-surface: '#31312c'
  outline: '#909096'
  outline-variant: '#46464c'
  surface-tint: '#c3c6d7'
  primary: '#c3c6d7'
  on-primary: '#2c303d'
  primary-container: '#0a0e1a'
  on-primary-container: '#777b8a'
  inverse-primary: '#5a5e6d'
  secondary: '#c4c0ff'
  on-secondary: '#2000a4'
  secondary-container: '#3826cd'
  on-secondary-container: '#b4b0ff'
  tertiary: '#eec13c'
  on-tertiary: '#3d2e00'
  tertiary-container: '#150e00'
  on-tertiary-container: '#987700'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#dfe2f3'
  primary-fixed-dim: '#c3c6d7'
  on-primary-fixed: '#171b28'
  on-primary-fixed-variant: '#434654'
  secondary-fixed: '#e3dfff'
  secondary-fixed-dim: '#c4c0ff'
  on-secondary-fixed: '#100069'
  on-secondary-fixed-variant: '#3622ca'
  tertiary-fixed: '#ffe08f'
  tertiary-fixed-dim: '#eec13c'
  on-tertiary-fixed: '#241a00'
  on-tertiary-fixed-variant: '#584400'
  background: '#131410'
  on-background: '#e5e2db'
  surface-variant: '#353530'
typography:
  display-lg:
    fontFamily: Clash Display
    fontSize: 48px
    fontWeight: '600'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Clash Display
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Clash Display
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.3'
  headline-sm:
    fontFamily: Clash Display
    fontSize: 20px
    fontWeight: '500'
    lineHeight: '1.4'
  body-lg:
    fontFamily: DM Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: DM Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-sm:
    fontFamily: DM Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: DM Sans
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: 0.1em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  gutter: 16px
  margin-mobile: 20px
  margin-desktop: 40px
---

## Brand & Style

This design system embodies the "Dark Academia" aesthetic filtered through a high-performance, modern technological lens. It targets a demographic that values intellectual rigor and premium craftsmanship—the "luxury productivity" segment. The UI should feel like a private library at midnight, illuminated by the glow of a sophisticated neural interface.

The design style is a hybrid of **Minimalism** and **Glassmorphism**. It utilizes heavy whitespace (or "darkspace") to allow elements to breathe, paired with translucent, frosted-glass surfaces that suggest depth and digital sophistication. The emotional response is one of calm focus, exclusivity, and intellectual empowerment.

## Colors

The palette is rooted in a deep **Midnight Navy (#0A0E1A)** base to provide a high-contrast environment for focus. 

- **Primary Accent:** **Electric Indigo (#6C63FF)** is used for interactive elements, primary actions, and "digital energy" signatures.
- **Highlight:** **Warm Gold (#F5C842)** is used sparingly for status indicators, achievements, or premium features, providing a classical scholarly contrast.
- **Typography:** **Soft Cream (#F0EDE6)** replaces pure white to reduce eye strain and evoke the feel of high-quality vellum or archival paper.
- **Surfaces:** UI containers use translucent layers with subtle blurs to maintain the glassmorphic depth.

## Typography

The system utilizes a high-contrast typographic pairing. **Clash Display** brings a geometric, modernist edge to headlines, conveying precision and authority. **DM Sans** provides a clean, understated foundation for body text and interface labels, ensuring high legibility during deep work sessions.

Large display titles should use tighter letter spacing to emphasize their architectural structure. For mobile devices, display sizes scale down significantly to maintain vertical rhythm without overwhelming the viewport.

## Layout & Spacing

The layout is governed by a strict **8px grid system**. This mathematical precision reinforces the "MIT tech" influence. 

- **Mobile First:** Content is stacked vertically with 20px side margins. Cards utilize the full width of the screen minus margins.
- **Desktop:** A 12-column fluid grid system with 24px gutters. Content containers are capped at 1280px to maintain readability.
- **Rhythm:** Use `spacing-md` (16px) for internal component padding and `spacing-xl` (32px) to separate distinct sections of content.

## Elevation & Depth

Depth is achieved through **Glassmorphism** rather than traditional drop shadows. Surfaces are layered using "Backdrop Filter: Blur" (typically 12px to 20px) and varying levels of opacity.

- **Level 1 (Base):** Deep Navy background.
- **Level 2 (Cards):** 3% Soft Cream fill, 10% Soft Cream border, 16px blur.
- **Level 3 (Modals/Popovers):** 6% Soft Cream fill, 20% Soft Cream border, 32px blur.

To simulate "Electric Indigo" energy, use soft, low-opacity outer glows (`box-shadow: 0 0 20px rgba(108, 99, 255, 0.2)`) on active elements instead of hard shadows.

## Shapes

The shape language is "Calculated Softness." Elements use a **0.5rem (8px)** base radius to align with the spacing grid. This creates a professional, structural feel that isn't as aggressive as sharp corners nor as casual as pill shapes.

- **Standard Buttons/Inputs:** 8px radius.
- **Large Cards:** 16px radius (`rounded-lg`).
- **Contextual Chips:** 24px radius (`rounded-xl`) to distinguish them from actionable buttons.

## Components

### Buttons
Primary buttons use a solid **Electric Indigo** fill with Soft Cream text. Secondary buttons are "ghost" style with a 1px border and a subtle glass blur on hover.

### Cards
Cards are the primary container. They must feature a 1px inner stroke of Soft Cream at 10% opacity to define the edge against the dark background. No solid backgrounds are permitted for cards.

### Input Fields
Inputs are dark with a bottom-only border of 10% Soft Cream. Upon focus, the border transitions to Electric Indigo with a 4px soft glow.

### Chips & Tags
Used for categorization. They should have a 1px border of the accent color (Indigo or Gold) and a background fill at 5% opacity of that same color.

### Progress Indicators
Use thin (2px) lines. The "filled" portion should use a gradient from Electric Indigo to a slightly lighter violet to simulate a neon light tube.