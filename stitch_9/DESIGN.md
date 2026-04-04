# Design System Specification: The Engineering Editorial

## 1. Overview & Creative North Star
**Creative North Star: "The Precise Architect"**

This design system moves away from the "flat web" toward a high-fidelity, engineering-led aesthetic. We are not just building an interface; we are crafting a digital instrument. The experience should feel like a high-end command center—authoritative, deep, and meticulously organized.

To move beyond "standard" dark mode, we employ **Intentional Asymmetry** and **Tonal Depth**. Instead of rigid, centered grids, we utilize left-aligned editorial "columns" and overlapping surfaces to create a sense of movement. The "template" look is defeated by treating every screen as a canvas where information is curated, not just displayed.

---

## 2. Colors & Surface Philosophy
The palette is rooted in a deep, void-like slate, punctuated by vibrant, functional accents that signal intent and hierarchy.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to section content. Boundaries must be defined solely through background color shifts. A `surface-container-low` section sitting on a `surface` background provides all the separation required. 

### Surface Hierarchy & Nesting
Treat the UI as physical layers of "Engineered Glass."
*   **Base:** `surface` (#060e20) - The foundation.
*   **The Well:** `surface-container-lowest` (#000000) - Used for inset areas like code blocks or data tables to create a "recessed" feel.
*   **The Lift:** `surface-container-high` (#141f38) - Used for cards and modals that need to feel physically closer to the user.

### Glass & Gradient (The "Signature" Touch)
To provide "soul" to the engineering aesthetic, use subtle, long-form gradients. 
*   **CTAs:** Transition from `primary` (#85adff) to `primary-container` (#6e9fff) at a 135° angle.
*   **Glassmorphism:** Floating panels (e.g., Navigation Bars) should use `surface-bright` at 70% opacity with a `24px` backdrop blur. This allows the primary colors of background elements to bleed through softly, preventing the UI from feeling "heavy."

---

## 3. Typography
We use **Plus Jakarta Sans** for its geometric, modern personality and **Tajawal** for its clean, architectural Arabic counterparts.

| Role | Font | Size | Character |
| :--- | :--- | :--- | :--- |
| **Display-LG** | Plus Jakarta Sans | 3.5rem | Bold, -2% tracking. Use for impact numbers. |
| **Headline-MD** | Plus Jakarta Sans | 1.75rem | Medium. The "Editorial" header. |
| **Title-SM** | Plus Jakarta Sans | 1.0rem | Semi-Bold. Used for card headers. |
| **Body-MD** | Plus Jakarta Sans | 0.875rem | Regular. The primary workhorse. |
| **Label-SM** | Plus Jakarta Sans | 0.6875rem | Bold, All-caps, +5% tracking. Engineering precision. |

**Editorial Note:** Use high contrast in scale. Pair a `Display-LG` metric directly with a `Label-SM` descriptor to create a sophisticated, data-rich hierarchy that feels intentional and custom.

---

## 4. Elevation & Depth
In this system, light and shadow mimic natural ambient physics.

*   **The Layering Principle:** Depth is achieved by stacking. Place a `surface-container-lowest` card on a `surface-container-low` section. This "inverted lift" creates a sophisticated, recessed look popular in high-end hardware interfaces.
*   **Ambient Shadows:** For floating modals, use a shadow with a `40px` blur and `6%` opacity. The shadow color must be tinted with `on-surface` (#dee5ff) rather than pure black to simulate a realistic dark-mode environment.
*   **The "Ghost Border" Fallback:** If accessibility requires a stroke, use `outline-variant` (#40485d) at **20% opacity**. It should feel like a faint reflection on an edge, not a structural line.

---

## 5. Components

### Buttons
*   **Primary:** Gradient fill (`primary` to `primary-container`). Roundedness: `md` (0.375rem). No border.
*   **Secondary:** Ghost style. `outline` token at 30% opacity. Text in `primary`.
*   **Tertiary:** Text-only using `primary-dim`. Hover state triggers a `surface-container-high` background tint.

### Input Fields
*   **Container:** `surface-container-low`. 
*   **Indicator:** A 2px bottom-bar in `primary` appears only on focus.
*   **Error State:** Border becomes `error_dim` (#d7383b) with a subtle outer glow (4px blur) in the same color.

### Progress & Accents
*   **The "Unity" Accents:** Use `secondary` (Green), `tertiary` (Yellow), and `error` (Red) sparingly. They are indicators of status (Success, Warning, Critical), not decorative elements.
*   **Cards:** Forbid divider lines. Separate "Header" from "Body" using a shift from `surface-container-high` to `surface-container-highest`.

### Signature Component: The "Data-Chip"
A selection chip using `surface-variant` with a leading 4px dot of `primary` or `secondary` to indicate status. This mimics physical server LEDs and reinforces the engineering aesthetic.

---

## 6. Do’s and Don’ts

### Do
*   **Do** use `surface-container` tiers to create hierarchy.
*   **Do** use `9999px` (Full) roundedness only for Chips and Badges; use `0.375rem` (MD) for structural elements like Buttons and Inputs.
*   **Do** prioritize Tajawal's baseline alignment when pairing with English to ensure the "Grid" feels unified across languages.

### Don't
*   **Don't** use 100% white (#FFFFFF) for text. Always use `on-background` (#dee5ff) to reduce eye strain and maintain the "Slate" mood.
*   **Don't** use drop shadows on flat, surface-level cards. Reserve shadows exclusively for elements that physically "hover" (Modals, Tooltips, Floating Nav).
*   **Don't** use standard dividers. If you feel the need for a line, use 48px of vertical white space instead.