---
name: Midnight Scholar
colors:
  surface: '#0f131f'
  surface-dim: '#0f131f'
  surface-bright: '#353946'
  surface-container-lowest: '#0a0e1a'
  surface-container-low: '#171b28'
  surface-container: '#1b1f2c'
  surface-container-high: '#262a37'
  surface-container-highest: '#313442'
  on-surface: '#dfe2f3'
  on-surface-variant: '#c7c4d8'
  inverse-surface: '#dfe2f3'
  inverse-on-surface: '#2c303d'
  outline: '#918fa1'
  outline-variant: '#464555'
  surface-tint: '#c4c0ff'
  primary: '#c4c0ff'
  on-primary: '#2000a4'
  primary-container: '#8781ff'
  on-primary-container: '#1b0091'
  inverse-primary: '#4f44e2'
  secondary: '#eec13c'
  on-secondary: '#3d2e00'
  secondary-container: '#bb9300'
  on-secondary-container: '#3e2f00'
  tertiary: '#ffb785'
  on-tertiary: '#502500'
  tertiary-container: '#db761f'
  on-tertiary-container: '#461f00'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e3dfff'
  primary-fixed-dim: '#c4c0ff'
  on-primary-fixed: '#100069'
  on-primary-fixed-variant: '#3622ca'
  secondary-fixed: '#ffe08f'
  secondary-fixed-dim: '#eec13c'
  on-secondary-fixed: '#241a00'
  on-secondary-fixed-variant: '#584400'
  tertiary-fixed: '#ffdcc6'
  tertiary-fixed-dim: '#ffb785'
  on-tertiary-fixed: '#301400'
  on-tertiary-fixed-variant: '#713700'
  background: '#0f131f'
  on-background: '#dfe2f3'
  surface-variant: '#313442'
typography:
  display-lg:
    fontFamily: Syne
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Syne
    fontSize: 36px
    fontWeight: '800'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Syne
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.3'
  headline-sm:
    fontFamily: Syne
    fontSize: 24px
    fontWeight: '600'
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
  label-md:
    fontFamily: DM Sans
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  xxl: 64px
  container-max: 1280px
  gutter: 24px
---

## Brand & Style
The design system embodies a "Dark Academia" aesthetic fused with high-end modern technology. It targets a demographic that values intellectual rigor and premium productivity—the "MIT student meets luxury" persona. The interface should feel like an advanced research laboratory at night: focused, high-contrast, and intellectually stimulating.

The visual style is a hybrid of **Glassmorphism** and **Modern Corporate**, utilizing deep translucent layers to create a sense of infinite depth. We employ "soft neon glows" (Electric Indigo) to highlight interactive elements, suggesting energy and computation against the "Warm Gold" highlights that represent heritage and achievement. The overall emotional response should be one of quiet confidence, technical mastery, and focused ambition.

## Colors
The palette is rooted in a deep midnight foundation (#0A0E1A), which serves as the "infinite" canvas. 

- **Primary (Electric Indigo):** Used for primary actions, focus states, and data visualizations. It represents the "tech" side of the brand.
- **Secondary (Warm Gold):** Reserved for "Luxury" moments—achievements, premium features, and subtle brand accents.
- **Neutral/Surface:** We use varying opacities of white and indigo over the midnight base to create layered glass surfaces.
- **Text (Soft Cream):** Chosen over pure white to reduce eye strain during long sessions and to provide a more "literary" and premium feel.

## Typography
We use **Syne** (as a high-character alternative to Clash Display) for headlines to provide a bold, editorial, and slightly avant-garde feel. It should be set with tight letter-spacing for large display sizes.

**DM Sans** provides a clean, neutral, and highly legible counterpoint for body text and functional UI labels. This pairing balances the "expressive scholar" with the "efficient engineer." 

Labels should often be set in uppercase with increased letter spacing to evoke a technical, "instrument panel" feel. All text defaults to the Soft Cream palette to maintain the dark academia atmosphere.

## Layout & Spacing
The layout is governed by a strict **8px grid system**. All margins, paddings, and component heights must be multiples of 8.

- **Desktop:** 12-column fluid grid with a 1280px max-width container. 24px gutters.
- **Tablet:** 8-column grid with 24px gutters and 24px side margins.
- **Mobile:** 4-column grid with 16px gutters and 16px side margins.

Content should feel spacious. Use `xl` (40px) or `xxl` (64px) spacing between major sections to emphasize the premium, "low-density" nature of the application. Elements should rely on alignment and glass containers rather than heavy lines to define space.

## Elevation & Depth
Depth is achieved through **Glassmorphism** and **Backdrop Blurs**. We avoid traditional drop shadows in favor of light-based depth cues:

1.  **Base Layer:** The solid Midnight (#0A0E1A) background.
2.  **Surface Level:** Semi-transparent glass (`rgba(255, 255, 255, 0.03)`) with a `backdrop-filter: blur(12px)`.
3.  **Raised Level:** Same as surface but with a subtle 1px inner border of `rgba(255, 255, 255, 0.1)` to catch the "light."
4.  **Interactive Glow:** Active or hovered elements emit a soft `box-shadow: 0 0 20px rgba(108, 99, 255, 0.2)`.

Objects closer to the user are more opaque and have a brighter border-stroke.

## Shapes
The design system uses a "Rounded" geometry (0.5rem base) to soften the technical edge and provide a premium, modern feel. 

- **Small Components (Buttons, Inputs):** 8px (0.5rem) radius.
- **Medium Components (Cards, Modals):** 16px (1rem) radius.
- **Large Components (Sections, Overlays):** 24px (1.5rem) radius.

Interactive chips and tags may use a pill-shape (32px+) to distinguish them from structural elements.

## Components

### Buttons
Primary buttons use a solid Electric Indigo fill with Soft Cream text. Secondary buttons are "ghost" glass style with an Indigo border and a 10% Indigo background on hover. Use uppercase labels for a more "utilitarian-luxury" feel.

### Input Fields
Inputs should be dark glass with a bottom-only border by default. Upon focus, the border transitions to a full 1px Electric Indigo stroke with a very faint Indigo outer glow.

### Cards
Cards are the primary expression of glassmorphism. They feature a `12px` backdrop blur, a `1px` semi-transparent border, and are slightly lifted from the background. Headings within cards use the Warm Gold accent for titles or key metrics.

### Chips & Tags
Used for categorization. These should be semi-transparent with no fill, only a subtle border, and text set in the secondary Warm Gold or Primary Indigo to denote status.

### Lists
List items use a subtle hover state that increases the background opacity from 3% to 8%, creating a "lit" effect as the user moves through data.